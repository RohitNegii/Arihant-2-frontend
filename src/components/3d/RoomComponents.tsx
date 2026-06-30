"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

// --- REUSABLE BRILLIANT CUT GEMSTONE COMPONENT ---
export function BrilliantCutGem({ color = "#ff5a1f", scale = 1.0, position = [0, 0, 0] }: { color?: string; scale?: number; position?: [number, number, number] }) {
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
export function LuxuryRing({ metalColor = "#C8A96A", gemColor = "#ff5a1f", position = [0, 0, 0], scale = 1.0 }: { metalColor?: string; gemColor?: string; position?: [number, number, number]; scale?: number }) {
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

// --- ORBITING CRYSTAL GEM COMPONENT ---
function OrbitingGem({ index }: { index: number }) {
  const gemRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!gemRef.current) return;
    const time = state.clock.getElapsedTime();
    const angle = (index * Math.PI * 2) / 3 + time * 0.35;
    const r = 1.3;
    gemRef.current.position.x = Math.cos(angle) * r;
    gemRef.current.position.z = Math.sin(angle) * r;
    gemRef.current.position.y = 0.7 + Math.sin(time * 2 + index) * 0.1;
    gemRef.current.rotation.x = time * 0.8;
    gemRef.current.rotation.y = time * 0.5;
  });

  return (
    <group ref={gemRef} scale={0.16}>
      <mesh castShadow>
        <octahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1.0}
          roughness={0.0}
          ior={2.42}
          thickness={1.0}
          clearcoat={1.0}
          envMapIntensity={3.0}
        />
      </mesh>
    </group>
  );
}

// --- SCENE 1: ENTRANCE HALL (Z = 0) ---
export function EntrancePedestal() {
  const ribbonRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ribbonRef.current) {
      ribbonRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
      ribbonRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.2) * 0.08;
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Volumetric pedestal base (white marble) */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.8, 32]} />
        <meshPhysicalMaterial color="#151515" roughness={0.15} clearcoat={0.5} />
      </mesh>

      {/* Floating Realistic Diamond centerpiece */}
      <RealisticDiamond position={[0, 0.7, 0]} scale={0.9} />

      {/* Orbiting accent gems */}
      {[...Array(3)].map((_, i) => (
        <OrbitingGem key={i} index={i} />
      ))}

      {/* Silk Ribbon orbit frame */}
      <mesh ref={ribbonRef} rotation={[0.4, 0, 0.2]}>
        <torusGeometry args={[2.0, 0.02, 8, 64]} />
        <meshPhysicalMaterial color="#ff5a1f" roughness={0.4} />
      </mesh>
    </group>
  );
}

