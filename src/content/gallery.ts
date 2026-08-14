import { JEWELRY_IMAGES } from "./jewelry";

/** Framed pictures hung in the six wall niches of The Collection. */
export const WALL_PICTURES: string[] = [
  JEWELRY_IMAGES.royalPeacock.src,
  JEWELRY_IMAGES.chainCoupe.src,
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
  // A hand wearing the pieces is a better last image than a second look at an
  // earring already hanging in three niches back up the hall.
  JEWELRY_IMAGES.ringsWorn.src,
];

/**
 * The photograph pinned to the drawing board on the workbench in The Craft —
 * the piece the jeweller is working from. One file; swap it for any other.
 */
export const BENCH_REFERENCE = JEWELRY_IMAGES.emeraldGoddess.src;

/**
 * The house crest, hung on the entrance sign — the elephant mark on its own,
 * without the wordmark, because the plate underneath already carries the name.
 *
 * The artwork was supplied on white paper. It is lifted off it by
 * `scripts/optimize-media.mjs`, which is also where to change which of the
 * three supplied files this is: the other two are the full lockups, and either
 * would put the name on the sign twice.
 */
export const BRAND_CREST = "/images/geetej-crest.webp";

/**
 * The necklace the muse wears in The Beginning — the real piece, cut off the
 * display bust it was photographed on and mapped onto a band that follows her
 * chest. See `Necklace` in `Jewellery.tsx`, and `optimize-media.mjs` for how
 * the cutout is made.
 */
export const MUSE_NECKLACE = "/images/necklace-muse.webp";

/**
 * The ring turning, shown in the gold frame of Made for Moments.
 *
 * Full size and unencoded at 18MB — far too big to hand to a phone, which is
 * why `MadeForMoments` will not fetch it at all unless the device is on the
 * high tier, not touch, not asking for reduced motion and not asking to save
 * data. Everyone else gets the still. The re-encode that makes this a ~1.5MB
 * file is written out in the header of optimize-media.mjs.
 */
export const ATELIER_FILM = "/media/fancy-ring.mp4";

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
  JEWELRY_IMAGES.chainCoupe.src,
  JEWELRY_IMAGES.emeraldGoddess.src,
  JEWELRY_IMAGES.turquoiseChandelier.src,
  JEWELRY_IMAGES.peacockHexagon.src,
  JEWELRY_IMAGES.rubyChandbali.src,
  JEWELRY_IMAGES.lapisBloom.src,
  JEWELRY_IMAGES.abaloneElephant.src,
  JEWELRY_IMAGES.jadeMedallion.src,
];
