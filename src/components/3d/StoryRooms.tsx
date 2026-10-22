"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, Sparkles, useTexture } from "@react-three/drei";
import {
  ATELIER_FILM,
  benchReference,
  BRAND_CREST,
  finalePictures,
  momentsPictures,
  plinthItems,
  wallPictures,
} from "@/content/gallery";
import type { HomeMediaItem } from "@/content/home-media";
import { JEWELRY_IMAGES } from "@/content/jewelry";
import { LuxuryRing } from "./RoomComponents";
import DoorLeaf, { DOOR_FOOT } from "./EntranceDoor";
import Mannequin, { MANNEQUIN_BASE_Y, setMannequinOpacity } from "./Mannequin";
import {
  leafMaps,
  plasterMaps,
  contactShadowMap,
  stoneSlabMaps,
  lightPoolMap,
  rugMaps,
  SLAB_TILE_W,
  SLAB_TILE_D,
} from "./procedural-textures";
import { MAX_STEP, quality } from "./quality";
import { filmAllowed, fullPreload } from "./preload";
import { isSceneRevealed } from "./scene-ready";
import { journeyProgress, sceneInteraction } from "@/store/scroll-store";
import { useShowroomStore } from "@/store/showroom-store";
import { palette } from "@/theme/palette";

export const STORY_ROOM_Z = [72, 60, 48, 36, 24, 12] as const;

export const GALLERY_FLOOR = [60, 300] as const;

const P = palette();
const GOLD = P.gold;
const EMERALD = P.brand;

const QUALITY = quality();
const REFRACT = QUALITY.transmission;

function plasterSurface(repeat: number, relief = 1) {
  const maps = plasterMaps();
  if (!maps) return {};
  const normalMap = maps.normalMap.clone();
  const roughnessMap = maps.roughnessMap.clone();
  const map = maps.map.clone();
  for (const tex of [normalMap, roughnessMap, map]) {
    tex.repeat.set(repeat, repeat);
    tex.needsUpdate = true;
  }
  return {
    map,
    normalMap,
    normalScale: new THREE.Vector2(0.9 * relief, 0.9 * relief),
    roughnessMap,
  };
}

export function stoneSlabSurface(worldW: number, worldD: number) {
  const maps = stoneSlabMaps();
  if (!maps) return {};
  const normalMap = maps.normalMap.clone();
  const roughnessMap = maps.roughnessMap.clone();
  const map = maps.map.clone();
  for (const tex of [normalMap, roughnessMap, map]) {
    tex.repeat.set(worldW / SLAB_TILE_W, worldD / SLAB_TILE_D);
    tex.needsUpdate = true;
  }
  return {
    map,
    normalMap,
    normalScale: new THREE.Vector2(1.1, 1.1),
    roughnessMap,
  };
}

export const MAT = {
  gold: new THREE.MeshPhysicalMaterial({
    color: GOLD,
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.15,
    emissive: "#6B5426",
    emissiveIntensity: 0.08,
  }),
  goldSoft: new THREE.MeshStandardMaterial({
    color: P.goldSoft,
    metalness: 0.85,
    roughness: 0.42,
  }),
  emerald: new THREE.MeshPhysicalMaterial({
    color: EMERALD,
    roughness: 0.4,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
  }),
  emeraldDeep: new THREE.MeshStandardMaterial({ color: P.brandDeep, roughness: 0.65 }),
  /**
   * Gallery wall. The emerald surfaces were the only large planes in the app
   * with no maps at all — flat colour reads as paper next to the plaster the
   * stonework carries, which is most of why the collection room looked drawn
   * rather than built.
   */
  emeraldWall: new THREE.MeshStandardMaterial({
    color: P.brandWall,
    roughness: 0.78,
    envMapIntensity: 0.5,
    ...plasterSurface(4, 0.75),
  }),
  velvet: new THREE.MeshPhysicalMaterial({
    color: P.velvet,
    roughness: 0.95,
    sheen: 1,
    sheenColor: new THREE.Color(P.velvetSheen),
  }),
  stone: new THREE.MeshStandardMaterial({
    color: P.stone,
    roughness: 0.92,
    ...plasterSurface(2.5),
  }),
  stoneWarm: new THREE.MeshStandardMaterial({
    color: P.stoneWarm,
    roughness: 0.98,
    envMapIntensity: 0.45,
    ...plasterSurface(3, 1.6),
  }),
  stoneHall: new THREE.MeshStandardMaterial({
    color: P.stoneHall,
    roughness: 0.95,
    ...plasterSurface(3),
  }),
  galleryFloor: new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    roughness: 1.0,
    metalness: 0.0,
    ...stoneSlabSurface(GALLERY_FLOOR[0], GALLERY_FLOOR[1]),
  }),
  slabPath: new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    roughness: 1.0,
    metalness: 0.0,
    ...stoneSlabSurface(3.6, 1.8),
  }),
  threshold: new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    roughness: 1.0,
    metalness: 0.0,
    ...stoneSlabSurface(4.0, 0.7),
  }),
  stoneShade: new THREE.MeshStandardMaterial({
    color: P.stoneShade,
    roughness: 1,
    envMapIntensity: 0.15,
  }),
  stoneVault: new THREE.MeshStandardMaterial({
    color: P.stoneVault,
    roughness: 0.95,
    ...plasterSurface(3),
  }),
  branch: new THREE.MeshStandardMaterial({ color: P.branch, roughness: 0.9 }),
  wood: new THREE.MeshStandardMaterial({ color: P.wood, roughness: 0.55 }),
  woodDark: new THREE.MeshStandardMaterial({ color: P.woodDark, roughness: 0.68 }),
  marble: new THREE.MeshPhysicalMaterial({
    color: P.marble,
    roughness: 0.3,
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transmission: REFRACT ? 0.95 : 0,
    roughness: 0.02,
    thickness: 0.35,
    transparent: true,
    opacity: REFRACT ? 0.45 : 0.28,
  }),
  gemGreen: new THREE.MeshPhysicalMaterial({
    color: P.gem,
    transmission: REFRACT ? 0.92 : 0,
    transparent: !REFRACT,
    opacity: REFRACT ? 1 : 0.72,
    roughness: 0.04,
    ior: 2.42,
    thickness: 0.35,
    flatShading: true,
    emissive: new THREE.Color(P.gem),
    emissiveIntensity: REFRACT ? 0.16 : 0.34,
  }),
  gemPearl: new THREE.MeshPhysicalMaterial({
    color: P.gemPale,
    transmission: REFRACT ? 0.9 : 0,
    transparent: !REFRACT,
    opacity: REFRACT ? 1 : 0.75,
    roughness: 0.05,
    ior: 2.2,
    thickness: 0.3,
    flatShading: true,
    emissive: new THREE.Color(P.gemPaleGlow),
    emissiveIntensity: REFRACT ? 0.14 : 0.3,
  }),
  blossom: new THREE.MeshStandardMaterial({ color: P.blossom, roughness: 0.6 }),
  glow: new THREE.MeshBasicMaterial({ color: P.glow }),
  glowSoft: new THREE.MeshBasicMaterial({
    color: P.glowSoft,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  }),
  /**
   * The shaft of light over the finale's plinth. Additive and double sided, so
   * the cone reads as lit air from inside and out rather than as a solid, and
   * faint enough that what it falls on still shows through it.
   */
  shaft: new THREE.MeshBasicMaterial({
    color: P.glow,
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
  halo: new THREE.MeshBasicMaterial({
    color: P.glowSoft,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
  }),
  /**
   * The hanging lanterns. Their transmission was the one in this table not
   * gated on the tier, and it was expensive out of all proportion to two boxes
   * a quarter of a unit across: a single transmissive object anywhere in the
   * frame makes three re-render the entire scene into an offscreen buffer at
   * full canvas resolution, every frame. Measured on a phone at the entrance,
   * that pass was 198 of the 459 draw calls in the frame — 43% of the work, for
   * a refraction nobody can see through a box that is mostly its own glow.
   *
   * Off, the glow has to come from somewhere else, so the emissive goes up the
   * way the glass material's does.
   */
  lantern: new THREE.MeshPhysicalMaterial({
    color: P.lantern,
    transmission: REFRACT ? 0.85 : 0,
    roughness: 0.25,
    thickness: 0.2,
    emissive: new THREE.Color(P.lanternGlow),
    emissiveIntensity: REFRACT ? 0.9 : 1.25,
    transparent: true,
    opacity: REFRACT ? 0.85 : 0.92,
  }),
  water: new THREE.MeshPhysicalMaterial({
    color: P.water,
    roughness: 0.06,
    metalness: 0.1,
    transparent: true,
    opacity: 0.75,
  }),
  paper: new THREE.MeshStandardMaterial({
    color: P.paper,
    roughness: 0.88,
    side: THREE.DoubleSide,
  }),
  silk: new THREE.MeshPhysicalMaterial({
    color: P.silk,
    roughness: 0.55,
    sheen: 1,
    sheenColor: new THREE.Color(P.lantern),
    side: THREE.DoubleSide,
  }),
  lampShade: new THREE.MeshStandardMaterial({
    color: P.goldWarm,
    metalness: 0.75,
    roughness: 0.35,
    side: THREE.DoubleSide,
  }),
  wax: new THREE.MeshStandardMaterial({ color: P.leather, roughness: 0.5 }),
  planter: new THREE.MeshStandardMaterial({
    color: P.planter,
    roughness: 0.95,
    metalness: 0.0,
    envMapIntensity: 0.4,
    ...plasterSurface(3.2, 0.8),
  }),
  soil: new THREE.MeshStandardMaterial({ color: P.soil, roughness: 1 }),
  vignette: new THREE.MeshBasicMaterial({
    color: P.brandDeep,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }),
  contact: new THREE.MeshBasicMaterial({
    color: P.contactShadow,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    alphaMap: contactShadowMap(),
  }),
  /**
   * Light thrown by a lamp onto whatever is under it. Additive and unlit, so
   * it adds to the surface beneath rather than replacing it, and `depthWrite`
   * off so the quad never occludes the props standing in it.
   *
   * This is a cheat, and the right one: an actual light here would cost every
   * material in the room a second lighting term, and a shadow-casting one a
   * whole extra scene pass, to light a patch of table a metre across.
   */
  lightPool: new THREE.MeshBasicMaterial({
    color: P.glow,
    map: lightPoolMap(),
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
  /**
   * The same wash, weak enough to lay over a photograph.
   *
   * `lightPool` is sized for a patch of floor or a glow behind a medallion,
   * where nothing is underneath it to wash out. Its core is opaque white and
   * it blends additively, so at full strength over a picture it burns the
   * middle out of anything already light — which is what it did to the pair in
   * Made for Moments.
   */
  pictureWash: new THREE.MeshBasicMaterial({
    color: P.glow,
    map: lightPoolMap(),
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
  /**
   * The workshop's back wall. Flat colour reads as paper next to the plaster
   * the stonework carries — the same reason the gallery walls got maps — and
   * this is the largest single surface in the zone.
   */
  craftWall: new THREE.MeshStandardMaterial({
    color: P.woodDark,
    roughness: 0.86,
    envMapIntensity: 0.4,
    ...plasterSurface(3, 0.55),
  }),
  rug: new THREE.MeshStandardMaterial({
    color: "#FFFFFF", // the weave is in the map; tinting would mute the border
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.35,
    ...(rugMaps() ?? {}),
  }),
  /**
   * The scattered petals. White for the same reason the rug is: the colour is
   * written per instance, and a tinted material would multiply every one of
   * them by itself.
   */
  bloom: new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    roughness: 0.62,
    envMapIntensity: 0.5,
  }),
};

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function TextPlane({
  text,
  width = 2,
  height = 0.5,
  color = GOLD,
  fontScale = 0.52,
  letterSpacing = "0.22em",
  /** Real weight, not a synthesised one — layout.tsx loads Cormorant 300–700. */
  weight = "400",
  position,
  rotation,
  renderOrder = 0,
  materialRef,
}: {
  text: string;
  width?: number;
  height?: number;
  color?: string;
  fontScale?: number;
  letterSpacing?: string;
  weight?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  renderOrder?: number;
  /** For a caller that fades the plane along with whatever it is captioning. */
  materialRef?: React.Ref<THREE.MeshBasicMaterial>;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const W = 1024;
    const H = Math.max(64, Math.round((height / width) * W));
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const serif =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--font-secondary")
          .trim() || "serif";
      ctx.clearRect(0, 0, W, H);
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
        letterSpacing;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shrink to fit. fontScale sets the size we *want*, but the glyphs plus
      // their letter-spacing regularly run wider than the canvas and fillText
      // simply clips — which is why the standee read GEETEJ VIRAASA.
      //
      // measureText does not include `letterSpacing` in every engine, so the
      // gap has to be added by hand or the overrun is invisible to the check:
      // GEETEJVIRAASAT measures ~810px of glyphs, under the 1024 canvas, but
      // draws ~1100px once 0.22em of tracking is added to all 14 characters.
      // Both terms scale linearly with font size, so one pass lands exactly.
      const inset = W * 0.94;
      let size = Math.round(H * fontScale);
      ctx.font = `${weight} ${size}px ${serif}, serif`;

      const em = /^([\d.]+)em$/.exec(letterSpacing);
      const px = /^([\d.]+)px$/.exec(letterSpacing);
      const tracking = em
        ? parseFloat(em[1]) * size * text.length
        : px
          ? parseFloat(px[1]) * text.length
          : 0;
      const drawn = ctx.measureText(text).width + tracking;

      if (drawn > inset) {
        size = Math.max(8, Math.floor((size * inset) / drawn));
        ctx.font = `${weight} ${size}px ${serif}, serif`;
      }

      ctx.fillText(text, W / 2, H / 2);
    };

    draw();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    document.fonts?.ready.then(() => {
      draw();
      tex.needsUpdate = true;
    });
    return tex;
  }, [text, width, height, color, fontScale, letterSpacing, weight]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={position} rotation={rotation} renderOrder={renderOrder}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={materialRef} map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function GroundShadow({
  position,
  radius = 1,
  stretch = 1,
  angle = 0,
}: {
  position: [number, number, number];
  radius?: number;
  stretch?: number;
  angle?: number;
}) {
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, angle]}
      scale={[1, stretch, 1]}
      material={MAT.contact}
    >
      {/* Match the radial mask so a shadow has no rectangular corner geometry. */}
      <circleGeometry args={[radius, 48]} />
    </mesh>
  );
}

const LEAF_GEO = (() => {
  const geo = new THREE.PlaneGeometry(0.15, 0.25, 2, 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, -(x * x) * 5 - (y + 0.125) * 0.06);
  }
  geo.computeVertexNormals();
  return geo;
})();

const leafTex = leafMaps();

function makeLeafMaterial(color: string) {
  return new THREE.MeshStandardMaterial({
    color,
    map: leafTex?.map ?? null,
    alphaMap: leafTex?.alphaMap ?? null,
    normalMap: leafTex?.normalMap ?? null,
    roughnessMap: leafTex?.roughnessMap ?? null,
    normalScale: new THREE.Vector2(0.8, 0.8),
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0.85,
  });
}

const LEAF_TINTS = P.leaf.map((c) => new THREE.Color(c));
const LEAF_MAT = makeLeafMaterial("#FFFFFF");

export interface LeafInstance {
  p: [number, number, number];
  rot: [number, number, number];
  s: number;
  tint: number;
  /**
   * Optional orientation, used in preference to `rot`. Aiming a leaf along a
   * branch is a "rotate this axis onto that one" problem, which is a
   * quaternion; expressing it as an Euler triple means picking apart the
   * rotation order by hand for no gain.
   */
  q?: THREE.Quaternion;
}

interface StemInstance {
  p: [number, number, number];
  rot: [number, number, number];
  len: number;
  /** As above — a twig segment points wherever the branch is going. */
  q?: THREE.Quaternion;
  /** Cross-section multiplier, so a branch can taper along its length. */
  w?: number;
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();

function LeafCloud({
  leaves,
  castShadow = false,
}: {
  leaves: LeafInstance[];
  castShadow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      if (leaf.q) {
        _q.copy(leaf.q);
      } else {
        _e.set(leaf.rot[0], leaf.rot[1], leaf.rot[2]);
        _q.setFromEuler(_e);
      }
      _v.set(leaf.p[0], leaf.p[1], leaf.p[2]);
      _s.setScalar(leaf.s);
      mesh.setMatrixAt(i, _m.compose(_v, _q, _s));
      mesh.setColorAt(i, LEAF_TINTS[leaf.tint]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // Without this the cull test uses the single-leaf bounds and the cloud
    // pops out of view as soon as that one leaf leaves the frustum
    mesh.computeBoundingSphere();
  }, [leaves]);

  if (leaves.length === 0) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[LEAF_GEO, LEAF_MAT, leaves.length]}
      castShadow={castShadow}
    />
  );
}

