"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { quality } from "./quality";

const Q = quality();

// ─── Brilliant-cut gemstone geometry ────────────────────────────────
// Models the standard round brilliant: table, star facets, bezel (kite)
// facets, upper girdle facets, girdle belt, lower girdle facets, pavilion
// main facets, and culet.  Total ~57 facets.

function createBrilliantGeometry(
  radius = 0.45,
  crownHeight = 0.18,
  pavilionDepth = 0.42,
  girdleHeight = 0.03,
  segments = 16,
): THREE.BufferGeometry {
  const vertices: number[] = [];
  const normals: number[] = [];

  const tableRadius = radius * 0.55;
  const crownTop = girdleHeight / 2 + crownHeight;
  const girdleTop = girdleHeight / 2;
  const girdleBot = -girdleHeight / 2;
  const pavilionTip = girdleBot - pavilionDepth;

  // Crown midpoint for star/bezel facets
  const crownMid = girdleTop + crownHeight * 0.45;
  const crownMidR = radius * 0.78;

  function pushTri(
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
  ) {
    const ab = new THREE.Vector3().subVectors(b, a);
    const ac = new THREE.Vector3().subVectors(c, a);
    const n = new THREE.Vector3().crossVectors(ab, ac).normalize();
    for (const v of [a, b, c]) {
      vertices.push(v.x, v.y, v.z);
      normals.push(n.x, n.y, n.z);
    }
  }

  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    const aMid = ((i + 0.5) / segments) * Math.PI * 2;

    // Girdle points
    const gT0 = new THREE.Vector3(Math.cos(a0) * radius, girdleTop, Math.sin(a0) * radius);
    const gT1 = new THREE.Vector3(Math.cos(a1) * radius, girdleTop, Math.sin(a1) * radius);
    const gB0 = new THREE.Vector3(Math.cos(a0) * radius, girdleBot, Math.sin(a0) * radius);
    const gB1 = new THREE.Vector3(Math.cos(a1) * radius, girdleBot, Math.sin(a1) * radius);

    // Table edge points
    const tE0 = new THREE.Vector3(Math.cos(a0) * tableRadius, crownTop, Math.sin(a0) * tableRadius);
    const tE1 = new THREE.Vector3(Math.cos(a1) * tableRadius, crownTop, Math.sin(a1) * tableRadius);

    // Crown mid points
    const cM = new THREE.Vector3(Math.cos(aMid) * crownMidR, crownMid, Math.sin(aMid) * crownMidR);

    // Culet (bottom tip)
    const culet = new THREE.Vector3(0, pavilionTip, 0);

    // --- TABLE FACET (flat top polygon, split into triangles)
    const tableCenter = new THREE.Vector3(0, crownTop, 0);
    pushTri(tableCenter, tE0, tE1);

    // --- STAR FACETS (table edge to crown mid-point)
    pushTri(tE0, cM, tE1);

    // --- BEZEL / KITE FACETS (crown mid to girdle)
    pushTri(cM, gT0, gT1);
    pushTri(tE0, gT0, cM);
    pushTri(tE1, cM, gT1);

    // --- GIRDLE (thin belt)
    pushTri(gT0, gB0, gB1);
    pushTri(gT0, gB1, gT1);

    // --- PAVILION FACETS (girdle bottom to culet)
    const pavMid = new THREE.Vector3(
      Math.cos(aMid) * radius * 0.48,
      girdleBot - pavilionDepth * 0.55,
      Math.sin(aMid) * radius * 0.48,
    );
    pushTri(gB0, pavMid, culet);
    pushTri(gB0, gB1, pavMid);
    pushTri(gB1, culet, pavMid);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  return geo;
}

// ─── Comfort-fit ring band (LatheGeometry profile) ──────────────────
// A real ring cross-section: slightly domed outside, concave inside,
// with a tiny chamfer at the edges.