// --- SCENE 2: HISTORY TUNNEL (Z = -12) ---
export function HistoryTunnelFrames() {
  const frames = [
    { frX: -2.3, frZ: -10, label: "Sketch 2001", image: "/emerald_ring.png" },
    { frX: 2.3, frZ: -11, label: "18K Gold Cast", image: "/emerald_necklace.png" },
    { frX: -2.3, frZ: -13, label: "First Solitaire", image: "/emerald_earrings.png" },
    { frX: 2.3, frZ: -14, label: "Milan Collection", image: "/gold_bracelet.png" },
  ];

  return (
    <group>
      {/* Tunnel side walls */}
      <mesh position={[-3.0, 0, -12]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshPhysicalMaterial color="#151515" roughness={0.9} />
      </mesh>
      <mesh position={[3.0, 0, -12]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshPhysicalMaterial color="#151515" roughness={0.9} />
      </mesh>

      {/* Picture Frames hanging on the walls */}
      {frames.map((fr, idx) => {
        const isRightWall = fr.frX > 0;
        return (
          <group key={idx} position={[fr.frX, 0.3, fr.frZ]}>
            {/* Dark wood frame bezel */}
            <mesh rotation={[0, isRightWall ? -Math.PI / 2 : Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[1.5, 1.2, 0.05]} />
              <meshPhysicalMaterial color="#1c1815" roughness={0.7} />
            </mesh>
            
            {/* Label Tag */}
            <Html position={[0, 0.8, 0]} center transform distanceFactor={4}>
              <div className="bg-[#151515]/95 border border-verdant-gold/30 rounded-lg px-2 py-0.5 shadow-sm text-[8px] uppercase tracking-widest text-[#ff5a1f]">
                {fr.label}
              </div>
            </Html>

            {/* Technical Sketch Blueprint Overlay */}
            <Html
              position={[isRightWall ? -0.027 : 0.027, 0, 0]}
              rotation={[0, isRightWall ? -Math.PI / 2 : Math.PI / 2, 0]}
              center
              transform
              distanceFactor={1.15}
            >
              <div className="w-[155px] h-[115px] bg-[#0c0c0c] border border-white/10 rounded-sm p-2 flex gap-2 font-mono select-none overflow-hidden" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                {/* Left Side: Realistic Image Box */}
                <div className="w-[52px] h-full relative rounded-xs border border-white/10 overflow-hidden bg-black/40 flex-shrink-0">
                  <img
                    src={fr.image}
                    alt={fr.label}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
                </div>

                {/* Right Side: Technical Specs */}
                <div className="flex-1 flex flex-col justify-between text-left h-full">
                  {/* Header */}
                  <div className="border-b border-white/5 pb-1 flex justify-between items-center text-[4.5px] text-white/40 tracking-wider">
                    <span>{fr.label.toUpperCase()}</span>
                    <span>FIG. {idx + 1}</span>
                  </div>

                  {/* CAD specifications */}
                  <div className="py-1 flex-1 flex flex-col justify-center gap-1 opacity-60">
                    <div className="text-[3.5px] text-white/50 leading-none">CAD FILE: REF_{idx + 900}</div>
                    <div className="text-[3.5px] text-white/50 leading-none">MATERIAL: 18K GOLD</div>
                    <div className="text-[3.5px] text-[#ff5a1f] leading-none">STATUS: ARCHIVED</div>
                  </div>

                  {/* Spec notes */}
                  <div className="text-[3.5px] text-white/30 tracking-tight leading-none border-t border-white/5 pt-1">
                    <div>SPEC: METRIC SCALE 1:1</div>
                    <div className="text-white/20 mt-0.5">CONFIDENTIAL // AURUM</div>
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

// --- SCENE 3: FLOATING GALLERY (Z = -24) ---
export function GalleryBoxes() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const boxes = [
    { x: -1.6, y: 0.2, z: -23, gem: "#ff5a1f" },
    { x: 0.0, y: -0.3, z: -24, gem: "#ffffff" },
    { x: 1.6, y: 0.4, z: -25, gem: "#FF1493" },
  ];

  return (
    <group>
      {boxes.map((bx, idx) => {
        const isHovered = hoveredIndex === idx;
        const lidY = isHovered ? 0.6 : 0.0;
        const ringY = isHovered ? 0.35 : 0.08;

        return (
          <group
            key={idx}
            position={[bx.x, bx.y, bx.z]}
            onPointerOver={() => setHoveredIndex(idx)}
            onPointerOut={() => setHoveredIndex(null)}
          >
            {/* Wooden Base of the Box */}
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.2, 0.8]} />
              <meshPhysicalMaterial color="#8B5A2B" roughness={0.3} />
            </mesh>

            {/* Glass Lid (translates up on hover) */}
            <mesh position={[0, 0.22 + lidY, 0]} castShadow>
              <boxGeometry args={[0.76, 0.4, 0.76]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.0} thickness={0.1} />
            </mesh>

            {/* Floating Ring inside the box */}
            <LuxuryRing position={[0, ringY, 0]} scale={0.25} gemColor={bx.gem} />
          </group>
        );
      })}
    </group>
  );
}

// --- SCENE 4: DIAMOND LABORATORY (Z = -36) ---
export function LaboratoryDiamond() {
  const particleRef = useRef<THREE.Points>(null);
  const scrollProgress = useRef(0);

  // Track global scroll index to run diamond explosion
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = scrollY / maxScroll;
      // Map progress around Laboratory Z zone (Z = -36, progress roughly 0.22 - 0.35)
      if (progress > 0.22 && progress < 0.35) {
        scrollProgress.current = (progress - 0.22) / 0.13;
      } else if (progress <= 0.22) {
        scrollProgress.current = 0;
      } else {
        scrollProgress.current = 1;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [positions, initialPositions] = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    const initPos = new Float32Array(count * 3);
    
    // Seeded deterministic pseudo-random generator
    let seed = 1;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      // Create a double cone diamond vertex grid
      const theta = random() * Math.PI * 2;
      const r = random() * 0.4;
      const y = (random() - 0.5) * 0.8;
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      initPos[i * 3] = x;
      initPos[i * 3 + 1] = y;
      initPos[i * 3 + 2] = z;
    }
    return [pos, initPos];
  }, []);

  useFrame((state) => {
    if (!particleRef.current) return;
    const time = state.clock.getElapsedTime();
    const explodeFactor = scrollProgress.current * 3.5; // Explodes outwards as scroll advances
    
    const geo = particleRef.current.geometry;
    const posAttr = geo.attributes.position;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const idx = i * 3;
      // Drift particles outwards
      posAttr.setX(i, initialPositions[idx] * (1.0 + explodeFactor) + Math.sin(time + i) * 0.02);
      posAttr.setY(i, initialPositions[idx + 1] * (1.0 + explodeFactor) + Math.cos(time + i) * 0.02);
      posAttr.setZ(i, initialPositions[idx + 2] * (1.0 + explodeFactor));
    }
    posAttr.needsUpdate = true;
    particleRef.current.rotation.y = time * 0.2;
  });

  return (
    <group position={[0, 0, -36]}>
      {/* Volumetric Laser beams */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 2.5, 8]} />
          <meshBasicMaterial color="#C8A96A" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Exploding particle diamond points */}
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#C8A96A" size={0.065} transparent opacity={0.8} />
      </points>
    </group>
  );
}

// --- SCENE 5: CRAFTING ATELIER (Z = -48) ---
export function CraftingAtelier() {
  const ringRef = useRef<THREE.Group>(null);
  const puddleRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = scrollY / maxScroll;
      // Zone Z = -48 (progress roughly 0.31 - 0.44)
      if (progress > 0.31 && progress < 0.44) {
        scrollProgress.current = (progress - 0.31) / 0.13;
      } else if (progress <= 0.31) {
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
    
    // Scale down the gold liquid puddle as it morphs/solidifies
    if (puddleRef.current) {
      puddleRef.current.scale.set(Math.max(1.0 - t * 1.2, 0.0), Math.max(1.0 - t * 1.2, 0.0), 1.0);
      puddleRef.current.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
    
    // Scale up the formed ring band
    if (ringRef.current) {
      const s = Math.min(t * 0.9, 0.9);
      ringRef.current.scale.set(s, s, s);
      ringRef.current.rotation.y = state.clock.getElapsedTime() * 0.6;
    }
  });

  return (
    <group position={[0, 0, -48]}>
      {/* Melting Puddle */}
      <mesh ref={puddleRef} position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <dodecahedronGeometry args={[0.5, 1]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.15} emissive="#A38244" emissiveIntensity={0.2} />
      </mesh>

      {/* Morphing formed Ring */}
      <group ref={ringRef} scale={0}>
        <LuxuryRing />
      </group>
    </group>
  );
}

// --- ROTATING PEDESTAL HELPER FOR SCENE 6 ---
function PedestalItem({ component, isClicked }: { component: React.ReactNode; isClicked: boolean }) {
  const itemRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!itemRef.current) return;
    const targetY = isClicked ? Math.PI * 2 : 0;
    itemRef.current.rotation.y = THREE.MathUtils.lerp(itemRef.current.rotation.y, targetY, 0.06);
  });

  return (
    <group ref={itemRef} position={[0, 0.65, 0]}>
      {component}
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
              <meshPhysicalMaterial color="#ff5a1f" roughness={0.1} clearcoat={0.8} />
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
      <BrilliantCutGem color="#ff5a1f" position={[0, 0.9, 0]} scale={0.8} />
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
          <meshPhysicalMaterial color="#ff5a1f" transmission={0.95} roughness={0.05} ior={2.42} thickness={0.5} />
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
            {/* Orange/White alternating crystal center */}
            <mesh position={[0, 0.02, 0]} scale={0.032} castShadow>
              <icosahedronGeometry args={[0.5, 1]} />
              <meshPhysicalMaterial color={i % 2 === 0 ? "#ff5a1f" : "#ffffff"} transmission={0.9} roughness={0.05} ior={2.42} />
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
        <meshPhysicalMaterial color="#ff5a1f" roughness={0.1} />
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
        <meshPhysicalMaterial color="#ff5a1f" transmission={0.95} roughness={0.02} thickness={0.4} />
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

// --- SCENE 6: COLLECTIONS ROOM (Z = -60) ---
export function Pedestals() {
  const [clickedPedestal, setClickedPedestal] = useState<number | null>(null);

  const items = [
    { x: -1.8, label: "Rings", component: <BotanicalRing /> },
    { x: -0.6, label: "Necklaces", component: <BotanicalNecklace /> },
    { x: 0.6, label: "Bracelets", component: <BotanicalBracelet /> },
    { x: 1.8, label: "Earrings", component: <BotanicalEarrings /> },
  ];

  return (
    <group position={[0, -0.4, -60]}>
      {items.map((ped, idx) => {
        const isClicked = clickedPedestal === idx;

        return (
          <group
            key={idx}
            position={[ped.x, -0.4, 0]}
            onClick={() => setClickedPedestal(isClicked ? null : idx)}
          >
            {/* Marble Pedestal base */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.4, 0.45, 0.8, 16]} />
              <meshPhysicalMaterial color="#151515" roughness={0.2} />
            </mesh>

            {/* Rotating container */}
            <PedestalItem component={ped.component} isClicked={isClicked} />
          </group>
        );
      })}
    </group>
  );
}