function Stems({
  stems,
  geometry,
}: {
  stems: StemInstance[];
  geometry: THREE.BufferGeometry;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < stems.length; i++) {
      const stem = stems[i];
      if (stem.q) {
        _q.copy(stem.q);
      } else {
        _e.set(stem.rot[0], stem.rot[1], stem.rot[2]);
        _q.setFromEuler(_e);
      }
      _v.set(stem.p[0], stem.p[1], stem.p[2]);
      _s.set(stem.w ?? 1, stem.len, stem.w ?? 1);
      mesh.setMatrixAt(i, _m.compose(_v, _q, _s));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [stems]);

  if (stems.length === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, MAT.branch, stems.length]} />;
}

function Vine({
  points,
  radius = 0.022,
  seed = 1,
  density = 9,
  leafScale = 1,
  castLeafShadow = false,
}: {
  points: [number, number, number][];
  radius?: number;
  seed?: number;
  density?: number;
  leafScale?: number;
  castLeafShadow?: boolean;
}) {
  const { tube, leaves } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
      false,
      "catmullrom",
      0.5
    );
    const detail = quality().tier === "low" ? 0.5 : 1;
    const tubeGeo = new THREE.TubeGeometry(
      curve,
      Math.round(48 * detail),
      radius,
      quality().tier === "low" ? 4 : 6,
      false
    );
    const count = Math.max(
      3,
      Math.round(curve.getLength() * density * quality().foliage)
    );
    const r = rng(seed);
    const up = new THREE.Vector3(0, 1, 0);

    const grown = Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;
      const pos = curve.getPointAt(t);
      const tan = curve.getTangentAt(t).normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const out = new THREE.Vector3().crossVectors(side, tan).normalize();
      const ang = r() * Math.PI * 2;
      const dir = side
        .clone()
        .multiplyScalar(Math.cos(ang))
        .addScaledVector(out, Math.sin(ang));
      const off = radius + 0.015;
      return {
        p: [pos.x + dir.x * off, pos.y + dir.y * off, pos.z + dir.z * off] as [
          number,
          number,
          number,
        ],
        rot: [
          (r() - 0.5) * 1.3,
          Math.atan2(dir.x, dir.z) + (r() - 0.5) * 0.9,
          (r() - 0.5) * 1.3,
        ] as [number, number, number],
        s: (0.72 + r() * 0.55) * leafScale,
        tint: Math.floor(r() * LEAF_TINTS.length),
      };
    });
    return { tube: tubeGeo, leaves: grown };
  }, [points, radius, seed, density, leafScale]);

  useEffect(() => () => tube.dispose(), [tube]);

  return (
    <group>
      <mesh geometry={tube} material={MAT.branch} castShadow />
      <LeafCloud leaves={leaves} castShadow={castLeafShadow} />
    </group>
  );
}

const BUSH_TWIG_GEO = new THREE.CylinderGeometry(0.004, 0.009, 1, 5);
const UP = new THREE.Vector3(0, 1, 0);
const LEAF_LEN = 0.25; // LEAF_GEO is a 0.15 x 0.25 plane, pivoted at its centre

/**
 * A potted bush, grown outwards along visible branches.
 *
 * It used to be a cloud: leaves scattered into four overlapping spheres. That
 * reads fine where the canopy is dense, but any leaf that lands on its own at
 * the edge has nothing holding it up, and at these foliage counts several
 * always do — the "floating leaves" beside the entrance urns. Here every leaf
 * is pinned to a branch, offset by half its own length so its stalk meets the
 * twig, which makes an outlying leaf read as the end of a bough instead of a
 * sprite hanging in mid-air.
 */
function RealisticBush({
  position,
  radius = 0.55,
  count = 120,
  seed = 5,
  scale = 1,
}: {
  position: [number, number, number];
  radius?: number;
  count?: number;
  seed?: number;
  scale?: number;
}) {
  const { leaves, twigs } = useMemo(() => {
    const r = rng(seed);
    const foliage = quality().foliage;
    const n = Math.max(8, Math.round(count * foliage));
    const branchCount = Math.max(4, Math.round(6 * foliage));
    const HEIGHT = radius * 1.35;

    // Each branch is a quadratic curve: up out of the soil, then bending
    // outward, so the canopy spreads without the stem leaving the pot.
    const branches = Array.from({ length: branchCount }, (_, i) => {
      const ang = ((i + 0.5) / branchCount) * Math.PI * 2 + (r() - 0.5) * 0.5;
      const hFrac = 0.55 + r() * 0.45;
      const top = HEIGHT * hFrac;
      // Low branches stay tucked in; only the tall ones reach out past the rim.
      const reach = radius * (0.2 + 0.52 * hFrac) * (0.75 + r() * 0.35);
      const dirX = Math.sin(ang);
      const dirZ = Math.cos(ang);

      const a = new THREE.Vector3(dirX * radius * 0.12, -0.04, dirZ * radius * 0.12);
      const c = new THREE.Vector3(dirX * reach, top, dirZ * reach);
      // Control point above the midpoint and pulled inward: the branch leaves
      // the soil steeply and only opens out near the tip.
      const b = new THREE.Vector3()
        .addVectors(a, c)
        .multiplyScalar(0.5)
        .setY(top * 0.72)
        .addScaledVector(new THREE.Vector3(dirX, 0, dirZ), -reach * 0.3);
      return { a, b, c };
    });

    const at = (br: (typeof branches)[number], t: number, out: THREE.Vector3) => {
      const u = 1 - t;
      return out.set(
        u * u * br.a.x + 2 * u * t * br.b.x + t * t * br.c.x,
        u * u * br.a.y + 2 * u * t * br.b.y + t * t * br.c.y,
        u * u * br.a.z + 2 * u * t * br.b.z + t * t * br.c.z
      );
    };

    // Twigs: three straight segments per branch approximate the curve well
    // enough at this scale, and the whole set is one instanced draw call. They
    // stop short of the tip so no bare stick pokes out of the canopy.
    const SEG = 3;
    const TWIG_END = 0.88;
    const twigList: StemInstance[] = [];
    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    const mid = new THREE.Vector3();
    const dir = new THREE.Vector3();
    for (const br of branches) {
      for (let s = 0; s < SEG; s++) {
        at(br, (s / SEG) * TWIG_END, p0);
        at(br, ((s + 1) / SEG) * TWIG_END, p1);
        mid.addVectors(p0, p1).multiplyScalar(0.5);
        dir.subVectors(p1, p0);
        const len = dir.length();
        dir.divideScalar(len);
        twigList.push({
          p: [mid.x, mid.y, mid.z],
          rot: [0, 0, 0],
          q: new THREE.Quaternion().setFromUnitVectors(UP, dir),
          len,
          w: 1 - 0.4 * (s / SEG),
        });
      }
    }

    // Leaves, dealt round-robin so no branch ends up bare.
    const pos = new THREE.Vector3();
    const ahead = new THREE.Vector3();
    const tan = new THREE.Vector3();
    const side = new THREE.Vector3();
    const out = new THREE.Vector3();
    const grow = new THREE.Vector3();
    const roll = new THREE.Quaternion();
    const leafList: LeafInstance[] = [];

    for (let i = 0; i < n; i++) {
      const br = branches[i % branchCount];
      // Nothing below t=0.22 — under that the branch is inside the pot — and
      // the square root biases the rest toward the tip, where a shrub actually
      // carries its leaves. The first pass round the branches is pinned to the
      // very end so each one finishes in a rosette rather than a bare point.
      // The low tier is what sets the floor here: at foliage 0.35 there are
      // only about eleven leaves per branch, so starting them any higher
      // leaves a stand of bare stems showing above the rim.
      const t = i < branchCount ? 0.97 : 0.22 + Math.sqrt(r()) * 0.78;
      at(br, t, pos);
      at(br, Math.min(1, t + 0.05), ahead);
      tan.subVectors(ahead, pos).normalize();
      if (tan.lengthSq() < 1e-6) tan.copy(UP);

      side.crossVectors(tan, UP).normalize();
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
      out.crossVectors(side, tan).normalize();

      const spin = r() * Math.PI * 2;
      grow
        .copy(side)
        .multiplyScalar(Math.cos(spin))
        .addScaledVector(out, Math.sin(spin))
        .multiplyScalar(0.9)
        .addScaledVector(tan, 0.4)
        .addScaledVector(UP, -0.15) // a little droop
        .normalize();

      const s = 0.72 + r() * 0.5;
      const stalk = LEAF_LEN * s * 0.44;

      const q = new THREE.Quaternion().setFromUnitVectors(UP, grow);
      roll.setFromAxisAngle(grow, r() * Math.PI * 2);
      q.premultiply(roll);

      leafList.push({
        p: [
          pos.x + grow.x * stalk,
          pos.y + grow.y * stalk,
          pos.z + grow.z * stalk,
        ],
        rot: [0, 0, 0],
        q,
        s,
        tint: Math.floor(r() * LEAF_TINTS.length),
      });
    }

    return { leaves: leafList, twigs: twigList };
  }, [radius, count, seed]);

  return (
    <group position={position} scale={scale}>
      <Stems stems={twigs} geometry={BUSH_TWIG_GEO} />
      <LeafCloud leaves={leaves} castShadow />
    </group>
  );
}

function Urn({
  position,
  scale = 1,
  seed = 9,
}: {
  position: [number, number, number];
  scale?: number;
  seed?: number;
}) {
  const profile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const at = (x: number, y: number) => pts.push(new THREE.Vector2(x, y));
    // Doubled on purpose: lathe averages normals along the profile, so a
    // single point at a corner rounds the collar off into a bulge.
    const corner = (x: number, y: number) => {
      at(x, y);
      at(x, y);
    };

    at(0.0, 0.0);
    corner(0.205, 0.0);
    corner(0.212, 0.035);
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      at(0.212 + t * 0.128 + Math.sin(t * Math.PI) * 0.012, 0.035 + t * 0.6);
    }
    corner(0.34, 0.635);
    corner(0.332, 0.665);
    corner(0.392, 0.688);
    corner(0.396, 0.742);
    corner(0.376, 0.762);
    corner(0.344, 0.752);
    at(0.332, 0.7);
    at(0.0, 0.688);
    return pts;
  }, []);

  return (
    <group position={position} scale={scale}>
      <GroundShadow position={[0.06, 0.012, 0.05]} radius={0.62} stretch={1.35} />
      <mesh material={MAT.planter} castShadow receiveShadow>
        <latheGeometry args={[profile, 40]} />
      </mesh>
      <mesh position={[0, 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.soil}>
        <circleGeometry args={[0.335, 24]} />
      </mesh>

      <RealisticBush position={[0, 0.72, 0]} radius={0.65} count={130} seed={seed} scale={1.1} />

      <RealisticBush position={[0, 0.6, 0]} radius={0.45} count={40} seed={seed + 5} scale={1.15} />
    </group>
  );
}

function EntranceGreenery() {
  const mirror = (pts: [number, number, number][]) =>
    pts.map(([x, y, z]) => [-x, y, z] as [number, number, number]);

  const climb: [number, number, number][] = [
    [-2.5, -1.4, -1.1],
    [-2.1, -0.4, -1.5],
    [-2.0, 0.7, -1.7],
    [-1.98, 1.9, -1.72],
    [-1.96, 2.9, -1.72],
    [-1.7, 3.6, -1.7],
    [-1.1, 4.0, -1.68],
    [-0.3, 4.15, -1.66],
  ];
  const accent: [number, number, number][] = [
    [-2.72, -1.42, -0.95],
    [-2.4, -0.5, -1.3],
    [-2.25, 0.6, -1.5],
    [-2.12, 1.7, -1.6],
    [-2.15, 2.6, -1.55],
    [-2.35, 3.3, -1.4],
  ];

  return (
    <group>
      <Vine points={climb} seed={11} density={17} castLeafShadow />
      <Vine points={mirror(climb)} seed={29} density={17} castLeafShadow />
      <Vine points={accent} seed={41} density={18} leafScale={0.95} />
      <Vine points={mirror(accent)} seed={53} density={18} leafScale={0.95} />

      <Urn position={[-2.7, -1.5, -0.95]} seed={61} />
      <Urn position={[2.7, -1.5, -0.95]} seed={73} scale={1.05} />
    </group>
  );
}

function NecklaceBust({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh material={MAT.velvet}>
        <cylinderGeometry args={[0.19, 0.34, 0.6, 20]} />
      </mesh>
      <mesh position={[0, 0.28, 0]} scale={[1, 0.45, 0.8]} material={MAT.velvet}>
        <sphereGeometry args={[0.22, 16, 12]} />
      </mesh>
      <mesh position={[0, 0.44, 0]} material={MAT.velvet}>
        <cylinderGeometry args={[0.085, 0.12, 0.26, 16]} />
      </mesh>
      <mesh position={[0, 0.26, 0.03]} rotation={[0.35, 0, 0]} material={MAT.gold}>
        <torusGeometry args={[0.19, 0.018, 8, 32]} />
      </mesh>
      <mesh position={[0, 0.09, 0.15]} material={MAT.gemGreen}>
        <octahedronGeometry args={[0.07, 0]} />
      </mesh>
    </group>
  );
}

