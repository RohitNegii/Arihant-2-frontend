"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { brassMaps, paintedWoodMaps } from "./procedural-textures";

export const DOOR_W = 1.78;
export const DOOR_H = 4.0;
export const DOOR_D = 0.13;

/** Stile / rail widths, in metres, matching joinery proportions. */
const STILE = 0.16;
const BEVEL = 0.02;

/** Recessed panel openings, measured from the door centre. */
const PANELS = [
  { cy: 1.145, h: 1.35 },
  { cy: -0.205, h: 0.95 },
  { cy: -1.29, h: 0.82 },
];
const PANEL_W = DOOR_W - 2 * STILE;

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

const wood = paintedWoodMaps();
const brass = brassMaps();

if (wood) {
  // Grain runs the length of the board: many tiles across, few along
  wood.normalMap.repeat.set(1.1, 0.3);
  wood.roughnessMap.repeat.set(1.1, 0.3);
}

/** Lacquered forest-green joinery paint. */
export const DOOR_PAINT = new THREE.MeshPhysicalMaterial({
  color: "#0A2A1E",
  // Eggshell, not lacquer. The showroom sits inside a bright cream studio
  // environment, so any real gloss lays a white sheen across the whole leaf —
  // a blue test swatch rendered lavender. Note three *multiplies* `roughness`
  // by the roughness map, so a grain map here would quietly halve this value.
  roughness: 0.85,
  metalness: 0,
  clearcoat: 0,
  envMapIntensity: 0.05,
  normalMap: wood?.normalMap ?? null,
  normalScale: new THREE.Vector2(0.4, 0.4),
});

/** Slightly deeper tone for the sunken panel fields, as paint pools there. */
export const DOOR_PAINT_PANEL = new THREE.MeshPhysicalMaterial({
  color: "#082217",
  roughness: 0.88,
  metalness: 0,
  clearcoat: 0,
  envMapIntensity: 0.04,
  normalMap: wood?.normalMap ?? null,
  normalScale: new THREE.Vector2(0.45, 0.45),
});

export const BRASS = new THREE.MeshPhysicalMaterial({
  color: "#C4A055",
  metalness: 1,
  roughness: 0.3,
  envMapIntensity: 1.5,
  normalMap: brass?.normalMap ?? null,
  normalScale: new THREE.Vector2(0.25, 0.25),
  roughnessMap: brass?.roughnessMap ?? null,
});

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

function roundedRect(w: number, h: number, r: number, cx = 0, cy = 0) {
  const shape = new THREE.Shape();
  const x = cx - w / 2;
  const y = cy - h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function roundedPath(w: number, h: number, r: number, cx = 0, cy = 0) {
  return new THREE.Path(roundedRect(w, h, r, cx, cy).getPoints(12));
}

/**
 * The door frame: one extruded slab with the panel openings cut out of it. The
 * bevel option chamfers the outer edge *and* every hole, which is exactly the
 * ovolo moulding a joiner would run around each panel.
 */
function buildFrameGeometry() {
  // Shrink by the bevel so the finished slab keeps its nominal size
  const shape = roundedRect(DOOR_W - BEVEL * 2, DOOR_H - BEVEL * 2, 0.02);
  for (const p of PANELS) {
    shape.holes.push(
      roundedPath(PANEL_W + BEVEL * 2, p.h + BEVEL * 2, 0.03, 0, p.cy)
    );
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: DOOR_D - BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelOffset: 0,
    bevelSegments: 2,
    curveSegments: 3,
  });
  geo.translate(0, 0, -DOOR_D / 2 + BEVEL);
  geo.computeVertexNormals();
  return geo;
}

/** A raised panel: flat field with a wide chamfer running to its edges. */
function buildPanelGeometry(w: number, h: number) {
  const rise = 0.075;
  const shape = roundedRect(w - rise * 2, h - rise * 2, 0.02);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.026,
    bevelSize: rise,
    bevelOffset: 0,
    bevelSegments: 1,
    curveSegments: 2,
  });
  geo.translate(0, 0, -0.03);
  geo.computeVertexNormals();
  return geo;
}

const FRAME_GEO = buildFrameGeometry();
const PANEL_GEOS = PANELS.map((p) => buildPanelGeometry(PANEL_W, p.h));

/* ------------------------------------------------------------------ */
/* Furniture                                                           */
/* ------------------------------------------------------------------ */

