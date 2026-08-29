# Prompt 39B Visual Simulation Foundation Report

Report date: 2026-08-27

Branch: `codex/prompt-39-approved-sources`

Baseline commit: `e094d985f2be`

## Executive Verdict

**PASS.** Industrial Learn now has a reusable visual simulation feature boundary, an optional backward-compatible visual lesson schema, and a private demonstration lab. Repository-wide CI and all 76 Playwright tests pass. No hydraulic pilot lesson, reviewed simulation behavior, engineering equation, database schema, authentication flow, or student publication was added.

## Architecture Created

- App-level visual-simulation feature with pure contracts/state separate from React.
- Central Learn, Guided, Explore, Fault diagnosis, Assessment, and Demonstration mode capability model.
- Discipline-extensible visual operating state and pure domain-to-visual adapter type.
- Deterministic display playback and low-data/reduced-motion render policy.
- Measurement point, instrument, linked representation, challenge, and fault contracts.
- External/Cutaway/Schematic selection using one component ID state.

## Components Created

Simulation shell/viewport, playback controls, flow path, engineering vector, gauge, digital reading, measurement selector, Live Equation, observation prompt, Micro Theory, depth selector, representation switcher, linked component view, challenge panel, fault status panel, real-world application, and visual block fallback.

## Schema And Renderer

- Added twelve optional visual content block types.
- Added optional `schemaVersion`, `experienceModel`, and `experienceSequence`.
- Existing lessons remain `linear-v1` by default and were not edited.
- Visual blocks require source IDs, review status, accessibility metadata, and formed reference IDs.
- `visual-v2` stage order is content-defined rather than globally fixed.

## Existing Systems Reused

Engineering calculation results, simulation modes, design controls/tokens, source governance, review statuses, content validation, lesson rendering, Vitest, Playwright, and Axe.

## Intentionally Unchanged

Authentication behavior, Supabase/database/RLS, assessment scoring, progress persistence, curriculum, engineering formulas, real simulation domain behavior, and publication statuses. Playwright test isolation was corrected to use a dedicated port and test-time local-auth build; this does not alter runtime authentication.

## Performance

Total static chunk output increased by 39,493 raw bytes in the measured production build. The visual-lab-specific client chunks are 36,657 B raw and 10,820 B gzip, within the initial 15 KB gzip foundation budget. No external rendering or animation dependency was installed.

## Accessibility

- Labelled native controls and fieldsets.
- Keyboard Play/Pause/Step/Reset, depth, instrument, measurement, and representation controls.
- Non-drag operation and supplied state summaries.
- Pattern, arrow, stop-mark, text, and numeric alternatives to colour.
- Reduced-motion and low-data static direction states.
- Mobile ordering and no page-level overflow tests.
- Private lab passed the focused Axe scan.

## Tests Added

- Mode capabilities, playback, reduced motion, low data, gauge clamp, vector scaling, flow scaling.
- Measurement compatibility, linked selection, representation fallback, and challenge evaluation.
- Live Equation supplied-result behavior and update rendering.
- Existing lesson compatibility and `visual-v2` renderer selection.
- Visual content acceptance and malformed reference/accessibility rejection.
- Private/noindex, keyboard, linked schematic, X-Ray, mode, mobile, and accessibility browser coverage.

## Verification Results

| Command                            | Result                                                          |
| ---------------------------------- | --------------------------------------------------------------- |
| `npm run scan:secrets`             | PASS                                                            |
| `npm run format:check`             | PASS                                                            |
| `npm run typecheck`                | PASS across all workspaces                                      |
| `npm run lint`                     | PASS                                                            |
| `npm run validate:content`         | PASS, 14 tests                                                  |
| `npm run validate:migrations`      | PASS, 13 tests                                                  |
| `npm run test:unit`                | PASS, 201 tests; 4 existing environment-dependent tests skipped |
| `npm run build`                    | PASS, 52 pages including the private visual lab                 |
| `npm run test:e2e`                 | PASS, 76 Chromium tests in 3.1 minutes                          |
| Dedicated visual-lab browser tests | PASS, 5 tests included in the 76-test run                       |
| Private visual-lab Axe scan        | PASS, no critical automated accessibility violations            |
| Responsive overflow checks         | PASS at 320, 375, 430, 768, 1024, and 1366 px                   |

The first full lint attempt exposed two new static-analysis errors. Both were corrected without suppressions, and the complete CI command was rerun successfully. The first Playwright launch was blocked by sandbox permission on local port 3100; the unchanged suite passed when rerun with permission to bind that local-only test server. The only remaining command-line warning is the existing Playwright `NO_COLOR`/`FORCE_COLOR` environment warning.

## Files Changed By Prompt 39B

### New feature and route

- `apps/web/src/features/visual-simulation/contracts.ts`
- `apps/web/src/features/visual-simulation/state.ts`
- `apps/web/src/features/visual-simulation/components.tsx`
- `apps/web/src/features/visual-simulation/visual-simulation.module.css`
- `apps/web/src/features/visual-simulation/visual-simulation-lab.tsx`
- `apps/web/src/features/visual-simulation/state.test.ts`
- `apps/web/src/features/visual-simulation/components.test.tsx`
- `apps/web/src/app/internal/visual-simulation-lab/page.tsx`

### Compatible integration and tests

- `apps/web/src/features/lesson-engine/types.ts`
- `apps/web/src/features/lesson-engine/components.tsx`
- `apps/web/src/features/lesson-engine/components.test.tsx`
- `apps/web/src/features/lesson-engine/data.ts`
- `content/schemas/content-block.schema.json`
- `content/schemas/lesson.schema.json`
- `packages/content-system/src/index.ts`
- `packages/content-system/src/content-system.test.ts`
- `tests/e2e/accessibility.spec.ts`
- `tests/e2e/visual-simulation-lab.spec.ts`
- `playwright.config.ts`
- `package.json`, `package-lock.json`, and `apps/web/package.json`
- `docs/architecture/dependency-rationale.md`

### Required documentation

- The seven Prompt 39B documents, including this report.

## Known Limitations

- Demonstration frames are fixed test data and not a simulation model.
- Live Equation renders a supplied result but Prompt 39C must connect a real simulation result.
- Fault behavior is contract-only and deliberately empty in the lab.
- No instrument derives a value from a drawing; additional instrument faces remain future work.
- Offscreen animation pausing and field performance profiling belong to the real pilot.
- Existing Prompt 39 and Prompt 39a work remains uncommitted in the same working tree.

## Prompt 39C Readiness

**READY.** Prompt 39C may implement one internally gated hydraulic normal-state adapter and lesson experience. It must keep unsupported faults disabled, preserve the source and review limitations documented in `hydraulic-cylinder-visual-pilot.md`, and measure the real pilot against the recorded performance budget.
