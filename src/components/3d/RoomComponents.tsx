"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

// --- REUSABLE BRILLIANT CUT GEMSTONE COMPONENT ---
export function BrilliantCutGem({ color = "#014421", scale = 1.0, position = [0, 0, 0] }: { color?: string; scale?: number; position?: [number, number, number] }) {
  return (
    <group position={position} scale={scale}>
      {/* Top Crown Cylinder (narrow top, wide base) */}
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.45, 0.18, 12, 1]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.96}
          roughness={0.0}
          ior={2.42}
          thickness={1.1}
          clearcoat={1.0}
          envMapIntensity={2.5}
        />
      </mesh>
      {/* Bottom Pavilion Cylinder (wide base, points to a sharp tip) */}
      <mesh position={[0, -0.225, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.01, 0.45, 12, 1]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.96}
          roughness={0.0}
          ior={2.42}
          thickness={1.1}
          clearcoat={1.0}
          envMapIntensity={2.5}
        />
      </mesh>
    </group>
  );
}

// --- REUSABLE LUXURY RING COMPONENT ---
export function LuxuryRing({ metalColor = "#C8A96A", gemColor = "#014421", position = [0, 0, 0], scale = 1.0 }: { metalColor?: string; gemColor?: string; position?: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main Ring Band */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.85, 0.12, 32, 100]} />
        <meshPhysicalMaterial color={metalColor} metalness={1.0} roughness={0.06} clearcoat={1.0} />
      </mesh>
      {/* Prongs gem holder */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 0.32, 8]} />
        <meshPhysicalMaterial color={metalColor} metalness={1.0} roughness={0.1} />
      </mesh>
      {/* Center Gemstone */}
      <BrilliantCutGem color={gemColor} position={[0, 0.9, 0]} scale={0.8} />
    </group>
  );
}

// --- REALISTIC 3D DIAMOND COMPONENT (INDEX OF REFRACTION = 2.42) ---
function RealisticDiamond({ scale = 1.0, position = [0, 0, 0] }: { scale?: number; position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.4;
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.15;
    meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.08;
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* Top crown cylinder */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.7, 0.3, 16, 1]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1.0}
          roughness={0.0}
          ior={2.42}
          thickness={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          envMapIntensity={4.0}
        />
      </mesh>
      {/* Bottom pavilion cylinder */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.01, 0.7, 16, 1]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1.0}
          roughness={0.0}
          ior={2.42}
          thickness={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          envMapIntensity={4.0}
        />
      </mesh>
    </group>
  );
}

