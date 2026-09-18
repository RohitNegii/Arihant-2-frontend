"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

import { useScrollStore } from "@/store/scroll-store";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Native touch scrolling updates in larger steps than a wheel. Syncing
      // touch through Lenis gives the fixed 3D camera a continuous signal while
      // keeping direct manipulation and inertial flicks feeling responsive.
      syncTouch: isTouchDevice,
      syncTouchLerp: 0.075,
      touchInertiaExponent: 1.7,
    });
    useScrollStore.getState().setLenis(lenis);

    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      useScrollStore.getState().setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
