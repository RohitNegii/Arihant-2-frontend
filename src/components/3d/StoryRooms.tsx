"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { JEWELRY_IMAGES } from "@/content/jewelry";
import { LuxuryRing } from "./RoomComponents";
import DoorLeaf from "./EntranceDoor";
import { leafMaps, plasterMaps } from "./procedural-textures";

/** Z centre of each story room, front (first seen) to back. */
export const STORY_ROOM_Z = [72, 60, 48, 36, 24, 12] as const;

const GOLD = "#C8A96A";
const EMERALD = "#0F4C3A";

/**
 * Plaster normal + roughness at a given tiling density. Each surface gets its
 * own texture clones so a 12m wall and a 3m pier can share one canvas without
 * sharing a tile size — the clones reuse the same uploaded image.
 */
function plasterSurface(repeat: number) {
  const maps = plasterMaps();
  if (!maps) return {};
  const normalMap = maps.normalMap.clone();
  const roughnessMap = maps.roughnessMap.clone();
  for (const tex of [normalMap, roughnessMap]) {
    tex.repeat.set(repeat, repeat);
    tex.needsUpdate = true;
  }
  return {
    normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughnessMap,
  };
}

// Shared materials, passed to meshes via the `material` prop. Building a new
// material per mesh in a scene this dense is what turns a 60fps walk into a
// 30fps one — and unlike <primitive>, `material={...}` is safe to reuse.
const MAT = {
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
    roughness: 0.95,
    ...plasterSurface(4),
  }),
  // Interiors are deliberately darker than the facade stone — against the
  // cream fog, mid-tone walls are what give the rooms any depth at all
  stoneHall: new THREE.MeshStandardMaterial({
    color: "#BCA688",
    roughness: 0.95,
    ...plasterSurface(3),
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
    transmission: 0.95,
    roughness: 0.02,
    thickness: 0.35,
    transparent: true,
    opacity: 0.45,
  }),
  gemGreen: new THREE.MeshPhysicalMaterial({
    color: "#15805C",
    transmission: 0.92,
    roughness: 0.04,
    ior: 2.42,
    thickness: 0.35,
    flatShading: true,
    emissive: new THREE.Color("#15805C"),
    emissiveIntensity: 0.16,
  }),
  gemPearl: new THREE.MeshPhysicalMaterial({
    color: "#F3E3C0",
    transmission: 0.9,
    roughness: 0.05,
    ior: 2.2,
    thickness: 0.3,
    flatShading: true,
    emissive: new THREE.Color("#B99A5E"),
    emissiveIntensity: 0.14,
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
  vignette: new THREE.MeshBasicMaterial({
    color: "#0A2B21",
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }),
  contact: new THREE.MeshBasicMaterial({
    color: "#7A6647",
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  }),
};

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

/** Deterministic PRNG so foliage scatter is identical on every render. */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** Normalized page scroll, 0 → 1 — the same value the camera is driven by. */
function pageProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight || 1;
  return Math.min(Math.max(window.scrollY / max, 0), 1);
}

/**
 * In-world text baked to a canvas texture using the page's own serif
 * (`--font-secondary`). Cheaper than drei's <Html> — no DOM node per label —
 * and it stays fogged and lit along with the rest of the scene.
 */
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
      ctx.font = `${Math.round(H * fontScale)}px ${serif}, serif`;
      // Not in every TS DOM lib yet, but supported by every browser that can
      // run WebGL2 here; harmless where it is missing
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
        letterSpacing;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, W / 2, H / 2);
    };

    draw();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    // The webfont may still be loading on first paint — repaint once it lands
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

/**
 * Painted contact shadow. The two shadow-casting lights in the scene only
 * cover the original rooms near the origin, so story-room objects get a soft
 * disc underneath instead of a real shadow map (an extra render pass each).
 */
function GroundShadow({
  position,
  radius = 1,
}: {
  position: [number, number, number];
  radius?: number;
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} material={MAT.contact}>
      <circleGeometry args={[radius, 24]} />
    </mesh>
  );
}

