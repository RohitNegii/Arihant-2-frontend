/**
 * Web-optimized product photography (WebP, served from public/images).
 *
 * Full-resolution originals live in /originals (git-ignored);
 * `scripts/optimize-media.mjs` is what turns one into the other. Run it after
 * adding a source and commit what it writes — the eight earrings predate the
 * script and were converted by hand at 1080×1350.
 */
export interface JewelryImage {
  /** Public URL path — usable as next/image src and as a three.js texture. */
  src: string;
  name: string;
  alt: string;
}

export const JEWELRY_IMAGES = {
  royalPeacock: {
    src: "/images/royal-peacock-drops.webp",
    name: "Royal Peacock Drops",
    alt: "Carved silver peacock earrings with pink sculpted petals and pearl clusters, resting on a wooden jewelry box",
  },
  turquoiseChandelier: {
    src: "/images/turquoise-chandelier-drops.webp",
    name: "Turquoise Chandelier Drops",
    alt: "Oxidised silver chandelier earrings lined with turquoise beads, ruby-toned beads and pearl tassels",
  },
  peacockHexagon: {
    src: "/images/peacock-hexagon-studs.webp",
    name: "Peacock Hexagon Studs",
    alt: "Two-tone hexagonal silver studs with a peacock relief and fluted drop",
  },
  jadeMedallion: {
    src: "/images/jade-medallion-drops.webp",
    name: "Jade Medallion Drops",
    alt: "Round green jade medallion earrings framed by silver blossoms",
  },
  lapisBloom: {
    src: "/images/lapis-bloom-danglers.webp",
    name: "Lapis Bloom Danglers",
    alt: "Silver flower studs with lapis lazuli triangle drops guarded by twin parrots",
  },
  emeraldGoddess: {
    src: "/images/emerald-goddess-drops.webp",
    name: "Emerald Goddess Drops",
    alt: "Antique silver goddess earrings crowned with rubies above carved emerald teardrops",
  },
  rubyChandbali: {
    src: "/images/ruby-pearl-chandbali.webp",
    name: "Ruby Pearl Crescent Drops",
    alt: "Oxidised silver crescent drop earrings with a ruby cluster crest and pearl heart",
  },
  abaloneElephant: {
    src: "/images/abalone-elephant-danglers.webp",
    name: "Abalone Elephant Danglers",
    alt: "Abalone shell lotus earrings with silver elephant motifs and pearl tassels",
  },
  chainCoupe: {
    src: "/images/chain-on-table.webp",
    name: "Artisan Chain Bracelets",
    alt: "Four silver link bracelets hung over the rim of a coupe glass on a copper cloth",
  },
  elephantRing: {
    src: "/images/ring-with-book.webp",
    name: "Enamel Elephant Ring",
    alt: "A silver and oxblood enamel elephant ring standing on a white page beside an open book and dried gypsophila",
  },
  ringInGlass: {
    src: "/images/rings-in-zar.webp",
    name: "Statement Ring and Curb Chain",
    alt: "A silver statement ring inside a glass phial with a heavy curb chain spilling from its mouth, on dark silk",
  },
  ringsWorn: {
    src: "/images/ring-and-hand.webp",
    // Shot against a blue sky, which is the one hue this palette does not
    // contain — optimize-media.mjs white-balances it warm on the way in.
    name: "Artisan Silver Cocktail Rings",
    alt: "A hand wearing two antique silver cocktail rings and an ornate cuff",
  },
} as const satisfies Record<string, JewelryImage>;

export type JewelryImageKey = keyof typeof JEWELRY_IMAGES;