function createBandGeometry(
  outerRadius = 0.85,
  innerRadius = 0.72,
  bandWidth = 0.28,
  segments = 64,
): THREE.BufferGeometry {
  const profile: THREE.Vector2[] = [];
  const steps = 24;

  // Build a cross-section profile in the XY plane.
  // The lathe rotates around Y, so X = distance from center, Y = height.
  // Go from inner bottom, around outside, back to inner top.

  const halfW = bandWidth / 2;
  const dome = 0.035; // outward dome
  const comfort = 0.025; // inward comfort curve

  // Inner wall (bottom to top) — slight concave for comfort fit
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -halfW + t * bandWidth;
    const concave = Math.sin(t * Math.PI) * comfort;
    profile.push(new THREE.Vector2(innerRadius - concave, y));
  }

  // Top chamfer
  profile.push(new THREE.Vector2(innerRadius + 0.01, halfW));
  profile.push(new THREE.Vector2(outerRadius - 0.01, halfW));

  // Outer wall (top to bottom) — domed outward
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const y = -halfW + t * bandWidth;
    const bulge = Math.sin(t * Math.PI) * dome;
    profile.push(new THREE.Vector2(outerRadius + bulge, y));
  }

  // Bottom chamfer
  profile.push(new THREE.Vector2(outerRadius - 0.01, -halfW));
  profile.push(new THREE.Vector2(innerRadius + 0.01, -halfW));

  return new THREE.LatheGeometry(profile, segments);
}

// ─── Prong geometry ─────────────────────────────────────────────────
// Each prong is a tapered cylinder arching from band to gem.

function createProngGeometry(): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = 0.018 - t * 0.006; // taper from 0.018 to 0.012
    pts.push(new THREE.Vector2(r, t * 0.35));
  }
  // Claw tip — bends inward
  pts.push(new THREE.Vector2(0.008, 0.36));
  pts.push(new THREE.Vector2(0.004, 0.355));
  return new THREE.LatheGeometry(pts, 6);
}

// ─── Gallery / basket (openwork cage under the gem) ─────────────────
function createGalleryGeometry(): THREE.BufferGeometry {
  const r = 0.18;
  const h = 0.12;
  return new THREE.CylinderGeometry(r * 0.85, r, h, 8, 1, true);
}

// ═══ THE MAIN COMPONENT ════════════════════════════════════════════

interface RealisticLuxuryRingProps {
  metalColor?: string;
  gemColor?: string;
  position?: [number, number, number];
  scale?: number;
  /** Disable continuous rotation (e.g. when nested in an animating parent) */
  autoRotate?: boolean;
}