function Chandelier({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.08;
  });

  const tiers = [
    { r: 0.75, y: 0, drops: 10 },
    { r: 0.5, y: 0.32, drops: 8 },
    { r: 0.26, y: 0.6, drops: 6 },
  ];

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.95, 0]} material={MAT.gold}>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 6]} />
      </mesh>

      {tiers.map((tier) => (
        <group key={tier.r} position={[0, tier.y, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
            <torusGeometry args={[tier.r, 0.022, 6, 28]} />
          </mesh>
          {Array.from({ length: tier.drops }, (_, i) => {
            const a = (i / tier.drops) * Math.PI * 2;
            return (
              <group
                key={i}
                position={[Math.cos(a) * tier.r, -0.12, Math.sin(a) * tier.r]}
              >
                <mesh material={MAT.glow}>
                  <sphereGeometry args={[0.05, 8, 6]} />
                </mesh>
                <mesh position={[0, -0.12, 0]} material={MAT.glowSoft}>
                  <coneGeometry args={[0.035, 0.16, 6]} />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}

      <mesh position={[0, 0.1, 0]} material={MAT.halo}>
        <sphereGeometry args={[0.9, 12, 10]} />
      </mesh>
    </group>
  );
}

function EntranceLight() {
  const keyRef = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (keyRef.current) keyRef.current.shadow.autoUpdate = false;
  }, []);

  useFrame(() => {
    if (QUALITY.shadows && keyRef.current && journeyProgress() < 0.14) {
      keyRef.current.shadow.needsUpdate = true;
    }
  });

  return (
    <>
      <primitive object={target} position={[0, 0.4, -2.5]} />
      <spotLight
        ref={keyRef}
        position={[5.5, 7.5, 8]}
        target={target}
        angle={0.52}
        penumbra={0.85}
        intensity={420}
        distance={32}
        decay={2}
        color="#FFEAC6"
        castShadow={QUALITY.shadows}
        shadow-mapSize={[QUALITY.shadowMapSize, QUALITY.shadowMapSize]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.035}
        shadow-camera-near={3}
        shadow-camera-far={32}
      />
      <spotLight
        position={[-6.5, 3.5, 6]}
        target={target}
        angle={0.75}
        penumbra={1}
        intensity={70}
        distance={26}
        decay={2}
        color="#DDE7F2"
      />
    </>
  );
}

// The welcome animation has the same width and pace on phones and desktops.
// Keep it independent of the faster touch-camera damping used while scrolling.
const DOOR_SWING: readonly [number, number] = [0, 0.98];
const DOOR_OPEN_DAMP = 3.1;

const ENTRANCE_TRIM = { stoneInnerX: 1.94, goldWidth: 0.06, gap: 0.01 } as const;
// Keep the gold outside the stone's volume so their top corners cannot intersect.
const GOLD_TRIM_X = ENTRANCE_TRIM.stoneInnerX - ENTRANCE_TRIM.goldWidth / 2 - ENTRANCE_TRIM.gap;

/**
 * The crest medallion: the house mark on a dark roundel with a gold rim.
 *
 * The mark is ivory and gold — the two palest things in the palette — so it
 * needs the dark ground under it for the same reason the entrance lettering
 * needs its plate. `markY` lifts the artwork inside the roundel, for the sign,
 * where the plate overlaps the disc's foot and would otherwise cut the lotus
 * off the bottom of the crest.
 *
 * Used twice: crowning the sign in the entrance, and crowning the portrait in
 * Made for Moments. The texture is fetched once — useTexture caches by URL.
 */
const CREST = { radius: 0.55, y: 0.82, markY: 0.05 } as const;

function CrestMedallion({
  radius = CREST.radius,
  markY = 0,
}: {
  radius?: number;
  markY?: number;
}) {
  // Ships with its alpha already cut — see BRAND_CREST. It used to be keyed in
  // the browser, on the main thread, at every page load, for a result that
  // never changed; scripts/optimize-media.mjs does it once instead.
  const crest = useTexture(BRAND_CREST, (tex) => {
    const t = Array.isArray(tex) ? tex[0] : tex;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  const size = useMemo<[number, number]>(() => {
    const img = crest?.image as { width?: number; height?: number } | undefined;
    const aspect = img?.width && img?.height ? img.width / img.height : 1;
    // Fits the mark inside the roundel whichever way round it is, with a margin
    // so the gold rim is never crowded.
    const box = radius * 1.55;
    return aspect >= 1 ? [box, box / aspect] : [box * aspect, box];
  }, [crest, radius]);

  return (
    <group>
      {/* A disc, not a plane: the medallion has an edge that catches the light,
          and the cylinder is lathed round Y so it is tipped on end to face the
          camera. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={MAT.emeraldDeep}>
        <cylinderGeometry args={[radius, radius, 0.06, 40]} />
      </mesh>
      <mesh position={[0, 0, 0.03]} material={MAT.gold}>
        <torusGeometry args={[radius, radius * 0.04, 8, 44]} />
      </mesh>
      {/* Tinted with the sign's own lettering colour. The artwork is ivory with
          gold linework, which against the dark roundel read as a pale silver
          mark sitting over gold type; multiplied by signText it is the same
          warm metal as the name below it. */}
      <mesh position={[0, markY, 0.048]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={crest} color={P.signText} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * The doorstep. Two courses of stone: a sill between the jambs that the leaves
 * stand over, and a wider tread in front of it. Both stay below DOOR_FOOT, so
 * the leaves sweep clear of the stone the whole way open — the old single slab
 * stood 0.04 proud of the leaf and sliced its foot off at an angle.
 */
const FLOOR_Y = -1.5;
const SILL_TOP = DOOR_FOOT - 0.04;
const TREAD_TOP = SILL_TOP - 0.08;

function Doorstep() {
  return (
    <group>
      <mesh
        position={[0, (FLOOR_Y + SILL_TOP) / 2, 0.135]}
        material={MAT.threshold}
        receiveShadow
      >
        <boxGeometry args={[3.98, SILL_TOP - FLOOR_Y, 0.97]} />
      </mesh>
      <mesh
        position={[0, (FLOOR_Y + TREAD_TOP) / 2, 0.69]}
        material={MAT.threshold}
        receiveShadow
      >
        <boxGeometry args={[4.8, TREAD_TOP - FLOOR_Y, 0.98]} />
      </mesh>
    </group>
  );
}

/**
 * The house mark on its own, with no roundel behind it — for the dark boards,
 * which already are the ground the medallion has to bring with it. Tinted with
 * the sign lettering colour so it reads as the same warm metal as the type
 * under it. The texture is fetched once; useTexture caches by URL.
 */
function CrestMark({
  height,
  position,
}: {
  height: number;
  position: [number, number, number];
}) {
  const crest = useTexture(BRAND_CREST, (tex) => {
    const t = Array.isArray(tex) ? tex[0] : tex;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  const size = useMemo<[number, number]>(() => {
    const img = crest?.image as { width?: number; height?: number } | undefined;
    const aspect = img?.width && img?.height ? img.width / img.height : 0.72;
    return [height * aspect, height];
  }, [crest, height]);

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={crest} color={P.signText} transparent toneMapped={false} />
    </mesh>
  );
}

function GrandEntrance({ z }: { z: number }) {
  const leftHinge = useRef<THREE.Group>(null);
  const rightHinge = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const step = Math.min(delta, MAX_STEP);
    // Wait for the loader's exit so the opening is visible, even at scroll zero.
    const angle = DOOR_SWING[isSceneRevealed() ? 1 : 0];
    if (leftHinge.current) {
      leftHinge.current.rotation.y = THREE.MathUtils.damp(
        leftHinge.current.rotation.y,
        -angle,
        DOOR_OPEN_DAMP,
        step
      );
    }
    if (rightHinge.current) {
      rightHinge.current.rotation.y = THREE.MathUtils.damp(
        rightHinge.current.rotation.y,
        angle,
        DOOR_OPEN_DAMP,
        step
      );
    }
  });

  return (
    <group position={[0, 0, z]}>
      <EntranceLight />

      <group position={[0, 0, -2]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 4.9, 1.75, 0]} material={MAT.stoneWarm} receiveShadow>
            <boxGeometry args={[6.2, 6.5, 0.5]} />
          </mesh>
        ))}
        <mesh position={[0, 3.75, 0]} material={MAT.stoneWarm} receiveShadow>
          <boxGeometry args={[3.6, 2.5, 0.5]} />
        </mesh>
        <mesh position={[0, 2.55, 0.27]} material={MAT.glow}>
          <circleGeometry args={[1.35, 24, 0, Math.PI]} />
        </mesh>
        <mesh position={[0, 2.55, 0.3]} material={MAT.gold}>
          <torusGeometry args={[1.4, 0.05, 8, 28, Math.PI]} />
        </mesh>

        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 1.83, 0.5, -0.02]} material={MAT.stoneHall} receiveShadow>
              <boxGeometry args={[0.07, 4.5, 0.46]} />
            </mesh>
            <mesh position={[s * 1.795, 0.5, 0.235]} material={MAT.stoneShade}>
              <boxGeometry args={[0.014, 4.5, 0.03]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 2.74, -0.02]} material={MAT.stoneHall} receiveShadow>
          <boxGeometry args={[3.73, 0.07, 0.46]} />
        </mesh>

        {[
          { w: 0.42, d: 0.14, h: 4.34, z: 0.25 },
          { w: 0.3, d: 0.12, h: 4.26, z: 0.39 },
          { w: 0.19, d: 0.1, h: 4.18, z: 0.51 },
        ].map((band, i) =>
          [-1, 1].map((s) => (
            <mesh
              key={`${i}${s}`}
              position={[s * (ENTRANCE_TRIM.stoneInnerX + band.w / 2), 0.5, band.z + band.d / 2]}
              material={MAT.stoneWarm}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[band.w, band.h, band.d]} />
            </mesh>
          ))
        )}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * GOLD_TRIM_X, 0.5, 0.5]} material={MAT.gold} castShadow>
            <boxGeometry args={[ENTRANCE_TRIM.goldWidth, 4.16, 0.1]} />
          </mesh>
        ))}
        <Doorstep />

        {/* The contact shadow rides inside the hinge group so it swings with
            the leaf. Touch devices run with shadows off, and without it the
            foot of an open leaf has nothing holding it to the stone. */}
        <group ref={leftHinge} position={[-1.8, 0, 0.2]}>
          <DoorLeaf side={1} />
          <GroundShadow position={[0.9, SILL_TOP + 0.006, 0]} radius={0.9} stretch={0.24} />
        </group>
        <group ref={rightHinge} position={[1.8, 0, 0.2]}>
          <DoorLeaf side={-1} />
          <GroundShadow position={[-0.9, SILL_TOP + 0.006, 0]} radius={0.9} stretch={0.24} />
        </group>
      </group>

      <EntranceGreenery />

      <group position={[0, 0, -6]}>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[s * 3.4, 1.75, 0]}
            rotation={[0, (s * -Math.PI) / 2, 0]}
            material={MAT.stoneHall}
          >
            <planeGeometry args={[7, 6.5]} />
          </mesh>
        ))}
        <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.stoneVault}>
          <planeGeometry args={[6.8, 7]} />
        </mesh>
        {[2.6, 0, -2.6].map((rz) => (
          <mesh key={rz} position={[0, 2.2, rz]} material={MAT.stoneVault}>
            <torusGeometry args={[3.3, 0.1, 6, 24, Math.PI]} />
          </mesh>
        ))}

        {[-1, 1].map((s) => (
          <group key={s} position={[s * 3.25, 1.6, -1.5]}>
            <mesh material={MAT.glow}>
              <sphereGeometry args={[0.13, 10, 8]} />
            </mesh>
            <mesh position={[0, -0.2, 0]} material={MAT.gold}>
              <cylinderGeometry args={[0.05, 0.09, 0.22, 8]} />
            </mesh>
          </group>
        ))}

        <Chandelier position={[0, 3.3, 0.6]} />

        <group position={[0, 2.5, -2.5]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 1.1, 0.75, 0]} material={MAT.gold}>
              <cylinderGeometry args={[0.012, 0.012, 1.5, 6]} />
            </mesh>
          ))}
          {/* The house sign, read from the doorway eighteen units back through
              fog — so every bit of contrast it starts with matters.

              It was MAT.emerald: a clearcoat lacquer, which put a specular
              hotspot dead centre behind the lettering and lifted the ground to
              nearly the luminance of the gold on it. Matte and dark instead.
              The second line was P.accent, a muted mauve on plum, which was
              the least legible thing in the scene; it is gold like the first,
              held back by size rather than by colour. */}
          <mesh position={[0, 0, -0.01]} material={MAT.gold}>
            <boxGeometry args={[2.78, 0.98, 0.05]} />
          </mesh>
          <mesh material={MAT.emeraldDeep}>
            <boxGeometry args={[2.7, 0.9, 0.07]} />
          </mesh>
          <TextPlane
            text="GEETEJ"
            width={2.24}
            height={0.44}
            fontScale={0.62}
            color={P.signText}
            weight="700"
            position={[0, 0.13, 0.045]}
          />
          <TextPlane
            text="VIRAASAT"
            width={1.62}
            height={0.22}
            fontScale={0.66}
            letterSpacing="0.5em"
            color={P.signText}
            weight="600"
            position={[0, -0.22, 0.045]}
          />

          {/* The house crest, crowning the sign.

              Hung on the same two rods rather than floated over the plate: a
              cross bar behind it runs out to both of them, so the medallion,
              the bar and the plate read as one thing that was hung, which is
              also why it overlaps the plate's top edge instead of clearing it.

              The mark is ivory and gold — the two palest things in the scene —
              and the vault behind the sign is cream, so it needs the dark
              roundel under it for the same reason the lettering needs the dark
              plate. Rim in gold to match the plate's edge, and the halo the
              rest of the hall's lit objects carry. */}
          <group position={[0, CREST.y, 0]}>
            <mesh position={[0, 0, -0.06]} material={MAT.gold}>
              <boxGeometry args={[2.2, 0.03, 0.03]} />
            </mesh>
            <mesh position={[0, 0, -0.04]} material={MAT.lightPool} renderOrder={2}>
              <planeGeometry args={[2.0, 2.0]} />
            </mesh>
            <CrestMedallion markY={CREST.markY} />
          </group>
        </group>

        <group position={[1.15, 0, -2.5]}>
          <GroundShadow position={[0, -1.47, 0]} radius={1.15} />
          <mesh position={[0, -1.0, 0]} material={MAT.wood}>
            <cylinderGeometry args={[0.85, 0.95, 1.0, 8]} />
          </mesh>
          <mesh position={[0, -0.48, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
            <torusGeometry args={[0.83, 0.035, 8, 8]} />
          </mesh>
          <mesh position={[0, 0.15, 0]} material={MAT.glass}>
            <cylinderGeometry args={[0.62, 0.62, 1.25, 8]} />
          </mesh>
          <mesh position={[0, 0.8, 0]} material={MAT.gold}>
            <cylinderGeometry args={[0.66, 0.66, 0.08, 8]} />
          </mesh>
          <NecklaceBust position={[0, -0.12, 0]} scale={0.78} />
        </group>

      </group>
    </group>
  );
}

/** Water surface of the fountain's upper dish — keep in step with that mesh. */
const FOUNTAIN_DISH_Y = -0.57;

/**
 * The display bust on the fountain's upper dish. MANNEQUIN_BASE_Y is the
 * underside of its collar, so seating it is `dishY - MANNEQUIN_BASE_Y * scale`;
 * the extra 0.01 sinks it in so no hairline gap opens against the stone. It
 * fades on approach — see setMannequinOpacity.
 */
function FountainBust({ worldZ, scale }: { worldZ: number; scale: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    // Solid while the zone is reading it (~5 units out), gone by the time the
    // camera arrives. Widen the divisor to start the fade earlier.
    const ahead = state.camera.position.z - worldZ;
    ref.current.visible = setMannequinOpacity(
      THREE.MathUtils.clamp((ahead - 1.6) / 3.2, 0, 1)
    );
  });

  return (
    <group
      ref={ref}
      position={[0, FOUNTAIN_DISH_Y - 0.01 - MANNEQUIN_BASE_Y * scale, 0]}
      scale={scale}
    >
      <Mannequin />
    </group>
  );
}

