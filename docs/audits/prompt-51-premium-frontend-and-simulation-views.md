# Prompt 51: Premium Frontend and Advanced Simulation Views

Implementation and local verification date: 2026-09-07.

## Executive Verdict

Frontend implementation and local verification are complete. All local quality gates
passed. This report must not be treated as a student-content or production release approval.
The implementation is confined to the frontend, presentation capabilities, tests and
documentation. No production deployment, live database operation, publication, live
account change, invitation or email was performed.

| Area                        | Verdict | Evidence                                                                                 |
| --------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| Brand system                | PASS    | Central semantic light/dark palettes, material colours and contrast tests                |
| Premium frontend            | PASS    | Shared navigation, governed homepage, unframed learning/workbench layouts                |
| Theme modes                 | PASS    | Light/Dark/System, persistence, OS changes, blocked-storage fallback                     |
| Simulation realism          | PASS    | Original cutaway/assembly geometry, real spatial inspection, bounded illustrative motion |
| Advanced view modes         | PASS    | Capability-driven connected routes, history, access checks, optional Three.js            |
| Flagship simulation upgrade | PASS    | Basic Pressure standard; hydraulic four views; Bernoulli standard/aerial                 |

These verdicts concern implementation, not approval of new engineering content. The
hydraulic and Bernoulli experiences remain protected engineering-review-required previews.
The [Prompt 49 pilot NO-GO](prompt-49-student-pilot-readiness.md) is not overridden by
frontend work or by the [Prompt 50 operations plan](prompt-50-pilot-operations.md).

## Original State and Scope

Base commit: `adffe83e6842387a00ca818354dfabdbd114d4da`.
The starting branch was `codex/prompt-48a-final-evidence`; implementation uses the new
`codex/prompt-51-premium-frontend` branch. No commit or push was made. The existing eleven
untracked Prompt 49/50 audit/pilot documents were preserved rather than included in a
frontend commit or removed. The final working tree intentionally contains this work.

Before editing, the permanent rules, design system, navigation/workspace access,
flagship lesson models, shared visual architecture, dashboard, protected previews,
accessibility tests and available Prompt 48/49/50 reports were inspected. The plan was
to retain existing lesson/calculation/assessment logic and layer presentation capabilities
over the existing models, with a separately lazy-loaded 3D renderer.

No files changed under `packages/engineering-core`, `packages/simulation-engine`,
`packages/assessment-core`, `packages/database`, `database`, `content`, `knowledge` or
`sources`. No environment values or credentials were added to browser code. No new
attempt storage, scoring, analytics, content approval or authentication mechanism exists.

## Implementation

### Brand, Theme and Navigation

- The approved Slate Blue, Muted Teal, Pearl White and Deep Blue Grey swatches are
  defined once in `packages/design-system/src/styles.css`. Semantic aliases cover page,
  surface, elevated/muted backgrounds, text, borders, actions, states, focus and materials.
- Dark mode uses Deep Blue Grey, not black. Contrasting action tints and a deeper
  light-mode secondary-action text token preserve readability without changing the brand
  swatch. Domain colours do not replace text/shape state indicators.
- `features/theme` adds a labelled native Appearance selector, a small static
  pre-hydration initializer, local-only preference persistence and cross-tab updates.
  Explicit themes override OS settings; System follows live OS changes. Storage denial
  does not prevent switching. There is no new network request or user-profile field.
- The shared header retains Home, Learn, Simulations, Projects, authenticated Profile
  and server-derived Workspace destinations. Reviewer inspection routes display the
  correct workspace label. Capability checks, not visible links, enforce access.
- The homepage replaces the obsolete foundation placeholder with usable learning
  destinations and real publication-filtered lessons. Its pressure visual reuses the
  existing model and is shown only when its lesson passes the publication gate.
- Catalogue, lesson, dashboard, author/reviewer/owner and loading/error/empty surfaces
  inherit shared tokens and spacing. Existing data and honest empty states are retained;
  no fabricated student activity or unavailable simulation is added.

### Simulation Workbench and Views

The existing `SimulationShell`/`SimulationViewport` now place the main visual first in
document order. Desktop puts primary controls, measurements and equation alongside it;
mobile stacks visual, controls, measurements and equation. Title IDs are instance-safe.
The existing observation, explanation and challenge panels remain intact. Reusable
`LiveEquationPanel`, `ObservationPanel` and `ChallengePanel` aliases avoid duplicate logic.

`features/simulation-views` supplies `ViewModeSwitcher`, `AnatomyOverlay`,
`ExplodedAssemblyView`, `Interactive360Viewer`, `AerialSystemView` and a single capability
manifest referenced by catalogue metadata. Views are connected links with selected state;
changing views/back/forward retains mounted lesson inputs and challenge state. Reload
rechecks server access and restores safe defaults, not an implicit saved assessment.