export function RealisticLuxuryRing({
  metalColor = "#C8A96A",
  gemColor = "#15805C",
  position = [0, 0, 0],
  scale = 1.0,
  autoRotate = true,
}: RealisticLuxuryRingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const gemRef = useRef<THREE.Mesh>(null);
  const shimmerPhase = useRef(Math.random() * Math.PI * 2);

  // Memoize all geometries so they're created once
  const bandGeo = useMemo(() => createBandGeometry(), []);
  const gemGeo = useMemo(
    () => createBrilliantGeometry(
      0.22,          // radius
      0.1,           // crown height
      0.2,           // pavilion depth
      0.015,         // girdle
      Q.tier === "low" ? 10 : 16,
    ),
    [],
  );
  const prongGeo = useMemo(() => createProngGeometry(), []);
  const galleryGeo = useMemo(() => createGalleryGeometry(), []);

  // Gold material — shared across band, prongs, gallery, collet
  const goldMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: metalColor,
        metalness: 1.0,
        roughness: 0.14,
        envMapIntensity: 1.3,
        emissive: "#6B5426",
        emissiveIntensity: 0.06,
        clearcoat: 0.15,
        clearcoatRoughness: 0.35,
      }),
    [metalColor],
  );

  // Gem material — full refraction on high tier, translucent fallback on mid/low
  const gemMat = useMemo(() => {
    const useTransmission = Q.transmission;
    return new THREE.MeshPhysicalMaterial({
      color: gemColor,
      transmission: useTransmission ? 0.92 : 0,
      transparent: !useTransmission,
      opacity: useTransmission ? 1.0 : 0.78,
      roughness: 0.015,
      ior: 1.57,
      thickness: 1.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.2,
      attenuationColor: new THREE.Color(gemColor),
      attenuationDistance: 0.4,
      specularIntensity: 1.0,
      specularColor: new THREE.Color("#ffffff"),
      flatShading: true,
      emissive: new THREE.Color(gemColor),
      emissiveIntensity: useTransmission ? 0.08 : 0.28,
    });
  }, [gemColor]);

  // Animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (autoRotate) {
      groupRef.current.rotation.y = t * 0.35;
    }

    // Gem shimmer — subtle emissive pulsing
    if (gemRef.current) {
      const mat = gemRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity =
        (Q.transmission ? 0.08 : 0.28) +
        Math.sin(t * 2.8 + shimmerPhase.current) * 0.04;
      mat.envMapIntensity = 2.2 + Math.sin(t * 1.6 + shimmerPhase.current + 1) * 0.3;
    }
  });

  // Number of prongs
  const prongCount = Q.tier === "low" ? 4 : 6;
  const bandTopY = 0.14; // half the band width
  const gemSeatY = 0.85 + bandTopY; // gem center

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* ── Ring Band ── */}
      <mesh
        geometry={bandGeo}
        material={goldMat}
        castShadow
        receiveShadow
      />

      {/* ── Gallery / basket under the gem ── */}
      <mesh
        geometry={galleryGeo}
        material={goldMat}
        position={[0, bandTopY + 0.26, 0]}
        castShadow
      />

      {/* ── Collet (inner ring that seats the gem) ── */}
      <mesh
        material={goldMat}
        position={[0, gemSeatY - 0.18, 0]}
        castShadow
      >
        <torusGeometry args={[0.16, 0.015, 8, 24]} />
      </mesh>

      {/* ── Prongs (cathedral-mount claws) ── */}
      {Array.from({ length: prongCount }, (_, i) => {
        const angle = (i / prongCount) * Math.PI * 2;
        const px = Math.cos(angle) * 0.14;
        const pz = Math.sin(angle) * 0.14;
        return (
          <mesh
            key={i}
            geometry={prongGeo}
            material={goldMat}
            position={[px, bandTopY + 0.12, pz]}
            rotation={[
              // Tilt prongs inward slightly
              Math.sin(angle) * -0.12,
              0,
              Math.cos(angle) * 0.12,
            ]}
            castShadow
          />
        );
      })}

      {/* ── Brilliant-Cut Gemstone ── */}
      <mesh
        ref={gemRef}
        geometry={gemGeo}
        material={gemMat}
        position={[0, gemSeatY, 0]}
        castShadow
      />

      {/* ── Accent micro-gems on the band shoulders ── */}
      {Q.tier !== "low" &&
        Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          // Place on upper half of the band only (y > 0)
          const ax = Math.cos(a) * 0.88;
          const az = Math.sin(a) * 0.88;
          const ay = 0.09;
          return (
            <mesh
              key={`accent-${i}`}
              position={[ax, ay, az]}
              castShadow
            >
              <sphereGeometry args={[0.018, 8, 6]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transmission={Q.transmission ? 0.9 : 0}
                transparent={!Q.transmission}
                opacity={Q.transmission ? 1 : 0.8}
                roughness={0.02}
                ior={2.42}
                thickness={0.3}
                envMapIntensity={2.0}
              />
            </mesh>
          );
        })}
    </group>
  );
}

// ─── Spotlight dust motes for the box scene ─────────────────────────
// Floating particles caught in a jewelry-store spotlight beam.

interface SpotlightDustProps {
  position?: [number, number, number];
  count?: number;
  spread?: [number, number, number];
}

export function SpotlightDust({
  position = [0, 0, 0],
  count = 40,
  spread = [0.8, 1.2, 0.6],
}: SpotlightDustProps) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const n = Q.tier === "low" ? Math.max(12, count / 3) : count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread[0] * 2;
      arr[i * 3 + 1] = Math.random() * spread[1];
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread[2] * 2;
    }
    return arr;
  }, [count, spread]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      // Gentle drift upward + wobble
      const oy = positions[i * 3 + 1];
      pos.setY(i, oy + Math.sin(t * 0.4 + i * 1.7) * 0.08);
      pos.setX(i, positions[i * 3] + Math.sin(t * 0.3 + i * 2.3) * 0.03);
    }
    pos.needsUpdate = true;
  });

  if (Q.tier === "low") return null;

  return (
    <points ref={ref} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FFE8C4"
        size={0.015}
        transparent
        opacity={0.5}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
