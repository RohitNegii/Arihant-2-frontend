/**
 * Turns the camera-original photography in `originals/` into the WebP files the
 * app actually serves, in `public/images/`.
 *
 *     node scripts/optimize-media.mjs
 *
 * Run it by hand when a source file is added or changed, and commit what comes
 * out. It is not wired into the build: the inputs change once in a blue moon,
 * they are git-ignored, and a build step that needs 70MB of JPEG present would
 * fail on any machine that only has the repo.
 *
 * Why this exists at all: the sources run to 6000px and 34MB each, while nothing
 * in this app shows a photograph larger than 512px — `PICTURE_TEX_W` in
 * StoryRooms.tsx redraws every wall picture down to 192–512 before it reaches
 * the GPU. Anything in `public/` is also served whether or not it is referenced,
 * so leaving the originals there publishes 73MB to no purpose.
 *
 * `sharp` comes with Next (it is what next/image uses), so this adds no
 * dependency.
 *
 * There is one thing this cannot do: `fancy-ring-video.mp4` is 18MB and needs
 * ffmpeg, which is not installed here. When it is available:
 *
 *     ffmpeg -i originals/display-pictures/fancy-ring-video.mp4 \
 *       -vf "scale=720:-2" -an -c:v libx264 -crf 30 -preset slow \
 *       -movflags +faststart public/media/fancy-ring.mp4
 *
 * That lands around 1.5MB. Until then the file is loaded from `public/media` as
 * it is, behind the guards in MadeForMoments.
 */

import sharp from "sharp";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images");

/**
 * What counts as background, per source.
 *
 * `paper` is the flat white the crest was drawn on. `bust` is two classes at
 * once — the cream display bust the necklace hangs on (mid-bright, barely
 * saturated, warm) and the dark red drape behind it. Both are wide enough to
 * take the whole background and still miss the piece: the pearls sit above
 * v 0.9, and the gold and the stones are far more saturated than 0.24.
 *
 * Nothing here is applied on its own — see `liftAlpha`, where a pixel only
 * counts as background if it also joins up with the edge of the frame.
 */
const BACKGROUND = {
  paper: ({ r, g, b }) => r > 246 && g > 244 && b > 240,
  bust: ({ r, g, b, v, s }) =>
    // The bust: mid-bright, barely saturated, warm.
    (v > 0.58 && v < 0.92 && s < 0.24 && r >= g && g >= b) ||
    // The shadow either side of it.
    v < 0.35 ||
    // The lit folds of the drape, which are neither: a pure, near-black-shadowed
    // red at s > 0.9. The necklace's own red enamel measures s 0.55 with green
    // and blue at half the red, so 0.72 and a 2.5x ratio clears it — and even a
    // gem that did match is enclosed by its gold setting, where the flood that
    // has to reach it from the frame edge cannot go.
    (s > 0.72 && r >= g * 2.5 && r >= b * 2.5),
};

/**
 * `crop` is in fractions of the source, so it survives the source being
 * re-exported at another size. `grade` gets the sharp pipeline mid-flight.
 */
const ASSETS = [
  {
    // The necklace the muse wears in scene 01. Cropped to the piece first: the
    // drape has bright folds at the edges of the frame that are neither bust
    // nor shadow, and no key should have to care about them.
    src: "display-pictures/neckless.jpg",
    out: "necklace-muse.webp",
    crop: { left: 0.2, top: 0.3, width: 0.6, height: 0.46 },
    key: "bust",
    width: 900,
  },
  {
    // Warm, dark, and already the right shape for a niche.
    src: "display-pictures/chain-on-table.jpg",
    out: "chain-on-table.webp",
    width: 850,
  },
  {
    // A landscape shot of a hand against a blue sky, going into rooms of cream,
    // plum and gold — blue is the one hue this palette does not own. Cropped
    // portrait onto the rings, then white-balanced warm: saturation down a
    // little, and the channels pulled the way a colourist would pull them, so
    // the sky goes ivory while the skin and the gold stay themselves. A `tint`
    // would have been easier and would have flattened all three to one hue.
    src: "display-pictures/ring-and-hand.jpg",
    out: "ring-and-hand.webp",
    crop: { left: 0.22, top: 0, width: 0.5, height: 1 },
    grade: (img) =>
      img.modulate({ saturation: 0.5 }).linear([1.1, 1.0, 0.74], [0, 0, 6]),
    width: 850,
  },
  {
    // The pair hung either side of the portrait in Made for Moments. Both are
    // 2:3 and go into identical frames, so neither is cropped — and they are
    // deliberately opposites, one high key and one nearly black, because two
    // photographs of the same weight flanking a centrepiece read as wallpaper.
    src: "display-pictures/ring-with-book.jpg",
    out: "ring-with-book.webp",
    width: 800,
  },
  {
    src: "display-pictures/rings-in-zar.jpg",
    out: "rings-in-zar.webp",
    width: 800,
  },
  {
    // The house crest on the entrance sign. This used to be keyed in the
    // browser, on the main thread, at every page load, for a result that never
    // changes — see the note where BRAND_CREST is declared.
    src: "home-logo/img-1.jpeg",
    out: "geetej-crest.webp",
    key: "paper",
    width: 512,
  },
];

