// Homepage photographs as set in the admin panel. Loaded once before the canvas
// mounts; on any failure the bundled defaults in gallery.ts stay in place.
import { API_URL } from "@/utils/api";

export interface HomeMediaItem {
  url: string;
  title: string;
  alt: string;
}

export type HomeMediaSlot = "wall" | "plinth" | "moments" | "finale" | "bench";

export type HomeMediaManifest = Partial<Record<HomeMediaSlot, HomeMediaItem[]>>;

let manifest: HomeMediaManifest = {};
let request: Promise<void> | null = null;

/** The manifest must never hold the loading screen open — see homepage.md §8. */
const FETCH_TIMEOUT_MS = 4000;

function resolve(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL.replace(/\/api$/, "")}${url}`;
  return url;
}

export function homeMedia(slot: HomeMediaSlot): HomeMediaItem[] {
  return manifest[slot] ?? [];
}

export function homeMediaSources(slot: HomeMediaSlot): string[] {
  return homeMedia(slot)
    .map((item) => item.url)
    .filter(Boolean);
}

export function loadHomeMedia(): Promise<void> {
  if (!request) request = fetchManifest();
  return request;
}

async function fetchManifest(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(`${API_URL}/home-media`, {
        cache: "no-store",
        signal: abort.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return;

    const body = await res.json();
    if (!body?.success || !body.media) return;

    const next: HomeMediaManifest = {};
    for (const slot of ["wall", "plinth", "moments", "finale", "bench"] as HomeMediaSlot[]) {
      const rows = Array.isArray(body.media[slot]) ? body.media[slot] : [];
      const items = rows
        .map((row: { url?: string; title?: string; alt?: string }) => ({
          url: resolve(row?.url ?? ""),
          title: row?.title ?? "",
          alt: row?.alt ?? "",
        }))
        .filter((item: HomeMediaItem) => item.url);
      if (items.length) next[slot] = items;
    }

    manifest = next;
  } catch {
    // Defaults stand.
  }
}
