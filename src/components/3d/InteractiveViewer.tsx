"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  metalColor: string;
  gemColor: string;
}

function CustomizableRing({ metalColor, gemColor }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.8) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {/* Central Diamond Faceted cut */}
      <mesh position={[0, 1.15, 0]} rotation={[0.5, 0.5, 0.5]} castShadow>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshPhysicalMaterial
          color={gemColor}
          transmission={1.0}
          roughness={0.01}
          ior={gemColor === "#ffffff" ? 2.42 : 1.76} // Sapphire/Emerald around 1.76
          thickness={1.3}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Gem Holder Prongs */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.36, 0.42, 8]} />
        <meshPhysicalMaterial
          color={metalColor}
          metalness={1.0}
          roughness={0.1}
          clearcoat={1.0}
        />
      </mesh>

      {/* Main Ring Band */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.15, 0.16, 32, 100]} />
        <meshPhysicalMaterial
          color={metalColor}
          metalness={1.0}
          roughness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Accent Gems on the band */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI) / 3;
        const radius = 1.15;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 1 || i === 2) return null; // skip top where the main gem is
        return (
          <mesh key={i} position={[x, y, 0.09]} scale={0.11}>
            <icosahedronGeometry args={[0.5, 1]} />
            <meshPhysicalMaterial
              color={gemColor}
              transmission={1.0}
              roughness={0.0}
              ior={2.42}
              thickness={1.0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function InteractiveViewer({ metalColor, gemColor }: ModelProps) {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[500px] relative">
      <Canvas
        camera={{ position: [0, 0, 4.0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        
        {/* Cinematic customizable lighting */}
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={1} color={metalColor} />
        <pointLight position={[10, -5, 10]} intensity={1.2} color="#ffffff" />
        
        <spotLight
          position={[0, 10, 0]}
          intensity={2.5}
          angle={0.6}
          penumbra={1}
          color="#FAF7F2"
        />

        <CustomizableRing metalColor={metalColor} gemColor={gemColor} />
        
        {/* Colored sparkling orbit particles */}
        <Sparkles
          count={50}
          scale={4.0}
          size={3.0}
          speed={0.4}
          color={gemColor}
          opacity={0.5}
        />

        {/* OrbitControls enabled for drag, pan, zoom */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate={true}
          autoRotateSpeed={0.4}
          minDistance={2.5}
          maxDistance={7}
        />
      </Canvas>
    </div>
  );
}
