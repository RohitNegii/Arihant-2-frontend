"use client";

import {
  ATELIER_FILM,
  benchReference,
  BRAND_CREST,
  finalePictures,
  momentsPictures,
  MUSE_NECKLACE,
  plinthPictures,
  wallPictures,
} from "@/content/gallery";
import { loadHomeMedia } from "@/content/home-media";
import { JEWELRY_IMAGES } from "@/content/jewelry";
import { quality } from "./quality";

/**
 * Full-preload mode: nothing is fetched, decoded, compiled or uploaded while
 * the visitor is scrolling.
 *
 * The scene used to spread its cost across the journey — textures at half
 * resolution, photographs downscaled to 192px, the film created only when the
 * scroll came within a zone of it. That kept the frame rate up by giving a
 * phone less to draw, and what it looked like was a soft picture that got
 * softer the closer you looked.
 *
 * This is the other trade. Everything the six rooms need is loaded, decoded,
 * compiled and drawn once behind the loading screen, and the journey then runs
 * off a warm GPU with nothing left to stream in. It costs a longer wait at the
 * door and buys full-resolution detail with no mid-scroll hitch, which is the
 * right way round for a showroom.
 *
 * On everywhere now, not just touch. It went in for phones, where the blur was
 * the complaint, but the reason it is better is not a mobile reason: a desktop
 * on the old progressive reveal was handed the scene at the entrance and then
 * built the other five rooms underneath the visitor as they scrolled into them.
 * One wait at a door that says what it is doing reads as deliberate; five
 * unannounced ones spread through the journey read as a slow site.
 *
 * Note this decides *when* things load, not how good they look. The graded
 * `low`/`mid`/`high` tiers still apply on a pointer device — see `quality.ts`,
 * where only a touch device takes the flat-out profile.
 *
 * `?preload=off` restores the progressive reveal; `?preload=full` is now a
 * no-op kept for symmetry.
 */
export function fullPreload(): boolean {
  return false;
}

/* ------------------------------------------------------------------ *
 * Progress
 * ------------------------------------------------------------------ */

/**
 * What the four phases are worth on the bar.
 *
 * Weighted by measured share of the wait rather than evenly. Shader
 * compilation dominates — it is the whole point of doing this at the door, and
 * it is charged for every material in all six rooms at once instead of a room
 * at a time as the visitor reaches them. Drawing the procedural textures, which
 * looked like the expensive phase, measured 1.3s against its 8.
 */
const WEIGHT = { assets: 0.15, textures: 0.15, shaders: 0.45, warmup: 0.25 } as const;

export type PreloadPhase = keyof typeof WEIGHT;

const reached: Record<PreloadPhase, number> = {
  assets: 0,
  textures: 0,
  shaders: 0,
  warmup: 0,
};

let listeners: ((progress: number) => void)[] = [];
let complete = true;
let completeWaiters: (() => void)[] = [];

/** Monotonic — a phase never reports backwards, so the bar never retreats. */
export function reportPreload(phase: PreloadPhase, fraction: number) {
  if (complete) return;
  const next = Math.min(1, Math.max(0, fraction));
  if (next <= reached[phase]) return;
  reached[phase] = next;
  const total = preloadProgress();
  for (const cb of listeners.slice()) cb(total);
}

export function preloadProgress(): number {
  let total = 0;
  for (const phase of Object.keys(WEIGHT) as PreloadPhase[]) {
    total += reached[phase] * WEIGHT[phase];
  }
  return total;
}

export function onPreloadProgress(cb: (progress: number) => void): () => void {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function isPreloadComplete(): boolean {
  return complete;
}

export function markPreloadComplete() {
  if (complete) return;
  complete = true;
  warming = false;
  for (const phase of Object.keys(WEIGHT) as PreloadPhase[]) reached[phase] = 1;
  for (const cb of listeners.slice()) cb(1);
  const pending = completeWaiters;
  completeWaiters = [];
  for (const cb of pending) cb();
}

export function onPreloadComplete(cb: () => void): () => void {
  if (complete) {
    cb();
    return () => {};
  }
  completeWaiters.push(cb);
  return () => {
    completeWaiters = completeWaiters.filter((w) => w !== cb);
  };
}

/**
 * True while `ScenePrewarm` is flying the camera down the corridor to force
 * every room through a real draw. `CameraController` yields for the duration —
 * it would otherwise damp the camera straight back to the entrance between
 * stops and the fly-through would never leave zone one.
 */
let warming = false;

export function setWarming(value: boolean) {
  warming = value;
}

export function isWarming(): boolean {
  return warming && !complete;
}

/* ------------------------------------------------------------------ *
 * Assets
 * ------------------------------------------------------------------ */

/**
 * Every image the six rooms hang, in one list.
 *
 * Deduplicated because the wall niches, the collection lookbook and the closing
 * panels deliberately share files, and both this and drei's `useTexture` cache
 * by URL — so a repeat costs a `Set` lookup and nothing else.
 */
export function sceneImages(): string[] {
  return Array.from(
    new Set([
      ...wallPictures(),
      ...plinthPictures(),
      ...finalePictures(),
      ...momentsPictures(),
      benchReference(),
      BRAND_CREST,
      MUSE_NECKLACE,
      JEWELRY_IMAGES.emeraldGoddess.src,
    ])
  );
}

/**
 * Whether this device gets the film at all.
 *
 * Lives here rather than beside the frame it hangs in because the preloader
 * has to make the same call: it buffers the file up front, and a visitor who
 * has asked for reduced motion or to save data should not be made to wait for
 * something they are never shown.
 */
export function filmAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (quality().tier === "low") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const link = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  return !link?.saveData;
}

