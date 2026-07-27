# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

The bundled Next.js is v16 — newer than most training data (cache components, Turbopack default, etc.). Its full docs live in `node_modules/next/dist/docs/` (`01-app/` for App Router guides and API reference); consult them before using any Next.js API.

## Commands

- `npm run dev` — start dev server (`http://localhost:3000`)
- `npm run build` — production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)

There is no test framework configured.

## What this app is

A single-page immersive 3D jewelry showroom ("VERDANT JEWELS"). The entire experience is one client-rendered route: `src/app/page.tsx` (`"use client"`, ~2000vh tall). There is no server-side data; the App Router is only providing the shell (`layout.tsx`, fonts, metadata).

## Architecture: everything is driven by scroll progress

Normalized scroll progress (`window.scrollY / maxScroll`, 0→1) is the single source of truth that three consumers derive from independently — they must stay in sync:

1. **3D camera** — `CameraController` in `src/components/3d/ShowroomCanvas.tsx` maps progress to camera Z travel (Z = 76 → −146).
2. **Rooms** — 19 rooms sit along the Z axis, 12 units apart: the six story rooms (Z = 72 → 12) in `src/components/3d/StoryRooms.tsx`, then the original thirteen (Z = 0 → −132) in `src/components/3d/RoomComponents.tsx`.
3. **Overlay cards** — `page.tsx` computes `activeZone = floor(progress * ZONE_COUNT)` (`ZONE_COUNT = 19`) and renders the matching entry of its `zones` array (titles, copy, CTAs). The first `STORY_ZONES = 6` entries are the numbered story chapters and also drive the right-hand chapter rail.

Adding/removing a zone touches all three: the `zones` array and `ZONE_COUNT` in `page.tsx`, and the room Z positions. The camera travel span (222 units) must stay `ZONE_COUNT × ~11.7` or the rooms drift out of their zone windows.

### Laying out a room

The camera flies straight down the axis, so a room's contents are only ever seen from `roomZ + 4` (zone start) to `roomZ − 7.7` (zone end):

- Put the focal object around `roomZ − 5`, so it is read from a distance for most of the zone instead of being passed immediately.
- Keep everything within `roomZ − 8`, and **never put an opaque full-width back wall in a room** — it blanks out the next room for the whole approach. Use hanging signs, side hedges or narrow panels instead of walls.
- Hold centrepieces slightly off the centre line (or below eye level, y ≈ 0.5) so the camera passes beside them rather than through them.

## Conventions

- **GSAP**: import `gsap`, `ScrollTrigger`, `useGSAP` from `@/lib/gsap` (registers plugins once), never from `"gsap"` directly.
- **Programmatic scrolling**: use `scrollToOffset()` from `@/store/scroll-store` — it routes through the Lenis instance (created in `SmoothScroll.tsx`, which wraps the app in `layout.tsx` and syncs Lenis with GSAP's ticker/ScrollTrigger). Direct `window.scrollTo` fights the smooth scroller. Lenis is disabled entirely under `prefers-reduced-motion`.
- **3D loading**: `ShowroomCanvas` is loaded via `next/dynamic` with `ssr: false`; keep three.js code out of the server bundle. Mind the perf constraints commented in `ShowroomCanvas.tsx` (dpr cap, only one shadow-casting spotlight — each shadow light is an extra render pass per frame).
- **3D materials**: `StoryRooms.tsx` shares one `MAT` table across all its meshes, passed as `material={MAT.x}` (a `<primitive>` object cannot be attached to more than one mesh). The shadow-casting lights only cover the original rooms near the origin, so story rooms fake contact shadows with `GroundShadow` discs.
- **Styling**: Tailwind v4, CSS-first — there is no `tailwind.config`. Theme tokens (`verdant-emerald`, `verdant-cream`, `verdant-gold`, `luxury-*`) and custom utilities (`glass-effect`, `glass-effect-gold`, `gold-gradient-text`, `gold-gradient-bg`) are defined in `src/app/globals.css` under `@theme`.
- **Path alias**: `@/*` → `src/*`.

## Dead code warning

`EntrancePedestal` (the ring + gem on a marble drum at Z = 0) is still exported from `RoomComponents.tsx` but is deliberately not mounted in `ShowroomCanvas.tsx` — it was removed from the start of the journey by request, not deleted.

Only `Navbar` from `src/components/sections/` is imported by the live page; the other section components (Hero, Collections, Testimonials, …) and several `src/components/3d/` files (`BackgroundCanvas`, `HeroRing`, `InteractiveViewer`, `ShowcaseModel`) are leftovers from an earlier sectioned layout and are not rendered. Don't assume editing them changes the site.