function TheBeginning({ z }: { z: number }) {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!waterRef.current) return;
    waterRef.current.scale.setScalar(
      1 + Math.sin(state.clock.getElapsedTime() * 1.2) * 0.012
    );
  });

  return (
    <group position={[0, 0, z]}>
      <group position={[0, 0, -1]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 2.35, 0.2, 0]} material={MAT.stoneWarm}>
            <boxGeometry args={[0.8, 3.4, 0.9]} />
          </mesh>
        ))}
        <mesh position={[0, 1.9, 0]} material={MAT.stoneWarm}>
          <torusGeometry args={[2.35, 0.4, 8, 26, Math.PI]} />
        </mesh>
        <mesh position={[0, 4.2, 0]} material={MAT.stone}>
          <boxGeometry args={[0.5, 0.5, 0.95]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 5.2, 0.7, 0]} material={MAT.stone}>
            <boxGeometry args={[4.8, 4.4, 0.7]} />
          </mesh>
        ))}

        {[-1, 1].map((s) => (
          <group key={s} position={[s * 3.1, 1.5, 0.55]}>
            <mesh position={[0, 0.5, 0]} material={MAT.goldSoft}>
              <cylinderGeometry args={[0.012, 0.012, 0.9, 6]} />
            </mesh>
            <mesh material={MAT.lantern}>
              <boxGeometry args={[0.24, 0.32, 0.24]} />
            </mesh>
            <mesh position={[0, 0.2, 0]} material={MAT.goldSoft}>
              <coneGeometry args={[0.2, 0.14, 4]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Loose leaf clusters used to hang in the air around the gateway here.
          Unlike the entrance vines they had no stem to grow from, so they read
          as flecks floating in mid-air. Greenery in this room is potted. */}
      <Urn position={[-3.5, -1.5, -0.5]} seed={97} scale={0.72} />
      <Urn position={[3.5, -1.5, -0.5]} seed={101} scale={0.66} />

      <group position={[0, 0, -5.5]}>
        {/* Shadow reads wider than the basin on purpose. At radius 1.7 against
            a 1.55 basin the whole dark core sat hidden underneath and only the
            faint tail showed, as a hard-edged ring peeking out either side.
            Offset away from the [6, 9, 6] sun so it falls to -x / -z. */}
        <GroundShadow
          position={[-0.3, -1.47, -0.25]}
          radius={2.5}
          stretch={1.15}
        />
        <mesh position={[0, -1.3, 0]} material={MAT.stone}>
          <cylinderGeometry args={[1.45, 1.55, 0.4, 28]} />
        </mesh>
        <mesh
          ref={waterRef}
          position={[0, -1.08, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={MAT.water}
        >
          <circleGeometry args={[1.32, 28]} />
        </mesh>
        <mesh position={[0, -0.975, 0]} material={MAT.stone}>
          <cylinderGeometry args={[0.16, 0.24, 0.55, 14]} />
        </mesh>
        <mesh position={[0, -0.67, 0]} material={MAT.stone}>
          <cylinderGeometry args={[0.62, 0.3, 0.16, 20]} />
        </mesh>
        <mesh
          position={[0, -0.57, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={MAT.water}
        >
          <circleGeometry args={[0.55, 20]} />
        </mesh>

        <FountainBust worldZ={z - 5.5} scale={0.78} />

        {/* The two flanking pots were plain brown cones with a cloud of loose
            leaves hovering above them. Urn is the entrance planter — tapered
            wall, projecting collar, soil and a rooted bush — so they now read
            as planted rather than decorated. */}
        {[-2.3, 2.3].map((x, i) => (
          <Urn key={x} position={[x, -1.5, 0.6]} seed={131 + i * 7} scale={0.6} />
        ))}

        {[-1, 1].map((s) => (
          <Urn
            key={s}
            position={[s * 3.1, -1.5, -1.6]}
            seed={s > 0 ? 149 : 163}
            scale={0.85}
          />
        ))}
      </group>

      {/* Welcome standee. The board used to be a slab centred at y = 0.4 with
          its bottom edge at -0.275 — 1.2 units clear of the floor, held up by
          nothing. It is now an easel: a raked board on a frame that reaches the
          ground, with a shadow under it. Everything is local to the foot, so
          the group's y is the floor. */}
      <group position={[3.15, -1.5, -5.3]} rotation={[0, -0.5, 0]}>
        <GroundShadow position={[0.05, 0.03, 0.12]} radius={0.95} stretch={0.72} />

        {/* Rear leg, raked back to meet the two front feet. */}
        <mesh position={[0, 0.72, -0.34]} rotation={[0.26, 0, 0]} material={MAT.woodDark}>
          <boxGeometry args={[0.09, 1.5, 0.07]} />
        </mesh>
        {[-0.66, 0.66].map((lx) => (
          <mesh
            key={lx}
            position={[lx, 0.7, 0.1]}
            rotation={[-0.12, 0, 0]}
            material={MAT.woodDark}
          >
            <boxGeometry args={[0.085, 1.45, 0.075]} />
          </mesh>
        ))}
        {/* Foot rail tying the front legs together. */}
        <mesh position={[0, 0.22, 0.16]} material={MAT.woodDark}>
          <boxGeometry args={[1.4, 0.07, 0.07]} />
        </mesh>

        {/* The board, tipped back so it faces the approach rather than the sky. */}
        <group position={[0, 1.42, 0.02]} rotation={[-0.12, 0, 0]}>
          <mesh material={MAT.emerald}>
            <boxGeometry args={[2.1, 1.35, 0.09]} />
          </mesh>
          <mesh position={[0, 0, 0.05]} material={MAT.emeraldDeep}>
            <boxGeometry args={[1.9, 1.16, 0.02]} />
          </mesh>
          {/* Same lettering treatment as the hanging sign in the hall — it is
              the same mark, and one of the two washing out while the other
              held would read as a mistake. EST. 2020 was P.accent, the mauve
              that made the hall sign's second line unreadable. */}
          <TextPlane
            text="GEETEJ VIRAASAT"
            width={1.72}
            height={0.3}
            color={P.signText}
            weight="700"
            position={[0, 0.06, 0.07]}
          />
          <TextPlane
            text="EST. 2020"
            width={0.85}
            height={0.16}
            color={GOLD}
            fontScale={0.62}
            letterSpacing="0.4em"
            position={[0, -0.26, 0.07]}
          />
          <CrestMark height={0.26} position={[0, 0.42, 0.07]} />
          {/* Brass caps where the board meets the frame. */}
          {[-0.66, 0.66].map((cx) => (
            <mesh key={cx} position={[cx, -0.6, 0.06]} material={MAT.gold}>
              <boxGeometry args={[0.16, 0.1, 0.04]} />
            </mesh>
          ))}
        </group>
      </group>

      {[1.5, -1.0, -3.5].map((pz) => (
        <mesh
          key={pz}
          position={[0, -1.46, pz]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={MAT.slabPath}
        >
          <planeGeometry args={[3.6, 1.8]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The bench's fine trim — gold beads, drawer pulls, loose stones. Six draw
 * calls of pure ornament, dropped on the low tier along with the door detail
 * it shares a flag with; the furniture reads without them.
 */
const BENCH_TRIM = QUALITY.doorDetail;

/**
 * The grid the bench is dressed against. Every prop on it used to carry its
 * own hand-picked literals, so nothing lined up with anything and several
 * pieces sat inside the furniture.
 *
 * Three depth bands, back to front: the ledge holds storage, the stand band
 * holds anything tall enough to be seen over the work, and the work band is
 * the front row the camera reads across. Three columns keep the left and
 * right groups balanced either side of the mat.
 */
/**
 * A lidded brass canister, pivoted at its base so it can just be dropped on a
 * shelf height. One lathe shared by all three sizes on the tool ledge: they
 * were three unrelated silhouettes before — a cone, a box and a stub — which
 * is what made the shelf read as leftovers rather than a set.
 */
const CANISTER_GEO = (() => {
  const pts: THREE.Vector2[] = [];
  const at = (x: number, y: number) => pts.push(new THREE.Vector2(x, y));
  // Doubled at the corners: the lathe averages normals along the profile, so a
  // single point at a hard edge rounds it off. Same trick as Urn.
  const corner = (x: number, y: number) => {
    at(x, y);
    at(x, y);
  };

  at(0, 0);
  corner(0.1, 0);
  corner(0.105, 0.022);
  corner(0.105, 0.162);
  corner(0.116, 0.176);
  corner(0.116, 0.206);
  at(0.092, 0.228);
  at(0.048, 0.248);
  corner(0.026, 0.262);
  corner(0.026, 0.286);
  corner(0.05, 0.296);
  at(0, 0.31);
  return new THREE.LatheGeometry(pts, 16);
})();

/**
 * A wall plane with arched openings cut through it.
 *
 * A room that ends in a wall filling the frame is a dead end: nothing in the
 * shot says the journey continues, which is exactly why the entrance reads as
 * an invitation — you see the hall, the sign and the fountain through the open
 * doors — and why the workshop and the portrait room did not.
 *
 * The obvious build for a wall with a doorway is three planes (two jambs and a
 * lintel), which is three meshes and cannot arch. Triangulating a shape with a
 * hole gives the whole wall back as one geometry, so it stays the single mesh
 * and single draw call it already was, and the head can be a real arch.
 *
 * Coordinates are plane-local, the same convention as `planeGeometry`: (0, 0)
 * is the centre of the wall. Each opening is a rectangle with a semicircular
 * head, so it springs at `top - width / 2`. Keep openings strictly inside the
 * outline — a hole touching an edge has nothing left to triangulate.
 */
function archedWallGeometry(
  width: number,
  height: number,
  openings: { x: number; bottom: number; top: number; width: number }[]
) {
  const hw = width / 2;
  const hh = height / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-hw, -hh);
  shape.lineTo(hw, -hh);
  shape.lineTo(hw, hh);
  shape.lineTo(-hw, hh);
  shape.closePath();

  for (const o of openings) {
    const r = o.width / 2;
    const spring = o.top - r;
    // Wound the other way round from the outline — up the left jamb, over the
    // head, down the right — which is what the triangulator wants of a hole.
    const hole = new THREE.Path();
    hole.moveTo(o.x - r, o.bottom);
    hole.lineTo(o.x - r, spring);
    hole.absarc(o.x, spring, r, Math.PI, 0, true);
    hole.lineTo(o.x + r, o.bottom);
    hole.closePath();
    shape.holes.push(hole);
  }

  const geo = new THREE.ShapeGeometry(shape, 16);

  // ShapeGeometry copies the shape's own x/y straight into the uv attribute, so
  // a tiling map would repeat once per world unit — the plaster on the workshop
  // wall would turn to noise. Normalised, the maps land exactly where they did
  // when the wall was a planeGeometry.
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (pos.getX(i) + hw) / width, (pos.getY(i) + hh) / height);
  }
  uv.needsUpdate = true;
  return geo;
}

/**
 * The workshop's back wall and the doorway through it, in the wall group's own
 * space (the group sits at y = 0.7, so local y + 0.7 is world y).
 *
 * The wall keeps its top edge at world y = 3.25 — high enough to hide the next
 * room's ceiling for the whole approach — and now runs 0.2 further down, to
 * world -1.7. That skirt is below the floor at -1.5 and never seen; it is there
 * so the doorway can reach the floor without its hole touching the outline.
 */
const CRAFT_WALL = {
  width: 5.8,
  height: 4.95,
  /** Local y of the plane's centre: puts the top edge at world y = 3.25. */
  y: 0.075,
  /** Half-width of the opening, and world y of the floor, springline and head. */
  half: 1.0,
  floorY: -1.5,
  springY: 0.9,
  headY: 1.9,
} as const;

const CRAFT_WALL_GEO = archedWallGeometry(CRAFT_WALL.width, CRAFT_WALL.height, [
  {
    x: 0,
    // Plane-space: world y minus the plane's own centre (0.7 + CRAFT_WALL.y).
    bottom: CRAFT_WALL.floorY - 0.775,
    top: CRAFT_WALL.headY - 0.775,
    width: CRAFT_WALL.half * 2,
  },
]);

const BENCH = {
  /** Top surface, and the ledge shelf on its brackets above it. */
  topY: -0.2,
  ledgeY: 0.06,
  ledgeZ: -0.74,
  standZ: -0.42,
  workZ: 0.16,
  leftX: -1.72,
  rightX: 1.55,
} as const;

function TheCraft({ z }: { z: number }) {
  const lampGlowRef = useRef<THREE.Mesh>(null);

  // Already fetched for zone 05's portrait, so this is a cache hit rather
  // than a second request.
  const reference = useTexture(benchReference(), (tex) => {
    const t = Array.isArray(tex) ? tex[0] : tex;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  /**
   * The board is sized from the photograph rather than the other way round.
   *
   * Cropping it to fit a board of some fixed shape is the obvious alternative
   * and it is not available: this texture is the same object the finale and
   * Made for Moments hang on their walls — useTexture caches by URL — so
   * touching its repeat or offset would crop it in all three places at once.
   */
  const board = useMemo<[number, number]>(() => {
    const img = reference.image as { width?: number; height?: number } | undefined;
    const aspect = img?.width && img?.height ? img.width / img.height : 0.8;
    const height = 0.62;
    return [height * aspect, height];
  }, [reference]);

  useFrame((state) => {
    if (!lampGlowRef.current) return;
    const m = lampGlowRef.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.75 + Math.sin(state.clock.getElapsedTime() * 2.3) * 0.06;
  });

  return (
    <group position={[0, 0, z]}>
      {/* Rug. The bench stood on bare slabs with a shadow disc under it and
          nothing else in the bottom third of the frame — furniture floating
          in a void. A rug is the cheapest thing in interior photography that
          says "a room", and it is one quad. Under the bench's contact shadow
          at y = -1.47 so the bench still reads as standing on it. */}
      <mesh
        position={[0, -1.485, -4.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.rug}
        receiveShadow
      >
        <planeGeometry args={[6.6, 3.7]} />
      </mesh>

      {/* The jeweller's stool, pushed back from the bench with the work apron
          folded over it. A zone called The Craft had no craftsman anywhere in
          it — nothing said a person works here, only that tools exist. It also
          buys the frame a foreground: bench and wall sat at two depths, and
          everything nearer the camera than the bench was empty floor.

          Kept off the centre line so it never stands in front of the mat. */}
      <group position={[-1.42, 0, -4.05]} rotation={[0, 0.42, 0]}>
        <GroundShadow position={[0, -1.47, 0.02]} radius={0.62} stretch={0.85} />
        <mesh position={[0, -0.74, 0]} material={MAT.wood} castShadow>
          <cylinderGeometry args={[0.3, 0.28, 0.07, 18]} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.5;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.2, -1.12, Math.sin(a) * 0.2]}
              rotation={[Math.cos(a) * 0.12, 0, -Math.sin(a) * 0.12]}
              material={MAT.woodDark}
            >
              <cylinderGeometry args={[0.028, 0.042, 0.73, 7]} />
            </mesh>
          );
        })}
        {/* Stretcher ring — three separate legs read as sticks otherwise, the
            same reason the bench has them. */}
        <mesh position={[0, -1.24, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.woodDark}>
          <torusGeometry args={[0.19, 0.014, 5, 14]} />
        </mesh>
        {/* Apron, folded over the seat and hanging down one side. */}
        <mesh position={[0.03, -0.68, 0.02]} rotation={[0, 0, 0.06]} material={MAT.wax}>
          <cylinderGeometry args={[0.27, 0.25, 0.05, 16]} />
        </mesh>
        <mesh position={[0.2, -0.83, 0.04]} rotation={[0.05, 0, 0.22]} material={MAT.wax}>
          <boxGeometry args={[0.26, 0.3, 0.04]} />
        </mesh>
      </group>

      <group position={[0, 0, -5.2]}>
        <GroundShadow position={[0, -1.47, 0.2]} radius={2.4} />

        {/* The bench used to be one dark slab on four posts, which read as a
            silhouette against the dark panel behind it. It is now a walnut top
            over a recessed apron: the top is the lighter wood, the apron and
            legs the dark one, and a gold bead runs between them. That tonal
            split is what gives the piece an edge to catch the light on.
            Top surface sits at y = -0.20 — everything standing on it assumes
            that height. */}
        <mesh position={[0, -0.25, 0]} material={MAT.wood} receiveShadow>
          <boxGeometry args={[4.6, 0.1, 1.9]} />
        </mesh>
        {BENCH_TRIM && (
          <mesh position={[0, -0.309, 0]} material={MAT.gold}>
            <boxGeometry args={[4.68, 0.018, 1.98]} />
          </mesh>
        )}
        {/* Nosing, proud of the apron: casts the shadow line under the top. */}
        <mesh position={[0, -0.355, 0]} material={MAT.woodDark}>
          <boxGeometry args={[4.62, 0.075, 1.94]} />
        </mesh>
        <mesh position={[0, -0.52, 0]} material={MAT.woodDark}>
          <boxGeometry args={[4.1, 0.27, 1.6]} />
        </mesh>

        {/* Drawers, standing proud of the apron so the seam reads. */}
        {[-1.02, 1.02].map((dx) => (
          <group key={dx} position={[dx, -0.52, 0.815]}>
            <mesh material={MAT.wood}>
              <boxGeometry args={[1.5, 0.2, 0.04]} />
            </mesh>
            {BENCH_TRIM && (
              <mesh position={[0, 0, 0.035]} material={MAT.gold}>
                <boxGeometry args={[0.42, 0.026, 0.026]} />
              </mesh>
            )}
          </group>
        ))}

        {/* Tapered legs — square posts read as scaffolding at this distance. */}
        {[
          [-1.98, 0.72],
          [1.98, 0.72],
          [-1.98, -0.72],
          [1.98, -0.72],
        ].map(([lx, lz]) => (
          <mesh key={`${lx}:${lz}`} position={[lx, -1.09, lz]} material={MAT.woodDark}>
            <cylinderGeometry args={[0.05, 0.088, 0.92, 8]} />
          </mesh>
        ))}
        {/* Stretchers. Without them the legs read as four separate sticks and
            the bench looks like it is hovering. */}
        {[-1.98, 1.98].map((sx) => (
          <mesh key={sx} position={[sx, -1.3, 0]} material={MAT.woodDark}>
            <boxGeometry args={[0.055, 0.055, 1.44]} />
          </mesh>
        ))}
        <mesh position={[0, -1.3, 0]} material={MAT.woodDark}>
          <boxGeometry args={[3.96, 0.055, 0.055]} />
        </mesh>

        {/* Tool ledge across the back of the top. The camera sits at y = 0.5
            looking level — only 0.7 above this bench — so anything lying flat
            on it is edge-on and invisible. The ledge lifts the props into the
            eye line and gives them a lit surface to read against instead of
            the dark panel two units behind. */}
        {[-2.02, 2.02].map((bx) => (
          <mesh key={bx} position={[bx, -0.09, -0.74]} material={MAT.woodDark}>
            <boxGeometry args={[0.06, 0.22, 0.3]} />
          </mesh>
        ))}
        <mesh position={[0, 0.04, -0.74]} material={MAT.wood}>
          <boxGeometry args={[4.16, 0.04, 0.32]} />
        </mesh>
        {BENCH_TRIM && (
          <mesh position={[0, 0.072, -0.588]} material={MAT.gold}>
            <boxGeometry args={[4.16, 0.022, 0.022]} />
          </mesh>
        )}
        {/* Ledge dressing. Kept clear of x < -1.0, which the drawing board
            stands in front of. The three vessels are one canister at three
            scales, stepping down as they run outward — a graded set reads as
            equipment that belongs together, where three different silhouettes
            read as things left lying about. */}
        {[
          [0.66, 1],
          [1.05, 0.82],
          [1.4, 0.66],
        ].map(([cx, cs]) => (
          <mesh
            key={cx}
            position={[cx, BENCH.ledgeY, BENCH.ledgeZ]}
            scale={cs}
            geometry={CANISTER_GEO}
            material={MAT.goldSoft}
          />
        ))}
        {/* Brass, not woodDark: the ledge is silhouetted against the dark
            panel behind it, so a dark tray on it disappears. */}
        <mesh position={[0.05, 0.1, BENCH.ledgeZ]} material={MAT.goldSoft}>
          <boxGeometry args={[0.42, 0.08, 0.24]} />
        </mesh>
        {BENCH_TRIM && (
          <mesh position={[0.05, 0.145, BENCH.ledgeZ]} material={MAT.velvet}>
            <boxGeometry args={[0.34, 0.012, 0.18]} />
          </mesh>
        )}

        {/* Velvet working mat on a gold tray, on the bench's centre line: the
            one saturated patch on an otherwise brown bench, and what the eye
            lands on. It was off-centre at x = 0.22, which threw the whole
            left/right balance out. */}
        <mesh position={[0, -0.197, BENCH.workZ]} material={MAT.goldSoft}>
          <boxGeometry args={[1.68, 0.01, 1.0]} />
        </mesh>
        <mesh position={[0, -0.186, BENCH.workZ]} material={MAT.velvet}>
          <boxGeometry args={[1.56, 0.014, 0.88]} />
        </mesh>

        {/* A ring on its stand — the one thing on the bench that stands upright
            in the eye line, so it is what the zone actually reads as jewellery
            being made. */}
        <mesh position={[-0.3, -0.049, BENCH.workZ - 0.06]} material={MAT.goldSoft}>
          <cylinderGeometry args={[0.016, 0.032, 0.26, 8]} />
        </mesh>
        <mesh position={[-0.3, 0.03, BENCH.workZ - 0.06]} material={MAT.gold}>
          <torusGeometry args={[0.085, 0.019, 8, 22]} />
        </mesh>

        {/* The piece being set. Lying straight on the mat it was a gold smudge
            — at this camera height a flat ring is 3px of edge — so it sits on
            a setting block, tipped up to show its face. */}
        <group position={[0.28, -0.155, BENCH.workZ - 0.08]}>
          <mesh material={MAT.woodDark}>
            <boxGeometry args={[0.26, 0.062, 0.2]} />
          </mesh>
          <group position={[0, 0.075, 0.01]} rotation={[-0.95, 0, 0.12]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
              <torusGeometry args={[0.11, 0.024, 10, 26]} />
            </mesh>
            <mesh position={[0, 0.055, 0]} material={MAT.gemGreen}>
              <octahedronGeometry args={[0.06, 0]} />
            </mesh>
          </group>
        </group>

        {/* Loose stones, set out in a row along the mat's front instead of
            dropped at two random offsets. */}
        {BENCH_TRIM &&
          [-0.26, 0, 0.26].map((gx) => (
            <mesh
              key={gx}
              position={[gx, -0.161, BENCH.workZ + 0.3]}
              material={MAT.gemGreen}
            >
              <octahedronGeometry args={[0.038, 0]} />
            </mesh>
          ))}

        {/* The reference photograph, propped on the board rather than lying
            flat — a sheet on the bench top is a white sliver from here.

            The board used to hold two things: a gold arc standing for a
            drawn design, and this photograph pinned small beside it. Neither
            won. The arc was five segments of a torus seen from three metres
            away, which is not a sketch, it is a broken ring; and the picture
            of the actual piece — the one thing on a bench in a zone about
            making jewellery that shows what is being made — was the size of a
            postage stamp next to it.

            The photograph has the board to itself now, and the board is cut
            to the photograph's own proportions, so nothing is cropped and
            nothing is stretched whatever file the bench reference points at. */}
        <group position={[-1.3, 0.125, BENCH.standZ]} rotation={[-0.3, 0.2, 0]}>
          <mesh material={MAT.woodDark}>
            <boxGeometry args={[board[0] + 0.09, board[1] + 0.09, 0.025]} />
          </mesh>
          {/* Paper behind the print, showing as a mat around it. */}
          <mesh position={[0, 0, 0.016]} material={MAT.paper}>
            <planeGeometry args={[board[0] + 0.045, board[1] + 0.045]} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={board} />
            <meshBasicMaterial map={reference} toneMapped={false} />
          </mesh>
          {/* The pin it hangs from. */}
          <mesh position={[0, board[1] / 2 + 0.028, 0.026]} material={MAT.gold}>
            <sphereGeometry args={[0.013, 6, 5]} />
          </mesh>
        </group>

        {/* Stack of setting trays. This corner held two more loose sheets, and
            for the same reason as the board they never read — swapped for
            something with height. */}
        <group position={[BENCH.leftX, 0, BENCH.workZ]} rotation={[0, 0.14, 0]}>
          <mesh position={[0, -0.175, 0]} material={MAT.woodDark}>
            <boxGeometry args={[0.64, 0.05, 0.44]} />
          </mesh>
          <mesh position={[0.02, -0.122, 0.01]} material={MAT.wood}>
            <boxGeometry args={[0.6, 0.055, 0.4]} />
          </mesh>
          <mesh position={[0.02, -0.09, 0.01]} material={MAT.velvet}>
            <boxGeometry args={[0.52, 0.014, 0.32]} />
          </mesh>
        </group>

        {/* Tool roll. The gravers used to lie at four different angles from
            x = 1.75 outward, which left the last one 0.29 past the edge of the
            top with nothing under it. They now lie parallel and square to the
            bench on a leather strip, wholly on the surface. */}
        <group position={[BENCH.rightX, 0, BENCH.workZ + 0.1]}>
          {/* Oxblood leather. In woodDark on a wood top the strip was the same
              value as the bench and read as a stain rather than an object. */}
          <mesh position={[0, -0.19, 0]} material={MAT.wax}>
            <boxGeometry args={[1.04, 0.026, 0.5]} />
          </mesh>
          {[-0.31, -0.1, 0.11, 0.32].map((tx, i) => (
            <mesh
              key={tx}
              position={[tx, -0.151, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              material={i % 2 === 0 ? MAT.goldSoft : MAT.woodDark}
            >
              <cylinderGeometry args={[0.026, 0.013, 0.46, 6]} />
            </mesh>
          ))}
        </group>

        {/* Loupe on its stand. It used to be tipped back with a 0.3 handle
            hanging off the bottom, which put the stem's end at y = -0.545 —
            a third of a unit below the tabletop. Upright on a short stem it
            both clears the surface and turns the lens to the camera. */}
        {/* ...but it still stood on a 0.17 stub that met the top at a point,
            so the lens looked balanced rather than mounted. It now has the
            weighted foot and full-length column a bench magnifier has, and it
            has moved inboard from x = -2.05, where the ring overhung the
            corner of the bench. */}
        <group position={[-1.98, 0.1, BENCH.standZ]} rotation={[0, 0.35, 0]}>
          <mesh material={MAT.gold}>
            <torusGeometry args={[0.17, 0.022, 8, 24]} />
          </mesh>
          <mesh material={MAT.glass}>
            <circleGeometry args={[0.16, 20]} />
          </mesh>
          {/* Column and foot down to the bench top at y = -0.20, which is
              local -0.30: the foot's underside sits exactly there. */}
          <mesh position={[0, -0.2, 0]} material={MAT.goldSoft}>
            <cylinderGeometry args={[0.017, 0.021, 0.13, 8]} />
          </mesh>
          <mesh position={[0, -0.2775, 0]} material={MAT.woodDark}>
            <cylinderGeometry args={[0.13, 0.15, 0.045, 14]} />
          </mesh>
        </group>

        {/* On the ledge, not the top — down there it was a white blob at the
            back of an unlit surface. Squat and flared rather than the tall
            0.3 drum it was: at that height, pale and alone on a shelf beside
            a lamp, it read as a second lampshade. */}
        <mesh position={[-0.55, 0.145, BENCH.ledgeZ]} material={MAT.marble}>
          <cylinderGeometry args={[0.16, 0.115, 0.17, 16]} />
        </mesh>
        {BENCH_TRIM && (
          <mesh
            position={[-0.55, 0.229, BENCH.ledgeZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={MAT.goldSoft}
          >
            <torusGeometry args={[0.152, 0.012, 6, 18]} />
          </mesh>
        )}

        {/* Bench lamp. The base used to be half-sunk in the top; it now stands
            on it, and it is pulled forward of z = -0.58, where the post rose
            straight through the ledge shelf and its gold rail.

            The head was the broken part: the shade sat 0.28 to the left of the
            post with nothing joining the two, so it read as a scoop hanging in
            mid-air — and being an open-ended cone with a double-sided material,
            you looked straight down its hollow interior. It is now jointed:
            post, knuckle, an arm out over the work, and the shade hung from the
            arm's end with its narrow end capped and the glow sunk inside the
            mouth rather than protruding from it. */}
        <group position={[1.62, -0.17, -0.28]}>
          <mesh material={MAT.goldSoft}>
            <cylinderGeometry args={[0.19, 0.22, 0.05, 20]} />
          </mesh>
          <mesh position={[0, 0.055, 0]} material={MAT.goldSoft}>
            <cylinderGeometry args={[0.09, 0.15, 0.06, 16]} />
          </mesh>
          <mesh position={[0, 0.53, 0]} material={MAT.goldSoft}>
            <cylinderGeometry args={[0.02, 0.028, 0.9, 10]} />
          </mesh>
          {/* Knuckle where the arm swings off the post. */}
          <mesh position={[0, 0.98, 0]} material={MAT.gold}>
            <sphereGeometry args={[0.045, 10, 8]} />
          </mesh>
          {/* Arm, reaching in over the mat. Spans x = -0.5 → 0, so it starts
              at the knuckle and there is no gap to read as a break. */}
          <mesh
            position={[-0.25, 0.98, 0.04]}
            rotation={[0, 0, Math.PI / 2]}
            material={MAT.goldSoft}
          >
            <cylinderGeometry args={[0.018, 0.018, 0.5, 8]} />
          </mesh>
          <mesh position={[-0.5, 0.965, 0.04]} material={MAT.gold}>
            <sphereGeometry args={[0.038, 10, 8]} />
          </mesh>

          {/* What the lamp actually throws. The shade hangs at local
              (-0.5, 0.85), so the pool is centred under it on the bench top
              at y = -0.20 — local -0.03 — lifted three thousandths clear to
              stay off the surface it is lighting. */}
          <mesh
            position={[-0.5, -0.027, 0.04]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={MAT.lightPool}
            renderOrder={2}
          >
            <planeGeometry args={[1.75, 1.75]} />
          </mesh>

          <group position={[-0.5, 0.85, 0.04]} rotation={[0.2, 0, 0.1]}>
            <mesh material={MAT.lampShade}>
              <cylinderGeometry args={[0.13, 0.3, 0.24, 20, 1, true]} />
            </mesh>
            <mesh
              position={[0, 0.12, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              material={MAT.lampShade}
            >
              <circleGeometry args={[0.13, 20]} />
            </mesh>
            <mesh ref={lampGlowRef} position={[0, -0.095, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.25, 20]} />
              <meshBasicMaterial color={P.glow} transparent opacity={0.8} />
            </mesh>
          </group>

          {/* Halo at the shade's mouth. The pool on the bench is the honest
              half of the effect but it is laid on a surface the camera sees
              almost edge-on, so it compresses to a band; this is what
              actually reads as "the lamp is on".

              No billboarding needed: the camera flies straight down -Z and
              never turns, so a quad in the XY plane always faces it. */}
          <mesh position={[-0.5, 0.74, 0.12]} material={MAT.lightPool} renderOrder={3}>
            <planeGeometry args={[1.15, 1.15]} />
          </mesh>

          {/* Dust in the light. Drei's Sparkles is a GPU-animated point
              cloud — one draw call and no per-frame work on our side — and
              it is already gated by the tier that turns it off on low. */}
          {QUALITY.sparkles > 0 && (
            <Sparkles
              count={14}
              position={[-0.5, 0.42, 0.06]}
              scale={[1.1, 0.9, 0.7]}
              size={1.6}
              speed={0.25}
              opacity={0.5}
              color={P.glow}
            />
          )}
        </group>
      </group>

      {/* The panel behind the bench. Its rail used to carry six bare pegs
          hanging straight down, which read as a gold comb rather than a
          display — nothing was on it. The pegs are now the necklaces
          themselves: a half-torus is the only shape that reads as a chain
          hanging over a bar at this distance, and the drop at the bottom of
          each gives it a reason to hang. */}
      <group position={[0, 0.7, -7.2]}>
        {/* The wall was 5 x 3, topped out at y = 2.2, and the next room's
            ceiling and its two downlights showed straight over it — a lit dark
            box hanging above the workshop. It now runs to y = 3.25, which is
            above that sightline for the whole of the zone's approach, and it
            carries plaster maps so the largest surface in the room is not one
            flat rectangle of colour.

            It also has a doorway through it now. Solid, it filled the frame and
            the zone read as a dead end — the entrance tells you to keep going
            by showing you the hall through the open doors, and this told you
            nothing. Through the arch you see the collection room's floor, its
            vitrine and its sign, ten units back. The camera flies at y = 0.5 on
            the centre line, so it goes through the doorway rather than through
            the wall. */}
        <mesh position={[0, CRAFT_WALL.y, 0]} geometry={CRAFT_WALL_GEO} material={MAT.craftWall} />
        {/* Cornice. Without it the wall stops at a cut edge; with it the wall
            stops because the room does. */}
        <mesh position={[0, 2.62, 0.08]} material={MAT.woodDark}>
          <boxGeometry args={[6.0, 0.2, 0.22]} />
        </mesh>
        <mesh position={[0, 2.5, 0.12]} material={MAT.goldSoft}>
          <boxGeometry args={[5.9, 0.035, 0.035]} />
        </mesh>
        {/* Side returns. Without them you see the cream void past both edges
            of the wall and it reads as a flat propped up in the open; with
            them the bench sits in an alcove. Short, and well off the centre
            line, so nothing is added to what blocks the way forward. */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh
              position={[s * 2.88, CRAFT_WALL.y, 0.85]}
              rotation={[0, (s * -Math.PI) / 2, 0]}
              material={MAT.craftWall}
            >
              <planeGeometry args={[1.7, CRAFT_WALL.height]} />
            </mesh>
            {/* The cornice has to turn the corner with them, or their top
                edges cut straight against the sky and they read as flaps. */}
            <mesh position={[s * 2.95, 2.62, 0.62]} material={MAT.woodDark}>
              <boxGeometry args={[0.22, 0.2, 1.25]} />
            </mesh>
          </group>
        ))}
        {/* The doorway's own frame. Cut into a dark wall and left bare, the
            opening reads as damage; jambs in the lighter walnut and a gold bead
            running up them and over the head make it architecture. The bead
            picks up the same trick as the entrance arch. */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * (CRAFT_WALL.half + 0.06), 0, 0]}>
            <mesh position={[0, -1.0, 0.06]} material={MAT.wood}>
              <boxGeometry args={[0.13, 2.4, 0.2]} />
            </mesh>
            <mesh position={[0, -1.0, 0.17]} material={MAT.goldSoft}>
              <boxGeometry args={[0.032, 2.4, 0.032]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.2, 0.17]} material={MAT.goldSoft}>
          <torusGeometry args={[CRAFT_WALL.half + 0.06, 0.026, 6, 26, Math.PI]} />
        </mesh>
        <mesh position={[0, -2.19, 0]} material={MAT.threshold}>
          <boxGeometry args={[2.16, 0.06, 0.5]} />
        </mesh>
        {/* Light from the room beyond, sitting in the threshold. The floor of
            the passage is hidden behind the bench from every camera position in
            the zone, so a pool laid on it would never be seen — this is the
            same additive quad the bench lamp uses, stood upright instead.

            It is kept low and small deliberately: filling the opening with it
            washed out the very thing the opening is there to show. */}
        <mesh position={[0, -1.45, -0.12]} material={MAT.lightPool} renderOrder={2}>
          <planeGeometry args={[1.7, 1.0]} />
        </mesh>

        {/* The necklaces hung on one rail across the middle of the wall, which
            is now the doorway. Two rails, one on each pier, with the longer
            chain of each pair nearest the opening so the pair reads as graded
            rather than as a pair of matching hooks. */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 1.95, 0, 0]}>
            <mesh position={[0, 0.55, 0.04]} material={MAT.goldSoft}>
              <boxGeometry args={[1.5, 0.07, 0.07]} />
            </mesh>
            {[
              { x: -s * 0.44, drop: 0.46 },
              { x: s * 0.44, drop: 0.34 },
            ].map(({ x, drop }) => (
              <group key={x} position={[x, 0.52, 0.1]}>
                {/* Squashed on x: a true half-circle at this drop would be
                    wider than the gap and the chains would interlace. */}
                <mesh
                  rotation={[0, 0, Math.PI]}
                  scale={[0.7, 1, 1]}
                  material={MAT.gold}
                >
                  <torusGeometry args={[drop, 0.014, 6, 22, Math.PI]} />
                </mesh>
                {BENCH_TRIM && (
                  <mesh position={[0, -drop, 0]} material={MAT.gemGreen}>
                    <octahedronGeometry args={[0.055, 0]} />
                  </mesh>
                )}
              </group>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}

/** The mount a niche picture is matted on, and the largest it may print. */
const PICTURE_MOUNT: [number, number] = [0.88, 1.12];
const PICTURE_MAX: [number, number] = [0.72, 0.96];

/**
 * Width the wall photographs are redrawn to before they reach the GPU.
 *
 * The source files are 1080x1350 product shots. A niche is 0.72 units wide,
 * seen from two-and-a-half units off the centre line at a raking angle, so it
 * never prints much past 300px — six full-size photos would be about 47MB of
 * texture memory to show maybe 2MB of it. That is invisible on a desktop GPU
 * and very much not on a phone, which is where the low tier matters.
 */
const PICTURE_TEX_W = { low: 192, mid: 320, high: 512 }[QUALITY.tier];

function downscalePicture(tex: THREE.Texture): THREE.Texture {
  const img = tex.image as (CanvasImageSource & { width: number; height: number }) | undefined;
  if (typeof document === "undefined" || !img?.width || img.width <= PICTURE_TEX_W) {
    return tex;
  }
  const canvas = document.createElement("canvas");
  canvas.width = PICTURE_TEX_W;
  canvas.height = Math.max(1, Math.round((img.height * PICTURE_TEX_W) / img.width));
  const ctx = canvas.getContext("2d");
  if (!ctx) return tex;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // A new texture rather than a resized one: useTexture caches by URL, and
  // these files are shared with the product cards and the zone 05 portrait.
  const small = new THREE.CanvasTexture(canvas);
  small.colorSpace = THREE.SRGBColorSpace;
  small.anisotropy = 8;
  return small;
}

/**
 * Fit a picture inside the mount without distorting it. Textures arrive with
 * their pixel dimensions attached, so the aspect is known at first render and
 * a landscape photo dropped into the wall pictures letterboxes rather than
 * stretching to the portrait frame.
 */
function fitPicture(tex: THREE.Texture): [number, number] {
  const img = tex.image as { width?: number; height?: number } | undefined;
  const aspect = img?.width && img?.height ? img.width / img.height : 0.8;
  const [maxW, maxH] = PICTURE_MAX;
  const w = Math.min(maxW, maxH * aspect);
  return [w, w / aspect];
}

/** An open catalogue gives this room a different silhouette from the
 * standing portrait panels in Moments and the finale. */
function CollectionLookbook({
  pictures,
  items,
}: {
  pictures: THREE.Texture[];
  items: HomeMediaItem[];
}) {
  const [spread, setSpread] = useState(0);
  const [active, setActive] = useState(false);
  const running = useShowroomStore((state) => state.running);
  const spreads = Math.ceil(items.length / 2);
  const first = spread * 2;
  const currentItems = items.slice(first, first + 2);

  useEffect(() => () => {
    sceneInteraction.hovered = false;
    sceneInteraction.focused = false;
  }, [active]);

  useEffect(() => {
    if (!running) return;
    const onScroll = () => {
      const progress = journeyProgress();
      setActive(progress >= 0.5 && progress < 2 / 3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [running]);

  if (!items.length) return null;

  return (
    <group>
      {/* The sloping book rests on a low velvet support. */}
      <mesh position={[0, -0.18, -0.32]} material={MAT.emeraldDeep}>
        <boxGeometry args={[1.85, 0.5, 0.5]} />
      </mesh>
      <group position={[0, 0.36, 0.08]} rotation={[-0.52, 0, 0]}>
        <mesh position={[0, 0, -0.065]} material={MAT.emeraldDeep}>
          <boxGeometry args={[3.12, 1.84, 0.1]} />
        </mesh>
        {[-1, 1].map((side, page) => {
          const index = first + page;
          const picture = pictures[index];
          const item = items[index];
          const img = picture?.image as { width?: number; height?: number } | undefined;
          const aspect = img?.width && img?.height ? img.width / img.height : 1;
          // Full contain-fit for every upload; never alter the cached texture.
          const width = Math.min(1.28, 1.35 * aspect);
          const height = width / aspect;
          return (
            <group key={side} position={[side * 0.76, 0, 0]} rotation={[0, side * 0.035, 0]}>
              <mesh position={[0, 0, -0.005]}>
                <boxGeometry args={[1.47, 1.76, 0.065]} />
                <meshBasicMaterial color={P.paper} toneMapped={false} />
              </mesh>
              {/* Layered page edges and a narrow cloth binding make this a book. */}
              {[-0.021, -0.007].map((z) => (
                <mesh key={z} position={[0, -0.87, z]} material={MAT.goldSoft}>
                  <boxGeometry args={[1.44, 0.008, 0.006]} />
                </mesh>
              ))}
              {picture && item ? (
                <>
                  <mesh position={[0, 0.055, 0.034]}>
                    <planeGeometry args={[width, height]} />
                    <meshBasicMaterial map={picture} toneMapped={false} />
                  </mesh>
                  {item.title && (
                    <TextPlane
                      text={item.title}
                      width={1.28}
                      height={0.16}
                      color={P.brandDeep}
                      fontScale={0.76}
                      letterSpacing="0.015em"
                      weight="600"
                      position={[0, -0.715, 0.038]}
                    />
                  )}
                  <TextPlane
                    text={String(index + 1).padStart(2, "0")}
                    width={0.2}
                    height={0.09}
                    color={P.brand}
                    letterSpacing="0.08em"
                    weight="600"
                    position={[side * 0.59, -0.82, 0.038]}
                  />
                </>
              ) : (
                <>
                  <CrestMark height={0.54} position={[0, 0.18, 0.034]} />
                  <TextPlane
                    text="GEETEJ VIRAASAT"
                    width={1.24}
                    height={0.2}
                    color={P.brandDeep}
                    weight="600"
                    position={[0, -0.27, 0.038]}
                  />
                </>
              )}
            </group>
          );
        })}
        <mesh position={[0, 0, 0.026]} material={MAT.emeraldDeep}>
          <boxGeometry args={[0.035, 1.77, 0.016]} />
        </mesh>
        <mesh position={[0.05, -0.66, 0.045]} material={MAT.goldSoft}>
          <boxGeometry args={[0.025, 0.62, 0.006]} />
        </mesh>
      </group>
      {active && (
        <Html center position={[0, -1.0, 1.58]} zIndexRange={[10, 0]}>
          <div
            role="group"
            aria-label="Collection lookbook"
            className="pointer-events-auto flex w-[204px] items-center justify-between rounded-full border border-verdant-gold/60 bg-[var(--color-primary)] px-1 text-[var(--color-shell)] shadow-md"
            onPointerDown={(event) => event.stopPropagation()}
            onPointerEnter={() => { sceneInteraction.hovered = true; }}
            onPointerLeave={() => { sceneInteraction.hovered = false; }}
            onFocusCapture={() => { sceneInteraction.focused = true; }}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                sceneInteraction.focused = false;
              }
            }}
          >
            <button
              type="button"
              aria-label="Previous collection pages"
              disabled={spreads <= 1}
              onClick={() => setSpread((value) => (value - 1 + spreads) % spreads)}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-full text-xl hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:invisible"
            >
              &lsaquo;
            </button>
            <span className="text-center text-[10px] tracking-[0.14em]" aria-live="polite" aria-atomic="true">
              <span aria-hidden="true">{first + 1}{currentItems.length > 1 ? `\u2013${first + 2}` : ""} / {items.length}</span>
              <span className="sr-only">
                {currentItems.map((item, i) => `${item.title || `Piece ${first + i + 1}`}. ${item.alt}`).join(" ")}
                {` Showing ${first + 1} to ${first + currentItems.length} of ${items.length}.`}
              </span>
            </span>
            <button
              type="button"
              aria-label="Next collection pages"
              disabled={spreads <= 1}
              onClick={() => setSpread((value) => (value + 1) % spreads)}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-full text-xl hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:invisible"
            >
              &rsaquo;
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

function DisplayNiche({
  position,
  rotation,
  picture,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  picture: THREE.Texture;
}) {
  const [pw, ph] = fitPicture(picture);

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.14]} material={MAT.emeraldDeep}>
        <boxGeometry args={[1.18, 1.9, 0.3]} />
      </mesh>
      <mesh position={[0, 0.55, 0.02]} material={MAT.gold}>
        <torusGeometry args={[0.58, 0.035, 6, 20, Math.PI]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.58, -0.2, 0.02]} material={MAT.gold}>
          <boxGeometry args={[0.07, 1.5, 0.07]} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, -0.05]} material={MAT.glow}>
        <sphereGeometry args={[0.06, 8, 6]} />
      </mesh>
      <mesh position={[0, -0.72, -0.02]} material={MAT.marble}>
        <boxGeometry args={[1.0, 0.07, 0.28]} />
      </mesh>

      {/* The framed photograph. Every niche used to hold the same green bust,
          six of them down the room; the wall is where the actual pieces are
          shown now. Frame, then a pale mount, then the print — the mount is
          what stops a dark photo from dissolving into the recess behind it. */}
      {/* z = 0.025, not inside the recess: the dark box behind is solid, and
          its front face is at z = 0.01 — anything below that is buried. */}
      <group position={[0, 0.02, 0.025]}>
        <mesh material={MAT.gold}>
          <boxGeometry args={[PICTURE_MOUNT[0] + 0.06, PICTURE_MOUNT[1] + 0.06, 0.03]} />
        </mesh>
        <mesh position={[0, 0, 0.019]} material={MAT.paper}>
          <planeGeometry args={PICTURE_MOUNT} />
        </mesh>
        <mesh position={[0, 0, 0.023]}>
          <planeGeometry args={[pw, ph]} />
          <meshBasicMaterial map={picture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function TheCollection({ z }: { z: number }) {
  // Loaded once for the whole room rather than per niche, and inside
  // ShowroomCanvas' Suspense boundary, so the room appears with its pictures
  // already on the walls. A shorter list repeats from the start.
  const loaded = useTexture(wallPictures(), (tex) => {
    for (const t of Array.isArray(tex) ? tex : [tex]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
  });
  const pictures = useMemo(() => loaded.map(downscalePicture), [loaded]);
  useEffect(
    () => () => {
      // Only the copies — the originals belong to useTexture's cache.
      for (const tex of pictures) {
        if (tex instanceof THREE.CanvasTexture) tex.dispose();
      }
    },
    [pictures]
  );
  const pictureAt = (i: number) => pictures[i % pictures.length];

  // Same loader, so any file already on the walls is a cache hit —
  // no second fetch and no second decode.
  const plinthEntries = useMemo(() => plinthItems(), []);
  const plinthSources = useTexture(plinthEntries.map((item) => item.url), (textures) => {
    for (const texture of Array.isArray(textures) ? textures : [textures]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
    }
  });

  const nicheZ = [0.5, -3, -6.5];

  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh
            position={[s * 3.0, 1.0, -3]}
            rotation={[0, (s * -Math.PI) / 2, 0]}
            material={MAT.emeraldWall}
          >
            <planeGeometry args={[11, 5.5]} />
          </mesh>
          {/* Skirting and a picture rail. A wall with nothing but a single
              plane of colour has no scale to it; two horizontal breaks give
              the eye something to measure the room against. */}
          <mesh
            position={[s * 2.96, -1.28, -3]}
            rotation={[0, (s * -Math.PI) / 2, 0]}
            material={MAT.emeraldDeep}
          >
            <boxGeometry args={[11, 0.44, 0.06]} />
          </mesh>
          <mesh
            position={[s * 2.96, 2.05, -3]}
            rotation={[0, (s * -Math.PI) / 2, 0]}
            material={MAT.goldSoft}
          >
            <boxGeometry args={[11, 0.05, 0.05]} />
          </mesh>
          {nicheZ.map((nz, i) => (
            <DisplayNiche
              key={nz}
              position={[s * 2.92, 0.35, nz]}
              rotation={[0, (s * -Math.PI) / 2, 0]}
              // Left wall takes the first three, right wall the next three,
              // matching the order the wall pictures are given in.
              picture={pictureAt(s < 0 ? i : nicheZ.length + i)}
            />
          ))}
        </group>
      ))}

      <mesh position={[0, 3.6, -3]} rotation={[Math.PI / 2, 0, 0]} material={MAT.emeraldDeep}>
        <planeGeometry args={[6, 11]} />
      </mesh>
      {[1, -1.5, -4, -6.5].map((lz) => (
        <mesh
          key={lz}
          position={[0, 3.55, lz]}
          rotation={[Math.PI / 2, 0, 0]}
          material={MAT.glow}
        >
          <circleGeometry args={[0.22, 16]} />
        </mesh>
      ))}

      {/* A deeper, double-framed plaque with illuminated lettering stays
          legible from the entrance. The unlit face preserves its contrast
          under the room's bright lighting while still receiving scene fog. */}
      <group position={[0, 2.45, -6.9]}>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 1.42, 0, 0]}>
            <mesh position={[0, 1.135, 0]} material={MAT.gold}>
              <cylinderGeometry args={[0.075, 0.09, 0.05, 12]} />
            </mesh>
            <mesh position={[0, 0.75, 0]} material={MAT.gold}>
              <cylinderGeometry args={[0.022, 0.022, 0.76, 8]} />
            </mesh>
            <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
              <torusGeometry args={[0.045, 0.014, 6, 16]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0, -0.025]} material={MAT.gold}>
          <boxGeometry args={[3.65, 0.78, 0.14]} />
        </mesh>
        <mesh position={[0, 0, 0.055]}>
          <boxGeometry args={[3.51, 0.64, 0.06]} />
          <meshBasicMaterial color={P.brandDeep} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[3.39, 0.53]} />
          <meshBasicMaterial color={P.goldSoft} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.095]}>
          <planeGeometry args={[3.365, 0.505]} />
          <meshBasicMaterial color={P.brandDeep} toneMapped={false} />
        </mesh>
        {/* The entrance's elephant crest crowns the frame like a house seal.
            Its lower rim overlaps the brass edge, leaving the title clear. */}
        <group position={[0, 0.64, 0.105]}>
          <CrestMedallion radius={0.34} markY={0.015} />
        </group>
        <TextPlane
          text="THE COLLECTION"
          width={3.22}
          height={0.46}
          fontScale={0.8}
          letterSpacing="0.1em"
          weight="600"
          color={P.signText}
          position={[0, 0, 0.105]}
        />
      </group>

      <group position={[0, 0, -5]}>
        <GroundShadow position={[0, -1.47, 0]} radius={1.7} />
        <mesh position={[0, -1.0, 0]} material={MAT.marble}>
          <cylinderGeometry args={[1.45, 1.55, 1.0, 64]} />
        </mesh>
        <mesh position={[0, -1.46, 0]} material={MAT.emeraldDeep}>
          <cylinderGeometry args={[1.62, 1.62, 0.09, 64]} />
        </mesh>
        {[-1.38, -0.56].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
            <torusGeometry args={[y < -1 ? 1.55 : 1.46, 0.018, 8, 64]} />
          </mesh>
        ))}
        <mesh position={[0, -0.48, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.08, 64]} />
          <meshStandardMaterial color={P.velvet} roughness={0.96} envMapIntensity={0.18} />
        </mesh>
        <mesh position={[0, -0.44, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
          <torusGeometry args={[1.48, 0.025, 8, 64]} />
        </mesh>

        <CollectionLookbook pictures={plinthSources} items={plinthEntries} />
        <TextPlane
          text="THE JEWELLERY LOOKBOOK"
          width={2.12}
          height={0.18}
          color={P.brandDeep}
          fontScale={0.75}
          letterSpacing="0.13em"
          weight="600"
          position={[0, -0.70, 1.56]}
        />
        <CrestMark height={0.18} position={[0, -1.36, 1.565]} />
      </group>
    </group>
  );
}

/**
 * Whether the film's element is built at boot and kept, rather than created on
 * approach and torn down on the way out. `preload.ts` has already buffered the
 * file by the time the room mounts, so building it here costs nothing and the
 * alternative — constructing a `VideoTexture` and starting playback in the
 * middle of a swipe — is exactly the hitch full preload exists to remove.
 */
const FILM_ALWAYS_ON = fullPreload();

/**
 * The ring turning, as a texture — the one moving image in the show.
 *
 * Off full preload, nothing is fetched until the journey approaches the room.
 * Retain the decoded texture after that and pause outside the room, including
 * on other routes. Repeatedly clearing its video source while the retained
 * scene still references it can send an empty video frame to WebKit's GPU.
 */
function useAtelierFilm() {
  const [near, setNear] = useState(FILM_ALWAYS_ON);
  const [requested, setRequested] = useState(FILM_ALWAYS_ON);
  const [film, setFilm] = useState<THREE.VideoTexture | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const running = useShowroomStore((state) => state.running);

  useEffect(() => {
    if (!running || FILM_ALWAYS_ON || !filmAllowed()) return;
    const onScroll = () => {
      const p = journeyProgress();
      const inRoom = p > 0.58 && p < 0.95;
      setNear(inRoom);
      if (inRoom) setRequested(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [running]);

  useEffect(() => {
    // `filmAllowed` is re-checked here rather than left to the scroll effect,
    // which does not run at all when the film is always on.
    if (!requested || !filmAllowed()) return;
    const el = document.createElement("video");
    video.current = el;
    el.src = ATELIER_FILM;
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    el.preload = "auto";

    const tex = new THREE.VideoTexture(el);
    tex.colorSpace = THREE.SRGBColorSpace;

    // Cover-fit: the film is 9:16 and the frame is 4:5, so it is matched
    // on width and trimmed top and
    // bottom rather than squashed.
    const onData = () => {
      const shot = el.videoWidth / el.videoHeight;
      const frame = MOMENTS_FRAME[0] / MOMENTS_FRAME[1];
      if (shot > frame) {
        tex.repeat.set(frame / shot, 1);
        tex.offset.set((1 - frame / shot) / 2, 0);
      } else {
        tex.repeat.set(1, shot / frame);
        tex.offset.set(0, (1 - shot / frame) / 2);
      }
      setFilm(tex);
    };
    // Metadata gives dimensions but does not guarantee an uploadable frame.
    el.addEventListener("loadeddata", onData, { once: true });
    return () => {
      el.removeEventListener("loadeddata", onData);
      el.pause();
      video.current = null;
      el.removeAttribute("src");
      el.load();
      tex.dispose();
    };
  }, [requested]);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    // Muted and inline; retain the still if autoplay is refused.
    if (running && near) void el.play().catch(() => {});
    else el.pause();
  }, [running, near, requested]);

  return film;
}

/** The artwork inside the gold frame — the still and the film share it. */
const MOMENTS_FRAME: [number, number] = [2.62, 3.3];

/**
 * The two pictures on the side walls. Both sources are 2:3, so this is 2:3 and
 * neither is cropped; at 1.7 wide they read as a pair either side of a 2.85
 * centrepiece rather than competing with it.
 */
const MOMENTS_WING: [number, number] = [1.7, 2.55];

/**
 * Where the centrepiece dissolves, and why it has to.
 *
 * The camera flies down x = 0 at y = 0.5 and this picture stands on the axis at
 * the same height, so it does not pass the frame — it goes through it. That
 * happens at progress 0.87, which is inside zone 05: the opening fifth of the
 * finale was a photograph filling the whole screen, worst of all on a phone,
 * where the lens is at its widest. Moving the picture is no answer, since a
 * runner leading to a centrepiece has nowhere off-axis to lead.
 *
 * So it fades out over the last three units of the approach instead, and the
 * finale is already lit behind it when it goes. The numbers are the camera's:
 * z = 76 - 68p against the frame at world 16.85, so 0.825 is three units short
 * of it and 0.858 is one.
 */
const MOMENTS_FADE_FROM = 0.825;
const MOMENTS_FADE_TO = 0.858;

/**
 * The centrepiece's own materials, at module scope for the same reason `MAT` is:
 * one room, one set, mutated from the frame loop, and nothing a hook returned.
 *
 * `depthWrite` stays on. Off, the finale's additive light pools — which carry a
 * renderOrder and so draw last — came through the picture while it was still
 * solid. On, the picture occludes them properly; the cost is that a fully faded
 * material still writes depth, which is what the group's `visible` is for.
 */
const MOMENTS_MAT = (() => {
  const clone = <T extends THREE.Material>(m: T) => {
    const c = m.clone() as T;
    c.transparent = true;
    return c;
  };
  return {
    gold: clone(MAT.gold),
    marble: clone(MAT.marble),
    vignette: clone(MAT.vignette),
  };
})();

function MomentsCentrepiece({ map }: { map: THREE.Texture }) {
  const picture = useRef<THREE.MeshBasicMaterial>(null);
  const captionEyebrow = useRef<THREE.MeshBasicMaterial>(null);
  const captionTitle = useRef<THREE.MeshBasicMaterial>(null);
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const k =
      1 -
      THREE.MathUtils.smoothstep(journeyProgress(), MOMENTS_FADE_FROM, MOMENTS_FADE_TO);
    if (group.current) group.current.visible = k > 0.002;
    MOMENTS_MAT.gold.opacity = k;
    MOMENTS_MAT.marble.opacity = k;
    // Keep the caption ground solid until the centrepiece is nearly gone. If
    // it fades at the same rate as the picture, the film shows through behind
    // the still-readable title during the approach to the next room.
    MOMENTS_MAT.vignette.opacity =
      THREE.MathUtils.smoothstep(k, 0, 0.35) * 0.94;
    if (picture.current) picture.current.opacity = k;
    if (captionEyebrow.current) captionEyebrow.current.opacity = k;
    if (captionTitle.current) captionTitle.current.opacity = k;
  });

  return (
    <group ref={group} position={[0, 0.5, -7.15]}>
      {/* The plinth runs from the floor at world -1.5 to the frame's bottom
          edge at -1.275 and stops there. */}
      <mesh position={[0, -1.8875, 0.02]} material={MOMENTS_MAT.marble}>
        <boxGeometry args={[3.1, 0.225, 0.52]} />
      </mesh>
      <mesh position={[0, 0, -0.05]} material={MOMENTS_MAT.gold}>
        <boxGeometry args={[2.85, 3.55, 0.08]} />
      </mesh>
      <mesh renderOrder={1}>
        <planeGeometry args={MOMENTS_FRAME} />
        <meshBasicMaterial ref={picture} map={map} transparent toneMapped={false} />
      </mesh>
      <mesh
        position={[0, -1.4, 0.02]}
        material={MOMENTS_MAT.vignette}
        renderOrder={2}
      >
        <planeGeometry args={[2.62, 0.9]} />
      </mesh>
      {/* A two-level title holds up at room distance. The old single line used
          wide tracking inside a 0.2-high texture, so shrink-to-fit reduced the
          glyphs to a faint hairline against the dark vignette. */}
      <TextPlane
        text="MADE FOR"
        width={1.55}
        height={0.22}
        color={P.signText}
        fontScale={0.8}
        letterSpacing="0.18em"
        weight="600"
        position={[0, -1.18, 0.04]}
        renderOrder={3}
        materialRef={captionEyebrow}
      />
      <TextPlane
        text="MOMENTS"
        width={2.12}
        height={0.34}
        color={P.signText}
        fontScale={0.76}
        letterSpacing="0.1em"
        weight="600"
        position={[0, -1.5, 0.04]}
        renderOrder={3}
        materialRef={captionTitle}
      />
    </group>
  );
}

function MadeForMoments({ z }: { z: number }) {
  const portrait = useTexture(JEWELRY_IMAGES.emeraldGoddess.src, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });
  // The pair either side. Loaded together so the room never appears with one
  // side dressed and the other bare.
  const wings = useTexture(
    momentsPictures(),
    (tex) => {
      for (const t of Array.isArray(tex) ? tex : [tex]) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
      }
    }
  );
  const film = useAtelierFilm();

  return (
    <group position={[0, 0, z]}>
      {/* Three pictures on a runner, and nothing else.

          This zone used to be a room: two raked walls, a ceiling, and an arched
          panel across the back. All of it is gone. Between them they closed the
          view for the whole approach, and the one thing this zone has to say —
          that the journey is not over — could only be said through two archways
          the centrepiece itself half covered. With them gone the finale stands
          in the open behind this, lit, from the moment the zone starts.

          What is left reads as a set rather than a room: three glasses standing
          on the floor, angled in off the aisle. */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 2.78, -1.5, -6.2]} rotation={[0, s * -0.38, 0]}>
          <GroundShadow position={[0, 0.02, 0.14]} radius={1.05} stretch={0.4} />

          {/* The foot it stands on. A frame resting straight on stone reads as
              a board propped against nothing. */}
          <mesh position={[0, 0.055, 0.04]} material={MAT.marble}>
            <boxGeometry args={[MOMENTS_WING[0] + 0.3, 0.11, 0.46]} />
          </mesh>
          <mesh position={[0, 0.12, 0.04]} material={MAT.goldSoft}>
            <boxGeometry args={[MOMENTS_WING[0] + 0.34, 0.028, 0.5]} />
          </mesh>

          {/* Leaning back off its foot, the way a cheval glass stands. */}
          <group
            position={[0, 0.17 + MOMENTS_WING[1] / 2, 0]}
            rotation={[-0.055, 0, 0]}
          >
            <mesh position={[0, 0, -0.035]} material={MAT.gold}>
              <boxGeometry args={[MOMENTS_WING[0] + 0.16, MOMENTS_WING[1] + 0.16, 0.07]} />
            </mesh>
            <mesh position={[0, 0, 0.006]}>
              <planeGeometry args={MOMENTS_WING} />
              <meshBasicMaterial
                // The bright one to the left of the portrait and the dark one
                // to its right, not the other way round: the left is the side
                // the copy card sits against, and a near-black picture behind a
                // pale card is a hole in the frame.
                map={wings[s < 0 ? 0 : 1]}
                toneMapped={false}
              />
            </mesh>
            {/* The wash over it, thrown by the lamp on the arm above. Weaker
                than the app's usual pool and pulled up towards the lamp, so it
                falls off down the picture instead of sitting as a hot core in
                the middle of it. */}
            <mesh position={[0, 0.5, 0.03]} material={MAT.pictureWash} renderOrder={2}>
              <planeGeometry args={[2.4, 3.1]} />
            </mesh>

            {/* Picture light on its arm. */}
            <group position={[0, MOMENTS_WING[1] / 2 + 0.3, 0.16]}>
              <mesh
                position={[0, -0.17, -0.07]}
                rotation={[0.5, 0, 0]}
                material={MAT.goldSoft}
              >
                <cylinderGeometry args={[0.018, 0.03, 0.38, 8]} />
              </mesh>
              <mesh material={MAT.glow}>
                <sphereGeometry args={[0.07, 10, 8]} />
              </mesh>
            </group>
          </group>
        </group>
      ))}

      {/* A runner up to the plinth. The floor held the bottom third of the
          frame and had nothing in it but slabs — and a room whose subject is a
          single picture wants a line pointing at it. Velvet rather than the
          workshop's rug: that map has its border woven in, and stretched to a
          runner's proportions the border stretches with it. The gold is a
          slightly larger quad showing underneath, which is one draw call for an
          edge on all four sides. */}
      <mesh
        position={[0, -1.492, -3.72]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.goldSoft}
      >
        <planeGeometry args={[2.48, 7.68]} />
      </mesh>
      <mesh
        position={[0, -1.488, -3.72]}
        rotation={[-Math.PI / 2, 0, 0]}
        // Not the display velvet, which carries a sheen that catches right
        // across a plane this large at this raking an angle — and not the
        // oxblood leather either, which is where this started: the scene renders
        // about two and a half times its albedo, so a #6B2436 runner arrived on
        // screen as hot pink and took the eye clean off the portrait it is meant
        // to be pointing at. The panelling's own dark plum is the one tone in
        // the room that stays dark after that lift.
        material={MAT.emeraldDeep}
      >
        <planeGeometry args={[2.4, 7.6]} />
      </mesh>

      {/* Motes in the air over the runner. One GPU-animated point cloud, and
          already off on the tier that cannot afford it. */}
      {QUALITY.sparkles > 0 && (
        <Sparkles
          count={22}
          position={[0, 0.1, -3.8]}
          scale={[6.4, 3.2, 4.4]}
          size={2.4}
          speed={0.16}
          opacity={0.45}
          color={P.glow}
        />
      )}

      <MomentsCentrepiece map={film ?? portrait} />

      {/* The tapers either side of the aisle, and the petals scattered over the
          runner, were removed by request. The runner is bare on purpose. */}
    </group>
  );
}

