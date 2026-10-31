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
    dpr: [1, 2],
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

  if (cores <= 2) return "low";
  if (memory !== undefined && memory <= 2) return "low";
  if (memory !== undefined && memory <= 4) return "mid";
  return "high";
}

/**
 * Mobile profile: crisp high-resolution rendering with per-frame luxuries (dynamic
 * real-time shadow maps and offscreen refraction passes) turned off to lock 60fps.
 *
 * All procedural textures, geometry detail, and photographs render at high quality.
 * The DPR is bounded to [1, Math.min(2.0, panel)], giving Retina-sharp native clarity
 * on mobile screens while avoiding superfluous fill rate above 2.0x.
 */
function mobilePreset(): Quality {
  const panel = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  return {
    ...PRESETS.high,
    tier: "high",
    shadows: false,
    transmission: false,
    sparkles: 24,
    dpr: [1, Math.min(2.0, panel)],
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
