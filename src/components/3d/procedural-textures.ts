"use client";

import * as THREE from "three";
import { texSize, quality } from "./quality";

const hasDOM = typeof document !== "undefined";

export interface SurfaceMaps {
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

function noise2D(seed: number) {
  const N = 256;
  const grid = new Float32Array(N * N);
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < grid.length; i++) grid[i] = rnd();

  const at = (x: number, y: number) =>
    grid[(((y % N) + N) % N) * N + (((x % N) + N) % N)];

  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    return (
      at(xi, yi) * (1 - u) * (1 - v) +
      at(xi + 1, yi) * u * (1 - v) +
      at(xi, yi + 1) * (1 - u) * v +
      at(xi + 1, yi + 1) * u * v
    );
  };
}

function fbm(
  n: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves = 4
) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * n(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function finish(canvas: HTMLCanvasElement, srgb: boolean, repeat: number) {
  const tex = new THREE.CanvasTexture(canvas);
  // Colour maps are sRGB; normal/roughness are raw data and must not be decoded
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = quality().tier === "high" ? 8 : 2;
  return tex;
}

function heightField(size: number, fn: (x: number, y: number) => number) {
  const data = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      data[y * size + x] = fn(x / size, y / size);
    }
  }
  return data;
}

function normalFromHeight(data: Float32Array, size: number, strength: number) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const h = (x: number, y: number) =>
    data[(((y % size) + size) % size) * size + (((x % size) + size) % size)];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = (1 / len) * 0.5 * 255 + 127.5;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function grayFromHeight(
  data: Float32Array,
  size: number,
  min: number,
  max: number
) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < data.length; i++) {
    const v = (min + (max - min) * data[i]) * 255;
    const j = i * 4;
    img.data[j] = v;
    img.data[j + 1] = v;
    img.data[j + 2] = v;
    img.data[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

let woodCache: SurfaceMaps | null | undefined;

export function paintedWoodMaps(): SurfaceMaps | null {
  if (woodCache !== undefined) return woodCache;
  if (!hasDOM) return (woodCache = null);

  const SIZE = texSize(512);
  const n = noise2D(9137);

  const grain = heightField(SIZE, (u, v) => {
    const warp = fbm(n, u * 3, v * 1.2, 4) * 2.2;
    const rings = Math.sin((u * 9 + warp * 2.6) * Math.PI) * 0.5 + 0.5;
    const fine = fbm(n, u * 90, v * 7, 2);
    const pores = Math.pow(fbm(n, u * 140, v * 12, 1), 4);
    return rings * 0.55 + fine * 0.3 + pores * 0.15;
  });

  const normalMap = finish(normalFromHeight(grain, SIZE, 1.1), false, 1);
  const roughnessMap = finish(grayFromHeight(grain, SIZE, 0.26, 0.46), false, 1);

  woodCache = { normalMap, roughnessMap };
  return woodCache;
}

export interface PlasterMaps extends SurfaceMaps {
  map: THREE.Texture;
}

let plasterCache: PlasterMaps | null | undefined;

export function plasterMaps(): PlasterMaps | null {
  if (plasterCache !== undefined) return plasterCache;
  if (!hasDOM) return (plasterCache = null);

  const SIZE = texSize(512);
  const n = noise2D(4421);

  const surface = heightField(SIZE, (u, v) => {
    const broad = fbm(n, u * 4, v * 4, 3);
    const trowel = fbm(n, u * 16, v * 16, 3);
    const tooth = fbm(n, u * 70, v * 70, 2);
    const skip = Math.pow(fbm(n, u * 7 + 3.1, v * 6 - 1.7, 3), 2);
    return broad * 0.42 + trowel * 0.3 + tooth * 0.16 + skip * 0.1;
  });

  const normalMap = finish(normalFromHeight(surface, SIZE, 3.2), false, 1);
  const roughnessMap = finish(grayFromHeight(surface, SIZE, 0.8, 1.0), false, 1);

  const colorCanvas = makeCanvas(SIZE);
  const ctx = colorCanvas.getContext("2d")!;
  const img = ctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = y * SIZE + x;
      const h = surface[i];
      // Two scales of drift, so big walls are neither one flat tone nor a
      // uniform noise field: broad blotches with finer patchiness inside them.
      // Frequencies must be whole numbers or the noise stops tiling and every
      // repeat boundary shows up on the wall as a seam.
      const drift = fbm(n, (x / SIZE) * 3 + 7.3, (y / SIZE) * 3 - 4.1, 3);
      const patch = fbm(n, (x / SIZE) * 7 - 2.6, (y / SIZE) * 7 + 9.4, 2);
      const t = 0.83 + h * 0.16 + (drift - 0.5) * 0.17 + (patch - 0.5) * 0.07;
      const j = i * 4;
      img.data[j] = Math.min(255, t * 255);
      img.data[j + 1] = Math.min(255, t * (0.995 + h * 0.005) * 255);
      img.data[j + 2] = Math.min(255, t * (0.972 + h * 0.028) * 255);
      img.data[j + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  plasterCache = { normalMap, roughnessMap, map: finish(colorCanvas, true, 1) };
  return plasterCache;
}

let contactCache: THREE.Texture | null | undefined;

export function contactShadowMap(): THREE.Texture | null {
  if (contactCache !== undefined) return contactCache;
  if (!hasDOM) return (contactCache = null);

  const S = 128;
  const canvas = makeCanvas(S);
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.92)");
  g.addColorStop(0.62, "rgba(255,255,255,0.42)");
  g.addColorStop(0.85, "rgba(255,255,255,0.11)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  contactCache = tex;
  return contactCache;
}

let poolCache: THREE.Texture | null | undefined;

/**
 * The pool of light a lamp throws on the surface below it — a soft radial
 * falloff, used additively.
 *
 * 128px on every tier, and deliberately not run through `texSize`: a smooth
 * gradient is the one texture where resolution buys nothing, because there is
 * no detail in it to lose. Built once and shared by every lamp.
 */
export function lightPoolMap(): THREE.Texture | null {
  if (poolCache !== undefined) return poolCache;
  if (!hasDOM) return (poolCache = null);

  const S = 128;
  const canvas = makeCanvas(S);
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  // Hotter core than a contact shadow's falloff, and gone well before the
  // edge — a hard rim on an additive quad reads as a decal, not as light.
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.22, "rgba(255,255,255,0.72)");
  g.addColorStop(0.55, "rgba(255,255,255,0.24)");
  g.addColorStop(0.82, "rgba(255,255,255,0.05)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  poolCache = tex;
  return poolCache;
}

let rugCache: (SurfaceMaps & { map: THREE.Texture }) | null | undefined;

/**
 * A bordered wool rug: field, guard stripes, and a lattice of diamonds, with
 * fbm mottling for pile and wear.
 *
 * Drawn once at 512 (tier-scaled) and clamped rather than tiled — this is one
 * rug, not a repeating floor, so a seam would show. The whole rug is a single
 * quad wearing this map.
 */
export function rugMaps(): (SurfaceMaps & { map: THREE.Texture }) | null {
  if (rugCache !== undefined) return rugCache;
  if (!hasDOM) return (rugCache = null);

  const S = texSize(512);
  const canvas = makeCanvas(S);
  const ctx = canvas.getContext("2d")!;
  const rn = noise2D(4177);

  const FIELD = "#5E2733";
  const GUARD = "#3A1620";
  const MOTIF = "#C8A96A";

  ctx.fillStyle = GUARD;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = FIELD;
  ctx.fillRect(S * 0.07, S * 0.07, S * 0.86, S * 0.86);

  // Guard stripes either side of the border.
  ctx.strokeStyle = MOTIF;
  ctx.lineWidth = Math.max(1, S * 0.006);
  ctx.strokeRect(S * 0.045, S * 0.045, S * 0.91, S * 0.91);
  ctx.strokeRect(S * 0.085, S * 0.085, S * 0.83, S * 0.83);

  // Lattice of diamonds across the field.
  ctx.globalAlpha = 0.5;
  const step = S * 0.115;
  for (let y = S * 0.12; y < S * 0.88; y += step) {
    for (let x = S * 0.12; x < S * 0.88; x += step) {
      const r = step * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
      ctx.lineWidth = Math.max(1, S * 0.0035);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Pile and wear: multiply a low-frequency field over the whole thing.
  const img = ctx.getImageData(0, 0, S, S);
  const heights = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const pile = fbm(rn, (x / S) * 26, (y / S) * 26, 3);
      heights[i] = pile;
      const k = 0.78 + pile * 0.42;
      const j = i * 4;
      img.data[j] = Math.min(255, img.data[j] * k);
      img.data[j + 1] = Math.min(255, img.data[j + 1] * k);
      img.data[j + 2] = Math.min(255, img.data[j + 2] * k);
    }
  }
  ctx.putImageData(img, 0, 0);

  const clamp = (tex: THREE.Texture) => {
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };

  rugCache = {
    map: clamp(finish(canvas, true, 1)),
    normalMap: clamp(finish(normalFromHeight(heights, S, 0.7), false, 1)),
    roughnessMap: clamp(
      finish(grayFromHeight(heights, S, 0.72, 0.18), false, 1)
    ),
  };
  return rugCache;
}

export const SLAB_TILE_W = 4.05;
export const SLAB_TILE_D = 3.6;

const SLAB_COLS = 3;
const SLAB_ROWS = 4;

/**
 * Albedo, NOT the colour you see. The floor is lit by three spots, a sun, a
 * hemisphere and a studio environment, then ACES tone-mapped, so it renders
 * roughly 2.5x brighter than its texture — painting the intended stone colour
 * in here directly came out near-white. These values were calibrated by
 * sampling the rendered frame until the lit floor measured about #96856a, a
 * warm mid stone. Re-measure before changing them, and re-measure again if the
 * showroom lighting is ever retuned.
 */
const SLAB_BASE = [62, 54, 37] as const;
const SLAB_JOINT = [43, 37, 26] as const;

let slabCache: (SurfaceMaps & { map: THREE.Texture }) | null | undefined;

export function stoneSlabMaps(): (SurfaceMaps & { map: THREE.Texture }) | null {
  if (slabCache !== undefined) return slabCache;
  if (!hasDOM) return (slabCache = null);

  const SIZE = texSize(1024);
  const JOINT = 3.0;
  const BEVEL = 8;
  const n = noise2D(8412);

  function slabAt(u: number, v: number) {
    const yy = v * SLAB_ROWS;
    const row = Math.floor(yy);
    const xx = u * SLAB_COLS + (row % 2 ? 0.5 : 0);
    const col = Math.floor(xx);
    const fx = xx - col;
    const fy = yy - row;
    const dx = Math.min(fx, 1 - fx) * (SIZE / SLAB_COLS);
    const dy = Math.min(fy, 1 - fy) * (SIZE / SLAB_ROWS);
    return {
      id: ((col % SLAB_COLS) + SLAB_COLS) % SLAB_COLS + row * 7,
      edge: Math.min(dx, dy),
    };
  }

  function tone(id: number) {
    const h = Math.sin(id * 12.9898) * 43758.5453;
    return h - Math.floor(h);
  }

  const surface = heightField(SIZE, (u, v) => {
    const { edge } = slabAt(u, v);
    if (edge < JOINT) {
      return 0.06 + fbm(n, u * 90, v * 90, 2) * 0.08;
    }
    const bevel = Math.min((edge - JOINT) / BEVEL, 1);
    const grain = fbm(n, u * 26, v * 26, 4);
    const pit = Math.pow(fbm(n, u * 170, v * 170, 2), 7);
    return 0.6 + bevel * 0.26 + grain * 0.12 - pit * 0.22;
  });

  const normalMap = finish(normalFromHeight(surface, SIZE, 5.0), false, 1);
  // Inverted range on purpose: the joints (height 0) must read rougher than
  // the honed slab faces (height 1), which keep a faint sheen
  const roughnessMap = finish(grayFromHeight(surface, SIZE, 0.96, 0.58), false, 1);

  const colorCanvas = makeCanvas(SIZE);
  const ctx = colorCanvas.getContext("2d")!;
  const img = ctx.createImageData(SIZE, SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const u = x / SIZE;
      const v = y / SIZE;
      const i = y * SIZE + x;
      const h = surface[i];
      const { id, edge } = slabAt(u, v);
      const j = i * 4;

      let r, g, b;
      if (edge < JOINT) {
        const m = 0.92 + fbm(n, u * 70, v * 70, 2) * 0.16;
        r = SLAB_JOINT[0] * m;
        g = SLAB_JOINT[1] * m;
        b = SLAB_JOINT[2] * m;
      } else {
        const shade = (0.88 + tone(id) * 0.24) * (0.85 + h * 0.22);
        const mottle = 0.93 + fbm(n, u * 12, v * 12, 3) * 0.15;
        r = SLAB_BASE[0] * shade * mottle;
        g = SLAB_BASE[1] * shade * mottle;
        b = SLAB_BASE[2] * shade * mottle;
      }

      const speck = (Math.random() - 0.5) * 6;
      img.data[j] = Math.max(0, Math.min(255, r + speck));
      img.data[j + 1] = Math.max(0, Math.min(255, g + speck));
      img.data[j + 2] = Math.max(0, Math.min(255, b + speck));
      img.data[j + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const map = finish(colorCanvas, true, 1);

  slabCache = { normalMap, roughnessMap, map };
  return slabCache;
}

let brassCache: SurfaceMaps | null | undefined;

export function brassMaps(): SurfaceMaps | null {
  if (brassCache !== undefined) return brassCache;
  if (!hasDOM) return (brassCache = null);

  const SIZE = texSize(256);
  const n = noise2D(7717);

  const surface = heightField(SIZE, (u, v) => {
    const brush = fbm(n, u * 220, v * 2, 2);
    const patina = fbm(n, u * 6, v * 6, 3);
    return brush * 0.55 + patina * 0.45;
  });

  const normalMap = finish(normalFromHeight(surface, SIZE, 0.5), false, 1);
  const roughnessMap = finish(grayFromHeight(surface, SIZE, 0.14, 0.42), false, 1);

  brassCache = { normalMap, roughnessMap };
  return brassCache;
}

export interface LeafMaps {
  map: THREE.Texture;
  alphaMap: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

let leafCache: LeafMaps | null | undefined;

function leafPath(ctx: CanvasRenderingContext2D, S: number) {
  ctx.beginPath();
  ctx.moveTo(S * 0.5, S * 0.03);
  ctx.bezierCurveTo(S * 0.92, S * 0.28, S * 0.86, S * 0.74, S * 0.5, S * 0.98);
  ctx.bezierCurveTo(S * 0.14, S * 0.74, S * 0.08, S * 0.28, S * 0.5, S * 0.03);
  ctx.closePath();
}

export function leafMaps(): LeafMaps | null {
  if (leafCache !== undefined) return leafCache;
  if (!hasDOM) return (leafCache = null);

  const S = texSize(256);

  const alphaCanvas = makeCanvas(S);
  const actx = alphaCanvas.getContext("2d")!;
  actx.fillStyle = "#000";
  actx.fillRect(0, 0, S, S);
  actx.fillStyle = "#fff";
  leafPath(actx, S);
  actx.fill();

  const strokeVeins = (ctx: CanvasRenderingContext2D, midribW: number, veinW: number) => {
    ctx.lineCap = "round";
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      ctx.lineWidth = S * midribW * (1 - t * 0.75);
      ctx.beginPath();
      ctx.moveTo(S * 0.5, S * (0.04 + t * 0.79));
      ctx.lineTo(S * 0.5, S * (0.04 + (t + 1 / 12) * 0.79));
      ctx.stroke();
    }
    ctx.lineWidth = S * veinW;
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const y = S * (0.14 + t * 0.66);
      const reach = 0.34 * Math.sin(Math.PI * (0.18 + t * 0.72));
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(S * 0.5, y);
        ctx.quadraticCurveTo(
          S * (0.5 + dir * reach * 0.55),
          y + S * 0.055,
          S * (0.5 + dir * reach),
          y + S * 0.115
        );
        ctx.stroke();
      }
    }
  };

  const colorCanvas = makeCanvas(S);
  const cctx = colorCanvas.getContext("2d")!;
  const grad = cctx.createLinearGradient(0, 0, 0, S);
  grad.addColorStop(0, "#3E6B45");
  grad.addColorStop(0.4, "#2F5C3B");
  grad.addColorStop(1, "#1E4029");
  cctx.fillStyle = grad;
  cctx.fillRect(0, 0, S, S);
  const sheen = cctx.createRadialGradient(S * 0.36, S * 0.3, 0, S * 0.36, S * 0.3, S * 0.5);
  sheen.addColorStop(0, "rgba(150, 190, 140, 0.34)");
  sheen.addColorStop(1, "rgba(150, 190, 140, 0)");
  cctx.fillStyle = sheen;
  cctx.fillRect(0, 0, S, S);
  cctx.save();
  leafPath(cctx, S);
  cctx.clip();
  cctx.strokeStyle = "rgba(14, 38, 22, 0.55)";
  cctx.lineWidth = S * 0.09;
  leafPath(cctx, S);
  cctx.stroke();
  cctx.restore();
  cctx.strokeStyle = "rgba(176, 205, 158, 0.55)";
  strokeVeins(cctx, 0.026, 0.007);

  const heightCanvas = makeCanvas(S);
  const hctx = heightCanvas.getContext("2d")!;
  hctx.fillStyle = "#4d4d4d";
  hctx.fillRect(0, 0, S, S);
  hctx.strokeStyle = "#e6e6e6";
  strokeVeins(hctx, 0.03, 0.009);
  const hdata = hctx.getImageData(0, 0, S, S).data;
  const heights = new Float32Array(S * S);
  for (let i = 0; i < heights.length; i++) heights[i] = hdata[i * 4 + 1] / 255;

  const roughCanvas = makeCanvas(S);
  const rctx = roughCanvas.getContext("2d")!;
  const rn = noise2D(2277);
  const rimg = rctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const mottle = fbm(rn, (x / S) * 9, (y / S) * 9, 3);
      const v = (0.34 + mottle * 0.14 + heights[i] * 0.34) * 255;
      const j = i * 4;
      rimg.data[j] = v;
      rimg.data[j + 1] = v;
      rimg.data[j + 2] = v;
      rimg.data[j + 3] = 255;
    }
  }
  rctx.putImageData(rimg, 0, 0);

  leafCache = {
    map: finish(colorCanvas, true, 1),
    alphaMap: finish(alphaCanvas, false, 1),
    normalMap: finish(normalFromHeight(heights, S, 1.1), false, 1),
    roughnessMap: finish(roughCanvas, false, 1),
  };
  return leafCache;
}
