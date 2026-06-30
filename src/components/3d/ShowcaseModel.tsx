"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function ShowcaseGroup() {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const gemRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("showcase-section");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalDist = rect.height + viewportHeight;
      const currentDist = viewportHeight - rect.top;

      const progress = Math.min(Math.max(currentDist / totalDist, 0), 1);
      scrollProgress.current = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const progress = scrollProgress.current;

    if (groupRef.current && ring1Ref.current && ring2Ref.current && gemRef.current) {
      ring1Ref.current.rotation.x = time * 0.4 + progress * Math.PI * 2.5;
      ring1Ref.current.rotation.y = time * 0.2 + progress * Math.PI * 1.5;

      ring2Ref.current.rotation.y = -time * 0.4 - progress * Math.PI * 2.5;
      ring2Ref.current.rotation.z = time * 0.3 + progress * Math.PI * 2;

      gemRef.current.rotation.y = time * 0.6 + progress * Math.PI * 3;
      gemRef.current.rotation.x = Math.sin(time) * 0.2;

      const scaleVal = 1 + progress * 0.35;
      groupRef.current.scale.set(scaleVal, scaleVal, scaleVal);

      groupRef.current.position.y = Math.sin(time * 1.2) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Emerald Sculpture */}
      <mesh ref={gemRef} castShadow>
        <octahedronGeometry args={[0.7, 0]} />
        <meshPhysicalMaterial
          color="#0F4C3A" // Emerald Green
          transmission={0.95}
          roughness={0.05}
          ior={1.57}
          thickness={1.2}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          emissive="#0F4C3A"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Orbit Ring 1 (Champagne Gold) */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.3, 0.06, 16, 100]} />
        <meshPhysicalMaterial
          color="#C8A96A" // Champagne Gold
          metalness={1.0}
          roughness={0.1}
          clearcoat={1.0}
        />
      </mesh>

      {/* Orbit Ring 2 (Platinum) */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.6, 0.04, 16, 100]} />
        <meshPhysicalMaterial
          color="#E5E4E2"
          metalness={1.0}
          roughness={0.15}
          clearcoat={1.0}
        />
      </mesh>

      {/* Outer Floating Accents */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2;
        const radius = 1.3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh key={i} position={[x, 0, z]} scale={0.08}>
            <icosahedronGeometry args={[0.5, 1]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={1.0}
              roughness={0.0}
              ior={2.42}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ShowcaseModel() {
  return (
    <div className="w-full h-full min-h-[350px] md:min-h-[500px] lg:min-h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 4.0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />

        {/* Shifting background lights */}
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#C8A96A" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#0F4C3A" />
        <pointLight position={[0, -5, 5]} intensity={1} color="#ffffff" />

        <directionalLight position={[0, 10, 0]} intensity={1} />

        <ShowcaseGroup />

        <Sparkles
          count={50}
          scale={4.5}
          size={2.5}
          speed={0.5}
          color="#C8A96A"
          opacity={0.5}
        />

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
