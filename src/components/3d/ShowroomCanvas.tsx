"use client";

import { useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment } from "@react-three/drei";
import * as THREE from "three";

import {
  BoutiqueArchitecture,
  GrandEntranceDoor,
  ReceptionGallerySketches,
  ExhibitionHallRing,
  BraceletGalleryBoxes,
  EarringShowcase,
  NecklaceExhibition,
  CraftsmanshipStudio,
  PremiumCollection,
  VIPShowroomMirror,
  CheckoutLounge
} from "./RoomComponents";

const keyframes = [
  { progress: 0.0, pos: [0, 1.5, 12.0], lookAt: [0, 1.5, 6.0] },    // Outside boutique
  { progress: 0.1, pos: [0, 1.4, 7.5], lookAt: [0, 1.4, 0.0] },     // Approaching entrance doorway
  { progress: 0.2, pos: [0, 1.2, 2.0], lookAt: [0, 1.2, -6.0] },    // Reception Gallery corridor
  { progress: 0.3, pos: [0.75, 0.9, -7.5], lookAt: [0, 0.7, -12.0] }, // Hero Diamond Ring (orbiting offset)
  { progress: 0.4, pos: [-2.2, 1.3, -18.0], lookAt: [-2.0, 1.2, -24.0] }, // Floating Bracelet Gallery (left wing corridor)
  { progress: 0.5, pos: [2.2, 1.3, -30.0], lookAt: [2.0, 1.2, -36.0] },  // Earring Showcase Room (right wing corridor)
  { progress: 0.6, pos: [0, 1.4, -42.0], lookAt: [0, 1.2, -48.0] },      // Necklace curtain entry
  { progress: 0.7, pos: [-1.8, 1.0, -54.0], lookAt: [-1.8, 0.6, -58.0] }, // Craftsmanship studio table
  { progress: 0.8, pos: [1.8, 1.5, -66.0], lookAt: [0, 1.1, -70.0] },    // Premium collection room
  { progress: 0.9, pos: [0, 1.3, -78.0], lookAt: [0, 1.3, -84.0] },     // VIP Mirror try-on area
  { progress: 1.0, pos: [1.5, 1.2, -90.0], lookAt: [-1.0, 1.1, -96.0] }   // Checkout Lounge (facing boutique lounge table)
];

function CameraController() {
  const currentLookAt = useRef(new THREE.Vector3(0, 1.5, 6.0));
  const lastProgress = useRef(0);

  useFrame((state) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1); // progress 0 to 1

    // Find bounding keyframes
    let kf1 = keyframes[0];
    let kf2 = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].progress && progress <= keyframes[i + 1].progress) {
        kf1 = keyframes[i];
        kf2 = keyframes[i + 1];
        break;
      }
    }

    const span = kf2.progress - kf1.progress;
    const localT = span > 0 ? (progress - kf1.progress) / span : 0;
    
    // Smooth ease-in-out mapping for dramatic room speed reduction
    const easedT = localT * localT * (3 - 2 * localT);

    const targetPos = new THREE.Vector3(
      THREE.MathUtils.lerp(kf1.pos[0], kf2.pos[0], easedT),
      THREE.MathUtils.lerp(kf1.pos[1], kf2.pos[1], easedT),
      THREE.MathUtils.lerp(kf1.pos[2], kf2.pos[2], easedT)
    );

    const targetLook = new THREE.Vector3(
      THREE.MathUtils.lerp(kf1.lookAt[0], kf2.lookAt[0], easedT),
      THREE.MathUtils.lerp(kf1.lookAt[1], kf2.lookAt[1], easedT),
      THREE.MathUtils.lerp(kf1.lookAt[2], kf2.lookAt[2], easedT)
    );

    // Apply smooth cinematic position interpolation
    state.camera.position.lerp(targetPos, 0.07);
    currentLookAt.current.lerp(targetLook, 0.07);

    // Walks bobbing movement - amplifies when actively scrolling
    const scrollDelta = Math.abs(progress - lastProgress.current);
    lastProgress.current = progress;
    const time = state.clock.getElapsedTime();
    const bobFactor = 0.02 + scrollDelta * 1.5;
    
    state.camera.position.y += Math.sin(time * 1.2) * (bobFactor * 0.4);
    state.camera.position.x += Math.cos(time * 0.6) * (bobFactor * 0.2);

    // Elegant interactive mouse parallax
    const mouseX = state.pointer.x * 0.35;
    const mouseY = state.pointer.y * 0.35;
    const finalLook = currentLookAt.current.clone().add(new THREE.Vector3(mouseX, mouseY, 0));

    state.camera.lookAt(finalLook);
  });

  return null;
}

