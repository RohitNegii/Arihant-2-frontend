"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function EmeraldRing() {
  const groupRef = useRef<THREE.Group>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const currentScroll = scrollY.current;

    // Parallax scroll calculations
    const scrollFactor = currentScroll * 0.0035;

    // Continuous base rotation + scroll parallax rotation
    groupRef.current.rotation.y = time * 0.15 + scrollFactor * 2.0;

    // Mouse parallax tracking
    const targetMouseX = (state.pointer.x * Math.PI) / 8;
    const targetMouseY = (state.pointer.y * Math.PI) / 8;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetMouseY + scrollFactor * 0.6,
      0.05
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      -targetMouseX,
      0.05
    );

    // Vertical floating + scroll parallax drop
    const floatY = Math.sin(time * 1.5) * 0.15 - scrollFactor * 1.2;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, floatY, 0.08);
  });

  return (
    <group ref={groupRef}>
      {/* Central Emerald Gem */}
      <mesh position={[0, 1.1, 0]} rotation={[0.5, 0.5, 0.5]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshPhysicalMaterial
          color="#0F4C3A" // Deep Emerald Green
          transmission={0.9}
          roughness={0.05}
          ior={1.57}
          thickness={1.2}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Gem Holder / Prongs (Champagne Gold) */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.4, 8]} />
        <meshPhysicalMaterial
          color="#C8A96A"
          metalness={1.0}
          roughness={0.15}
          clearcoat={1.0}
        />
      </mesh>

      {/* Main Ring Band (Champagne Gold) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.1, 0.15, 32, 100]} />
        <meshPhysicalMaterial
          color="#C8A96A"
          metalness={1.0}
          roughness={0.18}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Accent Gems around the band */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI) / 3;
        const radius = 1.1;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 1 || i === 2) return null;
        return (
          <mesh key={i} position={[x, y, 0.08]} scale={0.12}>
            <icosahedronGeometry args={[0.5, 1]} />
            <meshPhysicalMaterial
              color="#ffffff"
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

export default function HeroRing() {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />

        {/* Cinematic lights */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          castShadow
        />

        <pointLight position={[-10, 5, -10]} intensity={1} color="#C8A96A" />
        <pointLight position={[10, -5, 10]} intensity={1.2} color="#ffffff" />

        <spotLight
          position={[0, 10, 0]}
          intensity={2.5}
          angle={0.6}
          penumbra={1}
          color="#F8F4EA"
        />

        <EmeraldRing />

        {/* Champagne particles */}
        <Sparkles
          count={60}
          scale={5}
          size={3.5}
          speed={0.4}
          color="#C8A96A"
          opacity={0.6}
        />

        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 3} />
      </Canvas>
    </div>
  );
}
