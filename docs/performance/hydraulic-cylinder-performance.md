# Hydraulic Cylinder Visual Lesson Performance

## Build Measurement

Measured from an optimized Next.js 16.2.12 build on 2026-08-27.

| Metric                                 | Prompt 39B baseline | Prompt 39C build | Change or result |
| -------------------------------------- | ------------------: | ---------------: | ---------------: |
| Total `.next/static/chunks` JavaScript |           719,266 B |        804,774 B |        +85,508 B |
| Static JavaScript chunk count          |                  26 |               27 |               +1 |
| Lesson-route client chunks             |                 n/a |         76,150 B |    21,317 B gzip |
| Lesson-route CSS                       |                 n/a |         24,251 B |     3,344 B gzip |
| Prompt 39C 2D adapter budget           |          35 KB gzip |     21.3 KB gzip |             PASS |

The lesson-route JavaScript figure is the two client chunks listed for `/lessons/[lessonSlug]`, including the dynamically imported hydraulic experience and shared visual/design code. It does not represent total first-visit transfer including framework chunks. The total chunk delta also includes build-wide chunk reshaping, so it is not labelled as hydraulic code alone.

### Visual Standard V1 Recheck

The Prompt 39E optimized build identifies the simulation-registry-loaded hydraulic client
chunk at 30,511 B raw and 8,026 B gzip. The two route CSS assets total 68,935 B raw and
10,232 B gzip, including global and route styles. These figures are build artifacts, not
field transfer measurements, but the hydraulic module remains below the 35 KB gzip 2D
adapter budget.

## Loading Strategy

- The hydraulic client experience is resolved by simulation ID and dynamically imported
  only for the registered lesson experience.
- The structured lesson header and content remain server-rendered.
- SVG is used for the cylinder, schematic, gauge, vector, and excavator application.
- No WebGL, 3D engine, bitmap asset, or new runtime dependency was added.
- The reference lesson loads no bitmap, WebGL, 3D, or high-frequency animation asset.

## Interaction Sample

The Prompt 39C interaction sample remains the latest automation-transport timing sample.
Prompt 39E changed display hierarchy and display units but not the governing calculation
path. A new raw main-thread trace was not claimed.

These timings include browser-automation transport and DOM readback. They are a coarse end-to-end responsiveness check, not raw main-thread execution time and not a field Core Web Vitals measurement. No incorrect or stale output was observed.

## Render Behaviour

Hydraulic calculations run from memoised lesson inputs. Prompt 39E removed playback frame,
speed, and timer state from this static pressure-area model. Input changes are the only
automatic cause of engineering recalculation; there is no background frame progression.

## Responsive Measurement

The optimized Prompt 39E render reported zero horizontal overflow at 1,440 by 900 and 375
by 900. The final desktop layout places primary controls and the main visual in the same
hero row; an end-to-end first-screen guard verifies that both begin within the initial
900 px viewport. At mobile size the explicit Adjust Inputs action begins at 676 px and the
main SVG begins at 807 px, so both are present in the initial 900 px viewport. The full
page reduced from the Prompt 39D measurement of 7,183 to about 5,373 px desktop and from
12,297 to about 8,625 px mobile. Mobile places the visual before the full input and
measurement stack and retains numeric alternatives downstream.

## Remaining Performance Work

- A browser performance trace was not used to isolate React commit count or raw main-thread task duration.
- No field data, low-end Android CPU profile, memory profile, or network-throttled Core Web Vitals sample exists yet.
- The 35 KB gzip guard should remain in CI or release review as more simulations are added.
- Offscreen automatic-pause integration from the Prompt 39B budget remains future foundation work.
