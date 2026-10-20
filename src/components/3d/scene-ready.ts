"use client";

let ready = true;
let waiters: (() => void)[] = [];
let revealed = true;

/** The loader has finished exiting, so entrance animations are now visible. */
export function isSceneRevealed() {
  return revealed;
}

export function setSceneRevealed(value: boolean) {
  revealed = value;
}

/** Reset only when replacing the canvas; route changes retain the ready scene. */
export function resetSceneReady() {
  ready = false;
  revealed = false;
}

export function markSceneReady() {
  if (ready) return;
  ready = true;
  const pending = waiters;
  waiters = [];
  for (const cb of pending) cb();
}

export function isSceneReady() {
  return ready;
}

export function onSceneReady(cb: () => void): () => void {
  if (ready) {
    cb();
    return () => {};
  }
  waiters.push(cb);
  return () => {
    waiters = waiters.filter((w) => w !== cb);
  };
}
