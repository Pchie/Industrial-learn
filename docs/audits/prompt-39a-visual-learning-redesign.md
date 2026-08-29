# Prompt 39a Visual Learning Redesign Report

Report date: 2026-08-26

Branch: `codex/prompt-39-approved-sources`

Task type: product, learning-experience, and software architecture documentation only

## Executive Verdict

**ARCHITECTURE COMPLETE; IMPLEMENTATION NOT STARTED.** Industrial Learn can move to a visual-first, simulation-first learning model without rebuilding its technical foundation. The current renderer and content schema need a backward-compatible visual experience layer, while `engineering-core`, the simulation runtime, assessment security, source governance, review workflow, and data protections remain authoritative.

The proposed first vertical slice is Hydraulic Cylinder Force in checked ideal extension-force scope. Unsupported dynamic movement, diameter derivation, equipment ratings, and fault multipliers remain explicitly outside the pilot until evidence, pure calculations, tests, and human review exist.

## 1. What Is Currently Too Theory-Heavy

All three current student-facing lessons are classified **D - Mostly static reading** in `docs/product/visual-learning-audit.md`.

| Lesson                                             | Audit summary                                                                                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Basic Fluid Pressure                               | 562 visible words, five theory sections, one static diagram, one question, no embedded simulation or challenge  |
| Pump System Units and Measurements                 | 605 visible words, five theory sections, one generic static diagram, one question, no simulation or application |
| Thermodynamic Systems, Surroundings and Boundaries | 719 visible words, five theory sections, one generic static diagram, one question, no simulation or application |

The problem is not excessive paragraph length alone. The fixed 18-section flow gives explanation before experience; `interactiveActivity` can contain ordinary prose; fault cases are text; and the shared diagram renderer ignores subject-specific visual data in favour of one generic force/area picture. A separate hydraulic simulation exists but is not embedded or synchronized with lessons.

## 2. What Remains Unchanged

- Approved and source-checked records, knowledge files, equations, content versions, and review statuses.
- Engineering calculations as pure tested SI functions in `engineering-core`.
- Simulation definitions, modes, transitions, measurements, events, and tests in `simulation-engine`.
- Secure assessment scoring, hidden-answer policy, authenticated persistence, progress rules, RLS, and audit controls.
- Curriculum structure, routes, authentication, PostgreSQL/Supabase architecture, and deployment controls.
- Existing design primitives and the WCAG 2.2 AA, mobile, reduced-motion, and low-data commitments.

No application code, lesson content, equation, dependency, database schema, migration, or feature was changed by Prompt 39a.

## 3. New Visual-First Architecture

The universal model is:

`Hero Experience -> Explore -> Observe -> Micro Theory -> Live Equation -> Engineering Challenge -> Fault Mode -> Real-World Application -> Knowledge Check -> Deep Dive -> Sources`

The student path becomes `SEE -> INTERACT -> OBSERVE -> EXPLAIN -> CALCULATE -> CONNECT -> BREAK -> DIAGNOSE -> APPLY`. Quick is the default explanation depth; Engineering adds equation, units, assumptions, and worked reasoning; Deep Dive preserves academic depth and references.

One domain state drives external equipment, cutaway, schematic, virtual instruments, Live Equation, and accessible summary. A presentation-only `VisualState` maps that state to geometry, paths, vectors, patterns, labels, and readings without owning formulas or fault behaviour.

## 4. Content-Schema Changes Required

Add versioned `schemaVersion` and `experienceModel` fields and a native `visual-v2` `experienceSequence`. Introduce discriminated blocks for `heroSimulation`, `interactiveDiagram`, `animation`, `observationQuestion`, `microTheory`, `liveEquation`, `componentCutaway`, `linkedSchematic`, `engineeringChallenge`, `faultChallenge`, `realWorldApplication`, and `deepDive`.

Keep `linear-v1` valid and normalize old sections through an adapter. New validators resolve IDs, enforce source and review gates, verify component and dimension bindings, require accessibility/low-data fallbacks, and prevent graded answers from entering public lesson payloads. No immediate database migration is proposed.

## 5. Simulation Architecture Changes Required

Retain the existing runtime and add contracts around it:

- Versioned simulation type and discoverability metadata.
- Visual-state adapters and external/internal/schematic representation manifests.
- Stable component and measurement-point IDs.
- A standard Play, Pause, Reset, Step, speed, and reduced-motion control surface.
- State-derived virtual instruments and accessible summaries.
- Lazy-loaded renderers and meaningful attempt-summary persistence.

Component, system, schematic, calculation, fault, and design simulations share the contract, but only the component pilot should be implemented first. Fault simulations remain evidence-gated.

## 6. Design-System Changes Required

Compose existing controls before adding new primitives. Required additions or refinements are a simulation stage shell, playback controls, depth and representation segmented controls, engineering legend, state summary, measurement-point selector, instrument dock, responsive simulation layout, and formula-free Live Equation view.

Domain states use arrows, movement, labels, symbols, patterns, geometry, and numeric readings. Hydraulic blue, electrical state, automation signal, temperature, warning, and fault tokens reinforce meaning but never replace non-colour indicators.

## 7. Performance Implications

- Load the lesson shell and fallback before simulation code.
- Lazy-load each simulation and alternate representation rather than the entire lab.
- Prefer SVG for 2D equipment, cutaways, vectors, gauges, and schematics.
- Use Canvas for justified high-count or continuous visuals and WebGL only after an educational and performance decision.
- Pause offscreen visual loops and provide a low-data simplified SVG/text path.
- Establish measured staging budgets for route JavaScript, chunk/asset weight, interaction latency, frame consistency, and mobile memory before release.

