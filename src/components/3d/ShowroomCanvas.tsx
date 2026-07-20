"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

import StorySection from "./StoryRooms";
import {
  HistoryTunnelFrames,
  GalleryBoxes,
  LaboratoryDiamond,
  CraftingAtelier,
  Pedestals,
  TryOnMirror,
  MuseumCubes,
  ReviewBubbles,
  UndergroundCave,
  PromisePillars,
  ShowcaseArena,
} from "./RoomComponents";

function CameraController() {
  useFrame((state) => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1); // progress 0 to 1

    // Camera travels forward along the Z axis. It starts in front of the six
    // story rooms (Z = 76) and ends past the last original room (Z = -146).
    const targetZ = 76.0 - progress * 222;
    
    // Smooth camera interpolation
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);

    // Subtle breathing / walking bobbing movement
    const time = state.clock.getElapsedTime();
    state.camera.position.y = 0.5 + Math.sin(time * 0.8) * 0.04;
    state.camera.position.x = Math.cos(time * 0.4) * 0.02;

    // Mouse parallax tracking
    const targetMouseX = (state.pointer.x * Math.PI) / 14;
    const targetMouseY = (state.pointer.y * Math.PI) / 14;
    
    state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, -targetMouseX, 0.05);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetMouseY, 0.05);
  });

  return null;
}

export default function ShowroomCanvas() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-auto select-none bg-[#F6F2EA]">
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

        {/* Depth fade into the cream backdrop — distant rooms emerge from
            haze instead of popping in fully lit */}
        <fog attach="fog" args={["#F6F2EA", 8, 42]} />

        {/* Suspense boundary is critical to prevent CDN loaders from suspending the canvas */}
        <Suspense fallback={null}>
          {/* Low base fill — the key lights and environment do the modeling.
              High ambient flattens every form into cardboard */}
          <ambientLight intensity={0.25} />
          <hemisphereLight intensity={0.5} color="#FFF9EE" groundColor="#CBBA97" />

          {/* Entrance Hall key light — off-axis so forms get light/shade
              modeling instead of a flat head-on wash */}
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

          {/* Lab Spotlight — no castShadow: each shadow-casting light is a
              full extra scene render pass per frame, and this one is far
              from the camera for most of the journey */}
          <spotLight
            position={[0, 8, -36]}
            intensity={3.5}
            angle={0.5}
            color="#ffffff"
          />

          {/* Arena Spotlight — same: shadows dropped for perf */}
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

          {/* Gallery floor running the full journey — grounds every room and
              catches the entrance shadows; without it everything floats */}
          <mesh position={[0, -1.5, -70]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[18, 170]} />
            <meshStandardMaterial color="#F1EAD9" roughness={0.92} />
          </mesh>

          {/* --- STORY JOURNEY: 6 rooms in front of the gallery (Z = 72 → 12) --- */}
          <StorySection />

          {/* --- ORIGINAL ROOM ENVIRONMENTS MOUNTED ON Z-AXIS --- */}
          <group position={[0, 0, 0]}>
            {/* Scene 1 (Z = 0) — the Entrance Hall ring + gem is parked:
                `EntrancePedestal` still lives in RoomComponents.tsx, it is
                just no longer mounted */}

            {/* Scene 2: History Tunnel (Z = -12) */}
            <HistoryTunnelFrames />

            {/* Scene 3: Floating Gallery (Z = -24) */}
            <GalleryBoxes />

            {/* Scene 4: Diamond Lab (Z = -36) */}
            <LaboratoryDiamond />

            {/* Scene 5: Crafting Atelier (Z = -48) */}
            <CraftingAtelier />

            {/* Scene 6: Collections Pedestals (Z = -60) */}
            <Pedestals />

            {/* Scene 7: Virtual Try-On (Z = -72) */}
            <TryOnMirror />

            {/* Scene 8: Museum Cubes (Z = -84) */}
            <MuseumCubes />

            {/* Scene 9: Review Bubbles (Z = -96) */}
            <ReviewBubbles />

            {/* Scene 10: Cave (Z = -108) */}
            <UndergroundCave />

            {/* Scene 11: Promise Pillars (Z = -120) */}
            <PromisePillars />

            {/* Scene 12: Showcase Arena (Z = -132) */}
            <ShowcaseArena />
          </group>

          {/* Floating dust motes — kept faint; big bright dots read as fake */}
          <Sparkles
            count={80}
            scale={12}
            size={1.8}
            speed={0.25}
            color="#C8A96A"
            opacity={0.35}
          />

          {/* Custom jewelry-studio environment: elongated softboxes give the
              metals the long, natural highlight streaks of product photography
              instead of the harsh blobs of the "studio" preset. Rendered once
              (frames={1}) — costs nothing per frame */}
          <Environment resolution={256} frames={1}>
            <color attach="background" args={["#E9DFCB"]} />
            {/* Overhead softbox */}
            <Lightformer
              form="rect"
              intensity={2.6}
              color="#FFFBF0"
              position={[0, 5, 0]}
              rotation-x={Math.PI / 2}
              scale={[10, 14, 1]}
            />
            {/* Warm strip light, camera left */}
            <Lightformer
              form="rect"
              intensity={1.4}
              color="#FFF3DC"
              position={[-5, 1, 0]}
              rotation-y={Math.PI / 2}
              scale={[16, 2.5, 1]}
            />
            {/* Cool strip light, camera right — the warm/cool contrast is what
                makes polished metal look dimensional */}
            <Lightformer
              form="rect"
              intensity={1.2}
              color="#F2F7FF"
              position={[5, 1, 2]}
              rotation-y={-Math.PI / 2}
              scale={[16, 2.5, 1]}
            />
            {/* Gold accent ring behind the scene */}
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
