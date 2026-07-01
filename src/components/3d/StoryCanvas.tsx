"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// --- GLOBAL EVENT BUS FOR MOUSE HOVER STATES IN SCENE 5 ---
let activeCollectionIndex = -1;
export function setActiveCollectionHover(index: number) {
  activeCollectionIndex = index;
}

// --- PRECISE LUXURY PBR MATERIALS ---
function useJewelryMaterials() {
  return useMemo(() => {
    // Oxidized silver / darkened carved silver (antique look)
    const oxidizedSilver = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#2E2E2E"),
      metalness: 0.95,
      roughness: 0.20,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      envMapIntensity: 3.2,
    });

    // Mirror polished sterling silver (highly reflective mirror finish)
    const sterlingSilver = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ECECEC"),
      metalness: 1.0,
      roughness: 0.01,
      clearcoat: 1.0,
      clearcoatRoughness: 0.005,
      envMapIntensity: 3.8,
    });

    // Traditional polished gold (warm 18k glow)
    const filigreeGold = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#D4AF37"), // Genuine 18K gold color tone
      metalness: 1.0,
      roughness: 0.015,
      clearcoat: 1.0,
      clearcoatRoughness: 0.005,
      envMapIntensity: 3.8,
    });

    // Turquoise stone cabochon (polished turquoise blue)
    const turquoiseStone = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#30D5C8"),
      roughness: 0.08,
      metalness: 0.0,
      clearcoat: 0.95,
      clearcoatRoughness: 0.02,
    });

    // Lapis Lazuli stone (flat royal blue)
    const lapisStone = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0F2B5C"),
      roughness: 0.1,
      metalness: 0.0,
      clearcoat: 0.95,
      clearcoatRoughness: 0.02,
    });

    // Jade Green stone (translucent emerald green)
    const jadeStone = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0A5C36"),
      roughness: 0.04,
      metalness: 0.0,
      clearcoat: 0.98,
      clearcoatRoughness: 0.01,
      transmission: 0.65,
      thickness: 0.45,
    });

    // Ruby Red/Pink stone (vitreous ruby translucent)
    const rubyStone = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#D81B60"),
      roughness: 0.01,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.005,
      transmission: 0.95,
      thickness: 0.55,
    });

    return { oxidizedSilver, sterlingSilver, filigreeGold, turquoiseStone, lapisStone, jadeStone, rubyStone };
  }, []);
}

