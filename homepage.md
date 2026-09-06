# The VERDANT JEWELS homepage

One scroll-driven 3D walk from the street, through a shop door, down a corridor of six rooms. Everything on `/` is a function of one number: how far down the page you are.

This document is the map. It covers what exists today, the numbers that have to stay in sync, and the techniques that produced the current look — so the next change starts from here instead of from zero.

---

## 1. File map

| File | Role |
| --- | --- |
| `src/app/page.tsx` | The whole route. `"use client"`, a 700svh journey (420svh on touch) with `Footer` below it. Owns the zone copy, the overlay cards, the chapter rail, the progress bar. |
| `src/components/3d/ShowroomCanvas.tsx` | The `<Canvas>`: camera driver, global lighting, fog, the gallery floor, the environment. |
| `src/components/3d/StoryRooms.tsx` | The six rooms and every prop in them. Also owns `MAT`, the shared material table. The big file (~2000 lines). |
| `src/components/3d/EntranceDoor.tsx` | One door leaf — frame, raised panels, hinges, pull handle, kickplate. Mounted twice, mirrored. |
| `src/components/3d/procedural-textures.ts` | Every texture in the scene, drawn to a canvas at runtime. No image files. |
| `src/components/3d/quality.ts` | Device tier (`low`/`mid`/`high`), the phone profile, and every performance budget. Force a tier with `?q=`. |
| `src/components/3d/preload.ts` | Full preload: the progress bus the loading bar reads, the asset and procedural-texture priming, and the `fullPreload()` switch. Force it with `?preload=`. |
| `src/components/3d/scene-ready.ts` | One-shot signal that the canvas has drawn, so the loading screen can wait on something real. |
| `src/components/SmoothScroll.tsx` | Creates Lenis and drives it from a plain rAF loop. Wraps the app in `layout.tsx`. |
| `src/store/scroll-store.ts` | Holds the Lenis instance; exports `scrollToOffset()`. |
| `src/content/jewelry.ts` | The photography shown in the side showcase panel. |
| `scripts/optimize-media.mjs` | Turns `originals/` into what is served: the WebP photography in `public/images/`, and the tab icons (`favicon.ico`, `icon.png`, `apple-icon.png`) cut from the house crest. Run by hand, not wired into the build. |

There is no server-side data. The App Router only provides the shell.

---

## 2. The one invariant: scroll progress

`progress = window.scrollY / (scrollHeight - innerHeight)`, clamped to 0–1.

Three consumers derive from it **independently**. Nothing passes the value between them, so if you change one you must change the others by hand.

1. **The camera** — `CameraController` in `ShowroomCanvas.tsx`:
   `targetZ = 76 - progress * 68`, lerped at `0.05`/frame.
2. **The rooms** — fixed Z positions in `StoryRooms.tsx`: `STORY_ROOM_Z = [72, 60, 48, 36, 24, 12]`, 12 units apart.
3. **The overlay cards** — `page.tsx`: `activeZone = floor(progress * ZONE_COUNT)`, `ZONE_COUNT = 6`.

### The numbers, worked out

Camera travel is 68 units over 6 zones, so one zone is **11.33 units** of travel, while rooms sit **12 units** apart. They do not match exactly.

Camera Z when zone *n* becomes active: `76 - 11.33n`. Room *n* sits at `72 - 12n`. The gap between them is `4 + 0.67n` — so room 0 is first seen from 4 units away and room 5 from 7.3 units away. Each room is read over a window from roughly `roomZ + 4` down to `roomZ - 7.3`.

That drift is small enough to live with today. If you add rooms it compounds, so **keep `camera travel ≈ ZONE_COUNT × 12`** — with 6 zones that would be 72, not 68.

### Adding or removing a zone

Three places, always together:

- `ZONE_COUNT` and the `zones` array in `page.tsx`
- `STORY_ROOM_Z` and the mounts in `StorySection` (`StoryRooms.tsx`)
- the camera travel span in `CameraController` (`ShowroomCanvas.tsx`)