/**
 * A real leaf: a slightly cupped plane with the blade cut out by an alpha map.
 * `alphaTest` rather than `transparent` keeps it in the opaque pass, so a few
 * hundred leaves need no depth sorting and still cast correct shadows.
 */
const LEAF_GEO = (() => {
  const geo = new THREE.PlaneGeometry(0.15, 0.25, 2, 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Cup across the midrib and droop toward the tip
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
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.62,
    metalness: 0,
  });
}

const LEAF_MATS = [makeLeafMaterial("#8FA981"), makeLeafMaterial("#5E8560")];

/** Scattered foliage — the greenery framing the entrance and the garden. */
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
    const nextLeaves = Array.from({ length: count }, () => ({
      p: [(r() - 0.5) * sx * 2, (r() - 0.5) * sy * 2, (r() - 0.5) * sz * 2] as [
        number,
        number,
        number,
      ],
      rot: [r() * Math.PI, r() * Math.PI, r() * Math.PI] as [number, number, number],
      s: 0.7 + r() * 0.6,
      dark: r() > 0.5,
    }));
    // Short woody stems threaded through the cluster — without them the
    // leaves read as debris floating in mid-air, but anything longer than the
    // cluster itself reads as scaffolding poles
    const nextStems = Array.from({ length: 2 }, () => ({
      p: [(r() - 0.5) * sx, (r() - 0.5) * sy * 0.7, (r() - 0.5) * sz] as [
        number,
        number,
        number,
      ],
      // Mostly upright — a stem lying across the view looks like a stick
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
      {stems.map((stem, i) => (
        <mesh
          key={`s${i}`}
          position={stem.p}
          rotation={stem.rot}
          material={MAT.branch}
        >
          <cylinderGeometry args={[0.008, 0.012, stem.len, 5]} />
        </mesh>
      ))}
      {leaves.map((leaf, i) => (
        <mesh
          key={i}
          geometry={LEAF_GEO}
          position={leaf.p}
          rotation={leaf.rot}
          scale={leaf.s}
          material={leaf.dark ? LEAF_MATS[1] : LEAF_MATS[0]}
          castShadow={castShadow}
        />
      ))}
    </group>
  );
}

/** Necklace bust — used in the entrance vitrine and the collection niches. */
function NecklaceBust({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Velvet, not marble — a cream bust against cream walls disappears */}
      <mesh material={MAT.velvet}>
        <cylinderGeometry args={[0.19, 0.34, 0.6, 20]} />
      </mesh>
      {/* Shoulders */}
      <mesh position={[0, 0.28, 0]} scale={[1, 0.45, 0.8]} material={MAT.velvet}>
        <sphereGeometry args={[0.22, 16, 12]} />
      </mesh>
      <mesh position={[0, 0.44, 0]} material={MAT.velvet}>
        <cylinderGeometry args={[0.085, 0.12, 0.26, 16]} />
      </mesh>
      {/* Chain draped across the chest */}
      <mesh position={[0, 0.26, 0.03]} rotation={[0.35, 0, 0]} material={MAT.gold}>
        <torusGeometry args={[0.19, 0.018, 8, 32]} />
      </mesh>
      {/* Pendant stone */}
      <mesh position={[0, 0.09, 0.15]} material={MAT.gemGreen}>
        <octahedronGeometry args={[0.07, 0]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* STORY 1 — GRAND ENTRANCE (Z = 72)                                   */
/* Emerald double doors swinging open onto a chandelier-lit hall.      */
/* ------------------------------------------------------------------ */

/** Tiered gold chandelier with candle glows. */
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
      {/* Suspension rod */}
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

      {/* Warm halo so the fixture reads as the light source */}
      <mesh position={[0, 0.1, 0]} material={MAT.halo}>
        <sphereGeometry args={[0.9, 12, 10]} />
      </mesh>
    </group>
  );
}

/**
 * Key + fill for the doorway. Both lights are distance-limited so they die out
 * long before the other rooms, and the key's shadow map is driven manually:
 * toggling `castShadow` would change the shader program and recompile every
 * material mid-scroll, whereas pausing `autoUpdate` just skips the extra
 * render pass once the visitor is inside.
 */
function EntranceLight() {
  const keyRef = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const nearDoor = useRef(true);

  useEffect(() => {
    const onScroll = () => {
      nearDoor.current = pageProgress() < 0.09;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (keyRef.current) keyRef.current.shadow.autoUpdate = false;
  }, []);

  useFrame(() => {
    // Doors swing while we are here, so the map has to be redrawn each frame
    if (keyRef.current && nearDoor.current) keyRef.current.shadow.needsUpdate = true;
  });

  return (
    <>
      {/* Local to the room group, which already sits at Z = 72 — these were
          world coordinates once, which put both lights 80 units downrange */}
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
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.035}
        shadow-camera-near={3}
        shadow-camera-far={32}
      />
      {/* Cool sky bounce from the opposite side — keeps the shaded half of the
          mouldings from going dead flat */}
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

function GrandEntrance({ z }: { z: number }) {
  const leftHinge = useRef<THREE.Group>(null);
  const rightHinge = useRef<THREE.Group>(null);
  const openTarget = useRef(0);

  // Doors start ajar and swing wide as the visitor begins scrolling in
  useEffect(() => {
    const onScroll = () => {
      openTarget.current = Math.min(pageProgress() / 0.02, 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(() => {
    const angle = THREE.MathUtils.lerp(1.1, 1.95, openTarget.current);
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

      {/* ---- Facade wall with the arched portal ---- */}
      <group position={[0, 0, -2]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 4.9, 1.75, 0]} material={MAT.stoneWarm} receiveShadow>
            <boxGeometry args={[6.2, 6.5, 0.5]} />
          </mesh>
        ))}
        {/* Tympanum above the doors */}
        <mesh position={[0, 3.75, 0]} material={MAT.stoneWarm} receiveShadow>
          <boxGeometry args={[3.6, 2.5, 0.5]} />
        </mesh>
        {/* Glowing fanlight with a gold arch trim */}
        <mesh position={[0, 2.55, 0.27]} material={MAT.glow}>
          <circleGeometry args={[1.35, 24, 0, Math.PI]} />
        </mesh>
        <mesh position={[0, 2.55, 0.3]} material={MAT.gold}>
          <torusGeometry args={[1.4, 0.05, 8, 28, Math.PI]} />
        </mesh>

        {/* Moulded stone architrave around the opening: three stepped bands,
            which is what casts the stacked shadow lines of a real casing */}
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
        {/* Gilded jamb pilasters */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.95, 0.5, 0.5]} material={MAT.gold} castShadow>
            <boxGeometry args={[0.14, 4.16, 0.1]} />
          </mesh>
        ))}
        {/* Threshold saddle under the doors */}
        <mesh position={[0, -1.44, 0.32]} material={MAT.stoneWarm} receiveShadow>
          <boxGeometry args={[4.0, 0.12, 0.7]} />
        </mesh>

        {/* ---- The doors ---- */}
        <group ref={leftHinge} position={[-1.8, 0, 0.2]}>
          <DoorLeaf side={1} />
        </group>
        <group ref={rightHinge} position={[1.8, 0, 0.2]}>
          <DoorLeaf side={-1} />
        </group>
      </group>

      {/* ---- Climbing greenery framing the doorway ---- */}
      {/* Kept out beyond the door jambs — greenery drifting across the
          doorway itself reads as debris, not planting */}
      <Foliage castShadow position={[-3.5, 1.7, -1.65]} seed={11} count={34} spread={[0.55, 1.7, 0.3]} scale={1.15} />
      <Foliage castShadow position={[-4.4, -0.5, -1.5]} seed={23} count={34} spread={[0.8, 1.1, 0.45]} scale={1.3} />
      <Foliage castShadow position={[3.6, 1.5, -1.65]} seed={31} count={34} spread={[0.55, 1.8, 0.3]} scale={1.15} />
      <Foliage castShadow position={[4.5, -0.6, -1.5]} seed={43} count={34} spread={[0.8, 1.1, 0.45]} scale={1.35} />
      <Foliage castShadow position={[-2.6, 4.4, -1.6]} seed={57} count={22} spread={[0.9, 0.3, 0.25]} scale={0.9} />
      <Foliage castShadow position={[2.7, 4.5, -1.6]} seed={67} count={22} spread={[0.9, 0.3, 0.25]} scale={0.9} />

      {/* Blossom accents in the bushes */}
      {[
        [4.0, -0.2, -1.2],
        [4.7, -0.8, -1.3],
        [4.2, -1.1, -1.1],
        [-4.2, -0.9, -1.2],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} material={MAT.blossom}>
          <sphereGeometry args={[0.07, 8, 6]} />
        </mesh>
      ))}

      {/* ---- Hall interior beyond the doors ----
           Every room is open along Z: an opaque back wall here would hide the
           whole next room from the visitor walking toward it */}
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
        {/* Vault ribs */}
        {[2.6, 0, -2.6].map((rz) => (
          <mesh key={rz} position={[0, 2.2, rz]} material={MAT.stoneVault}>
            <torusGeometry args={[3.3, 0.1, 6, 24, Math.PI]} />
          </mesh>
        ))}

        {/* Wall sconces */}
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

        {/* Suspended brand sign hanging over the vitrine */}
        <group position={[0, 2.5, -2.5]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 1.1, 0.75, 0]} material={MAT.gold}>
              <cylinderGeometry args={[0.012, 0.012, 1.5, 6]} />
            </mesh>
          ))}
          <mesh material={MAT.emerald}>
            <boxGeometry args={[2.7, 0.9, 0.07]} />
          </mesh>
          <TextPlane text="VERDANT" width={2.1} height={0.4} position={[0, 0.11, 0.04]} />
          <TextPlane
            text="JEWELS"
            width={1.2}
            height={0.19}
            color="#9DBBA6"
            fontScale={0.6}
            letterSpacing="0.5em"
            position={[0, -0.21, 0.04]}
          />
        </group>

        {/* Centrepiece vitrine on its wooden drum. Held off the centre line so
            the camera passes beside it instead of straight through the glass —
            and it balances the copy card, which sits on the left */}
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

        {/* Runner + inlaid floor medallion */}
        <mesh
          position={[0, -1.47, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={MAT.stoneWarm}
        >
          <planeGeometry args={[3.4, 11]} />
        </mesh>
        {[
          [0.95, 1.15],
          [0.4, 0.5],
        ].map(([inner, outer]) => (
          <mesh
            key={inner}
            position={[0, -1.46, 4]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={MAT.goldSoft}
          >
            <ringGeometry args={[inner, outer, 40]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* STORY 2 — THE BEGINNING (Z = 60)                                    */
/* Garden archway, hanging lanterns and a courtyard fountain.          */
/* ------------------------------------------------------------------ */

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
      {/* ---- Stone gateway ---- */}
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
        {/* Wall flanks, so the arch reads as a doorway cut into a wall */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 5.2, 0.7, 0]} material={MAT.stone}>
            <boxGeometry args={[4.8, 4.4, 0.7]} />
          </mesh>
        ))}

        {/* Hanging lanterns */}
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

      {/* ---- Vines climbing the arch ---- */}
      <Foliage position={[-2.6, 2.6, -0.5]} seed={71} count={30} spread={[0.9, 1.1, 0.4]} scale={1.1} />
      <Foliage position={[2.6, 2.7, -0.5]} seed={83} count={30} spread={[0.9, 1.1, 0.4]} scale={1.1} />
      <Foliage position={[-3.4, 0.2, -0.4]} seed={97} count={26} spread={[0.8, 1.5, 0.5]} scale={1.2} />
      <Foliage position={[3.4, 0.1, -0.4]} seed={101} count={26} spread={[0.8, 1.5, 0.5]} scale={1.2} />
      <Foliage position={[0, 4.4, -0.7]} seed={113} count={24} spread={[2.2, 0.3, 0.3]} scale={0.85} />

      {/* ---- Courtyard beyond the arch ---- */}
      <group position={[0, 0, -5.5]}>
        <GroundShadow position={[0, -1.47, 0]} radius={1.7} />
        <mesh position={[0, -1.2, 0]} material={MAT.stone}>
          <cylinderGeometry args={[1.45, 1.55, 0.6, 28]} />
        </mesh>
        <mesh
          ref={waterRef}
          position={[0, -0.88, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={MAT.water}
        >
          <circleGeometry args={[1.32, 28]} />
        </mesh>
        <mesh position={[0, -0.6, 0]} material={MAT.stone}>
          <cylinderGeometry args={[0.16, 0.24, 0.9, 14]} />
        </mesh>
        <mesh position={[0, -0.12, 0]} material={MAT.stone}>
          <cylinderGeometry args={[0.62, 0.3, 0.16, 20]} />
        </mesh>
        <mesh
          position={[0, -0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={MAT.water}
        >
          <circleGeometry args={[0.55, 20]} />
        </mesh>

        {/* Potted greenery */}
        {[-2.3, 2.3].map((x, i) => (
          <group key={x} position={[x, -1.15, 0.6]}>
            <mesh material={MAT.wood}>
              <cylinderGeometry args={[0.32, 0.24, 0.5, 14]} />
            </mesh>
            <Foliage
              position={[0, 0.5, 0]}
              seed={131 + i * 7}
              count={32}
              spread={[0.32, 0.36, 0.32]}
              scale={1.05}
            />
          </group>
        ))}

        {/* Garden hedges closing the courtyard on either side. A solid wall
            here would blank out the whole next room from a distance */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 3.1, 0, -1.6]}>
            {/* Dense and tight — a wide scatter of leaves reads as confetti */}
            <Foliage
              position={[0, 0.4, 0]}
              seed={s > 0 ? 149 : 163}
              count={44}
              spread={[0.6, 1.0, 0.6]}
              scale={1.25}
            />
            <Foliage
              position={[s * 0.5, -0.9, 0.9]}
              seed={s > 0 ? 173 : 191}
              count={34}
              spread={[0.55, 0.4, 0.55]}
              scale={1.15}
            />
          </group>
        ))}
      </group>

      {/* ---- Founding plaque, angled toward the visitor ---- */}
      <group position={[3.3, 0.4, -5.4]} rotation={[0, -0.5, 0]}>
        <mesh material={MAT.emerald}>
          <boxGeometry args={[2.1, 1.35, 0.09]} />
        </mesh>
        <mesh position={[0, 0, 0.05]} material={MAT.emeraldDeep}>
          <boxGeometry args={[1.9, 1.16, 0.02]} />
        </mesh>
        <TextPlane text="VERDANT" width={1.5} height={0.32} position={[0, 0.06, 0.07]} />
        <TextPlane
          text="EST. 2020"
          width={0.85}
          height={0.16}
          color="#9DBBA6"
          fontScale={0.62}
          letterSpacing="0.4em"
          position={[0, -0.26, 0.07]}
        />
        {/* Gold leaf mark above the wordmark */}
        <mesh position={[0, 0.44, 0.07]} scale={[0.5, 1, 0.5]} material={MAT.gold}>
          <sphereGeometry args={[0.13, 8, 6]} />
        </mesh>
      </group>

      {/* Stone path underfoot */}
      {[1.5, -1.0, -3.5].map((pz) => (
        <mesh
          key={pz}
          position={[0, -1.46, pz]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={MAT.stoneWarm}
        >
          <planeGeometry args={[3.6, 1.8]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* STORY 3 — THE CRAFT (Z = 48)                                        */
/* The artisan's bench: sketches, tools, a lamp, a stone in progress.  */
/* ------------------------------------------------------------------ */

function TheCraft({ z }: { z: number }) {
  const lampGlowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!lampGlowRef.current) return;
    // Faint flicker on the lamp's inner glow
    const m = lampGlowRef.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.75 + Math.sin(state.clock.getElapsedTime() * 2.3) * 0.06;
  });

  const sketches = [
    { x: -1.15, rz: 0.18, stone: false },
    { x: 0.05, rz: -0.05, stone: true },
    { x: 1.2, rz: -0.22, stone: false },
  ];

  return (
    <group position={[0, 0, z]}>
      {/* ---- Workbench ---- */}
      <group position={[0, 0, -5.2]}>
        <GroundShadow position={[0, -1.47, 0.2]} radius={2.4} />
        <mesh position={[0, -0.28, 0]} material={MAT.woodDark}>
          <boxGeometry args={[4.6, 0.16, 1.9]} />
        </mesh>
        <mesh position={[0, -0.36, 0.95]} material={MAT.goldSoft}>
          <boxGeometry args={[4.6, 0.06, 0.06]} />
        </mesh>
        {[
          [-2.1, 0.75],
          [2.1, 0.75],
          [-2.1, -0.75],
          [2.1, -0.75],
        ].map(([lx, lz]) => (
          <mesh key={`${lx}:${lz}`} position={[lx, -0.95, lz]} material={MAT.woodDark}>
            <boxGeometry args={[0.16, 1.2, 0.16]} />
          </mesh>
        ))}

        {/* ---- Design sketches, propped to face the visitor ---- */}
        {sketches.map((s) => (
          <group key={s.x} position={[s.x, -0.13, 0.1]} rotation={[-1.15, 0, s.rz]}>
            <mesh material={MAT.paper}>
              <planeGeometry args={[1.05, 0.82]} />
            </mesh>
            {/* Sketched necklace curve */}
            <mesh position={[0, 0.02, 0.004]} material={MAT.goldSoft}>
              <torusGeometry args={[0.24, 0.006, 5, 28, Math.PI * 1.35]} />
            </mesh>
            {s.stone && (
              // The piece in progress, resting on the master drawing
              <group position={[0, -0.06, 0.05]} rotation={[1.15, 0, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
                  <torusGeometry args={[0.1, 0.022, 10, 24]} />
                </mesh>
                <mesh position={[0, 0.05, 0]} material={MAT.gemGreen}>
                  <octahedronGeometry args={[0.06, 0]} />
                </mesh>
              </group>
            )}
          </group>
        ))}

        {/* ---- Tools laid out on the right ---- */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[1.75 + i * 0.16, -0.17, -0.35 + i * 0.12]}
            rotation={[Math.PI / 2, 0, 0.35 + i * 0.12]}
            material={i % 2 === 0 ? MAT.goldSoft : MAT.woodDark}
          >
            <cylinderGeometry args={[0.022, 0.012, 0.72, 6]} />
          </mesh>
        ))}

        {/* Loupe */}
        <group position={[-1.9, -0.15, -0.3]} rotation={[-0.5, 0.4, 0]}>
          <mesh material={MAT.gold}>
            <torusGeometry args={[0.17, 0.022, 8, 24]} />
          </mesh>
          <mesh material={MAT.glass}>
            <circleGeometry args={[0.16, 20]} />
          </mesh>
          <mesh position={[0, -0.3, 0]} material={MAT.woodDark}>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
          </mesh>
        </group>

        {/* Stone jar */}
        <mesh position={[-1.55, -0.05, -0.55]} material={MAT.marble}>
          <cylinderGeometry args={[0.14, 0.16, 0.3, 14]} />
        </mesh>

        {/* ---- Bench lamp ---- */}
        <group position={[1.55, -0.2, -0.6]}>
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

      {/* ---- Tool board behind the bench. Kept narrow so the collection
             room stays visible past it from a distance ---- */}
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

/* ------------------------------------------------------------------ */
/* STORY 4 — THE COLLECTION (Z = 36)                                   */
/* Arched display niches down both walls, round vitrine in the middle. */
/* ------------------------------------------------------------------ */

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
      {/* Gold arch trim + jambs */}
      <mesh position={[0, 0.55, 0.02]} material={MAT.gold}>
        <torusGeometry args={[0.58, 0.035, 6, 20, Math.PI]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.58, -0.2, 0.02]} material={MAT.gold}>
          <boxGeometry args={[0.07, 1.5, 0.07]} />
        </mesh>
      ))}
      {/* Niche downlight */}
      <mesh position={[0, 0.82, -0.05]} material={MAT.glow}>
        <sphereGeometry args={[0.06, 8, 6]} />
      </mesh>
      {/* Shelf + the piece on show */}
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
      {/* Panelled side walls with display niches */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh
            position={[s * 3.0, 1.0, -3]}
            rotation={[0, (s * -Math.PI) / 2, 0]}
            material={MAT.emerald}
          >
            <planeGeometry args={[11, 5.5]} />
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

      {/* Ceiling with a row of downlights */}
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

      {/* Room sign hung from the ceiling — no back wall, so the next room
          stays visible down the axis */}
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

      {/* Central round display table */}
      <group position={[0, 0, -5]}>
        <GroundShadow position={[0, -1.47, 0]} radius={1.7} />
        <mesh position={[0, -1.0, 0]} material={MAT.wood}>
          <cylinderGeometry args={[1.45, 1.55, 1.0, 32]} />
        </mesh>
        <mesh position={[0, -0.48, 0]} material={MAT.velvet}>
          <cylinderGeometry args={[1.5, 1.5, 0.08, 32]} />
        </mesh>
        <mesh position={[0, -0.44, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.gold}>
          <torusGeometry args={[1.48, 0.04, 8, 40]} />
        </mesh>

        {/* Slowly rotating ring of pieces under a low glass dome */}
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
        <mesh position={[0, -0.42, 0]} scale={[1, 0.55, 1]} material={MAT.glass}>
          <sphereGeometry args={[1.2, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* STORY 5 — MADE FOR MOMENTS (Z = 24)                                 */
/* The piece as it is worn — candlelight and warm bokeh.               */
/* ------------------------------------------------------------------ */

function MadeForMoments({ z }: { z: number }) {
  const bokehRef = useRef<THREE.Group>(null);

  const portrait = useTexture(JEWELRY_IMAGES.emeraldGoddess.src, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });

  const bokeh = useMemo(() => {
    const r = rng(211);
    return Array.from({ length: 22 }, () => ({
      p: [(r() - 0.5) * 9, (r() - 0.4) * 4.5, 2 - r() * 9] as [number, number, number],
      s: 0.1 + r() * 0.3,
      o: 0.18 + r() * 0.3,
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
      {/* Deep drapes framing the moment */}
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

      {/* The piece, photographed */}
      <group position={[0.15, 0.5, -5.5]}>
        <mesh position={[0, 0, -0.05]} material={MAT.gold}>
          <boxGeometry args={[2.85, 3.55, 0.08]} />
        </mesh>
        <mesh>
          <planeGeometry args={[2.62, 3.3]} />
          <meshBasicMaterial map={portrait} toneMapped={false} />
        </mesh>
        {/* Warm gradient band so the caption stays legible */}
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

      {/* Candles on the floor either side */}
      {[-2.1, -1.55, 2.0, 2.6].map((x, i) => (
        <group key={x} position={[x, -1.2, -3.6 - (i % 2) * 0.9]}>
          <mesh material={MAT.blossom}>
            <cylinderGeometry args={[0.07, 0.08, 0.55 + (i % 3) * 0.15, 12]} />
          </mesh>
          <mesh position={[0, 0.36 + (i % 3) * 0.075, 0]} material={MAT.glow}>
            <sphereGeometry args={[0.05, 8, 6]} />
          </mesh>
        </group>
      ))}

      {/* Floating bokeh lights */}
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

/* ------------------------------------------------------------------ */
/* STORY 6 — YOURS FOREVER (Z = 12)                                    */
/* The open ring box, a sealed card and blossoms on silk.              */
/* ------------------------------------------------------------------ */

function YoursForever({ z }: { z: number }) {
  const lidRef = useRef<THREE.Group>(null);
  const lidOpen = useRef(0);

  // Lid finishes opening as the visitor arrives at the last story room
  useEffect(() => {
    const onScroll = () => {
      lidOpen.current = THREE.MathUtils.clamp((pageProgress() - 0.25) / 0.035, 0, 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(() => {
    if (!lidRef.current) return;
    // 1.35 rad = folded shut over the box, -0.3 = standing open and leaning
    // back. Anything past about -0.5 lies flat and reads as a loose slab.
    lidRef.current.rotation.x = THREE.MathUtils.lerp(
      lidRef.current.rotation.x,
      THREE.MathUtils.lerp(1.35, -0.3, lidOpen.current),
      0.06
    );
  });

  return (
    // Offset deeper into the room so the presentation is read from a distance
    // for most of the zone rather than flying past immediately
    <group position={[0, 0, z - 1.8]}>
      {/* Drapes closing the sides, so the presentation reads against a deep
          backdrop instead of dissolving into the cream haze */}
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

      {/* Silk the presentation sits on */}
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

      {/* ---- The ring box ---- */}
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
        {/* The ring standing in the cushion */}
        <group position={[0, 0.5, 0.06]}>
          <LuxuryRing scale={0.22} />
        </group>

        {/* Hinged lid carrying the wordmark */}
        <group ref={lidRef} position={[0, 0.24, -0.46]}>
          <group position={[0, 0.3, 0]}>
            <mesh material={MAT.velvet}>
              <boxGeometry args={[1.15, 0.62, 0.08]} />
            </mesh>
            <mesh position={[0, 0, 0.05]} material={MAT.emeraldDeep}>
              <boxGeometry args={[0.95, 0.44, 0.01]} />
            </mesh>
            <TextPlane text="VERDANT" width={0.75} height={0.16} position={[0, 0.02, 0.06]} />
          </group>
        </group>
      </group>

      {/* ---- Sealed card, propped up so the seal faces the visitor ---- */}
      <group position={[1.5, -1.08, -3.1]} rotation={[-0.5, -0.35, 0.06]}>
        <mesh material={MAT.paper}>
          <planeGeometry args={[1.1, 0.82]} />
        </mesh>
        {/* Gold border rule */}
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

      {/* ---- Blossoms and greenery ---- */}
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

      {/* ---- Wrapped gift with a ribbon ---- */}
      <group position={[-2.3, -1.15, -1.9]} rotation={[0, 0.4, 0]}>
        <mesh material={MAT.silk}>
          <boxGeometry args={[0.75, 0.52, 0.75]} />
        </mesh>
        {/* Ribbon wrapping the whole box, not just a band across the front */}
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

      {/* Soft glow behind the presentation */}
      <mesh position={[0, -0.6, -5.6]}>
        <circleGeometry args={[2.6, 28]} />
        <meshBasicMaterial color="#FFE3B2" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION WRAPPER                                                     */
/* ------------------------------------------------------------------ */

export default function StorySection() {
  return (
    <group>
      {/* Story-section floor — butts up against the original gallery floor,
          which ends at Z = 15 */}
      <mesh
        position={[0, -1.5, 51.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.stoneWarm}
        receiveShadow
      >
        <planeGeometry args={[18, 73]} />
      </mesh>

      {/* Warm practicals. The scene's two shadow-casting lights only cover the
          original rooms near the origin, so these are shadow-free point lights
          with a finite distance — cheap, and they stop the story rooms from
          being lit by the cool gallery key alone */}
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