/**
 * The finale's architecture.
 *
 * This is the one room in the journey allowed a wall across the back of it. The
 * rule against them exists so a room does not blank out the one behind it, and
 * nothing follows this one — so the closing scene is the only place the journey
 * can actually be closed. It had no wall, no ceiling and no horizon: two bare
 * panels and a rug adrift in cream, with the page background for a sky.
 *
 * An apse instead, on the axis, with the house mark over it. You came in
 * through an arch under that mark five rooms ago; you leave under another.
 */
const SANCTUM = {
  width: 15,
  height: 9.4,
  /** World y of the wall's centre — its top edge lands above the ceiling. */
  y: 1.4,
  z: -8.6,
  /** Half-width of the apse, which is also its depth and its arch radius. */
  half: 1.65,
  floorY: -1.5,
  headY: 3.0,
  ceilingY: 4.3,
} as const;

/** Where the arch springs. archedWallGeometry puts it at `headY - half`. */
const SANCTUM_SPRING = SANCTUM.headY - SANCTUM.half;
/** Back of the recess: the apse is as deep as it is wide. */
const SANCTUM_BACK = SANCTUM.z - SANCTUM.half;

const SANCTUM_GEO = archedWallGeometry(SANCTUM.width, SANCTUM.height, [
  {
    x: 0,
    // The sill runs below the floor, where the floor hides it, so the opening
    // reaches the ground without its hole touching the outline.
    bottom: SANCTUM.floorY - 0.3 - SANCTUM.y,
    top: SANCTUM.headY - SANCTUM.y,
    width: SANCTUM.half * 2,
  },
]);