`STORY_ZONES` in `page.tsx` controls how many leading zones are numbered chapters and appear in the right-hand rail. It is currently equal to `ZONE_COUNT`.

---

## 3. Laying out a room

The camera flies straight down the Z axis at eye height `y ≈ 0.5` with a 45° FOV. It never turns (beyond a few degrees of mouse parallax) and never stops. That constrains everything:

- **Put the focal object near `roomZ - 5`.** Anything at the room's near edge is passed within a second; anything at `-5` is read from a distance for most of the zone.
- **Keep contents within `roomZ - 8`**, or they belong to the next room.
- **Never put an opaque full-width wall at the back of a room.** It blanks out the next room for the entire approach. Use hanging signs, side hedges, or narrow panels — the interiors in `GrandEntrance` are open along Z for exactly this reason. The one exception is `YoursForever`: nothing follows it, so it is the only room that can be closed, and its back wall and apse are what stop the journey ending in cream void. `MadeForMoments` used to carry a panel across the back and is now the proof of the rule: walls, ceiling and panel are all gone, and what is left is three framed pieces standing on a runner with the finale open behind them.
- **Hold centrepieces off the centre line** (or below eye level, `y ≈ 0.5`) so the camera passes beside them rather than through them. The entrance vitrine sits at `x = 1.15` and balances the copy card, which is on the left.
- **The floor is at `y = -1.5`.** Props stand on it; contact shadows sit at `-1.47` or so to avoid Z-fighting.

---

## 4. The overlay layer (`page.tsx`)

A fixed-position HTML layer over the canvas. Five pieces:

- **Zone card** — bottom sheet on mobile, left panel from `md`. Re-keyed on `activeZone` so framer-motion cross-fades it. Numbered chapters get a serif numeral and an ornament divider; unnumbered zones get a tag chip instead.
- **Chapter rail** — the numbered chapters, visible while `activeZone < STORY_ZONES`. Each button calls `goToZone`. Two layouts off one `ChapterDot`: a vertical rail fixed right from `md` up, and below that a horizontal strip riding on top of the zone card, because the card is a full-width bottom sheet on a phone and leaves nothing beside it.
- **Side showcase** — fixed right, `lg` and up. Real photography for zones that set `image`, with a slow float loop and gold corner accents.
- **Category finale** — takes over from the zone card past `FINALE_AT`. Anchored under the navbar on mobile and centred from `md` up. It is the one card that is opaque rather than glass: it is the last thing the visitor is asked to act on, and the showroom sign sits directly behind it.
- **Progress indicator** — bottom left. Written directly to the DOM via refs in the scroll handler, deliberately not React state: it updates every frame and re-rendering the page for it would be wasteful.
- **`LoadingScreen` / `MouseFollower` / `Navbar`** — mounted unconditionally.

`goToZone(n)` scrolls to `((n + 0.25) / ZONE_COUNT) * journeySpan()` — a quarter into the zone, so you land looking at the room rather than on its boundary.

**Always scroll through `scrollToOffset()`** from `@/store/scroll-store`. It routes through Lenis. A direct `window.scrollTo` fights the smooth scroller. (Lenis is disabled entirely under `prefers-reduced-motion`, which is what makes headless testing possible — see §9.)

---

## 5. The 3D layer

### Canvas setup

```text
camera   [0, 0.5, 76], fov 45, near 0.5, far from the tier
dpr      tier-driven      high-DPI displays otherwise quadruple the pixel work
shadows  "percentage"     PCFShadowMap; PCFSoftShadowMap is deprecated in this three version
fog      #E3D9C6, 8 → tier-driven; must stay just inside the far plane
```

Everything marked tier-driven comes from `quality.ts` — see §8.

The container div is `bg-[#E3D9C6]`, matching the fog, so the scene dissolves into the page background. The page root in `page.tsx` carries the same colour, because the canvas arrives in a lazy chunk and the page may be revealed before it.

`ShowroomCanvas` is loaded via `next/dynamic` with `ssr: false`. Keep three.js out of the server bundle.

### The lighting budget

