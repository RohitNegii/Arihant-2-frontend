"use client";

import { Suspense, memo, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Sparkles,
  Environment,
  Lightformer,
  PerformanceMonitor,
} from "@react-three/drei";
import * as THREE from "three";

import StorySection, { MAT, GALLERY_FLOOR, STORY_GROUP } from "./StoryRooms";
import { MAX_STEP, SCROLL_DAMP, isTouchDevice, quality } from "./quality";
import { journeyProgress, sceneInteraction } from "@/store/scroll-store";
import { isSceneReady, isSceneRevealed, markSceneReady, onSceneReady } from "./scene-ready";
import {
  fullPreload,
  isPreloadComplete,
  isWarming,
  markPreloadComplete,
  reportPreload,
  setWarming,
} from "./preload";
import { palette } from "@/theme/palette";
// OLD EXHIBITION (disabled) — the original 13-room showroom that ran after the
// story journey. Commented out while we build out the story rooms one by one;
// re-enable the mounts below and this import together to bring it back.
// import {
//   HistoryTunnelFrames,
//   GalleryBoxes,
//   LaboratoryDiamond,
//   CraftingAtelier,
//   Pedestals,
//   TryOnMirror,
//   MuseumCubes,
//   ReviewBubbles,
//   UndergroundCave,
//   PromisePillars,
//   ShowcaseArena,
// } from "./RoomComponents";

const Q = quality();
const P = palette();
const TOUCH = isTouchDevice();
const FULL_PRELOAD = fullPreload();
/**
 * How far the lens tips down on a touch device.
 *
 * It leans further than it used to because the frame is taller than it used to
 * be — see ResponsiveLens. A phone sees a lot more vertically, and what it was
 * seeing was sky: every room is wider than it is high, so the extra height
 * arrived as a band of empty background above the walls. Tipping down lifts the
 * room in the frame and puts the surplus below instead, where the copy card
 * covers it anyway.
 */
const MOBILE_PITCH = -0.13;

function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 1) return;
    if (++frames.current > 1) {
      markSceneReady();
      markPreloadComplete();
    }
  });
  return null;
}

/**
 * The warm-up. Mounted inside the Suspense boundary, so reaching this point
 * already means every photograph and the film have loaded and every room has
 * been built.
 *
 * What is left after that is the work a GPU does the first time it is asked to
 * draw something. Worth being precise about which part of it lands here,
 * because it is not the part it looks like:
 *
 * 1. **Shader linking.** The scene builds 41 programs, and the expensive moment
 *    is not the link but three's first `getUniforms` on each — the uniform
 *    location queries are what make the driver finish compiling. That happens
 *    inside `renderBufferDirect`, so the *first ordinary render* pays for every
 *    program it draws with, before this component has even mounted. Profiled
 *    cold on an integrated GPU it is a single 19.7s task, 57% of all CPU to
 *    first paint. What is left for `compileAsync` here is the rooms that first
 *    render never had in frustum — the far plane is 46 and the corridor is 68
 *    deep, so the last two rooms are always among them — which is why these
 *    calls come back in tens of milliseconds rather than seconds.
 * 2. **Geometry and texture upload.** Linking does not upload vertex buffers;
 *    only a real draw does. So the camera is flown down the whole corridor and
 *    the ordinary render loop draws each stop.
 *
 * None of this is work the preload *adds*. It is work the journey used to do
 * underneath the visitor, a room at a time, as they scrolled into it.
 */
const WARMUP_STOPS = 28;

/** Frames to let React finish committing every room before compiling. */
const SETTLE_FRAMES = 4;

/**
 * Every budget here is wall-clock, and that is the point.
 *
 * They were frame counts to begin with, which is a unit that means nothing on
 * the machines the budgets exist for: at roughly a frame a second — which is
 * where a slow device sits during exactly this pass — a 150-frame cap on one
 * compile unit is a two-and-a-half minute cap, and 28 stops at one per frame is
 * half a minute of fly-through. Measured, the pass sailed past the loading
 * screen's own failsafe and the visitor was let in on a blind timeout, with the
 * bar jumping 30% straight to 100%.
 *
 * So: a cap per compile unit, a budget for the fly-through that it strides to
 * keep (fewer, further-apart stops rather than more time — the far plane is 46
 * units and the rooms are 12 apart, so even a handful of stops has every room
 * in frustum), and a deadline over the whole pass. Overrunning any of them
 * degrades what is warmed, not whether the door opens, and the door still opens
 * on `markPreloadComplete` with the bar run properly to 100 rather than on the
 * failsafe behind it.
 *
 * They cannot help against one thing, and it is worth knowing why: a budget is
 * only checked between frames, and `compileAsync` runs three's synchronous
 * `compile()` inside before it returns a promise. Nothing here can interrupt a
 * single long call — only avoid queueing more of them.
 */
