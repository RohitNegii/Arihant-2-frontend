"use client";

import { useEffect } from "react";
import { useScrollStore } from "@/store/scroll-store";

const locks = new Set<symbol>();
let restoreOverflow: (() => void) | undefined;

/** Only the last overlay to close may unlock the document. */
export function acquireScrollLock(): () => void {
  const token = Symbol("scroll-lock");
  if (locks.size === 0) {
    const elements = [document.documentElement, document.body];
    const previous = elements.map((element) => ({
      value: element.style.getPropertyValue("overflow-y"),
      priority: element.style.getPropertyPriority("overflow-y"),
    }));
    restoreOverflow = () => {
      elements.forEach((element, index) => {
        const { value, priority } = previous[index];
        if (value) element.style.setProperty("overflow-y", value, priority);
        else element.style.removeProperty("overflow-y");
      });
    };
    elements.forEach((element) => element.style.setProperty("overflow-y", "hidden"));
  }
  locks.add(token);
  useScrollStore.getState().lenis?.stop();

  return () => {
    if (!locks.delete(token) || locks.size > 0) return;
    restoreOverflow?.();
    restoreOverflow = undefined;
    useScrollStore.getState().lenis?.start();
  };
}

export function useScrollLock(locked: boolean) {
  const lenis = useScrollStore((state) => state.lenis);
  useEffect(() => {
    if (locked) return acquireScrollLock();
  }, [locked, lenis]);
}