// --- SCENE 7: VIRTUAL TRY-ON (Z = -72) ---
export function TryOnMirror() {
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.position.y = 0.15 + Math.sin(time * 1.5) * 0.08;
      ringRef.current.rotation.y = time * 0.8;
      ringRef.current.rotation.x = Math.sin(time * 0.7) * 0.12;
    }
  });

  return (
    <group position={[0, 0, -72]}>
      {/* 1. Gold backing frame plate */}
      <mesh castShadow>
        <boxGeometry args={[2.54, 3.24, 0.08]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.15} clearcoat={1.0} />
      </mesh>

      {/* 2. Orange outer accent bezel */}
      <mesh position={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[2.62, 3.32, 0.04]} />
        <meshPhysicalMaterial color="#ff5a1f" roughness={0.4} />
      </mesh>

      {/* 3. Reflector mirror surface (Real-time WebGL planar reflections) */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[2.3, 3.0]} />
        <MeshReflectorMaterial
          blur={[0, 0]}
          resolution={1024}
          mixBlur={0}
          mixStrength={1.5}
          roughness={0.0}
          depthScale={0}
          color="#333333"
          metalness={0.8}
          mirror={1.0}
        />
      </mesh>

      {/* 4. Real Ring floating in front of mirror */}
      <group ref={ringRef} position={[0, 0.15, 0.75]} scale={0.45}>
        <LuxuryRing gemColor="#ffffff" />
      </group>
    </group>
  );
}