/** Where the camera comes to rest, and what the room is composed for. */
const SANCTUM_PLINTH_Z = -6.6;

// Built once, like the room's other static props. All paper layers are in XY;
// the enclosing group lays them flat on the floor without intersecting it.
const LETTER_SHAPES = (() => {
  const rectangle = (w: number, h: number, r: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  };
  const border = rectangle(1.09, 0.65, 0.018);
  border.holes.push(new THREE.Path(rectangle(1.078, 0.638, 0.015).getPoints().reverse()));

  const flap = new THREE.Shape();
  flap.moveTo(-0.57, 0.34);
  flap.lineTo(0.57, 0.34);
  flap.lineTo(0.055, -0.055);
  flap.quadraticCurveTo(0, -0.098, -0.055, -0.055);
  flap.closePath();

  const folds = new THREE.Shape();
  folds.moveTo(-0.57, -0.35);
  folds.lineTo(0.57, -0.35);
  folds.lineTo(0, 0.065);
  folds.closePath();

  // A gently uneven edge gives the wax the character of a pressed seal.
  const wax = new THREE.Shape();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = 0.092 + Math.sin(a * 7) * 0.003 + Math.cos(a * 5) * 0.002;
    if (i === 0) wax.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else wax.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  wax.closePath();
  return { body: rectangle(1.18, 0.74, 0.025), border, flap, folds, wax };
})();