// --- EARRING POST & BUTTERFLY CLUTCH BACKING ---
function EarringPostBacking({ material }: { material: THREE.Material }) {
  return (
    <group position={[0, 0, -0.05]}>
      {/* Post Pin (Thin cylinder going backward) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.15]} material={material} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.32, 8]} />
      </mesh>

      {/* Butterfly Clutch backing (scroll) */}
      <group position={[0, 0, -0.3]}>
        {/* Central sleeve */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={material}>
          <cylinderGeometry args={[0.022, 0.022, 0.05, 8]} />
        </mesh>
        {/* Left curl */}
        <mesh position={[-0.035, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={material}>
          <torusGeometry args={[0.038, 0.009, 8, 16]} />
        </mesh>
        {/* Right curl */}
        <mesh position={[0.035, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={material}>
          <torusGeometry args={[0.038, 0.009, 8, 16]} />
        </mesh>
      </group>
    </group>
  );
}

// --- INTERLOCKING JUMP-RING LINK (Loop weaving through Loop) ---
function JumpRingLink({ yOffset, material }: { yOffset: number; material: THREE.Material }) {
  return (
    <group position={[0, yOffset, 0]}>
      {/* Top vertical loop (welded to stud) */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0.03, 0]} material={material} castShadow>
        <torusGeometry args={[0.045, 0.009, 8, 16]} />
      </mesh>
      {/* Bottom horizontal loop (welded to drop body) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} material={material} castShadow>
        <torusGeometry args={[0.045, 0.009, 8, 16]} />
      </mesh>
    </group>
  );
}

// --- PEACOCK EMBLEM SUB-GEOMETRY ---
function PeacockEmblem({ scale = 1.0 }: { scale?: number }) {
  const { filigreeGold } = useJewelryMaterials();
  return (
    <group scale={[scale, scale, scale]}>
      <mesh material={filigreeGold} scale={[1.4, 0.8, 0.8]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
      </mesh>
      <mesh position={[0.07, 0.08, 0.02]} rotation={[0, 0, -0.4]} material={filigreeGold} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.12, 8]} />
      </mesh>
      <mesh position={[0.09, 0.14, 0.02]} material={filigreeGold} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
      </mesh>
      {[-0.4, -0.2, 0, 0.2, 0.4].map((rot, idx) => (
        <mesh
          key={idx}
          position={[-0.08, -0.02, -0.01]}
          rotation={[0, 0, rot - Math.PI / 2]}
          material={filigreeGold}
          scale={[0.6, 1.5, 0.4]}
          castShadow
        >
          <coneGeometry args={[0.04, 0.18, 4]} />
        </mesh>
      ))}
      <mesh position={[0, -0.06, 0.02]} rotation={[0.2, 0, 0]} material={filigreeGold} castShadow>
        <boxGeometry args={[0.15, 0.03, 0.04]} />
      </mesh>
    </group>
  );
}

// --- 1. PEACOCK SPINDLE DROP EARRING (Image 4) ---
export function ArtisanalPeacockEarring({
  position = [0, 0, 0],
  scale = 1.0,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}) {
  const { oxidizedSilver, sterlingSilver, filigreeGold, turquoiseStone } = useJewelryMaterials();
  const groupRef = useRef<THREE.Group>(null);
  const bellsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation[1] + time * 0.18;
      groupRef.current.rotation.x = rotation[0] + Math.sin(time * 0.4) * 0.04;
    }
    if (bellsRef.current) {
      bellsRef.current.rotation.z = Math.sin(time * 1.5) * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Earring backing structure */}
      <EarringPostBacking material={sterlingSilver} />

      {/* Upper Hexagon Plate */}
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]} material={oxidizedSilver} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 6]} />
      </mesh>

      {/* Gold Peacock Motif */}
      <group position={[0, 0, 0.05]} scale={1.2}>
        <PeacockEmblem />
      </group>

      {/* Interlocking Linkage to Drop */}
      <JumpRingLink yOffset={-0.26} material={sterlingSilver} />

      {/* Grooved Spindle Bead */}
      <group position={[0, -0.58, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={sterlingSilver} scale={[0.5, 2.2, 0.5]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
        </mesh>
        {[-0.32, -0.16, 0.16, 0.32].map((xOffset, idx) => (
          <mesh key={idx} position={[xOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={filigreeGold} scale={[0.8, 1.02, 1.02]}>
            <torusGeometry args={[0.2, 0.015, 8, 24]} />
          </mesh>
        ))}

        {/* Turquoise Cabochon Stone-setting Rim */}
        <mesh position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]} material={filigreeGold}>
          <torusGeometry args={[0.07, 0.008, 8, 24]} />
        </mesh>
        <mesh position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]} material={turquoiseStone} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
        </mesh>
        {/* 4 gold prongs */}
        {[[-0.05, 0.05], [0.05, 0.05], [-0.05, -0.05], [0.05, -0.05]].map((coord, idx) => (
          <mesh key={idx} position={[coord[0], coord[1], 0.12]} material={filigreeGold}>
            <sphereGeometry args={[0.015, 6, 6]} />
          </mesh>
        ))}
      </group>

      {/* Hanging Bells */}
      <group ref={bellsRef} position={[0, -0.58, 0]}>
        <group position={[-0.35, -0.22, 0]}><mesh material={filigreeGold}><sphereGeometry args={[0.045, 8, 8]} /></mesh></group>
        <group position={[0.35, -0.22, 0]}><mesh material={filigreeGold}><sphereGeometry args={[0.045, 8, 8]} /></mesh></group>
        <group position={[0, -0.3, 0]} scale={[0.85, 1.4, 0.85]}><mesh material={filigreeGold}><sphereGeometry args={[0.06, 12, 12]} /></mesh></group>
      </group>
    </group>
  );
}

// --- DECOMPOSING PEACOCK EARRING (Scene 3) ---
function DecomposingEarring({ progress }: { progress: number }) {
  const { oxidizedSilver, sterlingSilver, filigreeGold, turquoiseStone } = useJewelryMaterials();
  const factor = THREE.MathUtils.clamp(1.0 - progress, 0, 1) * 1.5;

  return (
    <group scale={1.1}>
      {/* 1. Hexagon plate */}
      <group position={[0, factor * 0.6, 0]}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]} material={oxidizedSilver} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.08, 6]} />
        </mesh>
      </group>
      {/* 2. Peacock Emblem */}
      <group position={[0, 0, 0.05 + factor * 0.8]} scale={1.2}>
        <PeacockEmblem />
      </group>
      {/* 3. Spindle Bead */}
      <group position={[0, -0.58 - factor * 0.6, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={sterlingSilver} scale={[0.5, 2.2, 0.5]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
        </mesh>
        {[-0.32, -0.16, 0.16, 0.32].map((xOffset, idx) => (
          <mesh key={idx} position={[xOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={filigreeGold} scale={[0.8, 1.02, 1.02]}>
            <torusGeometry args={[0.2, 0.015, 8, 24]} />
          </mesh>
        ))}
      </group>
      {/* 4. Turquoise Setting */}
      <group position={[0, -0.58 - factor * 0.6, 0.11 + factor * 0.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={turquoiseStone} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
        </mesh>
      </group>
      {/* 5. Bells */}
      <group position={[0, -0.58 - factor * 1.2, 0]}>
        <group position={[-0.35, -0.22, 0]}><mesh material={filigreeGold}><sphereGeometry args={[0.045, 8, 8]} /></mesh></group>
        <group position={[0.35, -0.22, 0]}><mesh material={filigreeGold}><sphereGeometry args={[0.045, 8, 8]} /></mesh></group>
        <group position={[0, -0.3, 0]} scale={[0.85, 1.4, 0.85]}><mesh material={filigreeGold}><sphereGeometry args={[0.06, 12, 12]} /></mesh></group>
      </group>
    </group>
  );
}

// --- 2. FLORAL DAISY & LAPIS TRIANGLE DROP EARRING (Image 1) ---
export function LapisTriangleEarring({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const { sterlingSilver, filigreeGold, lapisStone } = useJewelryMaterials();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.18;
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Post pin and backing */}
      <EarringPostBacking material={sterlingSilver} />

      {/* Daisy Stud Top */}
      <group position={[0, 0.45, 0]}>
        <mesh material={sterlingSilver} castShadow>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
        {/* 8 daisy petals */}
        {[...Array(8)].map((_, idx) => {
          const angle = (idx * Math.PI * 2) / 8;
          return (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.14, Math.sin(angle) * 0.14, 0]}
              rotation={[Math.PI / 2, 0, angle]}
              material={sterlingSilver}
              castShadow
            >
              <cylinderGeometry args={[0.025, 0.05, 0.04, 8]} />
            </mesh>
          );
        })}
      </group>

      {/* Jump Ring Interlocking linkage */}
      <JumpRingLink yOffset={0.24} material={sterlingSilver} />

      {/* Silver Triangle (Pointed Down) */}
      <group position={[0, -0.22, 0]}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI]} material={sterlingSilver} scale={[1.1, 0.1, 1.1]} castShadow>
          <cylinderGeometry args={[0, 0.45, 0.8, 3, 1]} />
        </mesh>

        {/* Lapis Lazuli flat stone cabochon */}
        <mesh position={[0, 0.04, 0.05]} rotation={[Math.PI / 2, 0, Math.PI]} material={lapisStone} scale={[1.1, 0.08, 1.1]}>
          <cylinderGeometry args={[0, 0.35, 0.8, 3, 1]} />
        </mesh>

        {/* Lapis Prongs (Claws) at vertices */}
        <mesh position={[0, 0.12, 0.07]} material={sterlingSilver}><sphereGeometry args={[0.015, 6, 6]} /></mesh>
        <mesh position={[-0.22, -0.26, 0.07]} material={sterlingSilver}><sphereGeometry args={[0.015, 6, 6]} /></mesh>
        <mesh position={[0.22, -0.26, 0.07]} material={sterlingSilver}><sphereGeometry args={[0.015, 6, 6]} /></mesh>

        {/* Left & Right Silver Fish Trims */}
        <mesh position={[-0.32, 0.1, 0.02]} rotation={[0, 0, 0.6]} material={sterlingSilver} scale={[0.8, 1.8, 0.8]}>
          <cylinderGeometry args={[0.03, 0.03, 0.18, 8]} />
        </mesh>
        <mesh position={[0.32, 0.1, 0.02]} rotation={[0, 0, -0.6]} material={sterlingSilver} scale={[0.8, 1.8, 0.8]}>
          <cylinderGeometry args={[0.03, 0.03, 0.18, 8]} />
        </mesh>

        {/* Tiny gold beads hanging on loops */}
        {[-0.2, 0, 0.2].map((xOffset, idx) => (
          <group key={idx} position={[xOffset, -0.42, 0]}>
            <mesh material={filigreeGold}>
              <sphereGeometry args={[0.04, 8, 8]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// --- 3. JADE SQUARE & FILIGREE RUBY EARRING (Image 2) ---
export function JadeFiligreeEarring({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const { sterlingSilver, filigreeGold, jadeStone, rubyStone } = useJewelryMaterials();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.18;
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Post backing structure */}
      <EarringPostBacking material={sterlingSilver} />

      {/* Square Jade Stud Top */}
      <group position={[0, 0.5, 0]}>
        <mesh material={jadeStone} castShadow>
          <boxGeometry args={[0.36, 0.36, 0.12]} />
        </mesh>
        {/* Jade prongs (4 gold claws) */}
        {[[-0.18, 0.18], [0.18, 0.18], [-0.18, -0.18], [0.18, -0.18]].map((coord, idx) => (
          <mesh key={idx} position={[coord[0], coord[1], 0.06]} material={filigreeGold}>
            <sphereGeometry args={[0.016, 6, 6]} />
          </mesh>
        ))}
      </group>

      {/* Jump Ring Linkage */}
      <JumpRingLink yOffset={0.28} material={filigreeGold} />

      {/* Oblong Filigree Silver Shield */}
      <group position={[0, -0.18, 0]}>
        {/* Silver backdrop base */}
        <mesh material={sterlingSilver} castShadow>
          <boxGeometry args={[0.55, 0.72, 0.04]} />
        </mesh>
        
        {/* Filigree Wireframe Outer Accent */}
        <mesh material={filigreeGold} scale={[1.04, 1.04, 1.04]}>
          <boxGeometry args={[0.55, 0.72, 0.05]} />
        </mesh>

        {/* Central Bezel setting (Gold Border) */}
        <mesh position={[0, 0, 0.04]} material={filigreeGold}>
          <boxGeometry args={[0.22, 0.22, 0.04]} />
        </mesh>

        {/* Pink Ruby square stone */}
        <mesh position={[0, 0, 0.065]} material={rubyStone}>
          <boxGeometry args={[0.13, 0.13, 0.05]} />
        </mesh>

        {/* Ruby Prongs */}
        {[[-0.065, 0.065], [0.065, 0.065], [-0.065, -0.065], [0.065, -0.065]].map((coord, idx) => (
          <mesh key={idx} position={[coord[0], coord[1], 0.075]} material={filigreeGold}>
            <sphereGeometry args={[0.012, 6, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// --- 4. OCTAGON BEZEL & ROUND TURQUOISE DISC EARRING (Image 3) ---
export function TurquoiseDiscEarring({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const { sterlingSilver, filigreeGold, turquoiseStone } = useJewelryMaterials();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.22;
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Earring backing structure */}
      <EarringPostBacking material={sterlingSilver} />

      {/* Octagonal Stud Top */}
      <group position={[0, 0.55, 0]}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 8]} material={sterlingSilver} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.06, 8]} />
        </mesh>
        <mesh position={[0, 0, 0.04]} material={turquoiseStone}>
          <boxGeometry args={[0.13, 0.13, 0.03]} />
        </mesh>
        {/* Prongs */}
        {[[-0.065, 0.065], [0.065, 0.065], [-0.065, -0.065], [0.065, -0.065]].map((coord, idx) => (
          <mesh key={idx} position={[coord[0], coord[1], 0.05]} material={sterlingSilver}>
            <sphereGeometry args={[0.012, 6, 6]} />
          </mesh>
        ))}
      </group>

      {/* Jump Ring Linkage */}
      <JumpRingLink yOffset={0.34} material={sterlingSilver} />

      {/* Round Scalloped Disc Bottom */}
      <group position={[0, -0.22, 0]}>
        {/* Silver disc base */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={sterlingSilver} castShadow>
          <cylinderGeometry args={[0.54, 0.54, 0.05, 32]} />
        </mesh>

        {/* 12 Scalloped floral beads along the rim */}
        {[...Array(12)].map((_, idx) => {
          const angle = (idx * Math.PI * 2) / 12;
          return (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.54, Math.sin(angle) * 0.54, 0]}
              material={sterlingSilver}
            >
              <sphereGeometry args={[0.035, 8, 8]} />
            </mesh>
          );
        })}

        {/* Bezel stone setting rim */}
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={filigreeGold}>
          <torusGeometry args={[0.42, 0.01, 8, 32]} />
        </mesh>

        {/* Round Turquoise Cabochon center */}
        <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]} material={turquoiseStone}>
          <cylinderGeometry args={[0.42, 0.42, 0.05, 24]} />
        </mesh>
      </group>
    </group>
  );
}

// --- DECORATIVE SUSPENDED ACCENT LINKS FOR CINEMATIC PARALLAX ---
function ParallaxBackgroundLinks() {
  const { filigreeGold, sterlingSilver } = useJewelryMaterials();
  
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);
  const meshRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef1.current) {
      meshRef1.current.position.y = 1.0 + Math.sin(time * 0.4) * 0.12;
      meshRef1.current.rotation.x = time * 0.07;
      meshRef1.current.rotation.y = time * 0.1;
    }
    if (meshRef2.current) {
      meshRef2.current.position.y = -1.2 + Math.sin(time * 0.35 + 1.5) * 0.15;
      meshRef2.current.rotation.z = time * 0.08;
      meshRef2.current.rotation.x = -time * 0.06;
    }
    if (meshRef3.current) {
      meshRef3.current.position.y = 0.4 + Math.sin(time * 0.55 + 3.0) * 0.08;
      meshRef3.current.rotation.y = -time * 0.12;
    }
  });

  return (
    <group>
      {/* link 1: gold ring link far left background */}
      <mesh ref={meshRef1} position={[-2.7, 1.0, -3.5]} material={filigreeGold}>
        <torusGeometry args={[0.65, 0.025, 8, 48]} />
      </mesh>
      {/* link 2: silver link far right background */}
      <mesh ref={meshRef2} position={[2.6, -1.2, -3.0]} material={sterlingSilver}>
        <torusGeometry args={[0.55, 0.02, 8, 48]} />
      </mesh>
      {/* link 3: gold link front right */}
      <mesh ref={meshRef3} position={[1.7, 0.4, -1.6]} material={filigreeGold}>
        <torusGeometry args={[0.38, 0.012, 8, 32]} />
      </mesh>
    </group>
  );
}

