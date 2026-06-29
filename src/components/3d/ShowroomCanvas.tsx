"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment } from "@react-three/drei";
import * as THREE from "three";

import {
  EntrancePedestal,
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

    // Camera travels forward along the Z axis (starts at Z = 4, ends at Z = -146)
    const targetZ = 4.0 - progress * 150;
    
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
        camera={{ position: [0, 0.5, 4.0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <CameraController />

        {/* Suspense boundary is critical to prevent CDN loaders from suspending the canvas */}
        <Suspense fallback={null}>
          {/* Global Lighting */}
          <ambientLight intensity={1.5} />
          
          {/* Entrance Hall Spotlight */}
          <spotLight
            position={[0, 8, 2]}
            intensity={4.0}
            angle={0.6}
            penumbra={1}
            color="#C8A96A"
            castShadow
          />
          
          {/* Lab Spotlight */}
          <spotLight
            position={[0, 8, -36]}
            intensity={4.5}
            angle={0.5}
            color="#ffffff"
            castShadow
          />

          {/* Arena Spotlight */}
          <spotLight
            position={[0, 10, -132]}
            intensity={5.0}
            angle={0.8}
            penumbra={1}
            color="#C8A96A"
            castShadow
          />

          <directionalLight position={[5, 10, 5]} intensity={2.0} castShadow />
          <pointLight position={[0, 2, 2]} intensity={2.5} color="#C8A96A" />

          {/* --- 13 VIRTUAL ROOM ENVIRONMENTS MOUNTED ON Z-AXIS --- */}
          <group position={[0, 0, 0]}>
            {/* Scene 1: Entrance Hall (Z = 0) */}
            <EntrancePedestal />
            
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

          {/* Floating Sparkles & Dust Particles */}
          <Sparkles
            count={120}
            scale={12}
            size={3.5}
            speed={0.4}
            color="#C8A96A"
            opacity={0.6}
          />

          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}