// --- BOTANICAL JEWELRY: RINGS (SOWN IN BOTANY) ---
function BotanicalRing() {
  return (
    <group scale={0.36}>
      {/* Main Gold Helix Band */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.85, 0.12, 32, 100]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} clearcoat={1.0} />
      </mesh>
      
      {/* Small leaves branching off the gold band */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * 0.85;
        const y = Math.sin(angle) * 0.85;
        return (
          <group key={i} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
            <mesh scale={[0.1, 0.22, 0.04]}>
              <dodecahedronGeometry args={[0.5, 0]} />
              <meshPhysicalMaterial color="#014421" roughness={0.1} clearcoat={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Center Prong setting */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 0.32, 8]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>

      {/* Main Solitaire Gem */}
      <BrilliantCutGem color="#014421" position={[0, 0.9, 0]} scale={0.8} />
    </group>
  );
}

// --- BOTANICAL JEWELRY: NECKLACES (SOWN IN BOTANY) ---
function BotanicalNecklace() {
  return (
    <group position={[0, 0.1, 0]} scale={0.8}>
      {/* Thin Gold Torus Loop representing the chain */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.45, 0.012, 8, 64]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>

      {/* Pendant Ring Attachment */}
      <mesh position={[0, -0.45, 0]} scale={0.06} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.15} />
      </mesh>

      {/* Hanging Leaf-Wrapped Pendant */}
      <group position={[0, -0.62, 0.05]}>
        {/* Central Teardrop Gem */}
        <mesh scale={[0.16, 0.28, 0.08]} castShadow>
          <coneGeometry args={[0.5, 1.2, 4]} />
          <meshPhysicalMaterial color="#014421" transmission={0.95} roughness={0.05} ior={2.42} thickness={0.5} />
        </mesh>
        
        {/* Guard Leaves framing the gemstone */}
        <mesh position={[-0.1, 0.04, -0.04]} rotation={[0, 0, 0.45]} scale={[0.08, 0.24, 0.02]} castShadow>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
        </mesh>
        <mesh position={[0.1, 0.04, -0.04]} rotation={[0, 0, -0.45]} scale={[0.08, 0.24, 0.02]} castShadow>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

// --- BOTANICAL JEWELRY: BRACELETS (SOWN IN BOTANY) ---
function BotanicalBracelet() {
  return (
    <group scale={0.8} rotation={[0.4, 0, 0.4]}>
      {/* First vine hoop */}
      <mesh castShadow>
        <torusGeometry args={[0.5, 0.02, 8, 64]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.15} />
      </mesh>
      
      {/* Second helix-wrapped vine hoop */}
      <mesh rotation={[0.15, 0.1, 0.05]} castShadow>
        <torusGeometry args={[0.5, 0.02, 8, 64]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.15} />
      </mesh>

      {/* 8 Leaf buds with gem centers along the loop */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const r = 0.5;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const z = Math.sin(angle * 2) * 0.04;
        return (
          <group key={i} position={[x, y, z]}>
            {/* Golden bud capsule */}
            <mesh scale={0.038} castShadow>
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.2} />
            </mesh>
            {/* Emerald/White alternating crystal center */}
            <mesh position={[0, 0.02, 0]} scale={0.032} castShadow>
              <icosahedronGeometry args={[0.5, 1]} />
              <meshPhysicalMaterial color={i % 2 === 0 ? "#014421" : "#ffffff"} transmission={0.9} roughness={0.05} ior={2.42} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// --- BOTANICAL JEWELRY: EARRINGS (SOWN IN BOTANY) ---
function BotanicalEarrings() {
  const singleEarring = (
    <group>
      {/* Upper Stud attachment */}
      <mesh scale={0.04} position={[0, 0.4, 0]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshPhysicalMaterial color="#014421" roughness={0.1} />
      </mesh>
      {/* Hanging Golden Branch stem */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>
      {/* Delicate leaves attached to the branch */}
      <mesh position={[-0.07, 0.25, 0]} rotation={[0, 0, 0.6]} scale={[0.05, 0.12, 0.02]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>
      <mesh position={[0.07, 0.1, 0]} rotation={[0, 0, -0.6]} scale={[0.05, 0.12, 0.02]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>
      {/* Hanging Teardrop crystal gem */}
      <mesh position={[0, -0.15, 0]} scale={[0.08, 0.18, 0.06]} castShadow>
        <coneGeometry args={[0.5, 1.2, 4]} />
        <meshPhysicalMaterial color="#014421" transmission={0.95} roughness={0.02} thickness={0.4} />
      </mesh>
    </group>
  );

  return (
    <group scale={0.7} position={[0, 0.1, 0]}>
      {/* Left drop earring */}
      <group position={[-0.22, 0, 0]}>
        {singleEarring}
      </group>
      {/* Right drop earring */}
      <group position={[0.22, 0, 0]}>
        {singleEarring}
      </group>
    </group>
  );
}

// --- BOUTIQUE CENTRAL ARCHITECTURE SYSTEM ---
export function BoutiqueArchitecture() {
  return (
    <group>
      {/* Polished Limestone Floor with Realtime Reflection */}
      <mesh position={[0, -0.65, -45.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 110]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={0.3}
          roughness={0.12}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#FFF1E2"
          metalness={0.02}
          mirror={0.6}
        />
      </mesh>

      {/* Left side wall */}
      <mesh position={[-6.0, 2.0, -45.0]} receiveShadow>
        <boxGeometry args={[0.1, 5.3, 110]} />
        <meshPhysicalMaterial color="#FFF1E2" roughness={0.8} />
      </mesh>

      {/* Right side wall */}
      <mesh position={[6.0, 2.0, -45.0]} receiveShadow>
        <boxGeometry args={[0.1, 5.3, 110]} />
        <meshPhysicalMaterial color="#FFF1E2" roughness={0.8} />
      </mesh>

      {/* Ceiling structure */}
      <mesh position={[0, 4.6, -45.0]} receiveShadow>
        <boxGeometry args={[12, 0.1, 110]} />
        <meshPhysicalMaterial color="#FFF1E2" roughness={0.9} />
      </mesh>

      {/* Interconnected arches */}
      {[6.0, 0.0, -12.0, -24.0, -36.0, -48.0, -58.0, -70.0, -84.0, -96.0].map((z, idx) => (
        <group key={idx} position={[0, 0, z]}>
          {/* Left marble arch pillar */}
          <mesh position={[-4.5, 2.0, 0]} castShadow>
            <boxGeometry args={[0.4, 5.2, 0.4]} />
            <meshPhysicalMaterial color="#014421" roughness={0.5} clearcoat={0.3} />
          </mesh>
          
          {/* Right marble arch pillar */}
          <mesh position={[4.5, 2.0, 0]} castShadow>
            <boxGeometry args={[0.4, 5.2, 0.4]} />
            <meshPhysicalMaterial color="#014421" roughness={0.5} clearcoat={0.3} />
          </mesh>
          
          {/* Gold Trim Accents */}
          <mesh position={[-4.5, 2.0, 0.22]} castShadow>
            <boxGeometry args={[0.08, 5.2, 0.04]} />
            <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
          </mesh>
          <mesh position={[4.5, 2.0, 0.22]} castShadow>
            <boxGeometry args={[0.08, 5.2, 0.04]} />
            <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
          </mesh>
          
          {/* Curved top arch beam */}
          <mesh position={[0, 4.55, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 9.2, 24]} />
            <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --- BOUTIQUE AUTOMATED SWING DOORS (Z = 6) ---
export function GrandEntranceDoor() {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    
    // Doors slowly swing open from scroll progress 0.0 to 0.12
    const doorProgress = Math.min(Math.max((progress - 0.0) / 0.12, 0), 1);
    const angle = doorProgress * (Math.PI / 2.1); // Swing up to 85 degrees

    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = -angle;
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = angle;
    }
  });

  return (
    <group position={[0, -0.65, 6.0]}>
      {/* Left door wing, pivot on hinge */}
      <group ref={leftDoorRef} position={[-4.3, 2.45, 0]}>
        <mesh position={[2.15, 0, 0]} castShadow>
          <boxGeometry args={[4.3, 4.9, 0.14]} />
          <meshPhysicalMaterial color="#014421" roughness={0.35} metalness={0.15} clearcoat={0.7} />
        </mesh>
        {/* Decorative gold face plate */}
        <mesh position={[2.15, 0, 0.08]} castShadow>
          <boxGeometry args={[4.05, 4.6, 0.02]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Handle gold */}
        <mesh position={[3.9, 0, 0.14]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.05} />
        </mesh>
      </group>

      {/* Right door wing, pivot on hinge */}
      <group ref={rightDoorRef} position={[4.3, 2.45, 0]}>
        <mesh position={[-2.15, 0, 0]} castShadow>
          <boxGeometry args={[4.3, 4.9, 0.14]} />
          <meshPhysicalMaterial color="#014421" roughness={0.35} metalness={0.15} clearcoat={0.7} />
        </mesh>
        {/* Decorative gold face plate */}
        <mesh position={[-2.15, 0, 0.08]} castShadow>
          <boxGeometry args={[4.05, 4.6, 0.02]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Handle gold */}
        <mesh position={[-3.9, 0, 0.14]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.05} />
        </mesh>
      </group>
    </group>
  );
}

// --- RECEPTION GALLERY ARCHIVE PICTURES (Z = 2) ---
export function ReceptionGallerySketches() {
  const sketches = [
    { x: -5.9, z: 2.2, img: "/emerald_ring.png", label: "Botanical Solitaire Ring" },
    { x: 5.9, z: 0.8, img: "/emerald_necklace.png", label: "Imperial Emerald Collar" },
    { x: -5.9, z: -0.6, img: "/emerald_earrings.png", label: "Botanical Drop Earrings" },
    { x: 5.9, z: -2.0, img: "/gold_bracelet.png", label: "Sown Double Helix Bracelet" },
  ];

  return (
    <group>
      {sketches.map((sk, idx) => {
        const isRight = sk.x > 0;
        return (
          <group key={idx} position={[sk.x, 1.45, sk.z]}>
            {/* Frame base board */}
            <mesh rotation={[0, isRight ? -Math.PI / 2 : Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[1.8, 1.35, 0.05]} />
              <meshPhysicalMaterial color="#211A12" roughness={0.7} />
            </mesh>
            {/* Brushed gold border trim */}
            <mesh rotation={[0, isRight ? -Math.PI / 2 : Math.PI / 2, 0]} position={[isRight ? -0.03 : 0.03, 0, 0]} castShadow>
              <boxGeometry args={[1.7, 1.25, 0.02]} />
              <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
            </mesh>

            {/* Label flag on top */}
            <Html position={[0, 0.85, 0]} center transform distanceFactor={5.0}>
              <div className="bg-[#FFF1E2] border border-[#014421]/20 rounded-md px-2 py-0.5 shadow-sm text-[7px] uppercase tracking-widest text-[#014421] font-semibold whitespace-nowrap">
                {sk.label}
              </div>
            </Html>

            {/* Core blueprint grid & image display */}
            <Html
              position={[isRight ? -0.045 : 0.045, 0, 0]}
              rotation={[0, isRight ? -Math.PI / 2 : Math.PI / 2, 0]}
              center
              transform
              distanceFactor={1.12}
            >
              <div className="w-[165px] h-[120px] bg-[#014421] rounded-xs p-2.5 flex gap-2 font-mono select-none overflow-hidden border border-[#C8A96A]/30 animate-fade-in"
                   style={{ backgroundImage: 'linear-gradient(rgba(200,169,106,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,106,0.06) 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
                {/* CAD Image */}
                <div className="w-[56px] h-full relative rounded-xs border border-[#C8A96A]/20 overflow-hidden bg-black/40 flex-shrink-0">
                  <img
                    src={sk.img}
                    alt={sk.label}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C8A96A]/10 to-transparent pointer-events-none" />
                </div>
                {/* Tech Specs */}
                <div className="flex-1 flex flex-col justify-between text-left h-full text-white">
                  <div className="border-b border-[#C8A96A]/25 pb-1 flex justify-between items-center text-[4.5px] text-[#C8A96A] tracking-wider font-bold">
                    <span>{sk.label.toUpperCase()}</span>
                    <span>FIG. 0{idx + 1}</span>
                  </div>
                  <div className="py-1 flex-1 flex flex-col justify-center gap-0.5 opacity-80 text-[4px] text-white/80">
                    <div>DESIGN CODE: VDT_{100 + idx}</div>
                    <div>METAL ALLOY: 18K GOLD</div>
                    <div>GEM SPECS: Muzo emerald</div>
                    <div className="text-[#C8A96A]">STATUS: SIGNED</div>
                  </div>
                  <div className="text-[3.5px] text-white/40 tracking-tight leading-none border-t border-[#C8A96A]/20 pt-1">
                    <div>METRIC SCALE 1:1 // VERDANT</div>
                    <div className="text-[#C8A96A]/25 mt-0.5">CONFIDENTIAL</div>
                  </div>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// --- EXHIBITION HALL HERO SOLITAIRE (Z = -12) ---
export function ExhibitionHallRing() {
  return (
    <group position={[0, -0.65, -12.0]}>
      {/* Circular Marble Pedestal */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.78, 0.8, 32]} />
        <meshPhysicalMaterial color="#FFF1E2" roughness={0.1} clearcoat={1.0} clearcoatRoughness={0.08} />
      </mesh>
      {/* Pedestal Emerald Accent trim ring */}
      <mesh position={[0, 0.81, 0]} castShadow>
        <cylinderGeometry args={[0.71, 0.71, 0.05, 32]} />
        <meshPhysicalMaterial color="#014421" roughness={0.4} clearcoat={0.3} />
      </mesh>
      {/* Pedestal Gold band line */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.715, 0.715, 0.015, 32]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>

      {/* Bevelled Glass showcase cabinet */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[1.0, 1.25, 1.0]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.96}
          roughness={0.0}
          thickness={0.2}
          transparent
          opacity={0.35}
        />
      </mesh>
      {/* Gold Frame accents for show cabinet */}
      <group position={[0, 1.45, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.02, 0.03, 1.02]} /> {/* Top frame rim */}
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.62, 0]} castShadow>
          <boxGeometry args={[1.02, 0.03, 1.02]} /> {/* Bottom frame rim */}
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
        </mesh>
      </group>

      {/* Floating Solitaire Gem centerpiece */}
      <RealisticDiamond position={[0, 1.35, 0]} scale={0.7} />
    </group>
  );
}

// --- FLOATING BRACELET GALLERY (Z = -24) ---
export function BraceletGalleryBoxes() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const boxes = [
    { x: -1.8, y: -0.15, z: -23.0 },
    { x: 0.0, y: -0.42, z: -24.0 },
    { x: 1.8, y: -0.1, z: -25.0 }
  ];

  return (
    <group>
      {boxes.map((bx, idx) => {
        const isHovered = hoveredIndex === idx;
        const lidY = isHovered ? 0.65 : 0.0;
        const braceletY = isHovered ? 0.38 : 0.08;

        return (
          <group
            key={idx}
            position={[bx.x, bx.y, bx.z]}
            onPointerOver={() => setHoveredIndex(idx)}
            onPointerOut={() => setHoveredIndex(null)}
          >
            {/* Pedestal Stand base */}
            <mesh position={[0, -0.1, 0]} castShadow>
              <boxGeometry args={[0.9, 0.22, 0.9]} />
              <meshPhysicalMaterial color="#FFF1E2" roughness={0.2} clearcoat={0.5} />
            </mesh>
            {/* Emerald panel trim */}
            <mesh position={[0, -0.22, 0]} castShadow>
              <boxGeometry args={[0.92, 0.05, 0.92]} />
              <meshPhysicalMaterial color="#014421" roughness={0.5} />
            </mesh>
            {/* Gold border strip */}
            <mesh position={[0, -0.01, 0]}>
              <boxGeometry args={[0.91, 0.02, 0.91]} />
              <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
            </mesh>

            {/* Bevelled glass lid (animates upwards on hover) */}
            <mesh position={[0, 0.22 + lidY, 0]} castShadow>
              <boxGeometry args={[0.8, 0.44, 0.8]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.92} roughness={0.0} thickness={0.12} transparent opacity={0.3} />
            </mesh>

            {/* Levitating bracelet */}
            <group position={[0, braceletY, 0]} scale={0.42}>
              <BotanicalBracelet />
            </group>
          </group>
        );
      })}
    </group>
  );
}

// --- EARRING SHOWCASE ROOM (Z = -36) ---
export function EarringShowcase() {
  return (
    <group position={[0, -0.65, -36.0]}>
      {/* Left display column */}
      <group position={[-1.85, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.4, 1.0, 24]} />
          <meshPhysicalMaterial color="#014421" roughness={0.15} clearcoat={1.0} />
        </mesh>
        <mesh position={[0, 1.015, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.03, 24]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
        </mesh>
        <group position={[0, 1.4, 0]} scale={0.8}>
          <BotanicalEarrings />
        </group>
      </group>

      {/* Right display column */}
      <group position={[1.85, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.4, 1.0, 24]} />
          <meshPhysicalMaterial color="#014421" roughness={0.15} clearcoat={1.0} />
        </mesh>
        <mesh position={[0, 1.015, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.03, 24]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
        </mesh>
        <group position={[0, 1.4, 0]} scale={0.8}>
          <BotanicalEarrings />
        </group>
      </group>
    </group>
  );
}

// --- NECKLACE EXHBIT ALCOVE (Z = -48) ---
export function NecklaceExhibition() {
  return (
    <group position={[0, -0.65, -48.0]}>
      {/* Satin fabric panels framing the alcove entry at Z = -43 */}
      <group position={[0, 2.5, 5.0]}>
        {/* Left Satin Panel */}
        <mesh position={[-2.6, 0, 0]} castShadow>
          <boxGeometry args={[2.0, 5.0, 0.2]} />
          <meshPhysicalMaterial color="#FFF1E2" roughness={0.7} transparent opacity={0.85} thickness={0.5} />
        </mesh>
        <mesh position={[-1.6, -0.5, 0.05]} rotation={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4.0, 8]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
        </mesh>
        {/* Right Satin Panel */}
        <mesh position={[2.6, 0, 0]} castShadow>
          <boxGeometry args={[2.0, 5.0, 0.2]} />
          <meshPhysicalMaterial color="#FFF1E2" roughness={0.7} transparent opacity={0.85} thickness={0.5} />
        </mesh>
        <mesh position={[1.6, -0.5, 0.05]} rotation={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4.0, 8]} />
          <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
        </mesh>
      </group>

      {/* Main Exhibition Stand */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.9, 24]} />
        <meshPhysicalMaterial color="#FFF1E2" roughness={0.12} clearcoat={1.0} />
      </mesh>
      {/* Accent Gold frame loop */}
      <mesh position={[0, 0.91, 0]}>
        <cylinderGeometry args={[0.63, 0.63, 0.03, 24]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>

      {/* Velvet stand bust with necklace */}
      <group position={[0, 1.35, 0]} scale={0.75}>
        <mesh castShadow>
          <coneGeometry args={[0.3, 0.6, 16]} />
          <meshPhysicalMaterial color="#014421" roughness={0.85} />
        </mesh>
        <group position={[0, 0.35, 0]}>
          <BotanicalNecklace />
        </group>
      </group>
    </group>
  );
}

// --- CRAFTSMANSHIP WORKTABLE METRIC MORPH (Z = -58) ---
export function CraftsmanshipStudio() {
  const ringRef = useRef<THREE.Group>(null);
  const puddleRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = scrollY / maxScroll;
      // Zone 7 is Z = -58 (progress 0.65 to 0.75)
      if (progress > 0.65 && progress < 0.75) {
        scrollProgress.current = (progress - 0.65) / 0.10;
      } else if (progress <= 0.65) {
        scrollProgress.current = 0;
      } else {
        scrollProgress.current = 1;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    const t = scrollProgress.current;
    
    // Melting gold liquid puddle morphs/solidifies
    if (puddleRef.current) {
      puddleRef.current.scale.set(Math.max(1.0 - t * 1.15, 0.01), Math.max(1.0 - t * 1.15, 0.01), 1.0);
      puddleRef.current.rotation.z = state.clock.getElapsedTime() * 0.45;
    }
    
    // Liquid gold morphing to elegant botanical ring
    if (ringRef.current) {
      const s = Math.min(t * 0.75, 0.75);
      ringRef.current.scale.set(s, s, s);
      ringRef.current.rotation.y = state.clock.getElapsedTime() * 0.6;
      ringRef.current.position.y = 0.58 + Math.sin(state.clock.getElapsedTime() * 1.6) * 0.04;
    }
  });

  return (
    <group position={[-1.9, -0.65, -58.0]}>
      {/* Workbench (Walnut brown wood desk) */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.44, 1.1]} />
        <meshPhysicalMaterial color="#402915" roughness={0.7} />
      </mesh>
      {/* Gold Table border */}
      <mesh position={[0, 0.445, 0]}>
        <boxGeometry args={[1.92, 0.01, 1.12]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>

      {/* Fire container pot */}
      <mesh position={[0.42, 0.48, 0.22]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.12, 16]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>

      {/* Gold melting liquid */}
      <mesh ref={puddleRef} position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <dodecahedronGeometry args={[0.22, 1]} />
        <meshPhysicalMaterial
          color="#C8A96A"
          metalness={1.0}
          roughness={0.08}
          emissive="#A38244"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Emerging finished polished botanical ring */}
      <group ref={ringRef} scale={0} position={[0, 0.58, 0]}>
        <LuxuryRing gemColor="#014421" />
      </group>
    </group>
  );
}

// --- PREMIUM BOTANICAL LINE DISPLAY (Z = -70) ---
export function PremiumCollection() {
  const items = [
    { x: -1.8, label: "Rings", component: <BotanicalRing /> },
    { x: -0.6, label: "Necklaces", component: <BotanicalNecklace /> },
    { x: 0.6, label: "Bracelets", component: <BotanicalBracelet /> },
    { x: 1.8, label: "Earrings", component: <BotanicalEarrings /> },
  ];

  return (
    <group position={[0, -0.65, -70.0]}>
      {items.map((ped, idx) => {
        return (
          <group key={idx} position={[ped.x, 0, 0]}>
            {/* High Emerald Marble column stands */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.34, 0.8, 18]} />
              <meshPhysicalMaterial color="#014421" roughness={0.18} clearcoat={1.0} />
            </mesh>
            {/* Gold borders for column caps */}
            <mesh position={[0, 0.01, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.03, 18]} />
              <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.81, 0]}>
              <cylinderGeometry args={[0.33, 0.33, 0.03, 18]} />
              <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
            </mesh>

            {/* Levitating products */}
            <group position={[0, 1.22, 0]} scale={0.72}>
              {ped.component}
            </group>
          </group>
        );
      })}
    </group>
  );
}

// --- VIP PRIVATE REFLECTOR MIRROR (Z = -84) ---
export function VIPShowroomMirror() {
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.position.y = 1.35 + Math.sin(time * 1.3) * 0.05;
      ringRef.current.rotation.y = time * 0.55;
    }
  });

  return (
    <group position={[0, -0.65, -84.0]}>
      {/* 1. Gold backing frame plate */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[2.5, 3.2, 0.08]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.15} clearcoat={1.0} />
      </mesh>

      {/* 2. Emerald accent bezel */}
      <mesh position={[0, 1.5, -0.05]} castShadow>
        <boxGeometry args={[2.6, 3.3, 0.04]} />
        <meshPhysicalMaterial color="#014421" roughness={0.4} />
      </mesh>

      {/* 3. Reflector mirror surface (Real-time WebGL reflections) */}
      <mesh position={[0, 1.5, 0.045]}>
        <planeGeometry args={[2.3, 3.0]} />
        <MeshReflectorMaterial
          blur={[0, 0]}
          resolution={512}
          mixBlur={0}
          mixStrength={1.5}
          roughness={0.0}
          depthScale={0}
          color="#8b958c"
          metalness={0.8}
          mirror={1.0}
        />
      </mesh>

      {/* 4. Luxury Ring floating in front of the try-on mirror */}
      <group ref={ringRef} position={[0, 1.35, 0.95]} scale={0.45}>
        <LuxuryRing gemColor="#ffffff" />
      </group>
    </group>
  );
}

// --- BOUTIQUE CHECKOUT LOUNGE AREA (Z = -94) ---
export function CheckoutLounge() {
  return (
    <group position={[0, -0.65, -94.0]}>
      {/* Large polished cream stone marble lounge table */}
      <mesh position={[-0.8, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.7, 1.0]} />
        <meshPhysicalMaterial color="#FFF1E2" roughness={0.1} clearcoat={1.0} />
      </mesh>
      {/* Table Gold border */}
      <mesh position={[-0.8, 0.705, 0]}>
        <boxGeometry args={[1.82, 0.015, 1.02]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.1} />
      </mesh>

      {/* Velvet Lounge Chair Left */}
      <mesh position={[1.2, 0.3, 0.3]} rotation={[0, -Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
        <meshPhysicalMaterial color="#014421" roughness={0.8} />
      </mesh>
      {/* Velvet Lounge Chair Right */}
      <mesh position={[1.2, 0.3, -0.7]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
        <meshPhysicalMaterial color="#014421" roughness={0.8} />
      </mesh>

      {/* Floating welcoming jewel on table */}
      <group position={[-0.8, 0.95, 0]} scale={0.35}>
        <LuxuryRing gemColor="#014421" />
      </group>
    </group>
  );
}