// --- MAIN DIRECTOR COMPONENT FOR SCENE CAMERAS AND SCALING ---
function SceneDirector({ isMobile, spotLightRef }: { isMobile: boolean; spotLightRef: React.RefObject<THREE.SpotLight | null> }) {
  const globalGroupRef = useRef<THREE.Group>(null);
  const heroGroupRef = useRef<THREE.Group>(null);
  const explosionGroupRef = useRef<THREE.Group>(null);
  const showcaseGroupRef = useRef<THREE.Group>(null);

  const featuredGroup1 = useRef<THREE.Group>(null);
  const featuredGroup2 = useRef<THREE.Group>(null);
  const featuredGroup3 = useRef<THREE.Group>(null);

  const [scrollProgress, setScrollProgress] = useState(0);

  const targetCamPos = useMemo(() => new THREE.Vector3(0, 0.2, 3.2), []);
  const targetCamRot = useMemo(() => new THREE.Euler(0, 0, 0), []);
  const activeSection = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = THREE.MathUtils.clamp(scrollY / maxScroll, 0, 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const progress = scrollProgress;

    const segment = THREE.MathUtils.clamp(Math.floor(progress * 9), 0, 8);
    activeSection.current = segment;

    const mobileScale = isMobile ? 0.72 : 1.0;
    const xOffset = isMobile ? 0.0 : 1.1;

    // Default object values
    let targetHeroScale = 0;
    let targetHeroX = 0;
    let targetHeroY = 0;
    let targetHeroRotY = time * 0.25;
    let targetHeroRotX = Math.sin(time * 0.45) * 0.08;

    let targetExplosionScale = 0;
    let targetExplosionRotY = time * 0.2;

    let targetFeaturedScale = 0;
    let targetShowcaseScale = 0;
    let targetShowcaseY = 0;

    // Orchestrate camera coordinates and mesh sizes dynamically
    if (progress < 0.11) {
      // SCENE 1: HERO
      targetHeroScale = 1.05 * mobileScale;
      targetHeroX = 0;
      targetHeroY = 0.2;

      targetCamPos.set(0, 0.1, 2.9);
      targetCamRot.set(0, 0, 0);
    } else if (progress < 0.22) {
      // SCENE 2: BRAND STORY
      const t = (progress - 0.11) / 0.11;
      targetHeroScale = 0.95 * mobileScale;
      targetHeroX = THREE.MathUtils.lerp(0, -xOffset, t);
      targetHeroY = 0.2;

      targetCamPos.set(0, 0.1, 2.6 - t * 0.3);
      targetCamRot.set(0, 0, 0);
    } else if (progress < 0.33) {
      // SCENE 3: CRAFTSMANSHIP (DECOMPOSING EARRING)
      const t = (progress - 0.22) / 0.11;
      targetHeroScale = THREE.MathUtils.lerp(0.95 * mobileScale, 0, Math.min(t * 2.0, 1.0));
      targetHeroX = -xOffset;

      targetExplosionScale = THREE.MathUtils.lerp(0, 1.15 * mobileScale, t);
      targetExplosionRotY = time * 0.18;

      targetCamPos.set(0, 0.15, 2.7);
      targetCamRot.set(0.04, 0, 0);
    } else if (progress < 0.44) {
      // SCENE 4: MATERIALS
      const t = (progress - 0.33) / 0.11;
      targetExplosionScale = THREE.MathUtils.lerp(1.15 * mobileScale, 0.85 * mobileScale, t);
      targetExplosionRotY = time * 0.22;
      
      explosionGroupRef.current?.position.set(THREE.MathUtils.lerp(0, xOffset, t), 0.15, 0);

      targetCamPos.set(0, 0.1, 2.6);
      targetCamRot.set(0, 0, 0);
    } else if (progress < 0.55) {
      // SCENE 5: FEATURED COLLECTION
      const t = (progress - 0.44) / 0.11;
      targetExplosionScale = THREE.MathUtils.lerp(0.85 * mobileScale, 0, t);
      targetFeaturedScale = THREE.MathUtils.lerp(0, 0.8 * mobileScale, t);

      targetCamPos.set(0, 0.15, 3.4);
      targetCamRot.set(-0.02, 0, 0);
    } else if (progress < 0.66) {
      // SCENE 6: JEWELRY SHOWCASE (NECKLACE ORBIT)
      const t = (progress - 0.55) / 0.11;
      targetFeaturedScale = THREE.MathUtils.lerp(0.8 * mobileScale, 0, t);
      targetShowcaseScale = THREE.MathUtils.lerp(0, 1.05 * mobileScale, t);
      targetShowcaseY = 0.15;

      targetCamPos.set(0, -0.2 + Math.sin(time * 0.45) * 0.05, 2.3);
      targetCamRot.set(0.08, Math.sin(time * 0.3) * 0.08, 0);
    } else if (progress < 0.77) {
      // SCENE 7: LUXURY EXPERIENCE
      const t = (progress - 0.66) / 0.11;
      targetShowcaseScale = THREE.MathUtils.lerp(1.05 * mobileScale, 0.6 * mobileScale, t);
      targetShowcaseY = THREE.MathUtils.lerp(0.15, 0.2, t);

      targetCamPos.set(0, 0.3, THREE.MathUtils.lerp(2.3, 4.2, t));
      targetCamRot.set(-0.06, 0, 0);
    } else if (progress < 0.88) {
      // SCENE 8: TESTIMONIALS
      const t = (progress - 0.77) / 0.11;
      targetShowcaseScale = 0.55 * mobileScale;
      targetShowcaseY = 0.2;

      targetCamPos.set(THREE.MathUtils.lerp(0, -0.6 * xOffset, t), 0.2, 3.7);
      targetCamRot.set(0, THREE.MathUtils.lerp(0, 0.15, t), 0);
    } else {
      // SCENE 9: FINAL CTA
      const t = (progress - 0.88) / 0.12;
      targetShowcaseScale = THREE.MathUtils.lerp(0.55 * mobileScale, 0, t);

      targetHeroScale = THREE.MathUtils.lerp(0, 1.15 * mobileScale, t);
      targetHeroX = 0;
      targetHeroY = 0.2;
      targetHeroRotY = time * 0.32;

      targetCamPos.set(0, 0.2, 2.9);
      targetCamRot.set(-0.02, 0, 0);
    }

    // --- CINEMATIC DYNAMIC LIGHT MOTION FOR GLINTS ---
    if (spotLightRef.current) {
      spotLightRef.current.position.x = 2.0 + Math.sin(time * 0.45) * 1.6;
      spotLightRef.current.position.y = 6.0 + Math.cos(time * 0.3) * 1.0;
    }

    // --- ORGANIC CINEMATIC CAM DRIFT (Handheld Rig feel) ---
    const driftX = Math.sin(time * 0.35) * 0.05 + Math.cos(time * 0.6) * 0.02;
    const driftY = Math.cos(time * 0.3) * 0.05 + Math.sin(time * 0.5) * 0.02;
    targetCamPos.x += driftX;
    targetCamPos.y += driftY;

    // Camera Flight updates
    state.camera.position.lerp(targetCamPos, 0.06);
    
    const curRot = new THREE.Euler().setFromQuaternion(state.camera.quaternion);
    const lerpedRotX = THREE.MathUtils.lerp(curRot.x, targetCamRot.x, 0.06);
    const lerpedRotY = THREE.MathUtils.lerp(curRot.y, targetCamRot.y, 0.06);
    state.camera.rotation.set(lerpedRotX, lerpedRotY, 0);

    // Mouse Parallax drift
    const mouseX = (state.pointer.x * Math.PI) / 24;
    const mouseY = (state.pointer.y * Math.PI) / 24;
    state.camera.position.x += (mouseX - state.camera.position.x * 0.03) * 0.1;
    state.camera.position.y += (mouseY - state.camera.position.y * 0.03) * 0.1;

    // 1. Hero Ring Group Updates
    if (heroGroupRef.current) {
      const hGroup = heroGroupRef.current;
      const s = THREE.MathUtils.lerp(hGroup.scale.x, targetHeroScale, 0.06);
      hGroup.scale.set(s, s, s);
      hGroup.position.x = THREE.MathUtils.lerp(hGroup.position.x, targetHeroX, 0.06);
      hGroup.position.y = THREE.MathUtils.lerp(hGroup.position.y, targetHeroY, 0.06);
      hGroup.rotation.y = THREE.MathUtils.lerp(hGroup.rotation.y, targetHeroRotY, 0.06);
      hGroup.rotation.x = THREE.MathUtils.lerp(hGroup.rotation.x, targetHeroRotX, 0.06);
    }

    // 2. Decomposing Earring Group Updates
    if (explosionGroupRef.current) {
      const eGroup = explosionGroupRef.current;
      const s = THREE.MathUtils.lerp(eGroup.scale.x, targetExplosionScale, 0.06);
      eGroup.scale.set(s, s, s);
      eGroup.rotation.y = THREE.MathUtils.lerp(eGroup.rotation.y, targetExplosionRotY, 0.06);
    }

    // 3. Featured 3D Items Group Updates
    const fScale1 = activeCollectionIndex === 0 ? targetFeaturedScale * 1.25 : targetFeaturedScale;
    const fScale2 = activeCollectionIndex === 1 ? targetFeaturedScale * 1.25 : targetFeaturedScale;
    const fScale3 = activeCollectionIndex === 2 ? targetFeaturedScale * 1.25 : targetFeaturedScale;

    const fRotY1 = activeCollectionIndex === 0 ? time * 1.2 : time * 0.28;
    const fRotY2 = activeCollectionIndex === 1 ? time * 1.2 : time * 0.28;
    const fRotY3 = activeCollectionIndex === 2 ? time * 1.2 : time * 0.28;

    if (featuredGroup1.current && featuredGroup2.current && featuredGroup3.current) {
      featuredGroup1.current.scale.lerp(new THREE.Vector3(fScale1, fScale1, fScale1), 0.06);
      featuredGroup2.current.scale.lerp(new THREE.Vector3(fScale2, fScale2, fScale2), 0.06);
      featuredGroup3.current.scale.lerp(new THREE.Vector3(fScale3, fScale3, fScale3), 0.06);

      featuredGroup1.current.rotation.y = THREE.MathUtils.lerp(featuredGroup1.current.rotation.y, fRotY1, 0.06);
      featuredGroup2.current.rotation.y = THREE.MathUtils.lerp(featuredGroup2.current.rotation.y, fRotY2, 0.06);
      featuredGroup3.current.rotation.y = THREE.MathUtils.lerp(featuredGroup3.current.rotation.y, fRotY3, 0.06);
      
      // Floating animation
      featuredGroup1.current.position.y = Math.sin(time * 1.0) * 0.05;
      featuredGroup2.current.position.y = Math.sin(time * 1.0 + 1.2) * 0.05;
      featuredGroup3.current.position.y = Math.sin(time * 1.0 + 2.4) * 0.05;
    }

    // 4. Showcase Group Updates
    if (showcaseGroupRef.current) {
      const sGroup = showcaseGroupRef.current;
      const s = THREE.MathUtils.lerp(sGroup.scale.x, targetShowcaseScale, 0.06);
      sGroup.scale.set(s, s, s);
      sGroup.position.y = THREE.MathUtils.lerp(sGroup.position.y, targetShowcaseY, 0.06);
    }
  });

  // Calculate segment progress specifically for the explosion segment (Scene 3: 0.22 - 0.33)
  const segmentProgress = useMemo(() => {
    if (scrollProgress < 0.22) return 0;
    if (scrollProgress > 0.33) return 1;
    return (scrollProgress - 0.22) / 0.11;
  }, [scrollProgress]);

  // Featured items offsets
  const itemDist = isMobile ? 0.8 : 1.35;

  return (
    <group ref={globalGroupRef}>
      {/* 1. HERO ARTISANAL EARRING */}
      <group ref={heroGroupRef}>
        <ArtisanalPeacockEarring />
      </group>

      {/* 2. DECOMPOSING EARRING */}
      <group ref={explosionGroupRef}>
        <DecomposingEarring progress={segmentProgress} />
      </group>

      {/* 3. FEATURED ITEMS GRID (Scene 5) */}
      <group position={[0, 0, 0]}>
        {/* Item 1: Peacock Earring Pair */}
        <group ref={featuredGroup1} position={[-itemDist, 0, 0]}>
          <ArtisanalPeacockEarring scale={0.7} />
        </group>
        {/* Item 2: Lapis Triangle Earring */}
        <group ref={featuredGroup2} position={[0, 0.1, 0]}>
          <LapisTriangleEarring scale={0.7} />
        </group>
        {/* Item 3: Jade Filigree Earring */}
        <group ref={featuredGroup3} position={[itemDist, 0.1, 0]}>
          <JadeFiligreeEarring scale={0.7} />
        </group>
      </group>

      {/* 4. SHOWCASE TURQUOISE DISC */}
      <group ref={showcaseGroupRef}>
        <TurquoiseDiscEarring scale={1.0} />
      </group>

      {/* Parallax drifting link details in background */}
      <ParallaxBackgroundLinks />
    </group>
  );
}

