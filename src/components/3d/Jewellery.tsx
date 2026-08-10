"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANATOMY, torsoRadiusAt } from "./mannequin-anatomy";
import { quality } from "./quality";
import { palette } from "@/theme/palette";

const Q = quality();
const P = palette();

/**
 * Transparent from the start, like the bust's lacquer. The figure fades as the
 * camera closes on it (see setMannequinOpacity) and the pieces have to go with
 * it, or gold is left hanging in the air over an empty fountain. Flipping
 * `transparent` at runtime swaps the shader program, which costs a visible
 * hitch mid-scroll.
 */
const GOLD = new THREE.MeshStandardMaterial({
  color: P.gold,
  metalness: 1,
  roughness: 0.18,
  envMapIntensity: 1.5,
  transparent: true,
});

const GEM = new THREE.MeshStandardMaterial({
  color: P.gem,
  metalness: 0.15,
  roughness: 0.12,
  envMapIntensity: 1.4,
  transparent: true,
});

/** Fades every piece. Both materials are module-level, so this is global. */
export function setJewelleryOpacity(o: number) {
  GOLD.opacity = o;
  GEM.opacity = o;
}

// One unit sphere shared by every bead; the instance matrix carries the size.
const BEAD_SEGMENTS = Q.tier === "high" ? 14 : Q.tier === "mid" ? 10 : 6;
const BEAD_GEO = new THREE.SphereGeometry(
  1,
  BEAD_SEGMENTS,
  Math.round(BEAD_SEGMENTS * 0.75)
);

const STRAND_BEADS = Q.tier === "high" ? 52 : Q.tier === "mid" ? 38 : 26;
const RADIAL = Q.tier === "high" ? 16 : Q.tier === "mid" ? 12 : 8;

type Bead = { p: readonly [number, number, number]; r: number };

/**
 * Every small gold sphere the bust wears — two necklace strands, the maang
 * tikka chain and drop, the nose stud and the ear studs — in one instanced
 * mesh, one draw call. They are all static; only the jhumkas and the pendant
 * move.
 */
function buildBeads(): Bead[] {
  const beads: Bead[] = [];

  for (const { backY, frontDrop, bead } of ANATOMY.strands) {
    const gap = bead + ANATOMY.strandClearance;
    for (let i = 0; i < STRAND_BEADS; i++) {
      const theta = (i / STRAND_BEADS) * Math.PI * 2;
      const front = (Math.cos(theta) + 1) / 2;
      // Bias the fall towards the front so the back of the strand stays up on
      // the neck instead of sagging off the shoulders.
      const drape = front ** 1.5;
      const y = backY - frontDrop * drape;
      const radius = torsoRadiusAt(y) + gap;
      beads.push({
        p: [Math.sin(theta) * radius, y, Math.cos(theta) * radius],
        r: bead,
      });
    }
  }

  // Maang tikka: a chain from the crown to the brow, bowed out so it follows
  // the scalp rather than cutting through it.
  const [cx, cy, cz] = ANATOMY.crown;
  const [fx, fy, fz] = ANATOMY.forehead;
  const links = 6;
  for (let i = 0; i < links; i++) {
    const t = i / (links - 1);
    const bulge = Math.sin(t * Math.PI) * 0.025;
    beads.push({
      p: [
        cx + (fx - cx) * t,
        cy + (fy - cy) * t + bulge * 0.4,
        cz + (fz - cz) * t + bulge,
      ],
      r: 0.012,
    });
  }
  // The drop resting on the brow, and the bead below it.
  beads.push({ p: [fx, fy - 0.04, fz + 0.02], r: 0.032 });
  beads.push({ p: [fx, fy - 0.09, fz + 0.025], r: 0.014 });

  beads.push({ p: ANATOMY.nosePin, r: 0.017 });

  // Ear studs — the jhumkas hang off these.
  for (const side of [-1, 1] as const) {
    const ear = side < 0 ? ANATOMY.ears.left : ANATOMY.ears.right;
    beads.push({
      p: [ear[0] + side * ANATOMY.earOffset, ear[1] - 0.02, ear[2]],
      r: 0.024,
    });
  }

  return beads;
}

const _m = new THREE.Matrix4();
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();

function Beads() {
  const beads = useMemo(() => buildBeads(), []);
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < beads.length; i++) {
      _v.set(...beads[i].p);
      _s.setScalar(beads[i].r);
      mesh.setMatrixAt(i, _m.compose(_v, _q, _s));
    }
    mesh.instanceMatrix.needsUpdate = true;
    // Otherwise the cull test uses the single-bead bounds and the whole set
    // pops out of view the moment that one bead leaves the frustum.
    mesh.computeBoundingSphere();
  }, [beads]);

  return <instancedMesh ref={ref} args={[BEAD_GEO, GOLD, beads.length]} />;
}

/**
 * Everything the muse wears. Sits inside the bust's group, so it inherits the
 * bust's position and scale — see FountainBust in StoryRooms.tsx.
 */
export default function Jewellery() {
  const pendant = useRef<THREE.Group>(null);
  const jhumkas = useRef<Array<THREE.Group | null>>([null, null]);

  useFrame((state, delta) => {
    // The bust is invisible for the last stretch of the zone; nothing to move.
    if (GOLD.opacity < 0.01) return;

    if (pendant.current) pendant.current.rotation.y += delta * 0.5;

    const t = state.clock.getElapsedTime();
    for (let i = 0; i < 2; i++) {
      const jhumka = jhumkas.current[i];
      // Opposite phase per ear, so the pair reads as caught in a draught
      // rather than mechanically driven.
      if (jhumka) jhumka.rotation.z = Math.sin(t * 1.2 + i * Math.PI) * 0.1;
    }
  });

  const [px, py, pz] = ANATOMY.pendant;

  return (
    <group>
      <Beads />

      {/* Pendant: the house's orb motif, turning slowly enough to catch the
          light once per pass. The emerald rides on its face so the rotation
          actually reads — on a bare sphere it would be invisible. */}
      <group ref={pendant} position={[px, py, pz]}>
        <mesh material={GOLD}>
          <sphereGeometry args={[0.085, RADIAL + 6, RADIAL]} />
        </mesh>
        <mesh position={[0, 0, 0.076]} material={GEM}>
          <octahedronGeometry args={[0.05, 0]} />
        </mesh>
      </group>

      {/* Bail, tipped back to meet the lowest bead of the drape. */}
      <mesh
        position={[px, py + 0.078, pz - 0.05]}
        rotation={[Math.PI / 2.4, 0, 0]}
        material={GOLD}
      >
        <torusGeometry args={[0.028, 0.008, 6, 14]} />
      </mesh>

      {/* Jhumkas, swinging from the stud they hang on. A hoop would be edge-on
          to this camera — it only ever sees the bust from the front — so the
          bell silhouette is what reads at this distance. */}
      {([-1, 1] as const).map((side, i) => {
        const ear = side < 0 ? ANATOMY.ears.left : ANATOMY.ears.right;
        return (
          <group
            key={side}
            position={[
              ear[0] + side * ANATOMY.earOffset,
              ear[1] - 0.02,
              ear[2],
            ]}
          >
            <group
              ref={(node) => {
                jhumkas.current[i] = node;
              }}
            >
              <mesh
                position={[0, -0.07, 0]}
                rotation={[Math.PI, 0, 0]}
                material={GOLD}
              >
                <coneGeometry args={[0.055, 0.075, RADIAL]} />
              </mesh>
              <mesh position={[0, -0.125, 0]} material={GOLD}>
                <sphereGeometry args={[0.022, RADIAL, RADIAL - 4]} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}