No 3D or animation dependency is approved by this architecture.

## 8. Accessibility Implications

Every visual concept has a non-visual learning path. Essential controls are keyboard operable, sliders pair with numeric inputs, drag is optional, component drawings have synchronized lists, and instruments expose semantic readings. State summaries report significant changes without flooding live regions.

Reduced motion retains engineering meaning through discrete snapshots and Step mode. Mobile recomposes equipment, controls, measurements, equation, and challenge; it does not shrink a desktop canvas. Patterns, labels, arrows, and symbols prevent colour-only communication.

## 9. Lessons That Can Be Migrated Easily

- **Pump System Units and Measurements**: a subject-specific measurement-point diagram, instrument-selection interaction, and explicit unit comparisons need limited domain simulation.
- **Thermodynamic Systems, Surroundings and Boundaries**: system-boundary selection and open/closed/isolated classification can become an interactive diagram without property data.
- **Basic Fluid Pressure content order**: observation prompts, concise micro theory, Deep Dive movement, and checked equation presentation can migrate readily, although the full hydraulic visual is a substantive pilot.

## 10. Lessons Requiring New Simulation Work

- Hydraulic Cylinder Force needs the visual-state adapter, linked representations, Live Equation, and reviewed normal-state UI.
- A moving thermodynamics molecule/piston experience needs reviewed state equations and explicit model boundaries; it cannot be inferred from the current definitions lesson.
- Dynamic pump, Bernoulli, electrical, mechanical deformation, and future-engineering examples are curriculum direction, not current reviewed simulations.
- Every diagnostic fault experience needs approved fault behaviour, measurement signatures, and tests.

## 11. Proposed Hydraulic-Cylinder Pilot

The pilot opens on a cutaway, pressure gauge, effective-area cue, and force vector. Students vary pressure and explicit effective area, observe the checked theoretical extension force, answer observation prompts, inspect a synchronized Live Equation, and meet an abstract force target.

The initial pilot does not animate physical travel because the current model has no reviewed cylinder-position or speed relationship. Diameter input is deferred until a pure area calculation and tests are reviewed. Existing pressure-loss and seal-leak multipliers are not released as diagnosis. The excavator application remains source-required and uses only an original, reviewed contextual illustration.

## 12. Recommended Implementation Sequence

1. Approve the architecture and name educational, engineering, safety, accessibility, and content reviewers.
2. Add the dual `linear-v1` / `visual-v2` content contract and validation tests.
3. Add visual-state, component-manifest, accessible-summary, and playback foundations.
4. Implement Live Equation over the existing equation registry and `engineering-core` results.
5. Build the hydraulic normal-state pilot behind an internal flag.
6. Validate synchronization, units, invalid states, mobile, low data, reduced motion, and attempt-summary behaviour.
7. Obtain evidence and review before enabling any fault or real-world application.
8. Migrate the pump measurement and thermodynamic classification lessons.
9. Expand `/simulations` metadata and browsing after the pilot contract is proven.

## Documents Created

- `docs/product/visual-learning-audit.md`
- `docs/product/visual-learning-principles.md`
- `docs/product/visual-lesson-architecture.md`
- `docs/product/simulation-design-system.md`
- `docs/product/engineering-animation-guidelines.md`
- `docs/product/live-equation-system.md`
- `docs/product/linked-schematic-system.md`
- `docs/product/visual-content-schema.md`
- `docs/product/hydraulic-cylinder-visual-pilot.md`
- `docs/product/visual-migration-plan.md`
- `docs/audits/prompt-39a-visual-learning-redesign.md`

## Known Limitations

- The audit covers the three lessons currently registered for the student lesson engine; curriculum records without implemented lesson content were not counted as lessons.
- Counts are repository estimates based on delivered structured content and current renderer behaviour, not student analytics.
- Numeric performance budgets require staging measurements during implementation.
- No independent human review has approved these architecture documents.
- The current Prompt 39 source-onboarding changes remain uncommitted in the same working tree and were deliberately not altered or reverted.

## Verification Results

| Command                                                     | Result                                           |
| ----------------------------------------------------------- | ------------------------------------------------ |
| Targeted Prettier write for the eleven Prompt 39a documents | PASS; no other files were formatted by this task |
| `npm run scan:secrets` through `npm run ci`                 | PASS                                             |
| `npm run format:check` through `npm run ci`                 | PASS                                             |
| `npm run typecheck` through `npm run ci`                    | PASS across all workspaces                       |
| `npm run lint` through `npm run ci`                         | PASS                                             |
| `npm run validate:content` through `npm run ci`             | PASS, 12 tests                                   |
| `npm run validate:migrations` through `npm run ci`          | PASS, 13 tests; no migration changed             |
| `npm run test:unit` through `npm run ci`                    | PASS, 181 passed and 4 skipped across 26 files   |
| `npm run build` through `npm run ci`                        | PASS, 51 pages generated                         |

Browser E2E tests were not rerun for this documentation-only task. Prompt 39 had already passed the smoke and full E2E suites before Prompt 39a began; no application file was changed by Prompt 39a.

## Final Status

Prompt 39a is complete when these documents pass repository formatting and documentation checks. The next prompt should implement only Phases 1-3 of the migration plan, followed by the internally gated hydraulic normal-state pilot; it should not bulk-convert lessons or enable unsupported faults.