Every shadow-casting light is a **full extra scene render pass per frame**, and every light at all — shadows or not — adds work to the fragment shader of every material. Keep the list short.

| Light | Where | Shadows |
| --- | --- | --- |
| `directionalLight` `[6, 9, 6]` | global sun | tier-driven, camera ±9 around the origin |
| `spotLight` `[2.5, 7, 4]` | entrance key | tier-driven |
| `spotLight` in `EntranceLight` | the grand entrance at Z 72 | tier-driven, finite distance |
| `spotLight` fill in `EntranceLight` | cool bounce from the opposite side | no |
| three `pointLight`s in `StorySection` | warm practicals at Z 65 / 42 / 31 | no |
| `ambientLight` 0.15 + `hemisphereLight` 0.4 | base fill | n/a |

Two more spotlights used to sit at Z −36 and −132, aimed at the disabled exhibition. They lit nothing and were removed.

**The directional light's shadow camera covers ±9 units around the origin — the story rooms are at Z 12 to 72, entirely outside it.** That is why story-room props fake their shadows with `GroundShadow` discs instead of casting real ones.

An `<Environment>` with four `Lightformer` softboxes gives the metals the long highlight streaks of product photography. It renders once (`frames={1}`) and costs nothing per frame.

### Materials

`MAT` in `StoryRooms.tsx` is one shared table, passed as `material={MAT.x}`. Building a material per mesh in a scene this dense is what turns a 60fps walk into a 30fps one.

A `<primitive>` object cannot be attached to more than one mesh, but the `material={...}` prop is safe to reuse — always use the prop.

---

## 6. Procedural textures

`procedural-textures.ts` draws every texture to a `<canvas>` at runtime. No image assets, nothing to download, and the tiling is exact because the noise is written to wrap.

| Function | Produces |
| --- | --- |
| `paintedWoodMaps()` | Lacquered hardwood — the doors |
| `plasterMaps()` | Lime plaster — every wall, plus the planters |
| `stoneSlabMaps()` | Large-format limestone slabs — the floor |
| `brassMaps()` | Brushed, lightly aged brass — door furniture |
| `leafMaps()` | Leaf colour / alpha / normal / roughness |
| `contactShadowMap()` | Radial falloff for the fake contact shadows |

Each is memoised in a module-level cache and returns `null` when there is no DOM, so importing the module on the server is safe. Resolutions run through `texSize()`, which scales them by the device tier — startup CPU scales with the square of these numbers.

### Rules that bit us, in order

**Noise frequencies must be whole numbers.** `fbm(n, u * 2.5, …)` does not tile, and every texture repeat boundary then shows up on the wall as a visible seam. Integer frequencies only.

**Keep the two axis frequencies close.** `fbm(n, u * 9, v * 5, …)` stretches its features into vertical stripes, which reads as a rendering artefact rather than a surface.

**Size tiling in world units, not repeat counts.** The original floor material hard-coded `repeat.set(3, 3)`; on a 60×300 plane that stretched one tile across 100 units and the pattern vanished entirely. `stoneSlabSurface(worldW, worldD)` takes the surface's footprint and derives the repeats from `SLAB_TILE_W` / `SLAB_TILE_D`, so a 300-unit floor and a doorstep get identically sized stones.

**Roughness maps multiply.** Three multiplies the material's `roughness` scalar by the map, so the scalar is a *ceiling*, not a base. Set it to 1 when a map is doing the work. It also means dropping a normal map onto a material can quietly halve a carefully chosen roughness.

**Colour maps multiply too.** `plasterMaps()` returns a near-white tint map on purpose: it modulates each wall's own colour instead of replacing it, so one texture serves the facade, the halls, the vaults and the planters.

### Calibrating a colour against the lighting

This is the single most useful trick in the project, and it is not obvious.

The scene is lit by three spotlights, a sun, a hemisphere light and a studio environment, then ACES tone-mapped. **A surface renders roughly 2.5× brighter than its texture.** Painting the intended colour into a texture produces near-white.

