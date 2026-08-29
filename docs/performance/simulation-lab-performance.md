# Simulation Lab Performance Report

Date: 2026-08-27
Build: Next.js 16.2.12 optimized production build
Internal references: IL-SIM-LAB-39F, IL-VISUAL-STANDARD-V1

## Strategy

- Catalogue previews are inline SVG and require no image request.
- Planned items use text status and do not load placeholder media.
- Simulation card links set `prefetch={false}`.
- `interactive-client.tsx` is imported only by the authenticated attempt route.
- Catalogue and detail components import the lightweight preview, not the attempt runtime.
- Search and filters operate over the one-item serializable registry projection in memory.
- No analytics package, WebGL runtime, AI client, or new dependency was added.

## Optimized Bundle Evidence

The final production build generated 53 static pages and compiled successfully. Inspection
of identifiable client chunks showed:

| Identifiable client chunk |      Raw |     gzip | Evidence                                     |
| ------------------------- | -------: | -------: | -------------------------------------------- |
| Simulation Lab client     | 76,448 B | 16,418 B | Contains `Search simulations`                |
| Attempt-specific client   | 30,317 B |  8,663 B | Contains runtime and assessment-form strings |

The chunk values identify feature-bearing chunks, not total route transfer size; framework
and shared design-system chunks are excluded from this table. The browser lazy-loading test
also inspected scripts loaded by `/simulations` and found neither `Simulation runtime is
unavailable` nor `Submitted cylinder force answer`.

## Interaction Verification

Browser tests completed search, discipline selection, four combined filters, clear-filter,
and route navigation without timeouts. The catalogue uses memoised synchronous filtering;
with one available registry entry, no main-thread performance concern was observed. A large
catalogue benchmark is intentionally deferred until representative data exists.

## Low-Data Behaviour

The catalogue does not preload attempt code or simulation engines for cards. The SVG preview
contains no animation, texture, external font, or raster image. Its `figcaption` supplies a
usable low-data description. Full low-data preference persistence remains governed by the
existing visual simulation policy; Prompt 39F does not add a new preference store.

## Responsive Verification

At 375 by 812 CSS pixels, the tested catalogue and detail journey had no horizontal page
overflow, retained a large visible engineering preview, and kept search and card navigation
keyboard operable. Desktop inspection at 1,440 by 900 confirmed that heading, search,
discipline shortcuts, activity state, and the start of the catalogue are visible without a
marketing preamble.

## Limitations

- Chunk measurements are build-artifact snapshots and will change with Next.js output.
- No low-end physical-device CPU or network trace was captured.
- No scale benchmark was run because the registry deliberately contains one available
  simulation.
- Server response latency against live Supabase was not measured in this local Prompt 39F
  pass.
