"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { JEWELRY_IMAGES, type JewelryImage } from "@/content/jewelry";
import { quality } from "./quality";

// --- REUSABLE BRILLIANT CUT GEMSTONE COMPONENT ---
// Note: #0F4C3A (brand emerald) is a TEXT color — through a transmission
// material it renders near-black. Gems use this brighter emerald instead,
// which darkens back to a rich jewel tone once light passes through.
const GEM_EMERALD = "#15805C";

/**
 * Most of this file is the disabled thirteen-room exhibition, but `LuxuryRing`
 * — and this gem inside it — is live: the finale's gift box has one. Its
 * transmission was unconditional, and one transmissive object anywhere in
 * frame costs a full-resolution re-render of the whole scene every frame. On a
 * phone the finale is inside the mid tier's far plane from more than half the
 * journey, so that pass was running for most of the scroll.
 */
const REFRACT = quality().transmission;

export function BrilliantCutGem({ color = GEM_EMERALD, scale = 1.0, position = [0, 0, 0] }: { color?: string; scale?: number; position?: [number, number, number] }) {
  return (
    <group position={position} scale={scale}>
      {/* Top Crown Cylinder (narrow top, wide base) */}
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.45, 0.18, 12, 1]} />
        <meshPhysicalMaterial
          color={color}
          transmission={REFRACT ? 0.95 : 0}
          transparent={!REFRACT}
          opacity={REFRACT ? 1 : 0.92}
          roughness={0.02}
          ior={2.42}
          thickness={1.4}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          envMapIntensity={1.8}
          attenuationColor={color}
          attenuationDistance={0.5}
          flatShading
          emissive={color}
          emissiveIntensity={0.12}
        />
      </mesh>
      {/* Bottom Pavilion Cylinder (wide base, points to a sharp tip) */}
      <mesh position={[0, -0.225, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.01, 0.45, 12, 1]} />
        <meshPhysicalMaterial
          color={color}
          transmission={REFRACT ? 0.95 : 0}
          transparent={!REFRACT}
          opacity={REFRACT ? 1 : 0.92}
          roughness={0.02}
          ior={2.42}
          thickness={1.4}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          envMapIntensity={1.8}
          attenuationColor={color}
          attenuationDistance={0.5}
          flatShading
          emissive={color}
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  );
}

// --- REUSABLE LUXURY RING COMPONENT ---
export function LuxuryRing({ metalColor = "#C8A96A", gemColor = GEM_EMERALD, position = [0, 0, 0], scale = 1.0 }: { metalColor?: string; gemColor?: string; position?: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main Ring Band — upright like a ring on a display stand; lying it
          flat reads as an inflatable, not jewelry. Pure metals take ALL
          color from env reflections; a small warm emissive floor keeps gold
          from going black in shade, but anything stronger reads as plastic */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[0.85, 0.12, 32, 100]} />
        <meshPhysicalMaterial
          color={metalColor}
          metalness={1.0}
          roughness={0.16}
          envMapIntensity={1.1}
          emissive="#6B5426"
          emissiveIntensity={0.08}
        />
      </mesh>
      {/* Prong seat straddling the top of the band */}
      <mesh position={[0, 0.99, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.2, 0.26, 8]} />
        <meshPhysicalMaterial
          color={metalColor}
          metalness={1.0}
          roughness={0.2}
          envMapIntensity={1.1}
          emissive="#6B5426"
          emissiveIntensity={0.08}
        />
      </mesh>
      {/* Center Gemstone seated on the prongs */}
      <BrilliantCutGem color={gemColor} position={[0, 1.2, 0]} scale={0.62} />
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
        <cylinderGeometry args={[1.2, 1.3, 0.8, 48]} />
        <meshPhysicalMaterial color="#EFE8DD" roughness={0.32} clearcoat={0.12} clearcoatRoughness={0.5} />
      </mesh>

      {/* Floating Ring centerpiece — jewelry-sized; an oversized band reads
          as an inflatable, not a ring */}
      <LuxuryRing position={[0, 0.55, 0]} scale={0.68} />

      {/* Silk Ribbon orbit frame */}
      <mesh ref={ribbonRef} rotation={[0.4, 0, 0.2]}>
        <torusGeometry args={[2.0, 0.015, 8, 96]} />
        <meshPhysicalMaterial color="#5D7A68" roughness={0.55} sheen={0.5} sheenColor="#9DBBA6" />
      </mesh>
    </group>
  );
}