| Flagship                 | Implemented views                          | Preserved teaching behaviour                                                                                                |
| ------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Basic Fluid Pressure     | Standard only                              | Force/area controls, engineering-core pressure, equation, observation, challenge, Deep Dive and assessment link             |
| Hydraulic Cylinder Force | Standard, Anatomy, Exploded view, 360 view | Pressure/diameter, force, gauge, area, linked schematic, 15 kN educational challenge, observations, equation and Deep Dive  |
| Bernoulli Flow Lab       | Standard, Aerial view                      | Current two-section horizontal model, pressure/velocity measurements, P1/P2 selection, direction and shared elevation datum |

Hydraulic anatomy/exploded/3D views show generic barrel, piston, rod, seals, end caps and
chambers. Material layering is illustrative, not a material specification. Original SVG
and procedural meshes were checked against registered source
`SRC-PARKER-140H8-CYLINDER-2024` for generic part relationships (catalog p. 3) and force
context (catalog p. 26). No manufacturer drawing, equipment rating or service procedure
was copied. See the [flagship standard](../simulations/flagship-simulation-frontend-standard.md).

The existing cap-end force and piston-area equations remain unchanged. Inspection
extension is explicitly labelled illustrative: no predicted stroke, flow, velocity,
rod-side force, seal performance, loss or machine lifting capacity is introduced.
Pause/Step/Reset are available; zero pressure and the end pose stop the demonstration;
reduced motion disables automatic extension. Bernoulli aerial view reframes the existing
horizontal pipe rather than inventing a wider plant or new elevation/energy calculation.

### Access and Publication

- Private route: `/internal/simulations/[simulationSlug]/[[...view]]`; the server requires
  `content:preview` before draft data is loaded. Responses are dynamic, noindex and
  private/no-store. The reviewer page and protected visual lab provide entry links.
- Public advanced route: `/simulations/[simulationSlug]/[viewMode]`; existing simulation
  publication, supported capability, independent view-release and published-lesson gates
  all apply. New advanced views have no release authority and remain unavailable.
- Supported URLs are documented in [Simulation View Modes](../simulations/simulation-view-modes.md).
  Unknown slugs, unsupported modes, students and anonymous users cannot obtain the private
  workspace by guessing a URL. Client navigation cannot bypass server checks on entry.
- `notFound()` can follow a streamed HTTP 200 from the existing loading boundary. Tests
  therefore check final denial/noindex and absent protected content as well as transport
  status; no blanket assertion that every denied URL returns HTTP 404 is made.
- The existing assessment, ownership, hidden-answer and publication regression tests
  remain part of the complete browser suite. No client scoring or progress award is added.

## Dependencies and Performance

Targeted, exact additions: `three@0.185.1`, `lucide-react@1.41.0` and development-only
`@types/three@0.185.4`. The [dependency rationale](../architecture/dependency-rationale.md)
was documented before installation. The lock-file diff contains these additions and
their type-package dependencies, not unrelated package upgrades. Installation reported
zero vulnerabilities. This is not a claim of a new independent dependency-security audit.

The 3D renderer downloads only after **Load 3D inspection**. Default routes and views
retain SVG; no external models, textures, remote fonts or telemetry are fetched. A dynamic
import error boundary and WebGL/context-loss handling preserve a useful labelled cutaway.
Real Three.js OrbitControls support rotation, zoom and pan, with keyboard button
alternatives. Rendering is event-driven; device pixel ratio is capped at 1.5. Observers,
controls, materials, geometry and WebGL resources are disposed on exit.

The optional engine chunk measured 555,042 decoded bytes and approximately 137,699 gzip
bytes (134.5 KiB); compressed file size is not a promised deployed transfer size. The
browser test recorded one additional renderer chunk only after explicit loading.

| Local measurement                                                             | Result                                              |
| ----------------------------------------------------------------------------- | --------------------------------------------------- |
| 3D-engine requests on home, Learn, Lab, Basic Pressure and hydraulic Standard | 0                                                   |
| Ten keyboard pressure increments, including the final UI assertion            | 148 ms total; 14.8 ms average automation round trip |
| Desktop sampled distinct rendered RGB colours                                 | 853                                                 |
| 320 / 375 / 430 px sampled distinct rendered RGB colours                      | 205 / 260 / 316                                     |
| Rotation check                                                                | Rendered image changes after camera rotation        |
| Exit check                                                                    | Canvas removed when returning to Standard           |

Pixel counts confirm nonblank output, not physical validity or rendering quality scores.
Interaction timing includes browser automation overhead, not an isolated main-thread
measurement. No baseline Core Web Vitals, real-device FPS, long-task budget or production
performance improvement is claimed. The measurement JSON and inspected desktop/mobile
screenshots are retained in the ignored test artifacts.

## Verification Results

All browser tests use the repository's isolated local authentication/test data with
Supabase credentials explicitly empty. They are not live Supabase RLS or staging tests.

| Command/check                    | Final result                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| Targeted dependency installation | PASS; lock-file changes inspected, zero install audit findings                        |
| `npm run scan:secrets`           | PASS; tracked and nonignored untracked files scanned                                  |
| `npm run format:check`           | PASS                                                                                  |
| `npm run typecheck`              | PASS; all workspaces                                                                  |
| `npm run lint`                   | PASS; no errors or warnings                                                           |
| `npm run validate:content`       | PASS; 29 tests                                                                        |
| `npm run validate:migrations`    | PASS; 24 tests                                                                        |
| `npm run test:unit`              | PASS; 401 tests, 41 files; five existing live-database tests skipped                  |
| `npm run build`                  | PASS; local production-mode build, not a deployment                                   |
| `npm run test:e2e`               | PASS; 129 tests in 6.5 minutes, including 46 accessibility tests and five smoke tests |
| `git diff --check`               | PASS                                                                                  |