So texture constants like `SLAB_BASE` are *albedo*, not the colour you see. Derive them by measurement:

1. Screenshot the rendered scene (§8).
2. Sample pixels on the surface — decode the PNG into a canvas and read `getImageData`.
3. With two (albedo → rendered) pairs, fit `rendered = k · albedo^p` per channel and solve for the albedo that produces your target.
4. Apply, re-render, re-measure. It converges in two or three passes.

Current values: `SLAB_BASE = [62, 54, 37]` renders as about `#96856a`. **These are only valid for the current light rig — re-measure if the lighting is ever retuned.**

---

## 7. Detailing recipes

What actually made things stop looking like untextured primitives, in rough order of payoff:

**Contact shadows.** A flat-opacity disc gives every object a rubber-stamp edge. `GroundShadow` uses a radial-gradient alpha map on a *square* plane — a circle clips the gradient back to a hard rim — and takes `stretch` / `angle` so a pot throws an ellipse consistent with the key light rather than a symmetrical blob.

**Env intensity on large matte surfaces.** At full strength the cream studio environment lays a flat sheen across a whole wall and its texture disappears. The facade runs `envMapIntensity: 0.45`, the planters `0.4`. This is usually the fix when a surface "has a texture but looks like painted card".

**Lathe profiles need doubled corner points.** `latheGeometry` averages normals along the profile, so a pot's collar softens into a bulge unless you push each corner vertex twice.

**Two scales of variation.** One noise frequency reads as a uniform rash. Broad blotches with finer patchiness inside them read as a surface. The plaster tint map layers drift at frequency 3 with patchiness at 7.

**Reveals make corners.** The facade is 0.5 thick, so the doorway has real depth — but with the same stone on the face and the return, the corner was invisible. Lining the return in a darker stone and leaving a narrow quirk recess is what draws the arris.

**Alpha-cut leaves, not blobs.** Leaves are alpha-tested planes (`alphaTest: 0.5`, not `transparent`), which keeps them in the opaque pass — a few hundred leaves need no depth sorting and still cast correct shadows. The blade is cupped in the geometry; the midrib, lateral veins and margin darkening live in the texture; a roughness map keeps the blade waxy and the veins matt. Three tints rather than two, because a bush where every other leaf matches reads as a swatch.

**Text in-world.** `TextPlane` bakes text to a canvas texture in the page's own serif. Cheaper than drei's `<Html>` (no DOM node per label) and it stays fogged and lit with the rest of the scene.

---

## 8. Performance and the quality tiers

The scene was authored on a desktop with a discrete GPU. On a mid-range phone the first version cost roughly **1,950 draw calls a frame** and generated ~20MB of procedural texture on the main thread before it could show anything. `quality.ts` now resolves a `low` / `mid` / `high` tier once at startup and every budget knob lives in that one file.

Detection uses `navigator.deviceMemory` (Chromium only — absent on Safari), `hardwareConcurrency` and `(pointer: coarse)`. **Append `?q=low`, `?q=mid` or `?q=high` to force a tier** — that is how you check a real device against a budget it would not otherwise be assigned.

| | low | mid | high | **phone** |
| --- | --- | --- | --- | --- |
| dpr | 1–1.5 | 1–2 | 1–1.75 | **2–3** (capped at the real ratio) |
| shadows | off | 1024² | 2048² | off |
| texture scale | ½ | ¾ | 1 | **1** |
| framed photos | 192px | 320px | 512px | **512px** |
| foliage | 35% | 60% | 100% | **100%** |
| fog / far plane | 28 / 32 | 42 / 46 | 42 / 46 | **42 / 46** |
| refraction | fake | fake | real | fake |
| draw calls | ~310 | ~575 | ~575 | ~575 |

**A touch device now gets its own profile rather than being sorted into `low`
or `mid`** — `mobilePreset()` in `quality.ts`. It reports its tier as `high`,
which is the point: every `Q.tier` branch in the scene (mannequin segments and
clearcoat, ring prongs and facets, necklace beads, bench trim, the picture
downscale) upgrades from one place. Shadows and `transmission` stay off, because
neither is a resolution and both are charged every frame for the whole journey
rather than once at the door — see the two entries below.

