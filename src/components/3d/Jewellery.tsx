"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ANATOMY, torsoRadiusAt } from "./mannequin-anatomy";
import { quality } from "./quality";
import { MUSE_NECKLACE } from "@/content/gallery";
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

/**
 * The photographed necklace. Unlit, like every other photograph in the show —
 * it arrives with the light it was shot under already in it, and lighting it
 * again would light it twice.
 *
 * `depthWrite: false` rather than an `alphaTest`: the piece has to fade with
 * the bust, and a cutout that is discarded below a threshold does not fade, it
 * disappears in one frame when the opacity crosses it.
 */
const NECKLACE = new THREE.MeshBasicMaterial({
  transparent: true,
  depthWrite: false,
  toneMapped: false,
  side: THREE.DoubleSide,
});

/** Fades every piece. The materials are module-level, so this is global. */
export function setJewelleryOpacity(o: number) {
  GOLD.opacity = o;
  GEM.opacity = o;
  NECKLACE.opacity = o;
}

// One unit sphere shared by every bead; the instance matrix carries the size.
const BEAD_SEGMENTS = Q.tier === "high" ? 14 : Q.tier === "mid" ? 10 : 6;
const BEAD_GEO = new THREE.SphereGeometry(
  1,
  BEAD_SEGMENTS,
  Math.round(BEAD_SEGMENTS * 0.75)
);

const RADIAL = Q.tier === "high" ? 16 : Q.tier === "mid" ? 12 : 8;

type Bead = { p: readonly [number, number, number]; r: number };

/**
 * Every small gold sphere the bust wears — the maang tikka chain and drop, the
 * nose stud and the ear studs — in one instanced mesh, one draw call. They are
 * all static; only the jhumkas move.
 *
 * The two bead strands round her neck were built here too, from
 * `ANATOMY.strands`, until the photographed necklace took their place.
 */
function buildBeads(): Bead[] {
  const beads: Bead[] = [];

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

const NECKLACE_ROWS = 20;
const NECKLACE_COLS = 20;

/**
 * The surface the photographed piece is worn on.
 *
 * A cylinder arc of one radius cannot do this. It has to clear the widest part
 * of the chest it passes, and at that radius the top of the piece — the two
 * chain ends — stood half a unit off a neck a quarter as wide, hanging in the
 * air beside her instead of resting on her.
 *
 * Each row instead takes its depth from `torsoRadiusAt`, so the chain sits on
 * the neck and the piece opens onto the chest as it falls. Width is held in
 * world units rather than in arc angle: where a row is too narrow to lay the
 * piece flat across it, the row curls further round instead — which is exactly
 * what a chain does at the neck — up to `maxWrap`, short of the profile's side
 * where it would be edge on to the camera.
 */
function buildNecklaceGeometry(aspect: number) {
  const { top, height, clearance, minRadius, closeFrom, maxWrap } =
    ANATOMY.necklace;
  const halfWidth = (height * aspect) / 2;
  const count = (NECKLACE_ROWS + 1) * (NECKLACE_COLS + 1);

  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices: number[] = [];

  for (let i = 0; i <= NECKLACE_ROWS; i++) {
    const v = i / NECKLACE_ROWS;
    const y = top - height * (1 - v);
    const body = torsoRadiusAt(y) + clearance;
    const radius = THREE.MathUtils.lerp(
      Math.max(minRadius, body),
      body,
      THREE.MathUtils.smoothstep(v, closeFrom, 1)
    );
    const half = Math.min(maxWrap, Math.asin(Math.min(1, halfWidth / radius)));

    for (let j = 0; j <= NECKLACE_COLS; j++) {
      const u = j / NECKLACE_COLS;
      const phi = -half + 2 * half * u;
      const k = i * (NECKLACE_COLS + 1) + j;
      positions[k * 3] = radius * Math.sin(phi);
      positions[k * 3 + 1] = y;
      positions[k * 3 + 2] = radius * Math.cos(phi);
      uvs[k * 2] = u;
      uvs[k * 2 + 1] = v;
    }
  }

  for (let i = 0; i < NECKLACE_ROWS; i++) {
    for (let j = 0; j < NECKLACE_COLS; j++) {
      const a = i * (NECKLACE_COLS + 1) + j;
      const b = a + NECKLACE_COLS + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * The necklace, as photographed, lifted off the display bust it was shot on and
 * put on the muse. The photograph is a flat lay, so its top edge is the two
 * ends of the chain — they belong at the sides of her neck, not out in front
 * of it. See buildNecklaceGeometry.
 */
function Necklace() {
  const tex = useTexture(MUSE_NECKLACE, (t) => {
    const map = Array.isArray(t) ? t[0] : t;
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
  });

  useLayoutEffect(() => {
    NECKLACE.map = tex;
    NECKLACE.needsUpdate = true;
  }, [tex]);

  const geometry = useMemo(() => {
    const img = tex.image as { width?: number; height?: number } | undefined;
    const aspect = img?.width && img?.height ? img.width / img.height : 0.85;
    return buildNecklaceGeometry(aspect);
  }, [tex]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      material={NECKLACE}
      // Her lacquer is transparent too, and both are centred on the same axis,
      // so the depth sort has nothing to separate them by. Without this the
      // necklace flickers behind her.
      renderOrder={1}
    />
  );
}

/**
 * Everything the muse wears. Sits inside the bust's group, so it inherits the
 * bust's position and scale — see FountainBust in StoryRooms.tsx.
 */
export default function Jewellery() {
  const jhumkas = useRef<Array<THREE.Group | null>>([null, null]);

  useFrame((state) => {
    // The bust is invisible for the last stretch of the zone; nothing to move.
    if (GOLD.opacity < 0.01) return;

    const t = state.clock.getElapsedTime();
    for (let i = 0; i < 2; i++) {
      const jhumka = jhumkas.current[i];
      // Opposite phase per ear, so the pair reads as caught in a draught
      // rather than mechanically driven.
      if (jhumka) jhumka.rotation.z = Math.sin(t * 1.2 + i * Math.PI) * 0.1;
    }
  });

  return (
    <group>
      <Beads />

      {/* The piece itself. It replaced a modelled orb pendant on two bead
          strands: a house motif that was never a real product, where this is
          the necklace a visitor can actually be sold. */}
      <Necklace />

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