There were no skipped browser tests or retries in the successful final run. The five
unit-test skips belong to the existing environment-gated live database integration file;
they were not added to avoid failures. The browser suite prints an intentional simulated
database error during its safe-dashboard-error test, which passes. Existing runner
`NO_COLOR`/`FORCE_COLOR` warnings are cosmetic and were not suppressed.

New unit coverage checks theme parsing, sensitive-data absence in the initializer,
semantic palette contrast, capability boundaries, canonical URLs, review labels and
source-labelled assembly rendering. New browser coverage checks theme persistence/System/
blocked storage, input synchronisation, view/history state, denied routes, reduced motion,
mobile layouts, keyboard operation, lazy loading, rendered 3D pixels, rotation and WebGL
fallback. Existing engineering and security tests are not removed or relaxed.

Verification identified and corrected actual problems: insufficient teal text contrast
on a muted surface; a nested dark demonstration missing its dark background; overlapping
desktop input pairs; mobile control order; and an oversized mobile WebGL canvas. Test
setup corrections addressed a status-vs-alert query, streamed not-found responses, an
incorrect expected slider step (the existing 0.5 MPa increment is unchanged), and an
unbound method in the WebGL-failure stub. Failed intermediate runs were not reported as
passes; the successful final rerun supersedes those intermediate failures.

## Accessibility and Mobile

Requested 320, 375 and 430 px widths and a 1440 px desktop are covered in both themes.
Tests check no horizontal overflow, readable numeric controls, non-overlapping control
geometry, mobile content order, labelled images, state text, keyboard-operated view
links, focus, live feedback and reduced-motion behaviour. The cylinder canvas is checked
for nonblank pixels at desktop and each phone width, and rotation changes the rendering.
Basic Pressure and Bernoulli also have mobile light/dark screenshots and axe checks.
An additional isolated browser check of the fully loaded 3D view at 375 px in Dark
returned zero axe violations and exercised pan/reset. Its first ad hoc runner required
an explicit browser context for axe; this harness issue was corrected and rerun.

Screenshots and machine-readable measurements are local ignored artifacts under
`test-results/`; the detailed browser report is in `playwright-report/`. These are not
student data and are not committed. Automated accessibility checks and Chromium viewport
emulation are not full WCAG certification, physical-device testing or a human
screen-reader assessment.

## Local Review Access

A localhost-only preview is running at `http://127.0.0.1:3160` using the same isolated
synthetic authentication mode as the browser tests. It does not connect to Supabase.
Existing test identities are defined by the local test provider, not real reviewer
accounts. Enter the protected visual lab after signing in with the existing reviewer
test fixture; use the capability links to inspect hydraulic and Bernoulli views. This
preview is not a staging or production URL, and its synthetic activity is not pilot data.

## Deliverables and File Boundaries

- [Brand system](../design/industrial-learn-brand-system.md)
- [Theme guidelines](../design/light-dark-theme-guidelines.md)
- [Premium frontend principles](../design/premium-frontend-principles.md)
- [Simulation view modes](../simulations/simulation-view-modes.md)
- [Flagship frontend standard](../simulations/flagship-simulation-frontend-standard.md)
- This audit and the dependency-rationale update.

Implementation files are limited to `packages/design-system/src`, `apps/web` layout/home/
review/internal/public view routes, theme and simulation-view features, existing visual
shell and flagship presentation adapters, navigation display, catalogue capability
metadata, cache headers and the two E2E files. Root/web package manifests and lock file
record the justified dependencies. No working theory or calculation package was deleted.

## Known Limitations and Next Work

1. Independent engineering review of anatomy, assembly, motion and 3D interpretation is
   still required. Publication requires an explicit reviewed per-view release mechanism;
   changing the current deny gate without review is not an acceptable shortcut.
2. Prior Prompt 49 gates remain open: exact-version database governance, real external
   confirmation/recovery, tested rapid withdrawal, a current recovery point and human
   operational/accessibility evidence. No new live result is claimed here.
3. Five existing environment-gated database integration tests are not exercised by local
   synthetic browser testing. Real server/RLS verification remains a separate activity.
4. Physical low-end Android/iOS, Safari/Firefox, screen-reader and slower-network review
   are required before broader student testing. Optional 3D is not mandatory learning.
5. The frontend work is uncommitted on its feature branch. No remote CI, staging release
   or production deployment was triggered; local checks do not prove deployed behaviour.

Recommended next frontend task: a bounded human visual/accessibility and engineering
review of these exact views, followed by a reviewed feature-branch pull request to
`development`. Retest staging after an authorised preview deployment. Address the
separate pilot blockers before inviting students; do not start AI Mentor or production
release from this frontend completion report.
