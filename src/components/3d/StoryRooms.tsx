"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { JEWELRY_IMAGES } from "@/content/jewelry";
import { LuxuryRing } from "./RoomComponents";
import DoorLeaf from "./EntranceDoor";
import Mannequin, { MANNEQUIN_BASE_Y, setMannequinOpacity } from "./Mannequin";
import {
  leafMaps,
  plasterMaps,
  contactShadowMap,
  stoneSlabMaps,
  SLAB_TILE_W,
  SLAB_TILE_D,
} from "./procedural-textures";
import { isTouchDevice, quality } from "./quality";

export const STORY_ROOM_Z = [72, 60, 48, 36, 24, 12] as const;

export const GALLERY_FLOOR = [60, 300] as const;

const GOLD = "#C8A96A";
const EMERALD = "#0F4C3A";

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
    color: "#B08F52",
    metalness: 0.85,
    roughness: 0.42,
  }),
  emerald: new THREE.MeshPhysicalMaterial({
    color: EMERALD,
    roughness: 0.4,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
  }),
  emeraldDeep: new THREE.MeshStandardMaterial({ color: "#0A2B21", roughness: 0.65 }),
  /**
   * Gallery wall. The emerald surfaces were the only large planes in the app
   * with no maps at all — flat colour reads as paper next to the plaster the
   * stonework carries, which is most of why the collection room looked drawn
   * rather than built.
   */
  emeraldWall: new THREE.MeshStandardMaterial({
    color: "#14523E",
    roughness: 0.78,
    envMapIntensity: 0.5,
    ...plasterSurface(4, 0.75),
  }),
  velvet: new THREE.MeshPhysicalMaterial({
    color: "#0D4433",
    roughness: 0.95,
    sheen: 1,
    sheenColor: new THREE.Color("#2F7A5C"),
  }),
  stone: new THREE.MeshStandardMaterial({
    color: "#DCCFB6",
    roughness: 0.92,
    ...plasterSurface(2.5),
  }),
  stoneWarm: new THREE.MeshStandardMaterial({
    color: "#C9B896",
    roughness: 0.98,
    envMapIntensity: 0.45,
    ...plasterSurface(3, 1.6),
  }),
  stoneHall: new THREE.MeshStandardMaterial({
    color: "#BCA688",
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
    color: "#6E5F49",
    roughness: 1,
    envMapIntensity: 0.15,
  }),
  stoneVault: new THREE.MeshStandardMaterial({
    color: "#A8936E",
    roughness: 0.95,
    ...plasterSurface(3),
  }),
  branch: new THREE.MeshStandardMaterial({ color: "#5A4A33", roughness: 0.9 }),
  wood: new THREE.MeshStandardMaterial({ color: "#4A3222", roughness: 0.55 }),
  woodDark: new THREE.MeshStandardMaterial({ color: "#2E2118", roughness: 0.68 }),
  marble: new THREE.MeshPhysicalMaterial({
    color: "#EFE8DD",
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
    color: "#15805C",
    transmission: REFRACT ? 0.92 : 0,
    transparent: !REFRACT,
    opacity: REFRACT ? 1 : 0.72,
    roughness: 0.04,
    ior: 2.42,
    thickness: 0.35,
    flatShading: true,
    emissive: new THREE.Color("#15805C"),
    emissiveIntensity: REFRACT ? 0.16 : 0.34,
  }),
  gemPearl: new THREE.MeshPhysicalMaterial({
    color: "#F3E3C0",
    transmission: REFRACT ? 0.9 : 0,
    transparent: !REFRACT,
    opacity: REFRACT ? 1 : 0.75,
    roughness: 0.05,
    ior: 2.2,
    thickness: 0.3,
    flatShading: true,
    emissive: new THREE.Color("#B99A5E"),
    emissiveIntensity: REFRACT ? 0.14 : 0.3,
  }),
  blossom: new THREE.MeshStandardMaterial({ color: "#F7F1E4", roughness: 0.6 }),
  glow: new THREE.MeshBasicMaterial({ color: "#FFE6B8" }),
  glowSoft: new THREE.MeshBasicMaterial({
    color: "#FFD79A",
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  }),
  halo: new THREE.MeshBasicMaterial({
    color: "#FFDFA8",
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
  }),
  lantern: new THREE.MeshPhysicalMaterial({
    color: "#FFE9C4",
    transmission: 0.85,
    roughness: 0.25,
    thickness: 0.2,
    emissive: new THREE.Color("#FFCF8A"),
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.85,
  }),
  water: new THREE.MeshPhysicalMaterial({
    color: "#8FC7B4",
    roughness: 0.06,
    metalness: 0.1,
    transparent: true,
    opacity: 0.75,
  }),
  paper: new THREE.MeshStandardMaterial({
    color: "#F4EEDF",
    roughness: 0.88,
    side: THREE.DoubleSide,
  }),
  silk: new THREE.MeshPhysicalMaterial({
    color: "#F0E7D4",
    roughness: 0.55,
    sheen: 1,
    sheenColor: new THREE.Color("#FFF3DC"),
    side: THREE.DoubleSide,
  }),
  lampShade: new THREE.MeshStandardMaterial({
    color: "#C9A567",
    metalness: 0.75,
    roughness: 0.35,
    side: THREE.DoubleSide,
  }),
  wax: new THREE.MeshStandardMaterial({ color: "#7B2C2C", roughness: 0.5 }),
  planter: new THREE.MeshStandardMaterial({
    color: "#CFC8BA",
    roughness: 0.95,
    metalness: 0.0,
    envMapIntensity: 0.4,
    ...plasterSurface(3.2, 0.8),
  }),
  soil: new THREE.MeshStandardMaterial({ color: "#2A211A", roughness: 1 }),
  vignette: new THREE.MeshBasicMaterial({
    color: "#0A2B21",
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }),
  contact: new THREE.MeshBasicMaterial({
    color: "#3D3020",
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    alphaMap: contactShadowMap(),
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

function pageProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight || 1;
  return Math.min(Math.max(window.scrollY / max, 0), 1);
}

function TextPlane({
  text,
  width = 2,
  height = 0.5,
  color = GOLD,
  fontScale = 0.52,
  letterSpacing = "0.22em",
  position,
  rotation,
}: {
  text: string;
  width?: number;
  height?: number;
  color?: string;
  fontScale?: number;
  letterSpacing?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
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
      // GEETEJ VIRAASAT measures ~825px of glyphs, under the 1024 canvas, but
      // draws ~1125px once 0.22em of tracking is added to all 15 characters.
      // Both terms scale linearly with font size, so one pass lands exactly.
      const inset = W * 0.94;
      let size = Math.round(H * fontScale);
      ctx.font = `${size}px ${serif}, serif`;

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
        ctx.font = `${size}px ${serif}, serif`;
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
  }, [text, width, height, color, fontScale, letterSpacing]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
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
      <planeGeometry args={[radius * 2, radius * 2]} />
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

const LEAF_TINTS = ["#A8C495", "#7FA679", "#5C8460"].map((c) => new THREE.Color(c));
const LEAF_MAT = makeLeafMaterial("#FFFFFF");

export interface LeafInstance {
  p: [number, number, number];
  rot: [number, number, number];
  s: number;
  tint: number;
}

interface StemInstance {
  p: [number, number, number];
  rot: [number, number, number];
  len: number;
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
      _e.set(leaf.rot[0], leaf.rot[1], leaf.rot[2]);
      _q.setFromEuler(_e);
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
      _e.set(stem.rot[0], stem.rot[1], stem.rot[2]);
      _q.setFromEuler(_e);
      _v.set(stem.p[0], stem.p[1], stem.p[2]);
      _s.set(1, stem.len, 1);
      mesh.setMatrixAt(i, _m.compose(_v, _q, _s));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [stems]);

  if (stems.length === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, MAT.branch, stems.length]} />;
}

