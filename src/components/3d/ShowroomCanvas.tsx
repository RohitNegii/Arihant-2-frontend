"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

import StorySection, { MAT, GALLERY_FLOOR } from "./StoryRooms";
import { isTouchDevice, quality } from "./quality";
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
const MOBILE_PITCH = -0.085;

function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 4) return;
    if (++frames.current > 4) markSceneReady();
  });
  return null;
}

function CameraController() {
  useFrame((state) => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    const targetZ = 76.0 - progress * 68;

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);

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

export default function ShowroomCanvas() {
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
          antialias: Q.tier !== "low",
          alpha: true,
          powerPreference: "high-performance",
        }}
        shadows={Q.shadows ? "percentage" : false}
      >
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
