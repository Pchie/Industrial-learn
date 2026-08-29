# Bernoulli Flow Lab Performance

## Loading Strategy

- The Bernoulli lesson experience is resolved by simulation ID and dynamically
  imported by the visual-experience registry.
- Simulation Lab cards use a lightweight inline SVG preview and do not preload the
  Bernoulli lesson module.
- The main visual is responsive SVG; no WebGL, 3D engine, bitmap simulation asset,
  or new dependency was added.
- Animation is limited to a small bounded set of presentation dots, begins paused,
  can be stopped explicitly, and is disabled by reduced-motion CSS.
- Engineering calculations are memoised by the two student inputs and have no
  background time-step loop.

## Verification Results

Measured from the optimized Next.js 16.2.12 build on 2026-08-27.

| Metric                                                   |                       Result |
| -------------------------------------------------------- | ---------------------------: |
| Generated routes                                         |                           54 |
| JavaScript chunks containing Bernoulli module signatures | 76,648 B raw / 19,347 B gzip |
| CSS chunk containing Bernoulli styles                    |  38,163 B raw / 4,572 B gzip |
| Total build-wide static JavaScript                       |    895,965 B across 30 files |
| Horizontal overflow at 1,440 x 900                       |                         0 px |
| Horizontal overflow at 375 x 900                         |                         0 px |
| Desktop control-card collisions                          |                            0 |
| Mobile Play, Pause, and Reset target height              |                        44 px |
| Initial running continuous animations                    |                            0 |

The two matched JavaScript chunks include shared route code, so 19,347 B gzip is
an upper-bound route-module measurement rather than a claim that every byte is
Bernoulli-only. Simulation Lab cards still use a lightweight preview and do not
load the lesson experience.

Nine warm input/update/readback samples measured 75 to 105 ms, with an 85 ms
median. These timings include browser-automation transport and DOM readback and
are not raw main-thread time or field performance. The first setup sample took
4,678 ms while the browser located and scrolled to the lazy experience; it is
reported separately and excluded from the warm interaction range.

The complete production Playwright run passed at 320, 375, 430, 768, 1,024, and
1,366 px widths. Direct visual inspection at 1,440 x 900 and 375 x 900 found no
overlap after the control rail was corrected to stack its fields.

## Performance Boundaries

The visual cue is not a computational-fluid-dynamics result, particle solver, or
time integration. No raw input history or high-frequency frame state is persisted.

## Remaining Measurement Work

- No field Core Web Vitals data exists for this internal pilot.
- No low-end Android CPU or memory profile has been recorded.
- No React commit-count or browser performance trace has been recorded.
- Synthetic browser measurements must not be described as field performance.