// --- MAIN CANVAS COMPONENT ---
export default function StoryCanvas() {
  const spotLightRef = useRef<THREE.SpotLight>(null);

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none select-none bg-[#0D0D0D]">
      <Canvas
        camera={{ position: [0, 0.2, 3.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
      >
        <React.Suspense fallback={null}>
          {/* Subtle warm boutique lighting */}
          <ambientLight intensity={0.55} />

          {/* Warm Studio Spotlight Accent (Moving Specular Sweeper) */}
          <spotLight
            ref={spotLightRef}
            position={[2, 6, 4]}
            intensity={4.5}
            angle={0.45}
            penumbra={0.9}
            color="#F5F0E8" // Warm silk cream
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />

          {/* Gold Ambient Glow */}
          <pointLight position={[-4, 2, -2]} intensity={2.0} color="#C7A66A" />

          {/* Turquoise Accent Backlight (gorgeous tone matches image) */}
          <pointLight position={[3, -2, 2]} intensity={2.5} color="#30D5C8" />
          
          <directionalLight position={[0, 4, -3]} intensity={0.7} />

          {/* Director */}
          <SceneDirector isMobile={false} spotLightRef={spotLightRef} />

          {/* Transparent Contact Shadow Catcher Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial opacity={0.25} />
          </mesh>

          {/* Fine Floating Dust Particles */}
          <Sparkles
            count={65}
            scale={5.5}
            size={2.5}
            speed={0.2}
            color="#C7A66A"
            opacity={0.35}
          />

          {/* Showroom environment map */}
          <Environment preset="studio" />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
