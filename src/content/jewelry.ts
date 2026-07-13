/**
 * Web-optimized product photography (1080×1350 WebP, served from public/images).
 * Full-resolution originals live in /originals/images (git-ignored).
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
    alt: "Gold carved peacock earrings with pink kundan petals and pearl clusters, resting on a wooden jewelry box",
  },
  turquoiseChandelier: {
    src: "/images/turquoise-chandelier-drops.webp",
    name: "Turquoise Chandelier Drops",
    alt: "Oxidised silver chandelier earrings lined with turquoise beads, ruby kundan and pearl tassels",
  },
  peacockHexagon: {
    src: "/images/peacock-hexagon-studs.webp",
    name: "Peacock Hexagon Studs",
    alt: "Two-tone hexagonal studs with a golden peacock relief and fluted silver drop",
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
    name: "Ruby Pearl Chandbali",
    alt: "Oxidised silver chandbali earrings with a ruby cluster crest and pearl heart",
  },
  abaloneElephant: {
    src: "/images/abalone-elephant-danglers.webp",
    name: "Abalone Elephant Danglers",
    alt: "Abalone shell lotus earrings carried by golden elephants with pearl tassels",
  },
} as const satisfies Record<string, JewelryImage>;

export type JewelryImageKey = keyof typeof JEWELRY_IMAGES;