// --- SCENE 8: MUSEUM GLASS CUBES (Z = -84) ---
export function MuseumCubes() {
  const [hovered, setHovered] = useState<number | null>(null);

  const cubes = [
    { x: -1.2, price: "$12,500" },
    { x: 1.2, price: "$15,000" },
  ];

  return (
    <group position={[0, -0.2, -84]}>
      {cubes.map((cb, idx) => {
        const isHovered = hovered === idx;
        const itemY = isHovered ? 0.7 : 0.45;

        return (
          <group
            key={idx}
            position={[cb.x, -0.4, 0]}
            onPointerOver={() => setHovered(idx)}
            onPointerOut={() => setHovered(null)}
          >
            {/* Museum Base Pedestal */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.7, 0.7, 0.7]} />
              <meshPhysicalMaterial color="#151515" roughness={0.15} />
            </mesh>

            {/* Glass Cube frame */}
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.66, 0.6, 0.66]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.95} roughness={0.0} transparent opacity={0.3} />
            </mesh>

            {/* Floated Ring */}
            <LuxuryRing position={[0, itemY, 0]} scale={0.25} />

            {/* Price Tag HTML Overlay */}
            {isHovered && (
              <Html position={[0, 1.2, 0]} center distanceFactor={4}>
                <div className="bg-verdant-gold text-black text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md shadow-lg animate-fade-in pointer-events-none">
                  {cb.price}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

// --- SCENE 9: CRYSTAL BUBBLES (Z = -96) ---
export function ReviewBubbles() {
  const [hovered, setHovered] = useState<number | null>(null);

  const b1 = useRef<THREE.Group>(null);
  const b2 = useRef<THREE.Group>(null);
  const b3 = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (b1.current) {
      b1.current.position.y = 0.35 + Math.sin(time * 1.2) * 0.08;
      b1.current.rotation.y = time * 0.5;
      const t = hovered === 0 ? 1.3 : 1.0;
      b1.current.scale.lerp(new THREE.Vector3(t, t, t), 0.1);
    }
    if (b2.current) {
      b2.current.position.y = -0.15 + Math.sin(time * 1.5 + 2.0) * 0.09;
      b2.current.rotation.y = -time * 0.4;
      const t = hovered === 1 ? 1.3 : 1.0;
      b2.current.scale.lerp(new THREE.Vector3(t, t, t), 0.1);
    }
    if (b3.current) {
      b3.current.position.y = 0.45 + Math.sin(time * 1.0 + 4.0) * 0.08;
      b3.current.rotation.y = time * 0.45;
      const t = hovered === 2 ? 1.3 : 1.0;
      b3.current.scale.lerp(new THREE.Vector3(t, t, t), 0.1);
    }
  });

  const bubbles = [
    { ref: b1, x: -1.4, text: "Elena: Absolute Art!", gemColor: "#00ff66" },
    { ref: b2, x: 0.0, text: "Julian: Timeless!", gemColor: "#ffffff" },
    { ref: b3, x: 1.4, text: "Clara: Flawless!", gemColor: "#0066ff" },
  ];

  return (
    <group position={[0, 0, -96]}>
      {bubbles.map((bb, idx) => {
        const isHovered = hovered === idx;

        return (
          <group
            key={idx}
            ref={bb.ref}
            position={[bb.x, 0, 0]}
            onPointerOver={() => setHovered(idx)}
            onPointerOut={() => setHovered(null)}
          >
            {/* Crystal Refraction bubble */}
            <mesh>
              <sphereGeometry args={[0.45, 32, 32]} />
              <meshPhysicalMaterial
                color="#a5d8f0"
                transmission={0.96}
                roughness={0.01}
                ior={1.45}
                thickness={0.8}
                clearcoat={1.0}
                clearcoatRoughness={0.0}
                envMapIntensity={3.0}
              />
            </mesh>

            {/* Glowing cut gemstone inside the bubble */}
            <group scale={0.35} rotation={[0, 0, 0]}>
              <BrilliantCutGem color={bb.gemColor} />
            </group>
            
            {/* HTML Customer text overlay inside bubble */}
            {isHovered && (
              <Html center distanceFactor={4}>
                <div className="bg-[#151515]/95 border border-[#ff5a1f]/35 text-white font-serif text-[8px] uppercase tracking-widest p-2 rounded-lg shadow-xl w-32 text-center pointer-events-none">
                  {bb.text}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

// --- SCENE 10: EARTH TO MINE (Z = -108) ---
export function UndergroundCave() {
  const gemsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (gemsRef.current) {
      gemsRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group position={[0, 0, -108]}>
      {/* Left Cave Wall Rock */}
      <mesh position={[-2.4, 0, 0]} rotation={[0.4, 0.4, 0.4]}>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshPhysicalMaterial color="#3E352F" roughness={0.95} />
      </mesh>
      {/* Right Cave Wall Rock */}
      <mesh position={[2.4, 0.2, -1.0]} rotation={[-0.3, 0.5, 0.2]}>
        <dodecahedronGeometry args={[1.6, 0]} />
        <meshPhysicalMaterial color="#3E352F" roughness={0.95} />
      </mesh>

      {/* Raw Green Emerald Ores glowing inside rock cracks */}
      <group ref={gemsRef} position={[0, -0.2, 0.5]}>
        <BrilliantCutGem color="#ff5a1f" scale={0.4} position={[-1.2, 0.5, -0.5]} />
        <BrilliantCutGem color="#ff5a1f" scale={0.35} position={[1.3, 0.8, -1.2]} />
      </group>
    </group>
  );
}

// --- SCENE 11: LUXURY PROMISE (Z = -120) ---
export function PromisePillars() {
  const pillars = [
    { x: -1.8, text: "Gold" },
    { x: -0.6, text: "Diamonds" },
    { x: 0.6, text: "Warranty" },
    { x: 1.8, text: "Shipping" },
  ];

  return (
    <group position={[0, -0.6, -120]}>
      {pillars.map((pil, idx) => (
        <group key={idx} position={[pil.x, 0, 0]}>
          {/* Giant Stone Pillar */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.5, 3.2, 0.5]} />
            <meshPhysicalMaterial color="#151515" roughness={0.4} />
          </mesh>
          <Html position={[0, 1.8, 0]} center distanceFactor={4}>
            <div className="bg-[#151515]/95 border border-verdant-gold/25 rounded-md px-1.5 py-0.5 shadow-sm text-[7px] uppercase tracking-widest text-[#ff5a1f]">
              {pil.text}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

// --- SCENE 12: FINAL SHOWCASE (Z = -132) ---
export function ShowcaseArena() {
  return (
    <group position={[0, -0.4, -132]}>
      {/* Massive circular marble showcase base */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.6, 0.4, 32]} />
        <meshPhysicalMaterial color="#151515" roughness={0.08} clearcoat={1.0} />
      </mesh>

      {/* Floating Crown Ring centerpiece */}
      <LuxuryRing position={[0, 0.6, 0]} scale={0.9} />
    </group>
  );
}
