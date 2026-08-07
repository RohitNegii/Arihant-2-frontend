/**
 * The display bust's shape and body landmarks, in its own local units (bust
 * centred on the Y axis, facing +Z, so the camera flying down -Z reads it head
 * on).
 *
 * The bust geometry (`Mannequin.tsx`) and every piece it wears
 * (`Jewellery.tsx`) both read from here — move a landmark and the figure and
 * its jewellery stay in agreement. Everything is at scale 1; `FountainBust` in
 * `StoryRooms.tsx` scales the whole group.
 */

/** Where the torso is cut off into a display bust. */
export const CUT_Y = -0.28;

/**
 * Lathe profile of the bust (radius, height), ordered bottom → top: the chest
 * opening into shoulders and a slender neck.
 */
export const TORSO_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0, CUT_Y],
  [0.47, CUT_Y],
  [0.57, -0.02],
  [0.585, 0.16],
  [0.52, 0.3],
  [0.36, 0.42],
  [0.2, 0.55],
  [0.155, 0.68],
  [0.14, 0.85],
  [0.135, 1.05],
];

/**
 * Radius of the torso at a given height. The bust is a lathe, so this is the
 * whole silhouette — which is what lets a necklace hug it at every angle
 * instead of being hand-fitted at the front and floating at the sides.
 */
export function torsoRadiusAt(y: number): number {
  const profile = TORSO_PROFILE;
  if (y <= profile[0][1]) return profile[0][0];

  for (let i = 1; i < profile.length; i++) {
    const [radius, top] = profile[i];
    if (y <= top) {
      const [prevRadius, bottom] = profile[i - 1];
      return (
        prevRadius + ((radius - prevRadius) * (y - bottom)) / (top - bottom)
      );
    }
  }
  return profile[profile.length - 1][0];
}

export const ANATOMY = {
  /** Ellipsoid head: centre + radii (x = width, y = height, z = depth). */
  head: {
    center: [0, 1.42, 0] as const,
    radii: [0.36, 0.45, 0.39] as const,
  },
  /** Tip of the nose form on the face's front. */
  nose: [0, 1.38, 0.385] as const,
  /**
   * Nose stud, on the left nostril — the traditional nath side. It has to sit
   * *outside* the head ellipsoid (z ≈ 0.383 at this height) or it vanishes
   * inside the face.
   */
  nosePin: [-0.058, 1.365, 0.392] as const,
  ears: {
    left: [-0.365, 1.4, 0.01] as const,
    right: [0.365, 1.4, 0.01] as const,
  },
  /** How far out from the ear the earring hangs — clear of the ear pad. */
  earOffset: 0.03,
  /** Where the maang tikka drop rests, and where its chain starts. */
  forehead: [0, 1.6, 0.345] as const,
  crown: [0, 1.84, 0.16] as const,
  /**
   * Necklace strands, each a loop that sits close at the back of the neck and
   * falls by `frontDrop` at the front (θ = 0 faces +Z). The loop's radius is
   * taken from `torsoRadiusAt` at whatever height it has reached, so a strand
   * that drops further automatically widens onto the chest, exactly as a chain
   * does. Only the first strand carries the pendant.
   */
  strands: [
    { backY: 0.82, frontDrop: 0.36, bead: 0.021 },
    { backY: 0.79, frontDrop: 0.6, bead: 0.016 },
  ],
  /** Gap between a bead's surface and the skin. */
  strandClearance: 0.008,
  /**
   * Pendant centre. Pushed forward of the lowest bead rather than hung
   * straight below it: the chest bulges out faster going down than the drape
   * does, so a pendant falling vertically would end up inside it.
   */
  pendant: [0, 0.41, 0.44] as const,
} as const;