The dpr is what actually fixed the blur. A phone's device pixel ratio is
2.5–3.5, so drawing at 1 or 1.5 was rendering a quarter of the panel and letting
the compositor upscale it. Both ends of the range matter: `AdaptiveResolution`
in `ShowroomCanvas.tsx` wraps drei's `PerformanceMonitor` and drops to `Q.dpr[0]`
on sustained decline, so the floor of 2 is what stops a struggling device
falling back to mush. `?q=low`, `?q=mid` and `?q=high` still force the graded
tiers on a phone — that is how you check a real device against a budget it would
not otherwise be given, and `?q=` also opts out of the phone profile entirely.

MSAA is on at every tier: it is comparatively cheap on tile-based mobile GPUs
and it is what removes the stair-stepping on the door and jamb edges.

### Full preload

`preload.ts` holds the door until the whole show is resident — the opposite
trade from the graded tiers: a longer wait at the entrance instead of a soft
picture that never sharpens, or five unannounced stalls as each room is built
under the visitor mid-scroll. **On every device**, not just touch; `?preload=off`
restores the progressive reveal.

It went in for phones, where the blur was the complaint and the phone profile
is only affordable because of it. The reason it stayed is not a mobile reason:
one wait at a door that says what it is doing reads as deliberate, and the same
work spread through the journey reads as a slow site.

Four phases, each reporting to the loading bar. The weights are measured shares,
not guesses:

| phase | weight | what it does |
| --- | --- | --- |
| `assets` | 0.15 | Decodes all 14 photographs and buffers the film. Started from `LoadingScreen`, so it overlaps the three.js chunk download. |
| `textures` | 0.15 | Draws all eight procedural surfaces, one per task with a paint between. **1.3s** measured, of which the 1024² stone slab is 633ms. |
| `shaders` | 0.45 | `compileAsync` per room, then once over the whole scene — 11 units, a paint between each. |
| `warmup` | 0.25 | Flies the camera 76 → 8 over 28 frames so every mesh is really drawn — compilation does not upload vertex buffers, only a draw does. |

#### What the wait is actually made of

Profiled cold on an integrated GPU (headless Edge, Intel UHD), **57% of all CPU
to first paint is `renderBufferDirect` → `getUniforms`** — one 19.7-second task.
The scene builds 41 shader programs, and the expensive moment is not linking
them but three's first uniform-location query on each, which is what makes the
driver finish compiling. That happens inside the *first ordinary render*, before
`ScenePrewarm` has mounted, which is why its own `compileAsync` calls come back
in tens of milliseconds: they are only picking up the rooms that first render
did not have in frustum. The far plane is 46 and the corridor is 68 deep, so
that is always the last two.

**A cold visit measured 25.5s; the same page on a second visit was 7.1s.** The
difference is the browser's on-disk compiled-program cache. That gap is why the
loading screen's failsafe is 40s and not 30 — 30 cleared the warm case
comfortably and lost the cold one, and it lost it in the ugliest available way,
firing mid-warm-up with the bar jumping 30% straight to 100%.

None of this is cost the preload *adds*. It is the same work, moved in front of
the visitor instead of underneath them. Cutting it down means fewer distinct
programs, which is a materials job, not a loading one.

Two smaller things that cost more thought than expected:

- **Whoever draws the procedural textures first pays for them.** The rooms build
  them at module scope, so importing the 3D chunk draws all eight inside one
  unbroken task. `page.tsx` holds the canvas mount behind `preloadTextures()`
  so the preloader wins that race and the rooms' own calls hit a warm cache.
- **The loading bar cannot animate on a blocked main thread.** The longest wait
  behind the screen is one unbroken task — the 19.7s first render above — and a
  `width` transition is laid out on that thread. The bar is a
  `transform: scaleX()` with a long decelerating ease, which the compositor
  keeps running through the block, the way the spinner above it already did.
  Splitting that task by mounting rooms one per frame is the remaining fix and
  has not been done — it would make the bar move through the whole wait, but it
  puts a re-suspending boundary under the entire scene, so it is not free.