const COMPILE_TIMEOUT_MS = 2500;
const FLY_BUDGET_MS = 4000;
const WARMUP_DEADLINE_MS = 20000;

function ScenePrewarm() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  const settled = useRef(0);
  const units = useRef<THREE.Object3D[]>([]);
  const unit = useRef(0);
  const unitStartedAt = useRef(0);
  const pending = useRef(false);
  const stop = useRef(0);
  const startedAt = useRef(0);
  const flyStartedAt = useRef(0);
  const restoreZ = useRef(76.0);
  const ended = useRef(false);

  useEffect(() => {
    if (isPreloadComplete()) return;
    setWarming(true);
    return () => setWarming(false);
  }, []);

  useFrame(({ camera }) => {
    /**
     * Ending the pass has to be idempotent, and it has to work when something
     * *else* ends it.
     *
     * The loading screen's failsafe can fire while the camera is still mid-
     * corridor. It does not know about this component, so without this the
     * visitor would be handed a scene with the camera flying away from them
     * and `CameraController` still standing aside for a warm-up that is no
     * longer behind a door. Both paths converge here instead: whoever finishes
     * first snaps the camera back and hands the controls over.
     */
    const finish = () => {
      if (ended.current) return;
      ended.current = true;
      camera.position.z = restoreZ.current;
      setWarming(false);
      markPreloadComplete();
    };

    if (isPreloadComplete()) return finish();

    if (settled.current < SETTLE_FRAMES) {
      settled.current++;
      restoreZ.current = camera.position.z;
      return;
    }

    const now = performance.now();
    if (startedAt.current === 0) startedAt.current = now;

    if (now - startedAt.current > WARMUP_DEADLINE_MS) return finish();

    /**
     * A room at a time, then the whole scene.
     *
     * One `compileAsync(scene)` over the show is a single unbroken task, and a
     * loading bar cannot animate through a blocked main thread. Split this way
     * it is eleven shorter ones with a paint between each, for the same total
     * work: the closing pass over the whole scene catches the floor, the
     * sparkles and anything else outside the story group, and re-visiting a
     * room costs nothing because its materials are already prepared.
     */
    if (units.current.length === 0) {
      const story = scene.getObjectByName(STORY_GROUP);
      units.current = story ? [...story.children, scene] : [scene];
    }

    if (unit.current < units.current.length) {
      const total = units.current.length;
      if (!pending.current) {
        pending.current = true;
        unitStartedAt.current = now;
        const compilingUnit = unit.current;
        const done = () => {
          // A timed-out compile can resolve while the next unit is pending.
          if (ended.current || unit.current !== compilingUnit || !pending.current) return;
          pending.current = false;
          reportPreload("shaders", ++unit.current / total);
        };
        gl.compileAsync(units.current[unit.current], camera, scene).then(done, done);
      } else if (now - unitStartedAt.current > COMPILE_TIMEOUT_MS) {
        pending.current = false;
        reportPreload("shaders", ++unit.current / total);
      }
      return;
    }

    if (flyStartedAt.current === 0) flyStartedAt.current = now;

    // One stop per frame while there is time for it, striding further when
    // there is not, so the pass covers the whole corridor either way.
    const owed = Math.ceil(((now - flyStartedAt.current) / FLY_BUDGET_MS) * WARMUP_STOPS);
    const step = (stop.current = Math.max(stop.current + 1, owed));

    if (step <= WARMUP_STOPS) {
      camera.position.z = 76.0 - (step / WARMUP_STOPS) * 68;
      reportPreload("warmup", step / WARMUP_STOPS);
      return;
    }

    finish();
  });

  return null;
}

/**
 * The frame this show was composed in, and the widest the lens may go.
 *
 * Every room is laid out to be read across a 16:9 frame. Three keeps the
 * *vertical* field fixed as the viewport changes, so a phone held upright — a
 * 0.46 aspect against 1.78 — was seeing a 22° horizontal slice of a scene built
 * for 73°: the workbench ran off both edges of the screen, and the pictures
 * hung either side of the portrait in Made for Moments were not on screen at
 * all.
 *
 * So the horizontal field is what is held constant here, and the vertical one
 * derived from it. That cannot be free: holding all 73° on a phone needs a 116°
 * vertical lens, which is a fisheye. `MAX_FOV` is where it stops — 78° gives
 * back most of the width, and a wide vertical field on a tall screen is what
 * that shape of screen is for.
 */