const FOLIAGE_STEM_GEO = new THREE.CylinderGeometry(0.008, 0.012, 1, 5);

function Foliage({
  position,
  count = 12,
  spread = [0.8, 1.0, 0.5],
  scale = 1,
  seed = 7,
  sway = 0.05,
  castShadow = false,
}: {
  position: [number, number, number];
  count?: number;
  spread?: [number, number, number];
  scale?: number;
  seed?: number;
  sway?: number;
  castShadow?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [sx, sy, sz] = spread;

  const { leaves, stems } = useMemo(() => {
    const r = rng(seed);
    const n = Math.max(3, Math.round(count * quality().foliage));
    const nextLeaves = Array.from({ length: n }, () => ({
      p: [(r() - 0.5) * sx * 2, (r() - 0.5) * sy * 2, (r() - 0.5) * sz * 2] as [
        number,
        number,
        number,
      ],
      rot: [r() * Math.PI, r() * Math.PI, r() * Math.PI] as [number, number, number],
      s: 0.7 + r() * 0.6,
      tint: Math.floor(r() * LEAF_TINTS.length),
    }));
    const nextStems = Array.from({ length: 2 }, () => ({
      p: [(r() - 0.5) * sx, (r() - 0.5) * sy * 0.7, (r() - 0.5) * sz] as [
        number,
        number,
        number,
      ],
      rot: [(r() - 0.5) * 0.5, (r() - 0.5) * 1.2, (r() - 0.5) * 0.5] as [
        number,
        number,
        number,
      ],
      len: Math.min(sy, 0.6) * (0.5 + r() * 0.45),
    }));
    return { leaves: nextLeaves, stems: nextStems };
  }, [count, seed, sx, sy, sz]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z =
      Math.sin(state.clock.getElapsedTime() * 0.5 + seed) * sway;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Stems stems={stems} geometry={FOLIAGE_STEM_GEO} />
      <LeafCloud leaves={leaves} castShadow={castShadow} />
    </group>
  );
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
  const leaves = useMemo(() => {
    const r = rng(seed);
    const out: LeafInstance[] = [];
    const n = Math.max(8, Math.round(count * quality().foliage));

    const HEIGHT = radius * 1.35;
    const envelope = (y: number) => {
      const t = THREE.MathUtils.clamp(y / HEIGHT, 0, 1);
      return radius * (0.62 + 0.38 * Math.sin(t * Math.PI)) * (1 - 0.45 * t * t);
    };

    const numClusters = 4;
    const clusters = [];
    for (let c = 0; c < numClusters; c++) {
      clusters.push({
        cx: (r() - 0.5) * radius * 0.36,
        cy: radius * (0.12 + r() * 0.62),
        cz: (r() - 0.5) * radius * 0.36,
        cr: radius * (0.34 + r() * 0.3),
      });
    }

    for (let i = 0; i < n; i++) {
      const cluster = clusters[Math.floor(r() * numClusters)];

      const phi = Math.acos(1 - r());
      const theta = r() * Math.PI * 2;
      const rr = cluster.cr * (0.3 + r() * 0.7);

      let x = cluster.cx + Math.sin(phi) * Math.cos(theta) * rr;
      const y = cluster.cy + Math.cos(phi) * rr;
      let z = cluster.cz + Math.sin(phi) * Math.sin(theta) * rr;

      const h = Math.hypot(x, z);
      const maxH = envelope(y);
      if (h > maxH) {
        const k = maxH / h;
        x *= k;
        z *= k;
      }

      const dx = x - cluster.cx;
      const dy = y - cluster.cy + 0.15;
      const dz = z - cluster.cz;

      out.push({
        p: [x, y, z],
        rot: [
          Math.atan2(Math.sqrt(dx * dx + dz * dz), dy) + (r() - 0.5) * 0.8,
          Math.atan2(dx, dz) + (r() - 0.5) * 0.8,
          (r() - 0.5) * 1.5,
        ],
        s: 0.7 + r() * 0.6,
        tint: Math.floor(r() * LEAF_TINTS.length),
      });
    }

    return out;
  }, [radius, count, seed]);

  return (
    <group position={position} scale={scale}>
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
  const nearDoor = useRef(true);

  useEffect(() => {
    const onScroll = () => {
      nearDoor.current = pageProgress() < 0.14;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (keyRef.current) keyRef.current.shadow.autoUpdate = false;
  }, []);

  useFrame(() => {
    if (keyRef.current && nearDoor.current) keyRef.current.shadow.needsUpdate = true;
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

const DOOR_SWING: readonly [number, number] = isTouchDevice()
  ? [0.57, 1.02]
  : [1.1, 1.95];

function GrandEntrance({ z }: { z: number }) {
  const leftHinge = useRef<THREE.Group>(null);
  const rightHinge = useRef<THREE.Group>(null);
  const openTarget = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      openTarget.current = Math.min(pageProgress() / 0.05, 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(() => {
    const angle = THREE.MathUtils.lerp(DOOR_SWING[0], DOOR_SWING[1], openTarget.current);
    if (leftHinge.current) {
      leftHinge.current.rotation.y = THREE.MathUtils.lerp(
        leftHinge.current.rotation.y,
        -angle,
        0.05
      );
    }
    if (rightHinge.current) {
      rightHinge.current.rotation.y = THREE.MathUtils.lerp(
        rightHinge.current.rotation.y,
        angle,
        0.05
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
              position={[s * (1.94 + band.w / 2), 0.5, band.z + band.d / 2]}
              material={MAT.stoneWarm}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[band.w, band.h, band.d]} />
            </mesh>
          ))
        )}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.95, 0.5, 0.5]} material={MAT.gold} castShadow>
            <boxGeometry args={[0.14, 4.16, 0.1]} />
          </mesh>
        ))}
        <mesh position={[0, -1.44, 0.32]} material={MAT.threshold} receiveShadow>
          <boxGeometry args={[4.0, 0.12, 0.7]} />
        </mesh>

        <group ref={leftHinge} position={[-1.8, 0, 0.2]}>
          <DoorLeaf side={1} />
        </group>
        <group ref={rightHinge} position={[1.8, 0, 0.2]}>
          <DoorLeaf side={-1} />
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
          <mesh material={MAT.emerald}>
            <boxGeometry args={[2.7, 0.9, 0.07]} />
          </mesh>
          <TextPlane text="GEETEJ" width={2.1} height={0.4} position={[0, 0.11, 0.04]} />
          <TextPlane
            text="VIRAASAT"
            width={1.5}
            height={0.19}
            color="#9DBBA6"
            fontScale={0.6}
            letterSpacing="0.5em"
            position={[0, -0.21, 0.04]}
          />
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
          <TextPlane
            text="GEETEJ VIRAASAT"
            width={1.72}
            height={0.3}
            position={[0, 0.06, 0.07]}
          />
          <TextPlane
            text="EST. 2020"
            width={0.85}
            height={0.16}
            color="#9DBBA6"
            fontScale={0.62}
            letterSpacing="0.4em"
            position={[0, -0.26, 0.07]}
          />
          <mesh position={[0, 0.44, 0.07]} scale={[0.5, 1, 0.5]} material={MAT.gold}>
            <sphereGeometry args={[0.13, 8, 6]} />
          </mesh>
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

  useFrame((state) => {
    if (!lampGlowRef.current) return;
    const m = lampGlowRef.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.75 + Math.sin(state.clock.getElapsedTime() * 2.3) * 0.06;
  });

  return (
    <group position={[0, 0, z]}>
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
        {/* Ledge dressing. Two vessels adrift on a four-unit shelf read as
            leftovers; spaced along it with a parts tray between them, the
            ledge reads as where the bench keeps its things. Kept clear of
            x < -1.0, which the drawing board stands in front of. */}
        <mesh position={[0.62, 0.155, BENCH.ledgeZ]} material={MAT.goldSoft}>
          <cylinderGeometry args={[0.11, 0.13, 0.19, 12]} />
        </mesh>
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
        <mesh position={[1.2, 0.125, BENCH.ledgeZ]} material={MAT.marble}>
          <cylinderGeometry args={[0.085, 0.095, 0.13, 12]} />
        </mesh>

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

        {/* Design propped on a drawing board rather than flat: a sheet lying on
            the top is a white sliver from here. */}
        <group position={[-1.3, 0.125, BENCH.standZ]} rotation={[-0.3, 0.2, 0]}>
          <mesh material={MAT.woodDark}>
            <boxGeometry args={[0.92, 0.68, 0.025]} />
          </mesh>
          <mesh position={[0, 0.02, 0.016]} material={MAT.paper}>
            <planeGeometry args={[0.8, 0.58]} />
          </mesh>
          <mesh position={[0, 0.03, 0.022]} material={MAT.goldSoft}>
            <torusGeometry args={[0.17, 0.005, 5, 24, Math.PI * 1.35]} />
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
        <group position={[-2.05, 0.13, BENCH.standZ]} rotation={[0, 0.35, 0]}>
          <mesh material={MAT.gold}>
            <torusGeometry args={[0.17, 0.022, 8, 24]} />
          </mesh>
          <mesh material={MAT.glass}>
            <circleGeometry args={[0.16, 20]} />
          </mesh>
          <mesh position={[0, -0.25, 0]} material={MAT.woodDark}>
            <cylinderGeometry args={[0.022, 0.032, 0.17, 8]} />
          </mesh>
        </group>

        {/* On the ledge, not the top — down there it was a white blob at the
            back of an unlit surface. */}
        <mesh position={[-0.55, 0.21, BENCH.ledgeZ]} material={MAT.marble}>
          <cylinderGeometry args={[0.14, 0.16, 0.3, 14]} />
        </mesh>

        {/* The base used to be half-sunk in the top; it now stands on it. Also
            pulled forward of z = -0.58: at -0.6 the post rose straight through
            the ledge shelf and its gold rail. */}
        <group position={[1.62, -0.17, -0.28]}>
          <mesh material={MAT.goldSoft}>
            <cylinderGeometry args={[0.18, 0.2, 0.06, 16]} />
          </mesh>
          <mesh position={[0, 0.55, 0]} material={MAT.goldSoft}>
            <cylinderGeometry args={[0.022, 0.022, 1.1, 8]} />
          </mesh>
          <group position={[-0.28, 1.08, 0.05]} rotation={[0.35, 0, 0.5]}>
            <mesh material={MAT.lampShade}>
              <cylinderGeometry args={[0.34, 0.16, 0.26, 20, 1, true]} />
            </mesh>
            <mesh ref={lampGlowRef} position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.32, 20]} />
              <meshBasicMaterial color="#FFE0A8" transparent opacity={0.8} />
            </mesh>
          </group>
        </group>
      </group>

      <group position={[0, 0.7, -7.2]}>
        <mesh material={MAT.woodDark}>
          <planeGeometry args={[5, 3]} />
        </mesh>
        <mesh position={[0, 0.55, 0.04]} material={MAT.goldSoft}>
          <boxGeometry args={[3.2, 0.07, 0.07]} />
        </mesh>
        {[-1.3, -0.75, -0.2, 0.35, 0.9, 1.45].map((tx, i) => (
          <mesh key={tx} position={[tx, 0.25, 0.06]} material={MAT.goldSoft}>
            <cylinderGeometry args={[0.018, 0.014, 0.5 + (i % 3) * 0.12, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DisplayNiche({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
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
      <NecklaceBust position={[0, -0.35, -0.02]} scale={0.62} />
    </group>
  );
}

function TheCollection({ z }: { z: number }) {
  const carouselRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!carouselRef.current) return;
    carouselRef.current.rotation.y = state.clock.getElapsedTime() * 0.18;
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
          {nicheZ.map((nz) => (
            <DisplayNiche
              key={nz}
              position={[s * 2.92, 0.35, nz]}
              rotation={[0, (s * -Math.PI) / 2, 0]}
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

      <group position={[0, 2.5, -6.9]}>
        <mesh material={MAT.emeraldDeep}>
          <boxGeometry args={[2.8, 0.42, 0.06]} />
        </mesh>
        <TextPlane
          text="THE COLLECTION"
          width={2.5}
          height={0.28}
          fontScale={0.55}
          position={[0, 0, 0.04]}
        />
      </group>

      <group position={[0, 0, -5]}>
        <GroundShadow position={[0, -1.47, 0]} radius={1.7} />
        {/* Marble, not the brown wood it was: a chocolate drum was the one
            warm mass in a room of emerald, gold and stone, and it read as
            furniture borrowed from another set. */}
        <mesh position={[0, -1.0, 0]} material={MAT.marble}>
          <cylinderGeometry args={[1.45, 1.55, 1.0, 32]} />
        </mesh>
        <mesh position={[0, -1.46, 0]} material={MAT.emeraldDeep}>
          <cylinderGeometry args={[1.62, 1.62, 0.09, 32]} />
        </mesh>
        <mesh position={[0, -0.48, 0]} material={MAT.velvet}>
          <cylinderGeometry args={[1.5, 1.5, 0.08, 32]} />
        </mesh>
        <mesh position={[0, -0.44, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
          <torusGeometry args={[1.48, 0.04, 8, 40]} />
        </mesh>

        <group ref={carouselRef} position={[0, -0.3, 0]}>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <group key={i} position={[Math.cos(a) * 0.85, 0, Math.sin(a) * 0.85]}>
                <mesh position={[0, -0.04, 0]} material={MAT.marble}>
                  <cylinderGeometry args={[0.16, 0.18, 0.06, 16]} />
                </mesh>
                <mesh position={[0, 0.11, 0]} material={MAT.gold}>
                  <torusGeometry args={[0.1, 0.024, 10, 24]} />
                </mesh>
                <mesh
                  position={[0, 0.23, 0]}
                  material={i % 2 === 0 ? MAT.gemGreen : MAT.gemPearl}
                >
                  <octahedronGeometry args={[0.05, 0]} />
                </mesh>
              </group>
            );
          })}
        </group>
        {/* Vitrine. This was a hemisphere squashed to 0.55 — a soap bubble over
            the rings, and on the mid and low tiers, where transmission is off,
            just a grey film across them. A straight glass cylinder with a
            brass collar top and bottom reads as a case instead. */}
        <mesh position={[0, 0.135, 0]} material={MAT.glass}>
          <cylinderGeometry args={[1.2, 1.2, 1.15, 28, 1, true]} />
        </mesh>
        <mesh position={[0, 0.745, 0]} material={MAT.gold}>
          <cylinderGeometry args={[1.24, 1.24, 0.07, 28]} />
        </mesh>
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
          <torusGeometry args={[1.21, 0.03, 6, 32]} />
        </mesh>
      </group>
    </group>
  );
}

function MadeForMoments({ z }: { z: number }) {
  const bokehRef = useRef<THREE.Group>(null);

  const portrait = useTexture(JEWELRY_IMAGES.emeraldGoddess.src, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });

  const bokeh = useMemo(() => {
    const r = rng(211);
    // Held behind the portrait and up in the air. These used to run from
    // z = +2 back to -7 across the full width and down to floor level, with
    // radii up to 0.4 — so the camera flew straight through them and they
    // read as pale smears over the walls, the floor and the frame itself
    // rather than as lights behind the scene. Twenty-two of them, too.
    return Array.from({ length: 12 }, () => ({
      p: [(r() - 0.5) * 8, 0.5 + r() * 2.5, -6.4 - r() * 2.8] as [number, number, number],
      s: 0.08 + r() * 0.16,
      o: 0.25 + r() * 0.3,
      phase: r() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!bokehRef.current) return;
    const t = state.clock.getElapsedTime();
    bokehRef.current.children.forEach((child, i) => {
      child.position.y = bokeh[i].p[1] + Math.sin(t * 0.35 + bokeh[i].phase) * 0.18;
    });
  });

  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 4.2, 0.8, -4.2]}
          rotation={[0, s * -0.45, 0]}
          material={MAT.emeraldDeep}
        >
          <planeGeometry args={[5, 6.5]} />
        </mesh>
      ))}

      {/* Backing panel. The angled walls stop at x = ±1.95 while the portrait
          is 2.85 wide, so a bright cream void showed either side of the frame —
          the page background straight through the room. Widening the walls
          cannot close it: they rake forward as they run inward, so any length
          that reaches the centre also passes in front of the artwork and
          swallows it. A flat panel behind the frame closes both voids and
          leaves the gold edge proud. */}
      <mesh position={[0.15, 0.9, -5.75]} material={MAT.emeraldDeep}>
        <planeGeometry args={[5.4, 6.4]} />
      </mesh>

      <group position={[0.15, 0.5, -5.5]}>
        {/* Plinth. The frame's bottom edge is at y = -1.275 and the floor is
            at -1.5, so it stood a fifth of a unit clear of the ground. */}
        <mesh position={[0, -1.39, 0.02]} material={MAT.marble}>
          <boxGeometry args={[3.1, 0.23, 0.52]} />
        </mesh>
        <mesh position={[0, 0, -0.05]} material={MAT.gold}>
          <boxGeometry args={[2.85, 3.55, 0.08]} />
        </mesh>
        <mesh>
          <planeGeometry args={[2.62, 3.3]} />
          <meshBasicMaterial map={portrait} toneMapped={false} />
        </mesh>
        <mesh position={[0, -1.4, 0.02]} material={MAT.vignette}>
          <planeGeometry args={[2.62, 0.9]} />
        </mesh>
        <TextPlane
          text="MADE FOR MOMENTS"
          width={2.0}
          height={0.2}
          fontScale={0.6}
          letterSpacing="0.35em"
          position={[0, -1.45, 0.04]}
        />
      </group>

      {/* Candles. They stood at four unrelated x positions, all pinned to
          y = -1.2 while their heights ran 0.55 to 0.85 — so the tall ones sank
          through the floor at -1.5 and the short ones hovered above it. Now
          two matched pairs flanking the portrait, each graded tall-then-short
          and seated on the floor by its own height. */}
      {[-1, 1].map((s) =>
        [0, 1].map((i) => {
          const h = 0.8 - i * 0.22;
          return (
            <group
              key={`${s}:${i}`}
              position={[s * (2.0 + i * 0.42), -1.5 + h / 2, -3.45 - i * 0.35]}
            >
              <mesh material={MAT.blossom}>
                <cylinderGeometry args={[0.07, 0.08, h, 12]} />
              </mesh>
              <mesh position={[0, h / 2 + 0.06, 0]} material={MAT.glow}>
                <sphereGeometry args={[0.05, 8, 6]} />
              </mesh>
            </group>
          );
        })
      )}

      <group ref={bokehRef}>
        {bokeh.map((b, i) => (
          <mesh key={i} position={b.p}>
            <sphereGeometry args={[b.s, 10, 8]} />
            <meshBasicMaterial
              color="#FFD79A"
              transparent
              opacity={b.o}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function YoursForever({ z }: { z: number }) {
  const lidRef = useRef<THREE.Group>(null);
  const lidOpen = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      lidOpen.current = THREE.MathUtils.clamp((pageProgress() - 0.84) / 0.05, 0, 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(() => {
    if (!lidRef.current) return;
    lidRef.current.rotation.x = THREE.MathUtils.lerp(
      lidRef.current.rotation.x,
      THREE.MathUtils.lerp(1.35, -0.3, lidOpen.current),
      0.06
    );
  });

  return (
    <group position={[0, 0, z - 1.8]}>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 4.0, 0.6, -3.4]}
          rotation={[0, s * -0.5, 0]}
          material={MAT.emeraldDeep}
        >
          <planeGeometry args={[4.5, 6]} />
        </mesh>
      ))}

      <mesh
        position={[0, -1.44, -3]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.silk}
      >
        <planeGeometry args={[6.5, 7]} />
      </mesh>
      {[-2.6, -1.4, 1.5, 2.7].map((x, i) => (
        <mesh
          key={x}
          position={[x, -1.4, -3 + (i % 2) * 1.2]}
          rotation={[0, (i - 1.5) * 0.35, 0]}
          material={MAT.silk}
        >
          <boxGeometry args={[0.5, 0.08, 3.4]} />
        </mesh>
      ))}

      <group position={[0, -1.1, -3.6]}>
        <GroundShadow position={[0, -0.33, 0.15]} radius={0.95} />
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
            <TextPlane text="GEETEJ VIRAASAT" width={0.9} height={0.16} position={[0, 0.02, 0.06]} />
          </group>
        </group>
      </group>

      <group position={[1.5, -1.08, -3.1]} rotation={[-0.5, -0.35, 0.06]}>
        <mesh material={MAT.paper}>
          <planeGeometry args={[1.1, 0.82]} />
        </mesh>
        <mesh position={[0, 0, 0.004]} material={MAT.goldSoft}>
          <ringGeometry args={[0.44, 0.455, 4, 1]} />
        </mesh>
        <mesh position={[0, -0.02, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={MAT.wax}>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 16]} />
        </mesh>
        <mesh position={[0, -0.02, 0.04]} material={MAT.gold}>
          <torusGeometry args={[0.06, 0.008, 6, 18]} />
        </mesh>
      </group>

      <Foliage position={[-1.8, -1.34, -3.2]} seed={181} count={26} spread={[0.55, 0.12, 0.5]} scale={1.1} />
      {[
        [-1.55, -1.3, -2.95],
        [-2.05, -1.28, -3.35],
        [-1.35, -1.32, -3.5],
        [-2.3, -1.31, -2.9],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh material={MAT.blossom}>
            <sphereGeometry args={[0.11, 10, 8]} />
          </mesh>
          <mesh position={[0, 0.02, 0]} material={MAT.gold}>
            <sphereGeometry args={[0.035, 8, 6]} />
          </mesh>
        </group>
      ))}

      <group position={[-2.3, -1.15, -1.9]} rotation={[0, 0.4, 0]}>
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

      <mesh position={[0, -0.6, -5.6]}>
        <circleGeometry args={[2.6, 28]} />
        <meshBasicMaterial color="#FFE3B2" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function StorySection() {
  return (
    <group>

      <pointLight position={[0, 3.0, 65]} intensity={13} distance={16} decay={2} color="#FFD9A0" />
      <pointLight position={[1.3, 0.7, 42.4]} intensity={9} distance={7} decay={2} color="#FFC98A" />
      <pointLight position={[0, 2.6, 31.5]} intensity={20} distance={14} decay={2} color="#FFE7C0" />

      <GrandEntrance z={STORY_ROOM_Z[0]} />
      <TheBeginning z={STORY_ROOM_Z[1]} />
      <TheCraft z={STORY_ROOM_Z[2]} />
      <TheCollection z={STORY_ROOM_Z[3]} />
      <MadeForMoments z={STORY_ROOM_Z[4]} />
      <YoursForever z={STORY_ROOM_Z[5]} />
    </group>
  );
}
