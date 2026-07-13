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

/** Smooth-scroll to an absolute offset via Lenis, falling back to native. */
export function scrollToOffset(offset: number) {
  const lenis = useScrollStore.getState().lenis;
  if (lenis) {
    lenis.scrollTo(offset, { duration: 1.6 });
  } else {
    window.scrollTo({ top: offset, behavior: "smooth" });
  }
}