const DESIGN_ASPECT = 16 / 9;
const DESIGN_FOV = 45;
// 78 gave back a little more width and cost more than it was worth at both
// ends of it: a band of empty sky above every room, and enough edge stretch to
// smear the pictures hung at the sides of Made for Moments.
const MAX_FOV = 72;
const HALF_H_FOV = Math.atan(Math.tan((DESIGN_FOV / 2) * THREE.MathUtils.DEG2RAD) * DESIGN_ASPECT);

function ResponsiveLens() {
  // Driven from the frame loop rather than an effect on `size`: the camera is
  // the one thing in here that is mutated, and mutating what a hook returned is
  // exactly what the compiler will not have. One float comparison per frame is
  // not a cost, and this way an orientation change is picked up on the next
  // frame with no listener of its own.
  const applied = useRef(0);

  useFrame(({ camera, size }) => {
    const aspect = size.width / Math.max(1, size.height);
    if (Math.abs(aspect - applied.current) < 0.001) return;
    applied.current = aspect;

    const lens = camera as THREE.PerspectiveCamera;
    lens.fov = THREE.MathUtils.clamp(
      2 * Math.atan(Math.tan(HALF_H_FOV) / aspect) * THREE.MathUtils.RAD2DEG,
      DESIGN_FOV,
      MAX_FOV
    );
    lens.updateProjectionMatrix();
  });

  return null;
}

/**
 * Choose a sustainable resolution behind the loader, then keep it fixed.
 * Changing DPR resizes and clears the drawing buffer; repeated up/down changes
 * make the visible scene flash and alternate between sharp and soft edges.
 */
function AdaptiveResolution({ onDecline }: { onDecline: () => void }) {
  const reduceResolution = () => {
    if (!isPreloadComplete()) onDecline();
  };
  return (
    <PerformanceMonitor
      flipflops={1}
      onDecline={reduceResolution}
      onFallback={reduceResolution}
    />
  );
}

/**
 * How close the camera is allowed to get on a phone.
 *
 * The travel is 76 to 8 for everyone, but a phone reads every room through a
 * much wider lens, and at z = 8 it ends two and a half units off the finale's
 * plinth: the ring box, the halo, the arch and the house mark are all outside
 * the frame or behind the overlay card, and what is left on screen is the side
 * of a white drum. Holding at 10.6 puts the whole apse back in the shot and
 * costs the last three per cent of the scroll, where the camera settling into
 * place is what the scroll is for anyway.
 */
const TOUCH_MIN_Z = 10.6;
const POINTER_TILT = 0.025;

function CameraController({ active }: { active: boolean }) {
  const needsSnap = useRef(false);
  useEffect(() => {
    if (!active) needsSnap.current = true;
  }, [active]);
  useFrame((state, delta) => {
    // `ScenePrewarm` owns the camera during the warm-up fly-through; damping it
    // back toward the entrance between stops would leave the pass circling the
    // first room and never reach the other five.
    if (isWarming()) return;

    const step = Math.min(delta, MAX_STEP);
    const travelled = 76.0 - journeyProgress() * 68;
    const targetZ = TOUCH ? Math.max(travelled, TOUCH_MIN_Z) : travelled;

    state.camera.position.z = needsSnap.current ? targetZ : THREE.MathUtils.damp(
      state.camera.position.z,
      targetZ,
      SCROLL_DAMP,
      step
    );
    needsSnap.current = false;

    // A fixed viewpoint keeps stone, foliage and metal edges stable at rest.
    state.camera.position.x = 0;
    state.camera.position.y = 0.5;
    if (!isSceneRevealed()) {
      state.camera.rotation.set(TOUCH ? MOBILE_PITCH : 0, 0, 0);
      return;
    }

    if (sceneInteraction.hovered || sceneInteraction.focused) return;

    if (TOUCH) {
      state.camera.rotation.set(MOBILE_PITCH, 0, 0);
      return;
    }

    const targetYaw = -state.pointer.x * POINTER_TILT;
    const targetPitch = state.pointer.y * POINTER_TILT;
    state.camera.rotation.y = Math.abs(state.camera.rotation.y - targetYaw) < 0.00001
      ? targetYaw : THREE.MathUtils.damp(state.camera.rotation.y, targetYaw, 4, step);
    state.camera.rotation.x = Math.abs(state.camera.rotation.x - targetPitch) < 0.00001
      ? targetPitch : THREE.MathUtils.damp(state.camera.rotation.x, targetPitch, 4, step);
  });

  return null;
}