function KeepsakeLetter() {
  return (
    <group position={[1.66, -1.5, -4.3]} rotation={[0, -0.22, 0]}>
      {/* Above both runner layers (0.008 gold / 0.012 fabric), below the
          envelope's underside (0.019). Coplanar gold and shadow flicker. */}
      <GroundShadow position={[0, 0.017, 0]} radius={0.72} stretch={0.65} />
      <group position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <extrudeGeometry args={[LETTER_SHAPES.body, {
            depth: 0.014, bevelEnabled: true, bevelThickness: 0.003,
            bevelSize: 0.003, bevelSegments: 1, steps: 1, curveSegments: 8,
          }]} />
          <meshStandardMaterial color={P.paper} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0, 0.019]}>
          <shapeGeometry args={[LETTER_SHAPES.folds]} />
          <meshStandardMaterial color={P.silk} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0, 0.021]}>
          <shapeGeometry args={[LETTER_SHAPES.border]} />
          <meshStandardMaterial color={P.goldSoft} metalness={0.45} roughness={0.5} />
        </mesh>
        {/* A narrow crease under the flap gives it depth without coplanar faces. */}
        <mesh position={[0, -0.009, 0.023]}>
          <shapeGeometry args={[LETTER_SHAPES.flap]} />
          <meshStandardMaterial color={P.stoneWarm} roughness={1} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <shapeGeometry args={[LETTER_SHAPES.flap]} />
          <meshStandardMaterial color={P.paper} roughness={0.95} />
        </mesh>
        <group position={[0, -0.055, 0.03]}>
          <mesh>
            <extrudeGeometry args={[LETTER_SHAPES.wax, {
              depth: 0.012, bevelEnabled: true, bevelThickness: 0.004,
              bevelSize: 0.004, bevelSegments: 2, steps: 1,
            }]} />
            <meshStandardMaterial color={P.leather} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <torusGeometry args={[0.069, 0.003, 6, 32]} />
            <meshStandardMaterial color={P.gold} metalness={0.5} roughness={0.45} />
          </mesh>
          <CrestMark height={0.098} position={[0, 0, 0.02]} />
        </group>
      </group>
    </group>
  );
}