/**
 * Replaces the background with transparency.
 *
 * The rule is connectivity, not colour alone: a pixel is background if it
 * matches the test *and* the flood can reach it from the edge of the frame.
 * That is what keeps the pearls — they read as pale as the bust does, but they
 * are enclosed by gold, so the flood never gets to them. A plain colour key
 * loses every one of them.
 *
 * What survives is then filtered to the piece itself. The necklace is one
 * connected thing (the drops hang off the chain), so anything under a sixth of
 * the largest island is a scrap of background that met the test in isolation.
 * Alpha comes out binary, so a 3x3 mean takes the stagger off the edge, and the
 * result is cropped to what is left.
 */
async function liftAlpha(image, test) {
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const N = W * H;

  const sample = (i) => {
    const o = i * C;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    return { r, g, b, v: mx / 255, s: mx ? (mx - mn) / mx : 0 };
  };

  // 1. Flood the background in from every edge.
  const bg = new Uint8Array(N);
  const stack = [];
  const seed = (i) => {
    if (bg[i] || !test(sample(i))) return;
    bg[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < W; x++) {
    seed(x);
    seed((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    seed(y * W);
    seed(y * W + W - 1);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % W;
    if (x > 0) seed(i - 1);
    if (x < W - 1) seed(i + 1);
    if (i >= W) seed(i - W);
    if (i < N - W) seed(i + W);
  }

  // 2. Label what is left and keep only the substantial islands.
  const label = new Int32Array(N).fill(-1);
  const areas = [];
  for (let start = 0; start < N; start++) {
    if (bg[start] || label[start] !== -1) continue;
    const id = areas.length;
    let area = 0;
    label[start] = id;
    const walk = [start];
    while (walk.length) {
      const i = walk.pop();
      area++;
      const x = i % W;
      const y = (i / W) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
          const j = yy * W + xx;
          if (bg[j] || label[j] !== -1) continue;
          label[j] = id;
          walk.push(j);
        }
      }
    }
    areas.push(area);
  }
  const biggest = Math.max(0, ...areas);
  const keep = areas.map((a) => a >= biggest / 6);

  // 3. Soften the edge, and find what is worth keeping of the frame.
  const solid = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    solid[i] = !bg[i] && keep[label[i]] ? 255 : 0;
  }
  let minX = W;
  let minY = H;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          sum += solid[yy * W + xx];
          n++;
        }
      }
      const a = Math.round(sum / n);
      data[(y * W + x) * C + 3] = a;
      if (a > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) throw new Error("the key removed everything — check the test");

  return sharp(data, { raw: { width: W, height: H, channels: C } }).extract({
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  });
}

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

await mkdir(OUT_DIR, { recursive: true });

for (const asset of ASSETS) {
  const src = path.join(ROOT, "originals", asset.src);
  const before = (await stat(src)).size;
  const meta = await sharp(src).metadata();

  let img = sharp(src);
  if (asset.crop) {
    const c = asset.crop;
    img = img.extract({
      left: Math.round(meta.width * c.left),
      top: Math.round(meta.height * c.top),
      width: Math.round(meta.width * c.width),
      height: Math.round(meta.height * c.height),
    });
  }
  // Resized before the key, not after: the flood walks every pixel, and at
  // source resolution that is fifty million of them for no gain.
  img = img.resize({ width: asset.width });
  if (asset.grade) img = asset.grade(img);
  if (asset.key) img = await liftAlpha(img, BACKGROUND[asset.key]);

  const out = path.join(OUT_DIR, asset.out);
  await writeFile(
    out,
    await img.webp({ quality: 80, alphaQuality: 90, effort: 6 }).toBuffer()
  );

  const after = (await stat(out)).size;
  console.log(
    `${asset.src.padEnd(38)} ${meta.width}x${meta.height} ${kb(before).padStart(7)}` +
      `  ->  ${asset.out.padEnd(24)} ${kb(after).padStart(6)}`
  );
}

// A keyed cutout is impossible to judge on a white page — the whole point is
// what it looks like over something dark. This is a proof, not a shipped file.
const proof = ASSETS.find((a) => a.out === "necklace-muse.webp");
if (proof) {
  const cut = await readFile(path.join(OUT_DIR, proof.out));
  const { width, height } = await sharp(cut).metadata();
  await sharp({
    create: { width, height, channels: 4, background: { r: 16, g: 14, b: 18, alpha: 1 } },
  })
    .composite([{ input: cut }])
    .png()
    .toFile(path.join(ROOT, "originals", "necklace-on-black.png"));
  console.log("\nproof sheet: originals/necklace-on-black.png");
}
