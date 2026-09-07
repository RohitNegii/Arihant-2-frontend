import { JEWELRY_IMAGES } from "./jewelry";
import { homeMediaSources } from "./home-media";

/**
 * Bundled fallbacks. What the showroom hangs when the admin panel has nothing
 * for a slot, or the API cannot be reached — see `home-media.ts`.
 */

/** Framed pictures hung in the six wall niches of The Collection. */
export const DEFAULT_WALL_PICTURES: string[] = [
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
export const DEFAULT_FINALE_PICTURES: string[] = [
  JEWELRY_IMAGES.emeraldGoddess.src,
  // A hand wearing the pieces is a better last image than a second look at an
  // earring already hanging in three niches back up the hall.
  JEWELRY_IMAGES.ringsWorn.src,
];

/**
 * The photograph pinned to the drawing board on the workbench in The Craft —
 * the piece the jeweller is working from.
 */
export const DEFAULT_BENCH_REFERENCE = JEWELRY_IMAGES.emeraldGoddess.src;

/**
 * Photographs set into the base of the display plinth, running right round it.
 * They are spaced evenly around the drum, so the count sets how big each one
 * is. Six to ten reads well; past about twelve they get too narrow to make out.
 *
 * Listing the same files as the wall costs nothing extra: the loader caches by
 * URL, so they are fetched and decoded once for both.
 */
export const DEFAULT_PLINTH_PICTURES: string[] = [
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

/**
 * The pair standing either side of the film in Made for Moments, left first.
 * The film between them is not admin-managed.
 */
export const DEFAULT_MOMENTS_PICTURES: string[] = [
  JEWELRY_IMAGES.elephantRing.src,
  JEWELRY_IMAGES.ringInGlass.src,
];

/**
 * The house crest, hung on the entrance sign — the elephant mark on its own,
 * without the wordmark, because the plate underneath already carries the name.
 *
 * The artwork was supplied on white paper. It is lifted off it by
 * `scripts/optimize-media.mjs`, which is also where to change which of the
 * three supplied files this is: the other two are the full lockups, and either
 * would put the name on the sign twice. Not admin-managed for that reason — a
 * plain upload would hang a white box on the sign.
 */
export const BRAND_CREST = "/images/geetej-crest.webp";

/**
 * The necklace the muse wears in The Beginning — the real piece, cut off the
 * display bust it was photographed on and mapped onto a band that follows her
 * chest. See `Necklace` in `Jewellery.tsx`, and `optimize-media.mjs` for how
 * the cutout is made. Not admin-managed: an uncut photo smears across the band.
 */
export const MUSE_NECKLACE = "/images/necklace-muse.webp";

/**
 * The ring turning, shown in the gold frame of Made for Moments.
 *
 * 720x1280 at 30fps, 0.29MB — re-encoded from the 17MB 1080x1920 original in
 * `originals/display-pictures/`, by the command in the header of
 * optimize-media.mjs. `MadeForMoments` still withholds it on the low tier and
 * from anyone asking for reduced motion or to save data; they get the still.
 */
export const ATELIER_FILM = "/media/fancy-ring.mp4";

/* ------------------------------------------------------------------ *
 * Live values
 *
 * Read at render time, after `loadHomeMedia()` has resolved. Each falls back
 * to its default when the admin has nothing active for the slot.
 * ------------------------------------------------------------------ */

export function wallPictures(): string[] {
  const live = homeMediaSources("wall");
  return live.length ? live : DEFAULT_WALL_PICTURES;
}

export function plinthPictures(): string[] {
  const live = homeMediaSources("plinth");
  return live.length ? live : DEFAULT_PLINTH_PICTURES;
}

/**
 * Always exactly two — the closing scene indexes the pair directly, so a short
 * list would leave a blank panel. Topped up from the defaults.
 */
export function finalePictures(): string[] {
  return padToPair(homeMediaSources("finale"), DEFAULT_FINALE_PICTURES);
}

function padToPair(live: string[], fallbacks: string[]): string[] {
  const pair = live.slice(0, 2);
  for (const fallback of fallbacks) {
    if (pair.length >= 2) break;
    pair.push(fallback);
  }
  return pair.slice(0, 2);
}

/** Always exactly two — the room dresses a left and a right wing. */
export function momentsPictures(): string[] {
  return padToPair(homeMediaSources("moments"), DEFAULT_MOMENTS_PICTURES);
}

export function benchReference(): string {
  return homeMediaSources("bench")[0] ?? DEFAULT_BENCH_REFERENCE;
}