/** A decode that resolves either way — a missing file must not hold the door. */
function decodeImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof Image === "undefined") return resolve();
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    const settle = () => resolve();
    if (typeof img.decode === "function") {
      img.decode().then(settle, settle);
    } else {
      img.onload = settle;
      img.onerror = settle;
    }
  });
}

/** How long the film may hold the door before the room falls back to the still. */
const FILM_TIMEOUT_MS = 8000;

/**
 * Pull the film into the HTTP cache.
 *
 * The element is thrown away — `MadeForMoments` builds its own and needs to,
 * because a `VideoTexture` wants the element it was constructed with. What
 * survives is the cache entry, so the room's element is playable the frame it
 * is created instead of buffering under the visitor mid-journey.
 */
function bufferFilm(): Promise<void> {
  if (typeof document === "undefined" || !filmAllowed()) return Promise.resolve();

  const el = document.createElement("video");
  el.src = ATELIER_FILM;
  el.muted = true;
  el.playsInline = true;
  el.preload = "auto";

  return new Promise((resolve) => {
    const settle = () => {
      clearTimeout(timer);
      el.removeEventListener("canplaythrough", settle);
      el.removeEventListener("error", settle);
      el.removeAttribute("src");
      el.load();
      resolve();
    };
    // A phone on a bad connection must not be held at the door by 0.29MB of
    // decoration.
    const timer = setTimeout(settle, FILM_TIMEOUT_MS);
    el.addEventListener("canplaythrough", settle, { once: true });
    el.addEventListener("error", settle, { once: true });
    el.load();
  });
}

let assetsPromise: Promise<void> | null = null;

/**
 * Fetch and decode every photograph and the film, reporting as each lands.
 *
 * Started from the loading screen rather than from the canvas so it overlaps
 * the three.js chunk download instead of queueing behind it — the chunk is the
 * larger half of the wait, and the two are independent.
 */
export function preloadAssets(): Promise<void> {
  if (!assetsPromise) assetsPromise = runAssetPreload();
  return assetsPromise;
}

async function runAssetPreload(): Promise<void> {
  await loadHomeMedia();
  const jobs = [...sceneImages().map(decodeImage), bufferFilm()];
  let done = 0;
  const tick = () => reportPreload("assets", ++done / jobs.length);

  await Promise.all(jobs.map((job) => job.then(tick, tick)));
  reportPreload("assets", 1);
}

/* ------------------------------------------------------------------ *
 * Procedural textures
 * ------------------------------------------------------------------ */

/** A turn of the event loop the browser will paint in. */
function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "undefined") return void setTimeout(resolve, 0);
    requestAnimationFrame(() => setTimeout(resolve, 0));
  });
}

/**
 * Draw every procedural surface, one per task.
 *
 * These are generated at the module scope of the rooms that use them, which
 * means they are otherwise all drawn inside a single import — one unbroken
 * main-thread task, and React cannot commit a progress update on a thread that
 * is busy. On the mobile profile `texture: 1` has doubled every dimension
 * against what a phone used to get; measured, the whole set is 1.3 seconds,
 * which is a second and a bit of frozen loading bar.
 *
 * Every generator caches its result and returns it on any later call, so
 * priming them here one at a time — yielding to a paint between each — is
 * enough. The rooms' own calls all hit a warm cache afterwards and cost
 * nothing. Cheapest first, so the bar is visibly moving before it reaches the
 * 1024² stone slab, which is half the phase on its own (633ms of 1,279).
 *
 * The import is dynamic to keep three.js out of the initial bundle: this
 * module is reached from the loading screen, which is not lazily loaded.
 */
export function preloadTextures(signal?: AbortSignal): Promise<void> {
  // Each builder caches its texture. Keep the pass cancellable rather than
  // caching a partially completed promise when the visitor leaves home.
  return runTexturePreload(signal);
}

async function runTexturePreload(signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return;
  const tex = await import("./procedural-textures");
  const builders = [
    tex.leafMaps,
    tex.brassMaps,
    tex.contactShadowMap,
    tex.lightPoolMap,
    tex.paintedWoodMaps,
    tex.plasterMaps,
    tex.rugMaps,
    tex.stoneSlabMaps,
  ];

  let done = 0;
  for (const build of builders) {
    await nextPaint();
    if (signal?.aborted) return;
    try {
      build();
    } catch {
      // A surface that will not draw is the room's problem, not the door's.
    }
    reportPreload("textures", ++done / builders.length);
  }
}
