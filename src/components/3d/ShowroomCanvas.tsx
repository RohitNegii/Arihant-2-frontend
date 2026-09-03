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

import StorySection, { MAT, GALLERY_FLOOR } from "./StoryRooms";
import { MAX_STEP, SCROLL_DAMP, isTouchDevice, quality } from "./quality";
import { journeyProgress } from "@/store/scroll-store";
import { isSceneReady, markSceneReady, onSceneReady } from "./scene-ready";
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
    if (frames.current > 4) return;
    if (++frames.current > 4) markSceneReady();
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
 * Holds the dpr ceiling only while the device can pay for it.
 *
 * The mobile tiers now ask for more pixels than they used to: a phone drawing
 * at dpr 1 into a 3x screen was rendering a third of the panel and letting the
 * compositor upscale it, which is what read as blur. That ceiling is not safe
 * on hardware we cannot test, so the frame rate decides — sustained decline
 * drops back to `Q.dpr[0]`, and after `flipflops` reversals it stays there.
 */
function AdaptiveResolution() {
  const setDpr = useThree((state) => state.setDpr);
  return (
    <PerformanceMonitor
      flipflops={3}
      onIncline={() => setDpr(Q.dpr[1])}
      onDecline={() => setDpr(Q.dpr[0])}
      onFallback={() => setDpr(Q.dpr[0])}
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

function CameraController() {
  useFrame((state, delta) => {
    const step = Math.min(delta, MAX_STEP);
    const travelled = 76.0 - journeyProgress() * 68;
    const targetZ = TOUCH ? Math.max(travelled, TOUCH_MIN_Z) : travelled;

    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      targetZ,
      SCROLL_DAMP,
      step
    );

    if (TOUCH) {
      state.camera.position.x = 0;
      state.camera.position.y = 0.5;
      state.camera.rotation.set(MOBILE_PITCH, 0, 0);
      return;
    }

    const time = state.clock.getElapsedTime();
    state.camera.position.y = 0.5 + Math.sin(time * 0.8) * 0.04;
    state.camera.position.x = Math.cos(time * 0.4) * 0.02;

    const targetMouseX = (state.pointer.x * Math.PI) / 14;
    const targetMouseY = (state.pointer.y * Math.PI) / 14;

    state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, -targetMouseX, 0.05);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetMouseY, 0.05);
  });

  return null;
}

function ShowroomCanvas() {
  const [shown, setShown] = useState(isSceneReady);
  useEffect(() => onSceneReady(() => setShown(true)), []);

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-auto select-none bg-[var(--color-shell)]">
      <Canvas
        style={{
          opacity: shown ? 1 : 0,
          transition: "opacity 700ms ease-out",
        }}
        camera={{ position: [0, 0.5, 76.0], fov: 45, near: 0.5, far: Q.far }}
        dpr={Q.dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        shadows={Q.shadows ? "percentage" : false}
      >
        <ResponsiveLens />
        <AdaptiveResolution />
        <CameraController />
        <ReadySignal />

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
