"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useScrollStore } from "@/store/scroll-store";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    useScrollStore.getState().setLenis(lenis);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      useScrollStore.getState().setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
