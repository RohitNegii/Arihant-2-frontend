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

function detectTier(): QualityTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "high";
  }

  const forced = new URLSearchParams(window.location.search).get("q");
  if (forced === "low" || forced === "mid" || forced === "high") return forced;

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;
  const touch = window.matchMedia?.("(pointer: coarse)").matches ?? false;

  if (cores <= 2) return "low";
  if (memory !== undefined && memory <= 2) return "low";
  if (touch && (memory !== undefined ? memory <= 4 : cores <= 6)) return "low";
  if (touch || cores <= 4 || (memory !== undefined && memory <= 4)) return "mid";
  return "high";
}

let cached: Quality | null = null;

export function quality(): Quality {
  if (!cached) {
    const preset = PRESETS[detectTier()];
    /**
     * No real shadows on a touch device, whatever tier it lands in.
     *
     * A shadow map is charged twice: once to draw the scene into it, and again
     * in every material that samples it afterwards. Counted at the entrance on
     * a phone viewport, that first pass alone is half of every draw call in the
     * frame — 783 with, 391 without — and what it buys is contact shadow a few
     * hundred pixels across, on a screen held at arm's length, in a scene where
     * every story room already fakes its own with `GroundShadow` discs.
     */
    cached = preset.shadows && isTouchDevice() ? { ...preset, shadows: false } : preset;
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
 * How hard the scene chases the scroll position, per frame.
 *
 * Lenis leaves touch alone — `syncTouch` is off, so a phone scrolls natively at
 * full speed. What read as slow scrolling was the scene lagging behind it: at
 * 0.05 the camera was still drifting a second after the finger left the glass.
 * The entrance doors ride the same number so they stay in step with the
 * approach rather than swinging on their own clock.
 */
export const SCROLL_TRACKING = isTouchDevice() ? 0.1 : 0.05;

export function texSize(base: number): number {
  const scaled = base * quality().texture;
  return Math.max(128, 2 ** Math.round(Math.log2(scaled)));
}
