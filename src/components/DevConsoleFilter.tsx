"use client";

const KNOWN_NOISE = "THREE.Clock: This module has been deprecated";

if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development"
) {
  const warn = console.warn.bind(console);
  if (!(console.warn as { __clockFilter?: boolean }).__clockFilter) {
    const patched = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes(KNOWN_NOISE)) return;
      warn(...args);
    };
    (patched as { __clockFilter?: boolean }).__clockFilter = true;
    console.warn = patched;
  }
}

export default function DevConsoleFilter() {
  return null;
}
