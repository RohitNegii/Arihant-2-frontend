import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/textures");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function noise2D(seed) {
  const N = 256;
  const grid = new Float32Array(N * N);
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < grid.length; i++) grid[i] = rnd();

  const at = (x, y) => grid[(((y % N) + N) % N) * N + (((x % N) + N) % N)];

  return (x, y) => {
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

function fbm(n, x, y, octaves = 4) {
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

function heightField(size, fn) {
  const data = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      data[y * size + x] = fn(x / size, y / size);
    }
  }
  return data;
}

function normalBuffer(data, size, strength) {
  const buf = Buffer.alloc(size * size * 4);
  const h = (x, y) => data[(((y % size) + size) % size) * size + (((x % size) + size) % size)];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      buf[i] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      buf[i + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255);
      buf[i + 2] = Math.round((1 / len) * 0.5 * 255 + 127.5);
      buf[i + 3] = 255;
    }
  }
  return buf;
}

function grayBuffer(data, size, min, max) {
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < data.length; i++) {
    const v = Math.round((min + (max - min) * data[i]) * 255);
    const j = i * 4;
    buf[j] = v;
    buf[j + 1] = v;
    buf[j + 2] = v;
    buf[j + 3] = 255;
  }
  return buf;
}

async function saveWebp(buf, size, filename) {
  const dest = path.join(outDir, filename);
  await sharp(buf, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 90, effort: 4 })
    .toFile(dest);
  console.log(`Saved: ${filename} (${fs.statSync(dest).size} bytes)`);
}

