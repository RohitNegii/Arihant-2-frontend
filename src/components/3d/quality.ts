"use client";

export type QualityTier = "low" | "mid" | "high";

export interface Quality {
  tier: QualityTier;
  dpr: [number, number];
  shadows: boolean;
  shadowMapSize: number;
  texture: number;
  foliage: number;
  sparkles: number;
  envResolution: number;
  transmission: boolean;
  fogFar: number;
  far: number;
  doorDetail: boolean;
}

const PRESETS: Record<QualityTier, Quality> = {
  low: {
    tier: "low",
    dpr: [1, 1.5],
    shadows: false,
    shadowMapSize: 512,
    texture: 0.5,
    foliage: 0.35,
    sparkles: 0,
    envResolution: 64,
    transmission: false,
    fogFar: 28,
    far: 32,
    doorDetail: false,
  },
  mid: {
    tier: "mid",
    dpr: [1, 2],
    shadows: true,
    shadowMapSize: 1024,
    texture: 0.75,
    foliage: 0.6,
    sparkles: 40,
    envResolution: 128,
    transmission: false,
    fogFar: 42,
    far: 46,
    doorDetail: true,
  },
  high: {
    tier: "high",
    dpr: [1, 1.75],
    shadows: true,
    shadowMapSize: 2048,
    texture: 1,
    foliage: 1,
    sparkles: 80,
    envResolution: 256,
    transmission: true,
    fogFar: 42,
    far: 46,
    doorDetail: true,
  },
};

function forcedTier(): QualityTier | null {
  if (typeof window === "undefined") return null;
  const forced = new URLSearchParams(window.location.search).get("q");
  return forced === "low" || forced === "mid" || forced === "high" ? forced : null;
}

function detectTier(): QualityTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "high";
  }

  const forced = forcedTier();
  if (forced) return forced;

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;
  const touch = window.matchMedia?.("(pointer: coarse)").matches ?? false;

  if (cores <= 2) return "low";
  if (memory !== undefined && memory <= 2) return "low";
  if (touch && (memory !== undefined ? memory <= 4 : cores <= 6)) return "low";
  if (touch || cores <= 4 || (memory !== undefined && memory <= 4)) return "mid";
  return "high";
}

/**
 * The phone profile: every detail knob at the desktop maximum, and the two
 * per-frame luxuries still off.
 *
 * A phone used to be sorted into `low` or `mid`, and those tiers reach a very
 * long way — half-resolution procedural textures, photographs downscaled to
 * 192px, a third of the foliage, a fog wall at 28 units, and coarser geometry
 * wherever a component branches on `Q.tier` (the mannequin, the ring, the
 * necklace beads). All of it was bought to keep the frame rate up by giving
 * the device less work per frame, and the sum of it is what reads as blur.
 *
 * The trade is inverted now: `preload.ts` pays the whole cost once behind the
 * loading screen, so there is no streaming-in left to smooth out and the
 * detail knobs can go to `high`. Reporting the tier as `high` is the point —
 * every `Q.tier` gate in the scene upgrades with it, in one place.
 *
 * Two things stay off, because neither is a resolution and both are charged
 * every frame for the whole journey rather than once at the door:
 *
 * - **Shadows.** A shadow map is paid twice, once to draw the scene into it
 *   and again in every material that samples it. At the entrance on a phone
 *   viewport that first pass alone is half of every draw call in the frame —
 *   783 with, 391 without — and every story room already fakes its own contact
 *   shadow with a `GroundShadow` disc.
 * - **`transmission`.** It makes three re-render the entire scene into an
 *   offscreen buffer every frame. At this dpr that is the most expensive
 *   single thing the scene could ask for, for refraction in a few gemstones.
 *
 * The dpr is the one that actually fixes the blur. A phone's device pixel
 * ratio is 2.5–3.5; drawing at 1.5 and letting the compositor upscale is
 * rendering a quarter of the panel. The ceiling is the real ratio, capped at
 * 3 — past that the fill cost is quadratic for pixels nobody can resolve — and
 * the floor is 2 rather than 1, so `AdaptiveResolution` backing off a device
 * that cannot pay for the ceiling still never returns to mush.
 */
const MOBILE_DPR_FLOOR = 2;
const MOBILE_DPR_CEILING = 3;

function mobilePreset(): Quality {
  const panel = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  return {
    ...PRESETS.high,
    shadows: false,
    transmission: false,
    dpr: [Math.min(MOBILE_DPR_FLOOR, panel), Math.min(MOBILE_DPR_CEILING, panel)],
  };
}

let cached: Quality | null = null;

export function quality(): Quality {
  if (!cached) {
    // `?q=` still forces the old graded tiers on a phone — that is how you
    // check a real device against a budget it would not otherwise be given.
    if (isTouchDevice() && !forcedTier()) {
      cached = mobilePreset();
    } else {
      const preset = PRESETS[detectTier()];
      cached = preset.shadows && isTouchDevice() ? { ...preset, shadows: false } : preset;
    }
  }
  return cached;
}

let coarse: boolean | null = null;

export function isTouchDevice(): boolean {
  if (coarse === null) {
    coarse =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(pointer: coarse)").matches ?? false);
  }
  return coarse;
}

/**
 * How hard the scene chases the scroll position, as a rate per second.
 *
 * A rate rather than a per-frame fraction, because a per-frame fraction
 * converges at whatever the frame rate happens to be: the 0.1 this used to be
 * settled in about a sixth of a second at 60fps and took twice as long at 30,
 * which is where a phone spends most of its time. Same feel at any frame rate
 * now, and the stutter that read as "the scene is lagging behind my finger"
 * was that difference.
 *
 * Touch runs much tighter. This frame-rate-independent pass keeps the camera
 * attached to native touch scrolling
 * without making it feel delayed behind the visitor's finger.
 */
export const SCROLL_DAMP = isTouchDevice() ? 11 : 3.1;

/** Clamped so a stalled tab does not resume with one enormous step. */
export const MAX_STEP = 0.1;

export function texSize(base: number): number {
  const scaled = base * quality().texture;
  return Math.max(128, 2 ** Math.round(Math.log2(scaled)));
}
