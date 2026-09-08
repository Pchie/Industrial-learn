# Simulation View Modes

## Boundaries

`apps/web/src/features/simulation-views` contains presentation capabilities, connected
navigation and inspection renderers. It consumes values already computed by existing
lesson models; it does not score attempts, award progress or access the database.
Engineering-core and simulation-engine are unchanged.

| Experience               | Supported inspection views                 | Current delivery         |
| ------------------------ | ------------------------------------------ | ------------------------ |
| Basic Fluid Pressure     | Standard                                   | Existing approved lesson |
| Hydraulic Cylinder Force | Standard, Anatomy, Exploded view, 360 view | Protected staff preview  |
| Bernoulli Flow Lab       | Standard, Aerial view                      | Protected staff preview  |

The catalogue entry references the same capability manifest; no frontend page maintains
an independent list. Unknown slugs and unsupported modes fail closed. Capabilities do
not imply publication approval. Thermal boundary retains its existing standard capability;
this task does not implement a new thermal experience.

## Routes and State

Public route pattern: `/simulations/[simulationSlug]/[viewMode]`, alongside the existing
detail/start/attempt routes. Public lookup checks the existing simulation publication
gate, supported mode, separate student-view release gate and published parent lesson.
Advanced views currently have no release authority and invoke `notFound()`. With the
inherited loading boundary, Next.js can emit HTTP 200 before the final not-found/noindex
response is streamed; tests verify final denial and absent protected content. Approving an old
standard simulation must not automatically approve newly added anatomy or assembly views.

Authorised inspection routes:

- `/internal/simulations/hydraulic-cylinder-force`
- `/internal/simulations/hydraulic-cylinder-force/anatomy`
- `/internal/simulations/hydraulic-cylinder-force/explodedview`
- `/internal/simulations/hydraulic-cylinder-force/360view`
- `/internal/simulations/bernoulli-flow-lab`
- `/internal/simulations/bernoulli-flow-lab/aerialview`

The server requires `content:preview` before loading draft lesson data. Routes are dynamic,
noindex and private/no-store; students gain no access by constructing a URL. The private
visual lab links to these workspaces. Each shows its lesson version and visual revision.

View links use native History integration to retain the mounted lesson's inputs and
challenge state; back/forward updates the selection. Reload rechecks server permissions
and deliberately restores safe default inputs, not a hidden browser attempt. Modified
clicks and new tabs remain normal links. No new persistence or assessment mode is added.

## Reusable Primitives

- Existing `SimulationShell` and `SimulationViewport`: visual, controls, measurements,
  equation and learning regions with existing mode-based hint restrictions.
- `ViewModeSwitcher`: capability-driven, accessible links/buttons with selected state.
- `AnatomyOverlay`, `ExplodedAssemblyView`: labelled, selectable original SVG assembly.
- `Interactive360Viewer`: explicit optional download, lazy renderer, SVG fallback.
- `AerialSystemView`: the existing two-section horizontal pipe in plan view.
- `LiveEquationPanel`, `ObservationPanel`, `ChallengePanel`: aliases of existing tested
  primitives, not new calculation or assessment implementations.

## 3D and Motion

Three.js and OrbitControls provide real rotation, zoom and pan. Named keyboard-operable
camera buttons parallel pointer gestures. Device pixel ratio is capped at 1.5; geometry
is procedural and small, with no external models, textures or telemetry. Rendering is
event-driven, not an idle animation loop. Resize/theme observers, controls, geometry,
materials and renderer are disposed on exit. WebGL/context/chunk failure retains SVG.

Anatomy extension is an explicitly requested, bounded presentation demonstration. It
stops at its end pose or zero pressure; Pause/Step/Reset are available. Reduced motion
disables timed extension but permits steps. Its timing/pose is not an engineering result.
Exploded separation is unitless graphic spacing, not a service procedure or measured gap.

Technical references: [Next.js navigation](https://nextjs.org/docs/app/getting-started/linking-and-navigating),
[OrbitControls](https://threejs.org/docs/pages/OrbitControls.html),
[Three.js resource disposal](https://threejs.org/manual/en/how-to-dispose-of-objects.html).