### What actually cost the frames

Measured, in order of payoff:

1. **Every leaf was its own mesh.** 500+ draw calls for foliage. They are now `InstancedMesh` clouds with the three tints applied as per-instance colours against one white-based material — a whole bush is one call. Instanced meshes need `computeBoundingSphere()` after the matrices are written, or the cull test uses the single-leaf bounds and the cloud pops out of view.
2. **No far plane.** Fog reached full opacity at 42 but the camera's far plane was the default 2000, so every room behind the haze was still being drawn. Nothing culls what the far plane does not exclude.
3. **`transmission` on the vitrine glass and gemstones** makes three re-render the whole scene into an offscreen buffer every frame. Below `high` they fall back to plain transparency with a little extra emissive.
4. **Two spotlights aimed at the disabled exhibition** at Z −36 and −132. They lit nothing, but every light adds work to every material's fragment shader.
5. **`MAT.stonePaver` was dead** — nothing referenced it, yet `paverMaps()` still generated three 1024² textures at startup. Deleted.
6. Doors carry ~32 meshes per leaf. Hinges collapse to a single cylinder below `high` (`doorDetail`).

### Startup, and slow connections

The payload is ~800KB compressed, most of it three.js in a lazily-loaded chunk. On slow 3G that alone is ~9s, so the startup experience matters more than the download:

- The loading screen used to be a **fake timer** that ran to 100% in ~1.7s regardless. On a fast connection that was 1.7s of waiting for nothing; on a slow one it dismissed itself while three.js was still downloading and handed over an empty canvas.
- On the desktop it now creeps to 90% and waits for a real signal — `scene-ready.ts`, fired by `ReadySignal` a few frames after the canvas starts drawing (frame one is before textures upload and shaders compile).
- **Under full preload — the default everywhere — the bar is real**, driven straight from the four phases above, and the screen is dismissed by `onPreloadComplete` rather than by the canvas drawing. The creep-to-90 timer is now only the `?preload=off` path.
- Both the minimum (900ms) and the failsafe are measured from **navigation start**, not from mount. On a throttled phone the component does not hydrate for several seconds, so a budget counted from mount lands seconds late. The failsafe is 7s on the `?preload=off` path and 40s under full preload, which is loading the entire show rather than waiting for a first frame — see the cold/warm measurements above for why 40.
- Past the failsafe the page is revealed regardless and the canvas fades in when it arrives. For that to look deliberate the **page root carries the fog colour** (`bg-[#E3D9C6]`) — the canvas paints the same colour but lives in the lazy chunk, so without it the copy sits on bare white.

GSAP and ScrollTrigger were ~130KB of the *initial* bundle on every route, used only to give Lenis a ticker — nothing has ever registered a ScrollTrigger. `SmoothScroll` now uses a plain rAF loop. `@/lib/gsap` still exists if a real timeline is ever wanted.

### Measuring it yourself

Draw calls: wrap `drawElements`/`drawArrays` on both `WebGLRenderingContext` and `WebGL2RenderingContext` prototypes via `addInitScript`, then divide calls-per-second by a **single dedicated rAF loop's** FPS. Do not count frames by wrapping `requestAnimationFrame` globally — several independent rAF loops run on this page and the count comes out inflated, which deflates calls-per-frame by the same factor.

---

## 9. Running and verifying

```
npm run dev      # http://localhost:3000 (in my system this can be 5000 also, i have also changed this sometimes in package.json like -p 5000)
npm run build
npm run lint     # flat config in eslint.config.mjs
```

There is no test framework. Verification is visual.

Notes from doing this repeatedly:

- The system default Node may be 18, which is too old for Next 16 (needs ≥ 20.9). Invoke a newer one directly rather than switching globally.
- Next refuses to start a second dev server for the same directory — check whether one is already running and drive that instead of killing it.
- First dev compile takes 1–2 minutes. Poll for a 200 before driving.

