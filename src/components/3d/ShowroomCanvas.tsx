"use client";

import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

import StorySection, { MAT, GALLERY_FLOOR } from "./StoryRooms";
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

function CameraController() {
  useFrame((state) => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    const targetZ = 76.0 - progress * 68;

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);

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
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-auto select-none bg-[#E3D9C6]">
      <Canvas
        camera={{ position: [0, 0.5, 76.0], fov: 45 }}
        // dpr cap keeps high-DPI displays from quadrupling the pixel workload
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        // "percentage" = PCFShadowMap; PCFSoftShadowMap is deprecated in this
        // three version and silently falls back to PCF anyway
        shadows="percentage"
      >
        <CameraController />

        <fog attach="fog" args={["#E3D9C6", 8, 42]} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <hemisphereLight intensity={0.4} color="#E8DEC9" groundColor="#9C9384" />

          <spotLight
            position={[2.5, 7, 4]}
            intensity={3.5}
            angle={0.55}
            penumbra={1}
            color="#FFEFD6"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0002}
            shadow-normalBias={0.02}
          />

          {/* These two carry no castShadow deliberately: each shadow-casting
              light is a full extra scene render pass every frame, and both sit
              far behind the camera for the whole journey */}
          <spotLight
            position={[0, 8, -36]}
            intensity={3.5}
            angle={0.5}
            color="#ffffff"
          />

          <spotLight
            position={[0, 10, -132]}
            intensity={4.5}
            angle={0.8}
            penumbra={1}
            color="#FFE2B8"
          />

          <directionalLight
            position={[6, 9, 6]}
            intensity={1.7}
            color="#FFF6E8"
            castShadow
            shadow-mapSize={[2048, 2048]}
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

          <Sparkles
            count={80}
            scale={12}
            size={1.8}
            speed={0.25}
            color="#C8A96A"
            opacity={0.35}
          />

          <Environment resolution={256} frames={1}>
            <color attach="background" args={["#E9DFCB"]} />
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
