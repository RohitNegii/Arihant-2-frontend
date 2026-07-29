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
    dpr: [1, 1],
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
    dpr: [1, 1.25],
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
  if (!cached) cached = PRESETS[detectTier()];
  return cached;
}

export function texSize(base: number): number {
  const scaled = base * quality().texture;
  return Math.max(128, 2 ** Math.round(Math.log2(scaled)));
}