### Headless screenshots

No Playwright in the repo. Install `playwright-core` in a scratch directory and launch the system Edge:

```js
chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--hide-scrollbars", "--ignore-gpu-blocklist"],
});
```

**Headless Edge gets real hardware WebGL here** — ANGLE over D3D11, with
`KHR_parallel_shader_compile` — so do not reach for
`--enable-unsafe-swiftshader`. It was in these notes for a while and it forces
software rasterisation, which is fine for a screenshot and useless for a
measurement: it made shader compilation look like the dominant cost of startup
when it is a fifth of it, and it inflated every timing on this page by 2–3x.
Check what you actually got with `WEBGL_debug_renderer_info` before trusting a
number.

- `page.emulateMedia({ reducedMotion: "reduce" })` disables Lenis, so plain `window.scrollTo` drives zones. Otherwise Lenis fights programmatic scroll. It also suppresses the film in Made for Moments — `filmAllowed()` honours the same preference — so the gold frame shows its still.
- Emulate a phone with `isMobile: true, hasTouch: true` in the browser context, not just a narrow viewport: everything mobile keys off `(pointer: coarse)`, which a viewport alone does not set.
- Scroll to zone *n* with `window.scrollTo(0, p * (scrollHeight - innerHeight))` where `p = n / ZONE_COUNT`.
- **Wait ~4.5s after each scroll.** The camera lerps at `SCROLL_TRACKING`/frame and the entrance doors animate on the same easing — screenshot too early and you catch the doors mid-swing.
- The loading screen waits on real work, not a timer. Poll for `Initializing Exhibition` to leave the DOM rather than sleeping. On hardware WebGL, budget ~25s for a cold load and ~7s once the browser's program cache is warm — and note that a fresh `browserContext` is a cold load every time, which is the difference between those two numbers.
- Viewport ≥ 1024px wide to see the side showcase panel.

### Known noise, not regressions

- A hydration-mismatch console error under reduced-motion emulation — framer-motion renders different initial styles. Environment artefact.
- Lint errors in `src/components/sections/*` (other than `Navbar`) and in `LaboratoryDiamond`'s `Math.random` in a `useMemo`. Pre-existing, and `build` does not lint.

---

## 10. Disabled and dead code

Do not assume editing these changes the site.

**The original thirteen-room exhibition** ran after the story journey, from Z −12 back to Z −132. It is commented out in three matching places: the room mounts in `ShowroomCanvas.tsx`, its import there, and the thirteen zone cards in `page.tsx`. Restoring it means uncommenting all three, setting `ZONE_COUNT = 19`, and restoring the camera travel to ×222. Its component file `RoomComponents.tsx` is still live, though — `StoryRooms` imports `LuxuryRing` from it.

**`EntrancePedestal`** (ring + gem on a marble drum at Z 0) is still exported from `RoomComponents.tsx` and deliberately not mounted. Removed from the start of the journey by request, not deleted.

**Leftovers from an earlier sectioned layout:** everything in `src/components/sections/` except `Navbar`, and `BackgroundCanvas` / `HeroRing` / `InteractiveViewer` / `ShowcaseModel` in `src/components/3d/`.

**`public/images/parquet.png`** — a dark walnut herringbone, referenced by nothing. The floor is procedural.

---

## 11. Conventions

- **GSAP**: import `gsap`, `ScrollTrigger`, `useGSAP` from `@/lib/gsap` (registers plugins once), never from `"gsap"`.
- **Styling**: Tailwind v4, CSS-first. There is no `tailwind.config`. Theme tokens (`verdant-emerald`, `verdant-cream`, `verdant-gold`, `luxury-*`) and utilities (`glass-effect`, `glass-effect-gold`, `gold-gradient-text`, `gold-gradient-bg`) live in `src/app/globals.css` under `@theme`.
- **Path alias**: `@/*` → `src/*`.
- **Next.js is v16** — newer than most training data (cache components, Turbopack by default). Full docs ship in `node_modules/next/dist/docs/`. Read the relevant guide before using an API.
