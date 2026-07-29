# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

The bundled Next.js is v16 — newer than most training data (cache components, Turbopack default, etc.). Its full docs live in `node_modules/next/dist/docs/` (`01-app/` for App Router guides and API reference); consult them before using any Next.js API.

**`homepage.md` in the repo root is the deep reference for the homepage** — architecture, the numbers that must stay in sync, texture and lighting technique, the performance budget, and how to drive the app headlessly. Read it before non-trivial work on `/`.

## Commands

- `npm run dev` — start dev server (`http://localhost:3000`)
- `npm run build` — production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)

There is no test framework configured. Verification is visual — see `homepage.md` §9.

`npm run build` rewrites `next-env.d.ts` (one import path) and `npm run dev` rewrites it back. The file is tracked, so it will show as modified after either; restore it with `git checkout -- next-env.d.ts`. `tsconfig.tsbuildinfo` is also tracked and churns on every `tsc` run — it is a local cache, safe to ignore or untrack.

## What this app is

A single-page immersive 3D jewelry showroom ("VERDANT JEWELS"). The entire experience is one client-rendered route: `src/app/page.tsx` (`"use client"`, ~700vh tall). There is no server-side data; the App Router is only providing the shell (`layout.tsx`, fonts, metadata).

## Architecture: everything is driven by scroll progress

Normalized scroll progress (`window.scrollY / maxScroll`, 0→1) is the single source of truth that three consumers derive from independently — they must stay in sync:

1. **3D camera** — `CameraController` in `src/components/3d/ShowroomCanvas.tsx` maps progress to camera Z travel (Z = 76 → 8, i.e. `76 - progress * 68`).
2. **Rooms** — six story rooms sit along the Z axis 12 units apart (Z = 72 → 12) in `src/components/3d/StoryRooms.tsx`. The original thirteen exhibition rooms in `RoomComponents.tsx` are disabled — see Dead code below.
3. **Overlay cards** — `page.tsx` computes `activeZone = floor(progress * ZONE_COUNT)` (`ZONE_COUNT = 6`) and renders the matching entry of its `zones` array (titles, copy, CTAs). `STORY_ZONES = 6` entries are numbered story chapters and also drive the right-hand chapter rail.

Adding/removing a zone touches all three: the `zones` array and `ZONE_COUNT` in `page.tsx`, the room Z positions and mounts in `StoryRooms.tsx`, and the camera travel span in `ShowroomCanvas.tsx`. Keep `camera travel ≈ ZONE_COUNT × 12` or rooms drift out of their zone windows. (It is currently 68 for 6 zones rather than 72, so each room is read from slightly further away than the last — tolerable now, but it compounds if you add rooms.)

### Laying out a room

The camera flies straight down the axis, so a room's contents are only ever seen from about `roomZ + 4` (zone start) to `roomZ − 7.3` (zone end):

- Put the focal object around `roomZ − 5`, so it is read from a distance for most of the zone instead of being passed immediately.
- Keep everything within `roomZ − 8`, and **never put an opaque full-width back wall in a room** — it blanks out the next room for the whole approach. Use hanging signs, side hedges or narrow panels instead of walls.
- Hold centrepieces slightly off the centre line (or below eye level, y ≈ 0.5) so the camera passes beside them rather than through them.
- The floor is at y = −1.5; contact shadows sit just above it to avoid Z-fighting.

## Performance budget

The scene is draw-call bound, not triangle bound. `src/components/3d/quality.ts` resolves a `low`/`mid`/`high` tier once at startup from device hints, and holds every budget: dpr, shadows, texture resolution, foliage density, fog/far distance, refraction, door detail. **Force a tier with `?q=low`** to test a real device.

Rules that keep it fast — breaking any one of these has cost hundreds of draw calls before:

- **Instance repeated geometry.** Leaves are `InstancedMesh` clouds with per-instance colours (`LeafCloud` in `StoryRooms.tsx`), not one mesh each. Call `computeBoundingSphere()` after writing the matrices or the cull test uses the single-item bounds.
- **Keep the camera's far plane just past the fog.** Anything beyond the fog is solid background colour, but the renderer only culls what the far plane excludes.
- **Avoid `transmission`.** It makes three re-render the whole scene into an offscreen buffer every frame. Gated on the tier.
- **Every light costs**, shadows or not — each one adds work to every material's fragment shader. Every shadow-casting light additionally costs a full scene pass.
- **Procedural texture sizes go through `texSize()`.** Startup CPU scales with the square of the resolution, on the main thread.

## Conventions

- **Programmatic scrolling**: use `scrollToOffset()` from `@/store/scroll-store` — it routes through the Lenis instance created in `SmoothScroll.tsx`, which wraps the app in `layout.tsx` and drives Lenis from a plain rAF loop. Direct `window.scrollTo` fights the smooth scroller. Lenis is disabled entirely under `prefers-reduced-motion`, which is what makes headless testing possible.
- **GSAP**: if you ever need a real timeline, import `gsap`, `ScrollTrigger`, `useGSAP` from `@/lib/gsap` (registers plugins once), never from `"gsap"` directly. Nothing currently uses it — it was removed from `SmoothScroll` because it was ~130KB of the initial bundle on every route acting as a rAF ticker.
- **3D loading**: `ShowroomCanvas` is loaded via `next/dynamic` with `ssr: false`; keep three.js code out of the server bundle. The loading screen waits on `scene-ready.ts` (fired a few frames after the canvas draws) rather than a timer, with a failsafe measured from navigation start. The page root carries the fog colour so an early reveal looks deliberate.
- **3D materials**: `StoryRooms.tsx` shares one `MAT` table across all its meshes, passed as `material={MAT.x}` (a `<primitive>` object cannot be attached to more than one mesh, but the `material` prop is safe to reuse). The shadow-casting lights only cover the origin, so story rooms fake contact shadows with `GroundShadow` discs.
- **3D textures**: everything is procedural, drawn to a canvas at runtime in `procedural-textures.ts` — no image assets. Noise frequencies must be whole numbers or the textures stop tiling. Colour constants in there are *albedo*, not what you see: the scene renders roughly 2.5× brighter than the texture, so calibrate by sampling a render (`homepage.md` §6).
- **Styling**: Tailwind v4, CSS-first — there is no `tailwind.config`. Theme tokens (`verdant-emerald`, `verdant-cream`, `verdant-gold`, `luxury-*`) and custom utilities (`glass-effect`, `glass-effect-gold`, `gold-gradient-text`, `gold-gradient-bg`) are defined in `src/app/globals.css` under `@theme`.
- **Path alias**: `@/*` → `src/*`.

## Dead code warning

The **original thirteen-room exhibition** (Z = −12 → −132) is commented out in three matching places: the room mounts and their import in `ShowroomCanvas.tsx`, and the thirteen zone cards in `page.tsx`. Restoring it means uncommenting all three, setting `ZONE_COUNT = 19`, and restoring the camera travel to ×222. `RoomComponents.tsx` itself is still live — `StoryRooms` imports `LuxuryRing` from it.

`EntrancePedestal` (the ring + gem on a marble drum at Z = 0) is still exported from `RoomComponents.tsx` but is deliberately not mounted — it was removed from the start of the journey by request, not deleted.

Only `Navbar` from `src/components/sections/` is imported by the live page; the other section components (Hero, Collections, Testimonials, …) and several `src/components/3d/` files (`BackgroundCanvas`, `HeroRing`, `InteractiveViewer`, `ShowcaseModel`) are leftovers from an earlier sectioned layout and are not rendered. Don't assume editing them changes the site. `public/images/parquet.png` is referenced by nothing — the floor is procedural.

Pre-existing lint errors live in `BackgroundCanvas.tsx` (`prefer-const`) and `RoomComponents.tsx` (`react-hooks/purity`, `Math.random` in a `useMemo`). Not build-blocking; `build` does not lint.