function YoursForever({ z }: { z: number }) {
  const lidRef = useRef<THREE.Group>(null);

  // Both files are already on the page — one is zone 05's own portrait, the
  // other hangs in the gallery — so the loader serves these from cache.
  const finaleSources = useTexture(finalePictures());
  const finale = useMemo(
    () => finaleSources.map(downscalePicture),
    [finaleSources]
  );
  useEffect(
    () => () => {
      for (const tex of finale) {
        if (tex instanceof THREE.CanvasTexture) tex.dispose();
      }
    },
    [finale]
  );

  useFrame(() => {
    if (!lidRef.current) return;
    const lidOpen = THREE.MathUtils.clamp((journeyProgress() - 0.84) / 0.05, 0, 1);
    lidRef.current.rotation.x = THREE.MathUtils.lerp(
      lidRef.current.rotation.x,
      THREE.MathUtils.lerp(1.35, -0.3, lidOpen),
      0.06
    );
  });

  return (
    <group position={[0, 0, z - 1.8]}>
      {/* Ceiling. Only ever seen on the approach — by the time the camera is at
          the plinth it is well outside the frame — but that approach was the
          stretch that read as walking into nothing. A gold beam on its leading
          edge, so it ends as a beam rather than as the place geometry stops. */}
      <mesh
        position={[0, SANCTUM.ceilingY, -5.6]}
        rotation={[Math.PI / 2, 0, 0]}
        material={MAT.emeraldDeep}
      >
        <planeGeometry args={[SANCTUM.width, 8.2]} />
      </mesh>
      <mesh position={[0, SANCTUM.ceilingY - 0.03, -1.5]} material={MAT.goldSoft}>
        <boxGeometry args={[SANCTUM.width, 0.07, 0.07]} />
      </mesh>
      {/* Two beams across it. On a phone the ceiling is the top fifth of the
          frame for the whole approach, and flat dark plum that size reads as a
          hole rather than as a roof. */}
      {[-3.4, -6.2].map((bz) => (
        <mesh
          key={bz}
          position={[0, SANCTUM.ceilingY - 0.06, bz]}
          material={MAT.emeraldDeep}
        >
          <boxGeometry args={[SANCTUM.width, 0.14, 0.26]} />
        </mesh>
      ))}

      {/* The apse recess, built before the wall that frames it: a back, two
          returns and a soffit, all facing the camera, so the opening reads as a
          niche with depth rather than a hole cut in a flat. */}
      <mesh position={[0, 0.6, SANCTUM_BACK]} material={MAT.emeraldDeep}>
        <planeGeometry args={[3.5, 5.2]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * (SANCTUM.half + 0.08), 0.6, SANCTUM.z - SANCTUM.half / 2]}
          material={MAT.emeraldWall}
        >
          <boxGeometry args={[0.16, 5.2, SANCTUM.half]} />
        </mesh>
      ))}
      <mesh
        position={[0, SANCTUM.headY + 0.08, SANCTUM.z - SANCTUM.half / 2]}
        material={MAT.emeraldWall}
      >
        <boxGeometry args={[3.5, 0.16, SANCTUM.half]} />
      </mesh>
      <mesh
        position={[0, SANCTUM.floorY + 0.03, SANCTUM.z - SANCTUM.half / 2]}
        material={MAT.marble}
      >
        <boxGeometry args={[3.46, 0.06, SANCTUM.half]} />
      </mesh>
      {/* The light in the niche. Additive, so it lifts the plum behind the box
          instead of painting over it — the box has to be read against this. */}
      <mesh
        position={[0, 0.1, SANCTUM_BACK + 0.06]}
        material={MAT.lightPool}
        renderOrder={2}
      >
        <planeGeometry args={[4.0, 4.6]} />
      </mesh>

      {/* A halo hung in the apse, over the box. The niche above the lid was two
          units of dark nothing and the last object of the journey had nothing
          behind it to be read against. A ring, because that is what is in the
          box — and the one shape the whole zone is named for. */}
      <group position={[0, 1.52, SANCTUM.z - 0.12]}>
        <mesh position={[0, 0, -0.04]} material={MAT.lightPool} renderOrder={2}>
          <planeGeometry args={[2.1, 2.1]} />
        </mesh>
        <mesh material={MAT.gold}>
          <torusGeometry args={[0.72, 0.02, 8, 44]} />
        </mesh>
      </group>

      {/* The wall itself. One mesh, one draw call, arch and all. */}
      <mesh
        position={[0, SANCTUM.y, SANCTUM.z]}
        geometry={SANCTUM_GEO}
        material={MAT.emeraldWall}
      />

      {/* Gold on the arch, and a skirting along the wall's foot — the two
          things that give a plain wall its scale. */}
      <group position={[0, 0, SANCTUM.z + 0.05]}>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[
              s * (SANCTUM.half + 0.04),
              (SANCTUM.floorY + SANCTUM_SPRING) / 2,
              0,
            ]}
            material={MAT.goldSoft}
          >
            <boxGeometry args={[0.05, SANCTUM_SPRING - SANCTUM.floorY, 0.05]} />
          </mesh>
        ))}
        <mesh position={[0, SANCTUM_SPRING, 0]} material={MAT.goldSoft}>
          <torusGeometry args={[SANCTUM.half + 0.04, 0.032, 6, 26, Math.PI]} />
        </mesh>
      </group>
      <mesh
        position={[0, SANCTUM.floorY + 0.22, SANCTUM.z + 0.09]}
        material={MAT.emeraldDeep}
      >
        <boxGeometry args={[SANCTUM.width, 0.44, 0.14]} />
      </mesh>
      <mesh
        position={[0, SANCTUM.floorY + 0.45, SANCTUM.z + 0.11]}
        material={MAT.goldSoft}
      >
        <boxGeometry args={[SANCTUM.width, 0.035, 0.035]} />
      </mesh>
      <mesh
        position={[0, SANCTUM.ceilingY - 0.17, SANCTUM.z + 0.02]}
        material={MAT.emeraldDeep}
      >
        <boxGeometry args={[SANCTUM.width, 0.34, 0.12]} />
      </mesh>

      {/* The house mark in the tympanum, on its own dark ground with a pool of
          light behind it — the same medallion that crowns the entrance sign,
          which is the whole point of putting it here. */}
      <group position={[0, 3.68, SANCTUM.z + 0.16]}>
        <mesh position={[0, 0, -0.03]} material={MAT.lightPool} renderOrder={2}>
          <planeGeometry args={[2.6, 2.6]} />
        </mesh>
        <CrestMedallion radius={0.56} markY={0.03} />
      </group>

      {/* The runner, carried through from Made for Moments — the same two
          quads, the same plum and gold, so the last two rooms read as one
          walk. It stops at the apse's sill. */}
      <mesh
        position={[0, -1.492, -4.05]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.goldSoft}
      >
        <planeGeometry args={[2.72, 9.5]} />
      </mesh>
      <mesh
        position={[0, -1.488, -4.05]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.emeraldDeep}
      >
        <planeGeometry args={[2.64, 9.42]} />
      </mesh>

      {/* The two closing photographs. They were bare dark rectangles with a
          picture stuck on each; they now carry the same skirting, picture rail
          and cornice the walls of Made for Moments do, and a light over each
          frame. Everything hangs off an inboard station rather than the panel's
          centre, because the copy card covers the outer half of the left panel
          for the whole zone. */}
      {[-1, 1].map((s, i) => (
        <group key={s} position={[s * 4.7, 0.9, -6.1]} rotation={[0, s * -0.62, 0]}>
          {/* 7.4 tall, not 6: at 6 the panel stopped below the ceiling and left
              a wedge of page background in each top corner of the frame. */}
          <mesh material={MAT.emeraldWall}>
            <planeGeometry args={[4.6, 7.4]} />
          </mesh>
          <mesh position={[0, -2.18, 0.05]} material={MAT.emeraldDeep}>
            <boxGeometry args={[4.6, 0.44, 0.1]} />
          </mesh>
          <mesh position={[0, -1.95, 0.07]} material={MAT.goldSoft}>
            <boxGeometry args={[4.6, 0.03, 0.03]} />
          </mesh>
          <mesh position={[0, 3.54, 0.09]} material={MAT.emeraldDeep}>
            <boxGeometry args={[4.6, 0.32, 0.18]} />
          </mesh>
          <mesh position={[0, 3.35, 0.12]} material={MAT.goldSoft}>
            <boxGeometry args={[4.6, 0.035, 0.035]} />
          </mesh>

          <group position={[-s * 0.75, -0.3, 0]}>
            {/* Picture light, and the pool it throws down the frame. */}
            <group position={[0, 2.1, 0.1]}>
              <mesh position={[0, -0.16, 0.02]} material={MAT.goldSoft}>
                <cylinderGeometry args={[0.02, 0.05, 0.3, 8]} />
              </mesh>
              <mesh position={[0, 0.02, 0.04]} material={MAT.glow}>
                <sphereGeometry args={[0.075, 10, 8]} />
              </mesh>
              <mesh position={[0, -0.6, 0.05]} material={MAT.lightPool} renderOrder={2}>
                <planeGeometry args={[3.0, 4.2]} />
              </mesh>
            </group>

            <group position={[0, 0.2, 0.03]}>
              <mesh material={MAT.gold}>
                <planeGeometry args={[2.78, 3.44]} />
              </mesh>
              <mesh position={[0, 0, 0.01]} material={MAT.paper}>
                <planeGeometry args={[2.62, 3.28]} />
              </mesh>
              <mesh position={[0, 0.06, 0.02]}>
                <planeGeometry args={[2.36, 2.95]} />
                <meshBasicMaterial map={finale[i]} toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>
      ))}

      {/* The shaft. A cone of lit air from the ceiling onto the box, and the
          pool it lands in — the gesture that says this is the end of the road
          rather than another display. */}
      <mesh
        position={[0, 0.9, SANCTUM_PLINTH_Z]}
        material={MAT.shaft}
        renderOrder={3}
      >
        <coneGeometry args={[1.15, 4.2, 22, 1, true]} />
      </mesh>
      <mesh
        position={[0, -1.485, SANCTUM_PLINTH_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.lightPool}
        renderOrder={2}
      >
        <planeGeometry args={[3.6, 3.6]} />
      </mesh>

      {/* Pedestal, on the axis inside the apse. */}
      <group position={[0, 0, SANCTUM_PLINTH_Z]}>
        <GroundShadow position={[0, -1.46, 0.12]} radius={1.15} stretch={0.9} />
        <mesh position={[0, -1.43, 0]} material={MAT.marble}>
          <cylinderGeometry args={[0.62, 0.74, 0.14, 28]} />
        </mesh>
        <mesh position={[0, -1.0, 0]} material={MAT.marble}>
          <cylinderGeometry args={[0.44, 0.54, 0.72, 28]} />
        </mesh>
        <mesh position={[0, -0.58, 0]} material={MAT.marble}>
          <cylinderGeometry args={[0.7, 0.54, 0.13, 28]} />
        </mesh>
        <mesh
          position={[0, -0.52, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={MAT.gold}
        >
          <torusGeometry args={[0.685, 0.018, 6, 30]} />
        </mesh>
      </group>

      {/* The box. Bigger than it was — it is the last object of the journey and
          it was a thumbnail on a column. */}
      <group position={[0, -0.28, SANCTUM_PLINTH_Z]} scale={1.28}>
        <GroundShadow position={[0, -0.205, 0.1]} radius={0.6} />
        <mesh material={MAT.velvet}>
          <boxGeometry args={[1.15, 0.42, 0.92]} />
        </mesh>
        <mesh position={[0, 0.22, 0]} material={MAT.gold}>
          <boxGeometry args={[1.18, 0.03, 0.95]} />
        </mesh>
        <mesh position={[0, 0.26, 0.06]} material={MAT.silk}>
          <boxGeometry args={[0.95, 0.12, 0.7]} />
        </mesh>
        <group position={[0, 0.5, 0.06]}>
          <LuxuryRing scale={0.22} />
        </group>

        <group ref={lidRef} position={[0, 0.24, -0.46]}>
          <group position={[0, 0.3, 0]}>
            <mesh material={MAT.velvet}>
              <boxGeometry args={[1.15, 0.62, 0.08]} />
            </mesh>
            <mesh position={[0, 0, 0.05]} material={MAT.emeraldDeep}>
              <boxGeometry args={[0.95, 0.44, 0.01]} />
            </mesh>
            <TextPlane
              text="GEETEJ VIRAASAT"
              width={0.9}
              height={0.16}
              color={P.signText}
              weight="700"
              position={[0, 0.02, 0.06]}
            />
          </group>
        </group>
      </group>

      {/* What the occasion left at the foot of it: the gift and the letter.
          Both used to be scattered across an empty white rug; they now sit
          along the runner's edges, where they frame the walk in instead of
          competing with it. The greenery, the blossom pieces on the floor, the
          tapers and the scattered petals that used to keep them company were
          all removed by request — the floor is bare on purpose. */}
      <group position={[-1.72, -1.16, -4.5]} rotation={[0, 0.45, 0]}>
        <GroundShadow position={[0, -0.33, 0.06]} radius={0.62} stretch={0.85} />
        <mesh material={MAT.silk}>
          <boxGeometry args={[0.75, 0.52, 0.75]} />
        </mesh>
        <mesh material={MAT.emerald}>
          <boxGeometry args={[0.16, 0.55, 0.78]} />
        </mesh>
        <mesh material={MAT.emerald}>
          <boxGeometry args={[0.78, 0.55, 0.16]} />
        </mesh>
        <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
          <torusGeometry args={[0.12, 0.035, 8, 20]} />
        </mesh>
      </group>

      <KeepsakeLetter />

      {/* Motes in the shaft. Already off on the tier that cannot afford them. */}
      {QUALITY.sparkles > 0 && (
        <Sparkles
          count={20}
          position={[0, 0.3, SANCTUM_PLINTH_Z + 0.2]}
          scale={[3.2, 3.4, 3.0]}
          size={2.2}
          speed={0.14}
          opacity={0.4}
          color={P.glow}
        />
      )}
    </group>
  );
}

/**
 * The name `ScenePrewarm` looks the story group up by, so it can compile the
 * rooms' shaders one at a time with a paint between rather than in one task
 * the loading bar cannot animate through. Nothing else depends on it — the
 * warm-up falls back to compiling the whole scene at once if it is not found.
 */
export const STORY_GROUP = "story-rooms";

export default function StorySection() {
  return (
    <group name={STORY_GROUP}>

      <pointLight position={[0, 3.0, 65]} intensity={13} distance={16} decay={2} color="#FFD9A0" />
      <pointLight position={[1.3, 0.7, 42.4]} intensity={9} distance={7} decay={2} color="#FFC98A" />
      <pointLight position={[0, 2.6, 31.5]} intensity={20} distance={14} decay={2} color="#FFE7C0" />
      {/* The apse. The finale had no light of its own — the closing shot of the
          whole journey was lit by the same hemisphere as the corridor. Finite
          distance, so it reaches the box and the wall behind it and nothing
          else; every light costs every material a lighting term. */}
      <pointLight position={[0, 1.4, 3.2]} intensity={16} distance={10} decay={2} color="#FFE0AE" />

      <GrandEntrance z={STORY_ROOM_Z[0]} />
      <TheBeginning z={STORY_ROOM_Z[1]} />
      <TheCraft z={STORY_ROOM_Z[2]} />
      <TheCollection z={STORY_ROOM_Z[3]} />
      <MadeForMoments z={STORY_ROOM_Z[4]} />
      <YoursForever z={STORY_ROOM_Z[5]} />
    </group>
  );
}
