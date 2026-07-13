export const ZONE_COUNT = 13;

export interface NavLink {
  label: string;
  /** Showroom zone index (0-based) this link scrolls to. */
  zone: number;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Story", zone: 1 }, // History Tunnel
  { label: "Craftsmanship", zone: 4 }, // Crafting Atelier
  { label: "Collections", zone: 5 }, // Signature Collections
  { label: "Showcase", zone: 11 }, // Masterpiece Arena
];

export const NAV_CTA: NavLink = {
  label: "Book Consultation",
  zone: 12, // Create Your Forever Story
};

/** Scroll offset (px) that lands mid-way through the given zone. */
export function zoneScrollTarget(zone: number): number {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight || 1;
  const progress = Math.min((zone + 0.5) / ZONE_COUNT, 1);
  return progress * maxScroll;
}
