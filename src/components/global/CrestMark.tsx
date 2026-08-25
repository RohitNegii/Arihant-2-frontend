import Image from "next/image";

import { BRAND_CREST } from "@/content/gallery";

/**
 * The house crest as a small mark, for the places the interface needs the logo
 * in front of a line of text — the navbar lockup and the eyebrow pills.
 *
 * It always brings its own dark roundel, and that is the whole point of the
 * component. The artwork is ivory and gold, the two palest things in the
 * palette, and every pill it sits in is a cream card washed with more gold; on
 * its own it disappears. The roundel is the treatment the favicon already uses
 * and the ground the medallion in the 3D scene is built on, so this is the mark
 * looking like itself rather than a new invention.
 *
 * `size` is the roundel. Below about 16px the elephant stops resolving into
 * anything, so the callers that used a 10px sparkle come up to 16 rather than
 * passing the old number through — a smudge is worse than the icon it replaced.
 */
export default function CrestMark({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const height = Math.round(size * 0.76);
  // The source is 272x380, and the mark is never stretched to fit a square.
  const width = Math.round(height * 0.716);

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src={BRAND_CREST} alt="" width={width} height={height} priority />
    </span>
  );
}
