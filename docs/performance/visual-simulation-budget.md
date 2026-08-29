# Visual Simulation Performance Budget

## Measurement

Measurements were taken from optimized Next.js builds on 2026-08-26. Values are raw filesystem bytes unless gzip is stated. The baseline was captured immediately before Prompt 39B from the same Prompt 39 working tree and commit `e094d98`.

| Metric                                 | Before Prompt 39B |             Prompt 39B build |         Change |
| -------------------------------------- | ----------------: | ---------------------------: | -------------: |
| Total `.next/static/chunks` JavaScript |         679,773 B |                    719,266 B |      +39,493 B |
| Static JavaScript chunk count          |                24 |                           26 |             +2 |
| Visual-lab-specific client chunks      |               n/a | 36,657 B raw / 10,820 B gzip | Route-specific |
| Visual-lab server route artifacts      |               n/a |                about 20.8 KB | Route-specific |

The private route references shared Next/React chunks as well as its own chunks. The 36,657 B figure is the two route-specific client chunks, not the complete first visit transfer including shared framework code.

## Initial Budgets

| Asset                                                |                                                  Budget | Current status                                                          |
| ---------------------------------------------------- | ------------------------------------------------------: | ----------------------------------------------------------------------- |
| Reusable visual foundation route-specific JavaScript |                                           <= 15 KB gzip | PASS at 10.8 KB                                                         |
| One future 2D simulation adapter and SVG renderer    |                                   <= 35 KB gzip initial | To measure in Prompt 39C                                                |
| Optional high-detail assets                          |                Load on intent; not part of lesson shell | Required                                                                |
| Particle/animation loop                              | Stops when paused, reduced-motion, hidden, or offscreen | Foundation supports pause/reduced motion; offscreen integration remains |

Budgets are release guards, not reasons to remove accessibility or calculation validation. Prompt 39C must record its own before/after route chunks and interaction measurements.

## Loading Strategy

- Keep foundation and each simulation route-scoped.
- Dynamically import future heavy simulation visuals by simulation ID.
- Render lesson text, state summary, and loading fallback before optional assets.
- Prefer SVG for components, gauges, paths, and schematics.
- Use Canvas only for justified high-count visuals.
- Do not add WebGL or 3D dependencies during the hydraulic pilot without a separate decision and fallback.
- Low-data mode omits particles and optional high-detail assets.

## Rerender Strategy

Pure selectors and adapters should be memoized by stable serialized domain state when profiling proves a benefit. Do not memoize indiscriminately. High-frequency animation state must stay local to the visual boundary and must not trigger unrelated lesson or navigation renders.

## Known Measurement Limits

- Filesystem chunk size is not a field performance measurement.
- Gzip depends on server compression and caching.
- No real hydraulic adapter, asset, or sustained animation loop exists yet.
- Mobile CPU, memory, frame consistency, and interaction latency must be measured with the Prompt 39C pilot.
