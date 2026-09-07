import { create } from "zustand";
import type Lenis from "lenis";

interface ScrollStore {
  lenis: Lenis | null;
  setLenis: (lenis: Lenis | null) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  lenis: null,
  setLenis: (lenis) => set({ lenis }),
}));

/**
 * The journey is no longer the whole document — the footer sits below it — so
 * progress has to be measured against the scrolling block itself. Measured off
 * the document instead, the camera would keep flying while you read the footer
 * and would leave the finale out the back of the room.
 *
 * Cached: `journeyProgress` is read once per frame from `useFrame`, and
 * `offsetHeight` is a layout read. The element is looked up until it mounts and
 * the span is remeasured whenever the viewport changes.
 */
let journeyEl: HTMLElement | null = null;
let journeySpanPx = 1;

function measureJourney() {
  journeyEl = document.querySelector<HTMLElement>("[data-journey]");
  const height = journeyEl
    ? journeyEl.offsetHeight
    : document.documentElement.scrollHeight;
  journeySpanPx = Math.max(1, height - window.innerHeight);
}

if (typeof window !== "undefined") {
  window.addEventListener("resize", measureJourney, { passive: true });
  window.addEventListener("orientationchange", measureJourney, { passive: true });
}

/** Scrollable pixels of journey, above whatever follows it. */
export function journeySpan(): number {
  if (!journeyEl || !journeyEl.isConnected) measureJourney();
  return journeySpanPx;
}

/** Journey scroll, 0 to 1. Pinned at 1 for everything below the journey. */
export function journeyProgress(): number {
  return Math.min(Math.max(window.scrollY / journeySpan(), 0), 1);
}

/** Smooth-scroll to an absolute offset via Lenis, falling back to native. */
export function scrollToOffset(offset: number) {
  const lenis = useScrollStore.getState().lenis;
  if (lenis) {
    lenis.scrollTo(offset, { duration: 1.0 });
  } else {
    window.scrollTo({ top: offset, behavior: "smooth" });
  }
}
