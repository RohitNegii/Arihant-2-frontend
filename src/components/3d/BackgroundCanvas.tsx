"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

function ScrollControlledRing() {
  const groupRef = useRef<THREE.Group>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const scrollY = window.scrollY;
    
    // Total scroll height limit
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1); // progress 0 to 1

    // Desktop vs Mobile layout multipliers
    const xMultiplier = isMobile ? 0 : 1.35;
    const yOffsetMultiplier = isMobile ? 0.4 : 1.0;

    let targetX = 1.0 * xMultiplier;
    let targetY = 0.0;
    let targetZ = 0.0;
    let targetScale = isMobile ? 0.8 : 1.05;
    let targetRotX = 0.0;
    let targetRotY = time * 0.15 + progress * 6.5;

    // Define scroll keyframes
    if (progress < 0.12) {
      // Hero (Right) -> Craftsmanship (Left side zoom)
      const t = progress / 0.12;
      targetX = THREE.MathUtils.lerp(1.0 * xMultiplier, -1.3 * xMultiplier, t);
      targetY = THREE.MathUtils.lerp(0.0, 0.15 * yOffsetMultiplier, t);
      targetScale = THREE.MathUtils.lerp(isMobile ? 0.8 : 1.05, isMobile ? 1.2 : 1.6, t);
      targetRotX = THREE.MathUtils.lerp(0.0, 0.5, t);
    } else if (progress < 0.25) {
      // Craftsmanship (Left) -> Collections (Center)
      const t = (progress - 0.12) / 0.13;
      targetX = THREE.MathUtils.lerp(-1.3 * xMultiplier, 0.0, t);
      targetY = THREE.MathUtils.lerp(0.15 * yOffsetMultiplier, -0.1 * yOffsetMultiplier, t);
      targetScale = THREE.MathUtils.lerp(isMobile ? 1.2 : 1.6, isMobile ? 0.95 : 1.25, t);
      targetRotX = THREE.MathUtils.lerp(0.5, -0.2, t);
    } else if (progress < 0.40) {
      // Collections (Center) -> Customizer (Slide out to let local customizer load)
      const t = (progress - 0.25) / 0.15;
      targetX = THREE.MathUtils.lerp(0.0, -3.5 * xMultiplier, t);
      targetY = THREE.MathUtils.lerp(-0.1 * yOffsetMultiplier, 0.0, t);
      targetScale = THREE.MathUtils.lerp(isMobile ? 0.95 : 1.25, 0.0, t);
    } else if (progress < 0.58) {
      // Customizer -> Brand Story (Right Side drift)
      const t = (progress - 0.40) / 0.18;
      targetX = THREE.MathUtils.lerp(-3.5 * xMultiplier, 1.4 * xMultiplier, t);
      targetY = THREE.MathUtils.lerp(0.0, -0.05 * yOffsetMultiplier, t);
      targetScale = THREE.MathUtils.lerp(0.0, isMobile ? 0.75 : 1.0, t);
      targetRotX = THREE.MathUtils.lerp(0.0, 0.35, t);
    } else if (progress < 0.72) {
      // Brand Story -> Timeline (Left side)
      const t = (progress - 0.58) / 0.14;
      targetX = THREE.MathUtils.lerp(1.4 * xMultiplier, -1.3 * xMultiplier, t);
      targetY = THREE.MathUtils.lerp(-0.05 * yOffsetMultiplier, 0.2 * yOffsetMultiplier, t);
      targetScale = THREE.MathUtils.lerp(isMobile ? 0.75 : 1.0, isMobile ? 1.0 : 1.35, t);
      targetRotX = THREE.MathUtils.lerp(0.35, -0.3, t);
    } else {
      // Timeline -> Footer (Slide down & shrink)
      const t = (progress - 0.72) / 0.28;
      targetX = THREE.MathUtils.lerp(-1.3 * xMultiplier, 0.0, t);
      targetY = THREE.MathUtils.lerp(0.2 * yOffsetMultiplier, -2.8, t);
      targetScale = THREE.MathUtils.lerp(isMobile ? 1.0 : 1.35, 0.2, t);
    }

    // Apply smooth interpolation
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);

    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05);
    groupRef.current.scale.set(s, s, s);

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
  });

  return (
    <group ref={groupRef}>
      {/* Centered Emerald Gem */}
      <mesh position={[0, 1.1, 0]} rotation={[0.5, 0.5, 0.5]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshPhysicalMaterial
          color="#0F4C3A"
          transmission={0.9}
          roughness={0.05}
          ior={1.76}
          thickness={1.2}
          clearcoat={1.0}
        />
      </mesh>

      {/* Gem Holder / Prongs */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.4, 8]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.15} clearcoat={1.0} />
      </mesh>

      {/* Main Ring Band */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.15, 32, 100]} />
        <meshPhysicalMaterial color="#C8A96A" metalness={1.0} roughness={0.18} clearcoat={1.0} />
      </mesh>

      {/* Accent Diamonds */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI) / 3;
        const radius = 1.1;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 1 || i === 2) return null;
        return (
          <mesh key={i} position={[x, y, 0.08]} scale={0.12}>
            <icosahedronGeometry args={[0.5, 1]} />
            <meshPhysicalMaterial color="#ffffff" transmission={1.0} roughness={0.0} ior={2.42} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function BackgroundCanvas() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#C8A96A" />
        <pointLight position={[10, -5, 10]} intensity={1.2} color="#ffffff" />
        
        <spotLight position={[0, 10, 0]} intensity={2.5} angle={0.6} penumbra={1} color="#FAF7F2" />

        <ScrollControlledRing />

        <Sparkles count={40} scale={6.0} size={3.0} speed={0.3} color="#C8A96A" opacity={0.4} />
      </Canvas>
    </div>
  );
}