// --- SCENE 2: HISTORY TUNNEL (Z = -12) ---
// Photography hung on the tunnel walls, passing by on either side as the
// camera travels through. Portrait 4:5 frames match the source photos.
const TUNNEL_FRAMES: { frX: number; frZ: number; image: JewelryImage }[] = [
  { frX: -2.3, frZ: -9.5, image: JEWELRY_IMAGES.royalPeacock },
  { frX: 2.3, frZ: -10.75, image: JEWELRY_IMAGES.turquoiseChandelier },
  { frX: -2.3, frZ: -12, image: JEWELRY_IMAGES.rubyChandbali },
  { frX: 2.3, frZ: -13.25, image: JEWELRY_IMAGES.lapisBloom },
  { frX: -2.3, frZ: -14.5, image: JEWELRY_IMAGES.emeraldGoddess },
  { frX: 2.3, frZ: -15.75, image: JEWELRY_IMAGES.abaloneElephant },
];

export function HistoryTunnelFrames() {
  // Suspends inside ShowroomCanvas' Suspense boundary until all photos load
  const textures = useTexture(
    TUNNEL_FRAMES.map((fr) => fr.image.src),
    (loaded) => {
      loaded.forEach((tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
      });
    }
  );

  return (
    <group>
      {/* Tunnel side walls */}
      <mesh position={[-3.0, 0, -12.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshPhysicalMaterial color="#EFE8DD" roughness={0.9} />
      </mesh>
      <mesh position={[3.0, 0, -12.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshPhysicalMaterial color="#EFE8DD" roughness={0.9} />
      </mesh>

      {/* Gilded photography frames hanging on the walls */}
      {TUNNEL_FRAMES.map((fr, idx) => (
        <group
          key={idx}
          position={[fr.frX, 0.35, fr.frZ]}
          rotation={[0, fr.frX > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
        >
          {/* Gold frame border */}
          <mesh castShadow>
            <boxGeometry args={[1.26, 1.56, 0.06]} />
            <meshPhysicalMaterial
              color="#C8A96A"
              metalness={1.0}
              roughness={0.3}
              envMapIntensity={1.0}
              emissive="#6B5426"
              emissiveIntensity={0.06}
            />
          </mesh>
          {/* Cream mat */}
          <mesh position={[0, 0, 0.033]}>
            <planeGeometry args={[1.18, 1.48]} />
            <meshBasicMaterial color="#F6F2EA" />
          </mesh>
          {/* The photograph itself (unlit so colors stay true) */}
          <mesh position={[0, 0, 0.036]}>
            <planeGeometry args={[1.08, 1.35]} />
            <meshBasicMaterial map={textures[idx]} toneMapped={false} />
          </mesh>
          <Html position={[0, -0.98, 0.05]} center transform distanceFactor={4}>
            <div className="bg-[#F6F2EA]/95 border border-verdant-gold/30 rounded-lg px-2 py-0.5 shadow-sm text-[8px] uppercase tracking-widest text-[#5D7A68] whitespace-nowrap">
              {fr.image.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

// --- SCENE 3: FLOATING GALLERY (Z = -24) ---
export function GalleryBoxes() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const boxes = [
    { x: -1.6, y: 0.2, z: -23, gem: "#15805C" },
    { x: 0.0, y: -0.3, z: -24, gem: "#ffffff" },
    { x: 1.6, y: 0.4, z: -25, gem: "#FF1493" },
  ];

  return (
    <group>
      {boxes.map((bx, idx) => {
        const isHovered = hoveredIndex === idx;
        const lidY = isHovered ? 0.6 : 0.0;
        const ringY = isHovered ? 0.42 : 0.3;

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

            {/* Glass Lid (translates up on hover) — tall enough to house the
                upright ring */}
            <mesh position={[0, 0.3 + lidY, 0]} castShadow>
              <boxGeometry args={[0.76, 0.56, 0.76]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.0} thickness={0.1} />
            </mesh>

            {/* Upright Ring inside the box */}
            <LuxuryRing position={[0, ringY, 0]} scale={0.2} gemColor={bx.gem} />
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
    for (let i = 0; i < count; i++) {
      // Create a double cone diamond vertex grid
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.4;
      const y = (Math.random() - 0.5) * 0.8;
      
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

// --- SCENE 5: CRAFTING STUDIO (Z = -48) ---
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
      <mesh ref={puddleRef} position={[0, -1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <dodecahedronGeometry args={[0.5, 1]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.25} envMapIntensity={1.1} emissive="#8A5B26" emissiveIntensity={0.25} />
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

// --- SCENE 6: COLLECTIONS ROOM (Z = -60) ---
export function Pedestals() {
  const [clickedPedestal, setClickedPedestal] = useState<number | null>(null);

  const items = [
    { x: -1.8, label: "Rings", component: <LuxuryRing position={[0, 0.09, 0]} scale={0.35} /> },
    { x: -0.6, label: "Necklaces", component: <mesh><torusGeometry args={[0.3, 0.06, 8, 32]}/><meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.2} envMapIntensity={1.1} emissive="#6B5426" emissiveIntensity={0.08}/></mesh> },
    { x: 0.6, label: "Bracelets", component: <mesh rotation={[0.4, 0, 0.4]}><torusGeometry args={[0.26, 0.08, 16, 48]}/><meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.2} envMapIntensity={1.1} emissive="#6B5426" emissiveIntensity={0.08}/></mesh> },
    { x: 1.8, label: "Earrings", component: <group position={[-0.15, 0, 0]}><mesh><icosahedronGeometry args={[0.1, 1]}/><meshPhysicalMaterial color="#15805C" transmission={0.95} roughness={0.02} ior={2.42} thickness={0.6} attenuationColor="#15805C" attenuationDistance={0.8} envMapIntensity={1.8} flatShading emissive="#15805C" emissiveIntensity={0.05}/></mesh></group> },
  ];

  return (
    // y offset drops the pedestal bases onto the gallery floor (y = -1.5)
    <group position={[0, -0.75, -60]}>
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
              <cylinderGeometry args={[0.4, 0.45, 0.8, 24]} />
              <meshPhysicalMaterial color="#EFE8DD" roughness={0.32} />
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

  // The mirror "reflects" a styled look — a photo behind a glass sheen
  const reflection = useTexture(JEWELRY_IMAGES.jadeMedallion.src, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
      ringRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
    }
  });

  return (
    <group position={[0, 0, -72]}>
      {/* Floating Mirror Frame */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 3.2, 0.08]} />
        <meshPhysicalMaterial color="#5D7A68" roughness={0.3} thickness={0.5} />
      </mesh>
      {/* Styled look showing inside the mirror */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[2.2, 2.75]} />
        <meshBasicMaterial map={reflection} toneMapped={false} />
      </mesh>
      {/* Glass sheen over the reflection */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[2.2, 2.9]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          roughness={0.0}
          envMapIntensity={1.5}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Floating ring beside the mirror — kept off the camera's center
          flight path so it never blocks the reflection as we pass through */}
      <group ref={ringRef} position={[1.5, 0.15, 0.4]} scale={0.4}>
        <LuxuryRing />
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
    // y offset drops the museum bases onto the gallery floor (y = -1.5)
    <group position={[0, -0.75, -84]}>
      {cubes.map((cb, idx) => {
        const isHovered = hovered === idx;
        const itemY = isHovered ? 0.66 : 0.58;

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
              <meshPhysicalMaterial color="#EFE8DD" roughness={0.32} />
            </mesh>

            {/* Glass Cube frame — tall enough to house the upright ring */}
            <mesh position={[0, 0.64, 0]}>
              <boxGeometry args={[0.66, 0.78, 0.66]} />
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

  const bubbles = [
    { x: -1.4, y: 0.3, text: "Elena: Absolute Art!" },
    { x: 0.0, y: -0.2, text: "Julian: Timeless!" },
    { x: 1.4, y: 0.4, text: "Clara: Flawless!" },
  ];

  return (
    <group position={[0, 0, -96]}>
      {bubbles.map((bb, idx) => {
        const isHovered = hovered === idx;
        const scale = isHovered ? 1.3 : 1.0;

        return (
          <group
            key={idx}
            position={[bb.x, bb.y, 0]}
            onPointerOver={() => setHovered(idx)}
            onPointerOut={() => setHovered(null)}
          >
            {/* Crystal Refraction bubble */}
            <mesh scale={scale}>
              <sphereGeometry args={[0.45, 32, 32]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transmission={0.96}
                roughness={0.01}
                ior={1.12}
                thickness={0.8}
              />
            </mesh>
            
            {/* HTML Customer text overlay inside bubble */}
            {isHovered && (
              <Html center distanceFactor={4}>
                <div className="bg-[#F6F2EA]/95 border border-verdant-emerald/10 text-verdant-emerald font-semibold text-[7px] uppercase tracking-widest p-2 rounded-lg shadow-md w-28 text-center pointer-events-none">
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
        <BrilliantCutGem scale={0.4} position={[-1.2, 0.5, -0.5]} />
        <BrilliantCutGem scale={0.35} position={[1.3, 0.8, -1.2]} />
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
            <meshPhysicalMaterial color="#EFE8DD" roughness={0.4} />
          </mesh>
          <Html position={[0, 1.8, 0]} center distanceFactor={4}>
            <div className="bg-[#F6F2EA]/95 border border-verdant-gold/25 rounded-md px-1.5 py-0.5 shadow-sm text-[7px] uppercase tracking-widest text-[#5D7A68]">
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
      {/* Massive circular marble showcase base — tall enough to reach the
          gallery floor so the arena doesn't hover */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.6, 1.2, 48]} />
        <meshPhysicalMaterial color="#EFE8DD" roughness={0.12} clearcoat={0.6} clearcoatRoughness={0.25} />
      </mesh>

      {/* Crown Ring centerpiece standing on the showcase */}
      <LuxuryRing position={[0, 0.95, 0]} scale={0.9} />
    </group>
  );
}
