export interface Palette {
  name: string;

  /** Page background, canvas clear colour and fog. Sets the whole mood. */
  shell: string;
  /** Slightly deeper shell, used for the canvas behind the fog. */
  shellDeep: string;

  /** Brand colour: signage, framed panels, the gallery walls. */
  brand: string;
  /** Deeper brand: recesses, skirtings, backing panels, vignettes. */
  brandDeep: string;
  /** Large wall planes — carries the plaster maps, so slightly lifted. */
  brandWall: string;
  /** Display velvet, and the sheen that lifts its edges. */
  velvet: string;
  velvetSheen: string;

  /** The entrance doors — the first surface anyone sees. */
  door: string;
  doorPanel: string;

  /** Metal. `gold` is polished, `goldSoft` is brushed, `goldWarm` is shade. */
  gold: string;
  goldSoft: string;
  goldWarm: string;
  /**
   * Lettering on dark signage. Brighter than `gold` on purpose: sign text is
   * drawn unlit, and the boards it sits on are read from across a room, by
   * which point fog has blended most of the way to `shell` — the board cannot
   * get darker than the fog, so legibility has to come from the letters.
   */
  signText: string;

  /** Architecture: plaster and cut stone, light to dark. */
  stone: string;
  stoneWarm: string;
  stoneHall: string;
  stoneVault: string;
  stoneShade: string;

  /** Timber: bench tops, frames, branches. */
  wood: string;
  woodDark: string;
  branch: string;

  /** Pale surfaces. */
  marble: string;
  blossom: string;
  paper: string;
  silk: string;
  planter: string;
  soil: string;

  /** The feature stone set into the jewellery, and its pale counterpart. */
  gem: string;
  gemGlow: string;
  gemPale: string;
  gemPaleGlow: string;

  /** Warm light: lamps, lanterns, halos. */
  glow: string;
  glowSoft: string;
  lantern: string;
  lanternGlow: string;

  /** Odds and ends that still want to move with the theme. */
  water: string;
  leather: string;
  contactShadow: string;

  /**
   * Per-instance leaf tints, lit to shaded. Foliage stays green in every
   * palette — a plant does not rebrand — but the tints shift slightly so the
   * greenery sits with the room rather than against it.
   */
  leaf: readonly [string, string, string];

  /**
   * UI tokens mirrored into CSS custom properties. `ink` is body text on
   * `shell`; `accent` is the muted secondary used for eyebrow labels.
   */
  ink: string;
  accent: string;
  uiShell: string;

  goldLight: string;

  success: string;
  danger: string;
  warning: string;
}

/** The original green-and-cream showroom. */
const verdant: Palette = {
  name: "verdant",

  shell: "#E3D9C6",
  shellDeep: "#E9DFCB",

  brand: "#0F4C3A",
  brandDeep: "#0A2B21",
  brandWall: "#14523E",
  velvet: "#0D4433",
  velvetSheen: "#2F7A5C",

  door: "#0A2A1E",
  doorPanel: "#082217",

  gold: "#C8A96A",
  goldSoft: "#B08F52",
  goldWarm: "#C9A567",
  signText: "#F2DCA4",

  stone: "#DCCFB6",
  stoneWarm: "#C9B896",
  stoneHall: "#BCA688",
  stoneVault: "#A8936E",
  stoneShade: "#6E5F49",

  wood: "#4A3222",
  woodDark: "#2E2118",
  branch: "#5A4A33",

  marble: "#EFE8DD",
  blossom: "#F7F1E4",
  paper: "#F4EEDF",
  silk: "#F0E7D4",
  planter: "#CFC8BA",
  soil: "#2A211A",

  gem: "#15805C",
  gemGlow: "#15805C",
  gemPale: "#F3E3C0",
  gemPaleGlow: "#B99A5E",

  glow: "#FFE6B8",
  glowSoft: "#FFD79A",
  lantern: "#FFE9C4",
  lanternGlow: "#FFCF8A",

  water: "#8FC7B4",
  leather: "#7B2C2C",
  contactShadow: "#3D3020",

  leaf: ["#A8C495", "#7FA679", "#5C8460"],

  ink: "#0F4C3A",
  accent: "#5D7A68",
  uiShell: "#FAF7F2",

  goldLight: "#E3CDA4",

  success: "#2E7D5B",
  danger: "#9B2C2C",
  warning: "#A9741F",
};

