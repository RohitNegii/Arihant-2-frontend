import { JEWELRY_IMAGES } from "./jewelry";

/** Framed pictures hung in the six wall niches of The Collection. */
export const WALL_PICTURES: string[] = [
  JEWELRY_IMAGES.royalPeacock.src,
  JEWELRY_IMAGES.turquoiseChandelier.src,
  JEWELRY_IMAGES.rubyChandbali.src,
  JEWELRY_IMAGES.lapisBloom.src,
  JEWELRY_IMAGES.abaloneElephant.src,
  JEWELRY_IMAGES.jadeMedallion.src,
];

/**
 * The pair of photographs on the tall panels either side of the closing scene,
 * left first. Exactly two are shown; a longer list is ignored, which makes it
 * a convenient place to park alternatives.
 */
export const FINALE_PICTURES: string[] = [
  JEWELRY_IMAGES.emeraldGoddess.src,
  JEWELRY_IMAGES.royalPeacock.src,
];

/**
 * The photograph pinned to the drawing board on the workbench in The Craft —
 * the piece the jeweller is working from. One file; swap it for any other.
 */
export const BENCH_REFERENCE = JEWELRY_IMAGES.emeraldGoddess.src;

/**
 * Photographs set into the base of the display plinth, running right round it.
 * Add or remove freely — they are spaced evenly around the drum, so the count
 * sets how big each one is. Six to ten reads well; past about twelve they get
 * too narrow to make out.
 *
 * Listing the same files as WALL_PICTURES costs nothing extra: the loader
 * caches by URL, so they are fetched and decoded once for both.
 */
export const PLINTH_PICTURES: string[] = [
  JEWELRY_IMAGES.royalPeacock.src,
  JEWELRY_IMAGES.emeraldGoddess.src,
  JEWELRY_IMAGES.turquoiseChandelier.src,
  JEWELRY_IMAGES.peacockHexagon.src,
  JEWELRY_IMAGES.rubyChandbali.src,
  JEWELRY_IMAGES.lapisBloom.src,
  JEWELRY_IMAGES.abaloneElephant.src,
  JEWELRY_IMAGES.jadeMedallion.src,
];