export default function ShowroomCanvas() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-auto select-none bg-[#FFF1E2]">
      <Canvas
        camera={{ position: [0, 1.5, 12.0], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <CameraController />

        <Suspense fallback={null}>
          {/* Ambient Lighting - Soft Cream Light */}
          <ambientLight intensity={2.2} color="#FFF8F0" />
          
          {/* Directional Sunlight Casting Shadows */}
          <directionalLight
            position={[10, 20, 10]}
            intensity={2.8}
            color="#FFF1E2"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />

          {/* Core Spotlight Matrix for Premium Boutiques */}
          {/* Spotlight outside boutique portal */}
          <spotLight
            position={[0, 8, 12]}
            intensity={4.5}
            angle={0.6}
            penumbra={1}
            color="#FFF1E2"
            castShadow
          />
          
          {/* Spotlight inside reception gallery */}
          <spotLight
            position={[0, 8, 1]}
            intensity={5.0}
            angle={0.5}
            penumbra={1}
            color="#C8A96A"
            castShadow
          />

          {/* Volumetric spotlight on central solitaire */}
          <spotLight
            position={[0, 7, -12]}
            intensity={6.0}
            angle={0.4}
            penumbra={0.9}
            color="#ffffff"
            castShadow
          />

          {/* Spotlight on necklace bust */}
          <spotLight
            position={[0, 8, -48]}
            intensity={6.5}
            angle={0.4}
            penumbra={0.85}
            color="#ffffff"
            castShadow
          />

          {/* Spotlight in VIP showroom */}
          <spotLight
            position={[0, 8, -84]}
            intensity={5.0}
            angle={0.6}
            color="#FFF1E2"
            castShadow
          />

          {/* Dynamic scene points & fill lights */}
          <pointLight position={[-3, 3, -24]} intensity={2.0} color="#C8A96A" />
          <pointLight position={[3, 3, -36]} intensity={2.0} color="#C8A96A" />
          <pointLight position={[-2, 2, -58]} intensity={2.5} color="#C8A96A" />

          {/* --- boutique geometry, rooms, corridors, and arches --- */}
          <group>
            {/* Global Architecture Corridor and Floors */}
            <BoutiqueArchitecture />

            {/* Room 1: Grand Door (Z = 6) */}
            <GrandEntranceDoor />

            {/* Room 2: Gallery Sketches (Z = 0) */}
            <ReceptionGallerySketches />

            {/* Room 3: Exhibition Solitaire Ring (Z = -12) */}
            <ExhibitionHallRing />

            {/* Room 4: Floating Bracelet boxes (Z = -24) */}
            <BraceletGalleryBoxes />

            {/* Room 5: Earring Showcase (Z = -36) */}
            <EarringShowcase />

            {/* Room 6: Necklace display (Z = -48) */}
            <NecklaceExhibition />

            {/* Room 7: Crafting Atelier workbench (Z = -58) */}
            <CraftsmanshipStudio />

            {/* Room 8: Premium Marble columns (Z = -70) */}
            <PremiumCollection />

            {/* Room 9: VIP Mirror try-on (Z = -84) */}
            <VIPShowroomMirror />

            {/* Room 10: Checkout Lounge table (Z = -96) */}
            <CheckoutLounge />
          </group>

          {/* Levitating gold luxury stardust particles */}
          <Sparkles
            count={250}
            scale={45}
            position={[0, 1.5, -45]}
            size={2.5}
            speed={0.3}
            color="#C8A96A"
            opacity={0.6}
          />
          <Sparkles
            count={100}
            scale={15}
            position={[0, 1.5, 6]}
            size={2.0}
            speed={0.25}
            color="#C8A96A"
            opacity={0.4}
          />

          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}