function ShowroomCanvas({ active, running }: { active: boolean; running: boolean }) {
  // Allocate the sustainable Retina buffer up front on phones.
  const [dpr, setDpr] = useState<number | [number, number]>(TOUCH ? Q.dpr[0] : Q.dpr);

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-auto select-none bg-[var(--color-shell)]">
      <Canvas
        frameloop={running ? "always" : "never"}
        camera={{ position: [0, 0.5, 76.0], fov: 45, near: 0.5, far: Q.far }}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        shadows={Q.shadows ? "percentage" : false}
      >
        <ResponsiveLens />
        {!TOUCH && <AdaptiveResolution onDecline={() => setDpr(Q.dpr[0])} />}
        <CameraController active={active} />

        <fog attach="fog" args={[P.shell, 8, Q.fogFar]} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <hemisphereLight intensity={0.4} color="#E8DEC9" groundColor="#9C9384" />

          <spotLight
            position={[2.5, 7, 4]}
            intensity={3.5}
            angle={0.55}
            penumbra={1}
            color="#FFEFD6"
            castShadow={Q.shadows}
            shadow-mapSize={[Q.shadowMapSize, Q.shadowMapSize]}
            shadow-bias={-0.0002}
            shadow-normalBias={0.02}
          />

          <directionalLight
            position={[6, 9, 6]}
            intensity={1.7}
            color="#FFF6E8"
            castShadow={Q.shadows}
            shadow-mapSize={[Q.shadowMapSize, Q.shadowMapSize]}
            shadow-camera-left={-9}
            shadow-camera-right={9}
            shadow-camera-top={9}
            shadow-camera-bottom={-9}
            shadow-camera-near={1}
            shadow-camera-far={40}
            shadow-bias={-0.0003}
            shadow-normalBias={0.03}
          />
          <pointLight position={[0, 2, 2]} intensity={1.0} color="#E9CE9C" />

          <mesh
            position={[0, -1.5, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            material={MAT.galleryFloor}
          >
            <planeGeometry args={[GALLERY_FLOOR[0], GALLERY_FLOOR[1]]} />
          </mesh>

          <StorySection />

          <ReadySignal />

          {/* --- ORIGINAL EXHIBITION (disabled) ---
              The old 13-room showroom used to mount here, on the Z axis from
              Z = -12 (History Tunnel) back to Z = -132 (Showcase Arena). It is
              commented out while we build the story journey; re-enable it — and
              its import above, and restore the ×222 camera span — to bring it
              back.

          <group position={[0, 0, 0]}>
            <HistoryTunnelFrames />       // Z = -12
            <GalleryBoxes />              // Z = -24
            <LaboratoryDiamond />         // Z = -36
            <CraftingAtelier />           // Z = -48
            <Pedestals />                 // Z = -60
            <TryOnMirror />               // Z = -72
            <MuseumCubes />               // Z = -84
            <ReviewBubbles />             // Z = -96
            <UndergroundCave />           // Z = -108
            <PromisePillars />            // Z = -120
            <ShowcaseArena />             // Z = -132
          </group>
          */}

          {Q.sparkles > 0 && (
            <Sparkles
              count={Q.sparkles}
              scale={12}
              size={1.8}
              speed={0.25}
              color={P.gold}
              opacity={0.35}
            />
          )}

          <Environment resolution={Q.envResolution} frames={1}>
            <color attach="background" args={[P.shellDeep]} />
            <Lightformer
              form="rect"
              intensity={2.6}
              color="#FFFBF0"
              position={[0, 5, 0]}
              rotation-x={Math.PI / 2}
              scale={[10, 14, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.4}
              color="#FFF3DC"
              position={[-5, 1, 0]}
              rotation-y={Math.PI / 2}
              scale={[16, 2.5, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.2}
              color="#F2F7FF"
              position={[5, 1, 2]}
              rotation-y={-Math.PI / 2}
              scale={[16, 2.5, 1]}
            />
            <Lightformer
              form="ring"
              intensity={1.0}
              color="#FFE6BC"
              position={[0, 3, -6]}
              scale={4}
            />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default memo(ShowroomCanvas);
