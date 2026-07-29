"use client";

let ready = false;
let waiters: (() => void)[] = [];

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
