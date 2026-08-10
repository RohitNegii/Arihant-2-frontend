"use client";

import { useLayoutEffect } from "react";
import { DEFAULT_THEME, palette, paletteVars } from "./palette";

export default function ThemeVars() {
  useLayoutEffect(() => {
    const active = palette();
    if (active.name === DEFAULT_THEME) return;

    const root = document.documentElement;
    for (const [prop, value] of Object.entries(paletteVars(active))) {
      root.style.setProperty(prop, value);
    }
  }, []);

  return null;
}