/**
 * Cassis: deep plum and aubergine against warm taupe, gold kept as the metal.
 * Built from the 2026 palette swatch #351E28 — that hex is the *mid* of the
 * range, so it lands on `brand`, with the walls lifted off it and the recesses
 * dropped below.
 */
const cassis: Palette = {
  name: "cassis",

  shell: "#E7DCD2",
  shellDeep: "#EDE3DA",

  brand: "#351E28",
  brandDeep: "#1F1218",
  brandWall: "#3F2430",
  velvet: "#331C26",
  velvetSheen: "#7A4A5E",

  door: "#241119",
  doorPanel: "#1A0B11",

  gold: "#C8A96A",
  goldSoft: "#A98B55",
  goldWarm: "#C09A5E",
  signText: "#F6DFA8",

  stone: "#DCCCC1",
  stoneWarm: "#C9B3A5",
  stoneHall: "#BCA294",
  stoneVault: "#A88C7C",
  stoneShade: "#6B5349",

  wood: "#4A2C33",
  woodDark: "#2C1A20",
  branch: "#5A4038",

  marble: "#EFE6E1",
  blossom: "#F7F0EC",
  paper: "#F4EDE6",
  silk: "#F0E5DC",
  planter: "#CFC3BB",
  soil: "#241A1C",

  gem: "#7B3E62",
  gemGlow: "#7B3E62",
  gemPale: "#F3DCD0",
  gemPaleGlow: "#B98F82",

  glow: "#FFE6C8",
  glowSoft: "#FFD7AE",
  lantern: "#FFE9D2",
  lanternGlow: "#FFCF9E",

  water: "#C0A2AE",
  leather: "#6B2436",
  contactShadow: "#3A2A2E",

  leaf: ["#9DB98C", "#779B70", "#557B58"],

  ink: "#351E28",
  accent: "#7A5D68",
  uiShell: "#F7F2EE",

  goldLight: "#E3CDA4",

  success: "#3F7A5E",
  danger: "#9B2C48",
  warning: "#A97A32",
};

export const PALETTES = { verdant, cassis } as const;
export type PaletteName = keyof typeof PALETTES;

/** Switch the whole showroom here. */
export const DEFAULT_THEME: PaletteName = "cassis";

let cached: Palette | null = null;

/**
 * The active palette. Resolved once, like `quality()` — the 3D materials are
 * built at module scope, so this must not change identity mid-session.
 */
export function palette(): Palette {
  if (cached) return cached;

  let name: PaletteName = DEFAULT_THEME;
  if (typeof window !== "undefined") {
    const forced = new URLSearchParams(window.location.search).get("theme");
    if (forced && forced in PALETTES) name = forced as PaletteName;
  }
  cached = PALETTES[name];
  return cached;
}

function rgbTriplet(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16
  );
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * The CSS custom properties `globals.css` builds its Tailwind tokens on.
 */
export function paletteVars(
  p: Palette = PALETTES[DEFAULT_THEME]
): Record<string, string> {
  return {
    "--color-primary": p.ink,
    "--color-primary-rgb": rgbTriplet(p.ink),
    "--color-secondary": p.gold,
    "--color-secondary-rgb": rgbTriplet(p.gold),
    "--color-background": p.uiShell,
    "--color-background-rgb": rgbTriplet(p.uiShell),
    "--color-accent": p.accent,
    "--color-accent-rgb": rgbTriplet(p.accent),
    "--color-shell": p.shell,
    "--color-shell-rgb": rgbTriplet(p.shell),
    "--color-secondary-light": p.goldLight,
    "--color-success": p.success,
    "--color-success-rgb": rgbTriplet(p.success),
    "--color-danger": p.danger,
    "--color-danger-rgb": rgbTriplet(p.danger),
    "--color-warning": p.warning,
    "--color-warning-rgb": rgbTriplet(p.warning),
  };
}

/**
 * The same properties as a `:root` rule. Emitted by the layout so the server
 * and the 3D scene cannot drift apart, and there is no flash of the previous
 * palette.
 */
export function paletteCss(p: Palette = PALETTES[DEFAULT_THEME]): string {
  const body = Object.entries(paletteVars(p))
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return `:root{${body}}`;
}