async function main() {
  console.log("Baking procedural textures to WebP...");

  // 1. Contact Shadow (128x128)
  {
    const S = 128;
    const buf = Buffer.alloc(S * S * 4);
    const stops = [
      [0.0, 255],
      [0.3, 235],
      [0.62, 107],
      [0.85, 28],
      [1.0, 0],
    ];
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const dist = Math.hypot(x - S / 2, y - S / 2) / (S / 2);
        const d = Math.min(1, Math.max(0, dist));
        let val = 0;
        for (let s = 0; s < stops.length - 1; s++) {
          const [p0, v0] = stops[s];
          const [p1, v1] = stops[s + 1];
          if (d >= p0 && d <= p1) {
            const t = (d - p0) / (p1 - p0);
            val = v0 + (v1 - v0) * t;
            break;
          }
        }
        const i = (y * S + x) * 4;
        const b = Math.round(val);
        buf[i] = b;
        buf[i + 1] = b;
        buf[i + 2] = b;
        buf[i + 3] = 255;
      }
    }
    await saveWebp(buf, S, "contact-shadow.webp");
  }

  // 2. Light Pool (128x128)
  {
    const S = 128;
    const buf = Buffer.alloc(S * S * 4);
    const stops = [
      [0.0, 1.0],
      [0.22, 0.72],
      [0.55, 0.24],
      [0.82, 0.05],
      [1.0, 0.0],
    ];
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const dist = Math.hypot(x - S / 2, y - S / 2) / (S / 2);
        const d = Math.min(1, Math.max(0, dist));
        let alpha = 0;
        for (let s = 0; s < stops.length - 1; s++) {
          const [p0, a0] = stops[s];
          const [p1, a1] = stops[s + 1];
          if (d >= p0 && d <= p1) {
            const t = (d - p0) / (p1 - p0);
            alpha = a0 + (a1 - a0) * t;
            break;
          }
        }
        const i = (y * S + x) * 4;
        buf[i] = 255;
        buf[i + 1] = 255;
        buf[i + 2] = 255;
        buf[i + 3] = Math.round(alpha * 255);
      }
    }
    await saveWebp(buf, S, "light-pool.webp");
  }

  // 3. Painted Wood (256x256)
  {
    const size = 256;
    const n = noise2D(9137);
    const grain = heightField(size, (u, v) => {
      const warp = fbm(n, u * 3, v * 1.2, 4) * 2.2;
      const rings = Math.sin((u * 9 + warp * 2.6) * Math.PI) * 0.5 + 0.5;
      const fine = fbm(n, u * 90, v * 7, 2);
      const pores = Math.pow(fbm(n, u * 140, v * 12, 1), 4);
      return rings * 0.55 + fine * 0.3 + pores * 0.15;
    });
    await saveWebp(normalBuffer(grain, size, 1.1), size, "wood-normal.webp");
    await saveWebp(grayBuffer(grain, size, 0.26, 0.46), size, "wood-roughness.webp");
  }

  // 4. Plaster (256x256)
  {
    const size = 256;
    const n = noise2D(4421);
    const surface = heightField(size, (u, v) => {
      const broad = fbm(n, u * 4, v * 4, 3);
      const trowel = fbm(n, u * 16, v * 16, 3);
      const tooth = fbm(n, u * 70, v * 70, 2);
      const skip = Math.pow(fbm(n, u * 7 + 3.1, v * 6 - 1.7, 3), 2);
      return broad * 0.42 + trowel * 0.3 + tooth * 0.16 + skip * 0.1;
    });
    await saveWebp(normalBuffer(surface, size, 3.2), size, "plaster-normal.webp");
    await saveWebp(grayBuffer(surface, size, 0.8, 1.0), size, "plaster-roughness.webp");

    const color = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const h = surface[i];
        const drift = fbm(n, (x / size) * 3 + 7.3, (y / size) * 3 - 4.1, 3);
        const patch = fbm(n, (x / size) * 7 - 2.6, (y / size) * 7 + 9.4, 2);
        const t = 0.83 + h * 0.16 + (drift - 0.5) * 0.17 + (patch - 0.5) * 0.07;
        const j = i * 4;
        color[j] = Math.round(Math.min(255, t * 255));
        color[j + 1] = Math.round(Math.min(255, t * (0.995 + h * 0.005) * 255));
        color[j + 2] = Math.round(Math.min(255, t * (0.972 + h * 0.028) * 255));
        color[j + 3] = 255;
      }
    }
    await saveWebp(color, size, "plaster-map.webp");
  }

  // 5. Brass (256x256)
  {
    const size = 256;
    const n = noise2D(7717);
    const surface = heightField(size, (u, v) => {
      const brush = fbm(n, u * 220, v * 2, 2);
      const patina = fbm(n, u * 6, v * 6, 3);
      return brush * 0.55 + patina * 0.45;
    });
    await saveWebp(normalBuffer(surface, size, 0.5), size, "brass-normal.webp");
    await saveWebp(grayBuffer(surface, size, 0.14, 0.42), size, "brass-roughness.webp");
  }

  // 6. Stone Slab (512x512)
  {
    const size = 512;
    const SLAB_COLS = 3;
    const SLAB_ROWS = 4;
    const SLAB_BASE = [62, 54, 37];
    const SLAB_JOINT = [43, 37, 26];
    const JOINT = 3.0;
    const BEVEL = 8;
    const n = noise2D(8412);

    function slabAt(u, v) {
      const yy = v * SLAB_ROWS;
      const row = Math.floor(yy);
      const xx = u * SLAB_COLS + (row % 2 ? 0.5 : 0);
      const col = Math.floor(xx);
      const fx = xx - col;
      const fy = yy - row;
      const dx = Math.min(fx, 1 - fx) * (size / SLAB_COLS);
      const dy = Math.min(fy, 1 - fy) * (size / SLAB_ROWS);
      return {
        id: ((col % SLAB_COLS) + SLAB_COLS) % SLAB_COLS + row * 7,
        edge: Math.min(dx, dy),
      };
    }

    function tone(id) {
      const h = Math.sin(id * 12.9898) * 43758.5453;
      return h - Math.floor(h);
    }

    const surface = heightField(size, (u, v) => {
      const { edge } = slabAt(u, v);
      if (edge < JOINT) {
        return 0.06 + fbm(n, u * 90, v * 90, 2) * 0.08;
      }
      const bevel = Math.min((edge - JOINT) / BEVEL, 1);
      const grain = fbm(n, u * 26, v * 26, 4);
      const pit = Math.pow(fbm(n, u * 170, v * 170, 2), 7);
      return 0.6 + bevel * 0.26 + grain * 0.12 - pit * 0.22;
    });

    await saveWebp(normalBuffer(surface, size, 5.0), size, "stone-slab-normal.webp");
    await saveWebp(grayBuffer(surface, size, 0.96, 0.58), size, "stone-slab-roughness.webp");

    const color = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        const i = y * size + x;
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
        color[j] = Math.round(Math.max(0, Math.min(255, r + speck)));
        color[j + 1] = Math.round(Math.max(0, Math.min(255, g + speck)));
        color[j + 2] = Math.round(Math.max(0, Math.min(255, b + speck)));
        color[j + 3] = 255;
      }
    }
    await saveWebp(color, size, "stone-slab-map.webp");
  }

  // 7. Rug (256x256)
  {
    const size = 256;
    const rn = noise2D(4177);
    const FIELD = "#5E2733";
    const GUARD = "#3A1620";
    const MOTIF = "#C8A96A";

    let diamonds = "";
    const step = size * 0.115;
    for (let y = size * 0.12; y < size * 0.88; y += step) {
      for (let x = size * 0.12; x < size * 0.88; x += step) {
        const r = step * 0.3;
        diamonds += `<polygon points="${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}" fill="none" stroke="${MOTIF}" stroke-width="${Math.max(1, size * 0.0035)}" opacity="0.5"/>`;
      }
    }

    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${GUARD}"/>
      <rect x="${size * 0.07}" y="${size * 0.07}" width="${size * 0.86}" height="${size * 0.86}" fill="${FIELD}"/>
      <rect x="${size * 0.045}" y="${size * 0.045}" width="${size * 0.91}" height="${size * 0.91}" fill="none" stroke="${MOTIF}" stroke-width="${Math.max(1, size * 0.006)}"/>
      <rect x="${size * 0.085}" y="${size * 0.085}" width="${size * 0.83}" height="${size * 0.83}" fill="none" stroke="${MOTIF}" stroke-width="${Math.max(1, size * 0.006)}"/>
      ${diamonds}
    </svg>`;

    const baseBuf = await sharp(Buffer.from(svg)).raw().toBuffer();
    const heights = new Float32Array(size * size);
    const colorBuf = Buffer.from(baseBuf);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const pile = fbm(rn, (x / size) * 26, (y / size) * 26, 3);
        heights[i] = pile;
        const k = 0.78 + pile * 0.42;
        const j = i * 4;
        colorBuf[j] = Math.round(Math.min(255, colorBuf[j] * k));
        colorBuf[j + 1] = Math.round(Math.min(255, colorBuf[j + 1] * k));
        colorBuf[j + 2] = Math.round(Math.min(255, colorBuf[j + 2] * k));
      }
    }

    await saveWebp(colorBuf, size, "rug-map.webp");
    await saveWebp(normalBuffer(heights, size, 0.7), size, "rug-normal.webp");
    await saveWebp(grayBuffer(heights, size, 0.72, 0.18), size, "rug-roughness.webp");
  }

  // 8. Leaf (256x256)
  {
    const size = 256;
    const leafPathD = `M ${size * 0.5} ${size * 0.03} C ${size * 0.92} ${size * 0.28} ${size * 0.86} ${size * 0.74} ${size * 0.5} ${size * 0.98} C ${size * 0.14} ${size * 0.74} ${size * 0.08} ${size * 0.28} ${size * 0.5} ${size * 0.03} Z`;

    let veinsSvg = "";
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const w = size * 0.026 * (1 - t * 0.75);
      veinsSvg += `<line x1="${size * 0.5}" y1="${size * (0.04 + t * 0.79)}" x2="${size * 0.5}" y2="${size * (0.04 + (t + 1 / 12) * 0.79)}" stroke="rgba(176, 205, 158, 0.55)" stroke-width="${w}" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const y = size * (0.14 + t * 0.66);
      const reach = 0.34 * Math.sin(Math.PI * (0.18 + t * 0.72));
      for (const dir of [-1, 1]) {
        veinsSvg += `<path d="M ${size * 0.5} ${y} Q ${size * (0.5 + dir * reach * 0.55)} ${y + size * 0.055} ${size * (0.5 + dir * reach)} ${y + size * 0.115}" fill="none" stroke="rgba(176, 205, 158, 0.55)" stroke-width="${size * 0.007}" stroke-linecap="round"/>`;
      }
    }

    const alphaSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#000"/>
      <path d="${leafPathD}" fill="#fff"/>
    </svg>`;
    const alphaBuf = await sharp(Buffer.from(alphaSvg)).raw().toBuffer();
    await saveWebp(alphaBuf, size, "leaf-alpha.webp");

    const colorSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3E6B45"/>
          <stop offset="40%" stop-color="#2F5C3B"/>
          <stop offset="100%" stop-color="#1E4029"/>
        </linearGradient>
        <radialGradient id="sheen" cx="36%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#96BE8C" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#96BE8C" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="leafClip">
          <path d="${leafPathD}"/>
        </clipPath>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#leafGrad)"/>
      <rect width="${size}" height="${size}" fill="url(#sheen)"/>
      <g clip-path="url(#leafClip)">
        <path d="${leafPathD}" fill="none" stroke="rgba(14, 38, 22, 0.55)" stroke-width="${size * 0.09}"/>
      </g>
      ${veinsSvg}
    </svg>`;
    const colorBuf = await sharp(Buffer.from(colorSvg)).raw().toBuffer();
    await saveWebp(colorBuf, size, "leaf-map.webp");

    let heightVeins = "";
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const w = size * 0.03 * (1 - t * 0.75);
      heightVeins += `<line x1="${size * 0.5}" y1="${size * (0.04 + t * 0.79)}" x2="${size * 0.5}" y2="${size * (0.04 + (t + 1 / 12) * 0.79)}" stroke="#e6e6e6" stroke-width="${w}" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const y = size * (0.14 + t * 0.66);
      const reach = 0.34 * Math.sin(Math.PI * (0.18 + t * 0.72));
      for (const dir of [-1, 1]) {
        heightVeins += `<path d="M ${size * 0.5} ${y} Q ${size * (0.5 + dir * reach * 0.55)} ${y + size * 0.055} ${size * (0.5 + dir * reach)} ${y + size * 0.115}" fill="none" stroke="#e6e6e6" stroke-width="${size * 0.009}" stroke-linecap="round"/>`;
      }
    }
    const heightSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#4d4d4d"/>
      ${heightVeins}
    </svg>`;
    const heightRaw = await sharp(Buffer.from(heightSvg)).raw().toBuffer();
    const heights = new Float32Array(size * size);
    for (let i = 0; i < heights.length; i++) heights[i] = heightRaw[i * 4 + 1] / 255;

    await saveWebp(normalBuffer(heights, size, 1.1), size, "leaf-normal.webp");

    const rn = noise2D(2277);
    const roughBuf = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const mottle = fbm(rn, (x / size) * 9, (y / size) * 9, 3);
        const v = Math.round(Math.min(255, (0.34 + mottle * 0.14 + heights[i] * 0.34) * 255));
        const j = i * 4;
        roughBuf[j] = v;
        roughBuf[j + 1] = v;
        roughBuf[j + 2] = v;
        roughBuf[j + 3] = 255;
      }
    }
    await saveWebp(roughBuf, size, "leaf-roughness.webp");
  }

  console.log("All procedural textures successfully baked to /public/textures/!");
}

main().catch(console.error);
