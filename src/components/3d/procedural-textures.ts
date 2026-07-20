"use client";

import * as THREE from "three";

const hasDOM = typeof document !== "undefined";

export interface SurfaceMaps {
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

/* ------------------------------------------------------------------ */
/* Noise + canvas plumbing                                             */
/* ------------------------------------------------------------------ */

/** Tiling value noise. Deterministic, so the surfaces never shimmer. */
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
    // Smoothstep interpolation — linear interpolation leaves visible creases
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
  tex.anisotropy = 8;
  return tex;
}

/** Sample a height field into a Float32Array in 0..1. */
function heightField(size: number, fn: (x: number, y: number) => number) {
  const data = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      data[y * size + x] = fn(x / size, y / size);
    }
  }
  return data;
}

/** Sobel the height field into a tangent-space normal map. */
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

/** Map the height field onto a roughness range. */
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

/* ------------------------------------------------------------------ */
/* Painted hardwood — the entrance doors                               */
/* ------------------------------------------------------------------ */

let woodCache: SurfaceMaps | null | undefined;

/**
 * Lacquered hardwood: cathedral grain running the length of the board, still
 * faintly telegraphing through the paint, plus brush drag in the roughness.
 */
export function paintedWoodMaps(): SurfaceMaps | null {
  if (woodCache !== undefined) return woodCache;
  if (!hasDOM) return (woodCache = null);

  const SIZE = 512;
  const n = noise2D(9137);

  const grain = heightField(SIZE, (u, v) => {
    // Grain runs along v, so warp mostly across u
    const warp = fbm(n, u * 3, v * 1.2, 4) * 2.2;
    const rings = Math.sin((u * 9 + warp * 2.6) * Math.PI) * 0.5 + 0.5;
    const fine = fbm(n, u * 90, v * 7, 2);
    const pores = Math.pow(fbm(n, u * 140, v * 12, 1), 4);
    return rings * 0.55 + fine * 0.3 + pores * 0.15;
  });

  const normalMap = finish(normalFromHeight(grain, SIZE, 1.1), false, 1);
  // Paint pools slightly in the grain valleys, so they read glossier
  const roughnessMap = finish(grayFromHeight(grain, SIZE, 0.26, 0.46), false, 1);

  woodCache = { normalMap, roughnessMap };
  return woodCache;
}

/* ------------------------------------------------------------------ */
/* Lime plaster / cast stone — facade and hall walls                   */
/* ------------------------------------------------------------------ */

let plasterCache: SurfaceMaps | null | undefined;

export function plasterMaps(): SurfaceMaps | null {
  if (plasterCache !== undefined) return plasterCache;
  if (!hasDOM) return (plasterCache = null);

  const SIZE = 512;
  const n = noise2D(4421);

  const surface = heightField(SIZE, (u, v) => {
    const broad = fbm(n, u * 4, v * 4, 3);
    const trowel = fbm(n, u * 16, v * 16, 3);
    const tooth = fbm(n, u * 70, v * 70, 2);
    return broad * 0.5 + trowel * 0.32 + tooth * 0.18;
  });

  const normalMap = finish(normalFromHeight(surface, SIZE, 2.4), false, 1);
  const roughnessMap = finish(grayFromHeight(surface, SIZE, 0.82, 1.0), false, 1);

  plasterCache = { normalMap, roughnessMap };
  return plasterCache;
}

/* ------------------------------------------------------------------ */
/* Brushed / lightly aged brass — door furniture                       */
/* ------------------------------------------------------------------ */

let brassCache: SurfaceMaps | null | undefined;

export function brassMaps(): SurfaceMaps | null {
  if (brassCache !== undefined) return brassCache;
  if (!hasDOM) return (brassCache = null);

  const SIZE = 256;
  const n = noise2D(7717);

  const surface = heightField(SIZE, (u, v) => {
    // Fine brushing along one axis + broad patina blotches
    const brush = fbm(n, u * 220, v * 2, 2);
    const patina = fbm(n, u * 6, v * 6, 3);
    return brush * 0.55 + patina * 0.45;
  });

  const normalMap = finish(normalFromHeight(surface, SIZE, 0.5), false, 1);
  const roughnessMap = finish(grayFromHeight(surface, SIZE, 0.14, 0.42), false, 1);

  brassCache = { normalMap, roughnessMap };
  return brassCache;
}

/* ------------------------------------------------------------------ */
/* Leaves — alpha-cut planes instead of blobs                          */
/* ------------------------------------------------------------------ */

export interface LeafMaps {
  map: THREE.Texture;
  alphaMap: THREE.Texture;
  normalMap: THREE.Texture;
}

let leafCache: LeafMaps | null | undefined;

/** Traces a leaf silhouette into the current path, normalised to the canvas. */
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

  const S = 256;

  // --- Alpha silhouette (three samples the green channel) ---
  const alphaCanvas = makeCanvas(S);
  const actx = alphaCanvas.getContext("2d")!;
  actx.fillStyle = "#000";
  actx.fillRect(0, 0, S, S);
  actx.fillStyle = "#fff";
  leafPath(actx, S);
  actx.fill();

  // --- Colour: base green, darker toward the midrib, warm at the tip ---
  const colorCanvas = makeCanvas(S);
  const cctx = colorCanvas.getContext("2d")!;
  const grad = cctx.createLinearGradient(0, 0, 0, S);
  grad.addColorStop(0, "#6E9463");
  grad.addColorStop(0.45, "#41764E");
  grad.addColorStop(1, "#2C5638");
  cctx.fillStyle = grad;
  cctx.fillRect(0, 0, S, S);
  // Vein tracery, slightly lighter than the blade
  cctx.strokeStyle = "rgba(150, 180, 140, 0.5)";
  cctx.lineWidth = S * 0.012;
  cctx.beginPath();
  cctx.moveTo(S * 0.5, S * 0.05);
  cctx.lineTo(S * 0.5, S * 0.96);
  cctx.stroke();
  cctx.lineWidth = S * 0.006;
  for (let i = 1; i <= 6; i++) {
    const y = S * (0.12 + i * 0.12);
    for (const dir of [-1, 1]) {
      cctx.beginPath();
      cctx.moveTo(S * 0.5, y);
      cctx.quadraticCurveTo(
        S * (0.5 + dir * 0.2),
        y + S * 0.02,
        S * (0.5 + dir * 0.33),
        y + S * 0.1
      );
      cctx.stroke();
    }
  }

  // --- Normal: raised midrib and veins ---
  const heightCanvas = makeCanvas(S);
  const hctx = heightCanvas.getContext("2d")!;
  hctx.fillStyle = "#808080";
  hctx.fillRect(0, 0, S, S);
  hctx.drawImage(colorCanvas, 0, 0); // reuse the vein strokes as height
  const hdata = hctx.getImageData(0, 0, S, S).data;
  const heights = new Float32Array(S * S);
  for (let i = 0; i < heights.length; i++) heights[i] = hdata[i * 4 + 1] / 255;

  leafCache = {
    map: finish(colorCanvas, true, 1),
    alphaMap: finish(alphaCanvas, false, 1),
    normalMap: finish(normalFromHeight(heights, S, 0.6), false, 1),
  };
  return leafCache;
}
