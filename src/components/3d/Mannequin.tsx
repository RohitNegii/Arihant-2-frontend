"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { quality } from "./quality";
import { ANATOMY, CUT_Y, TORSO_PROFILE } from "./mannequin-anatomy";
import Jewellery, { setJewelleryOpacity } from "./Jewellery";

const Q = quality();

/** The collar the cut torso stands on. */
const COLLAR_H = 0.05;

/**
 * Lowest point of the piece, for seating it on something. The original figure
 * ran down to a stem at y = -1.48; cut at the chest it is a display bust, so
 * callers place this against whatever surface it stands on.
 */
export const MANNEQUIN_BASE_Y = CUT_Y - COLLAR_H;

// Transparent from the start, never toggled. Flipping `transparent` at runtime
// swaps the shader program, which three ignores unless you also set
// needsUpdate — and paying for that recompile mid-scroll is a visible hitch.
const LACQUER = new THREE.MeshPhysicalMaterial({
  color: "#0b0b0e",
  metalness: 0.1,
  roughness: 0.2,
  clearcoat: Q.tier === "high" ? 1 : 0,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1,
  transparent: true,
});

const PEDESTAL = new THREE.MeshStandardMaterial({
  color: "#a8905e",
  metalness: 1,
  roughness: 0.28,
  envMapIntensity: 1.2,
  transparent: true,
});

/**
 * Fades the bust out. It stands on the centre line above eye level, so the
 * journey passes straight through it — without this the last stretch of the
 * zone is a black blob filling the frame. Returns whether it is still worth
 * drawing. Both materials are module-level, so this fades every instance.
 */
export function setMannequinOpacity(o: number) {
  LACQUER.opacity = o;
  PEDESTAL.opacity = o;
  // The jewellery has to go with the figure, or gold is left hanging in the
  // air over the fountain.
  setJewelleryOpacity(o);
  return o > 0.01;
}

export default function Mannequin() {
  const lathe = useMemo(
    () => TORSO_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)),
    []
  );

  const radial = Q.tier === "high" ? 48 : Q.tier === "mid" ? 32 : 20;
  const headSeg = Q.tier === "high" ? 40 : Q.tier === "mid" ? 24 : 14;
  const { head, nose, ears } = ANATOMY;

  return (
    <group>
      <mesh material={LACQUER} castShadow receiveShadow>
        <latheGeometry args={[lathe, radial]} />
      </mesh>

      <mesh
        position={[...head.center]}
        scale={[...head.radii]}
        material={LACQUER}
        castShadow
      >
        <sphereGeometry args={[1, headSeg, headSeg]} />
      </mesh>

      <mesh
        position={[nose[0], nose[1] - 0.01, nose[2] - 0.04]}
        scale={[0.05, 0.09, 0.07]}
        material={LACQUER}
      >
        <sphereGeometry args={[1, 12, 12]} />
      </mesh>

      {([ears.left, ears.right] as const).map((ear, i) => (
        <mesh
          key={i}
          position={[ear[0] * 0.985, ear[1], ear[2]]}
          scale={[0.022, 0.07, 0.055]}
          material={LACQUER}
        >
          <sphereGeometry args={[1, 10, 10]} />
        </mesh>
      ))}

      <mesh position={[0, CUT_Y - COLLAR_H / 2, 0]} material={PEDESTAL} castShadow>
        <cylinderGeometry args={[0.5, 0.5, COLLAR_H, radial]} />
      </mesh>

      {/* What the bust is there to show. Landmarks come from the shared
          ANATOMY table, so the pieces track the figure's proportions. */}
      <Jewellery />
    </group>
  );
}