/** Butt hinge: two leaves and a knuckle, straddling the hanging stile. */
function Hinge({ y, side }: { y: number; side: 1 | -1 }) {
  return (
    <group position={[-side * (DOOR_W / 2 - 0.01), y, 0]}>
      <mesh material={BRASS} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.24, 12]} />
      </mesh>
      {/* Knuckle collars */}
      {[0.09, -0.09].map((oy) => (
        <mesh key={oy} position={[0, oy, 0]} material={BRASS} castShadow>
          <cylinderGeometry args={[0.036, 0.036, 0.05, 12]} />
        </mesh>
      ))}
      {/* Pin finial */}
      <mesh position={[0, 0.15, 0]} material={BRASS}>
        <sphereGeometry args={[0.028, 10, 8]} />
      </mesh>
      {/* Leaf screwed to the stile face */}
      <mesh position={[side * 0.05, 0, DOOR_D / 2 - 0.005]} material={BRASS}>
        <boxGeometry args={[0.1, 0.22, 0.012]} />
      </mesh>
    </group>
  );
}

/**
 * Full-height pull handle standing off the face on two rosettes — the vertical
 * bar of a grand entrance door, not a domestic lever.
 */
function PullHandle({ side }: { side: 1 | -1 }) {
  const x = side * (DOOR_W / 2 - 0.19);
  const faceZ = DOOR_D / 2;
  return (
    <group position={[x, 0.05, faceZ]}>
      {/* Backplate */}
      <mesh position={[0, 0, 0.006]} material={BRASS}>
        <boxGeometry args={[0.1, 1.15, 0.012]} />
      </mesh>
      {/* The bar itself, standing proud of the face */}
      <mesh position={[0, 0, 0.1]} material={BRASS} castShadow>
        <cylinderGeometry args={[0.023, 0.023, 0.94, 16]} />
      </mesh>
      {[0.47, -0.47].map((oy) => (
        <mesh key={oy} position={[0, oy, 0.1]} material={BRASS}>
          <sphereGeometry args={[0.023, 12, 10]} />
        </mesh>
      ))}
      {/* Rosette standoffs */}
      {[0.4, -0.4].map((oy) => (
        <group key={oy} position={[0, oy, 0]}>
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} material={BRASS}>
            <cylinderGeometry args={[0.017, 0.024, 0.1, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The door leaf                                                       */
/* ------------------------------------------------------------------ */

/**
 * One leaf of the pair. `side` is +1 for the leaf hinged on the left jamb and
 * -1 for its mirror; the leaf hangs from the jamb toward the centre of the
 * opening, so its hanging stile is at local -side and its lock stile at +side.
 */
export default function DoorLeaf({ side }: { side: 1 | -1 }) {
  const panels = useMemo(() => PANELS.map((p, i) => ({ ...p, geo: PANEL_GEOS[i] })), []);

  return (
    <group position={[side * 0.9, 0.5, 0]}>
      {/* Frame — stiles, rails and the panel mouldings in one piece */}
      <mesh geometry={FRAME_GEO} material={DOOR_PAINT} castShadow receiveShadow />

      {/* Recessed raised panels */}
      {panels.map((p) => (
        <mesh
          key={p.cy}
          geometry={p.geo}
          position={[0, p.cy, 0]}
          material={DOOR_PAINT_PANEL}
          castShadow
          receiveShadow
        />
      ))}

      {[1.55, 0.05, -1.45].map((y) => (
        <Hinge key={y} y={y} side={side} />
      ))}
      <PullHandle side={side} />

      {/* Brass kickplate across the foot — takes the scuffs a threshold gets,
          and a staple of any real grand entrance door */}
      <group position={[0, -DOOR_H / 2 + 0.2, DOOR_D / 2 + 0.004]}>
        <mesh material={BRASS} castShadow>
          <boxGeometry args={[DOOR_W - 2 * STILE - 0.02, 0.32, 0.02]} />
        </mesh>
        {/* Fixing screws top and bottom */}
        {[0.11, -0.11].map((oy) =>
          [-1, 1].map((sx) => (
            <mesh
              key={`${oy}${sx}`}
              position={[sx * (PANEL_W / 2 - 0.08), oy, 0.012]}
              material={BRASS}
            >
              <cylinderGeometry args={[0.012, 0.012, 0.01, 8]} />
            </mesh>
          ))
        )}
      </group>

      {/* Cast-brass rosette boss centred on the upper panel */}
      <group position={[0, PANELS[0].cy, DOOR_D / 2 + 0.002]}>
        <mesh material={BRASS} castShadow>
          <torusGeometry args={[0.12, 0.028, 10, 28]} />
        </mesh>
        <mesh position={[0, 0, 0.02]} material={BRASS}>
          <sphereGeometry args={[0.06, 16, 12]} />
        </mesh>
      </group>
    </group>
  );
}
