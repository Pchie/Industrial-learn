# Prompt 39C Hydraulic Cylinder Visual Pilot Audit

Audit date: 2026-08-27

## Executive Verdict

Implementation verdict: **PASS for the internal visual pilot**.

Publication verdict: **NO-GO for `Approved for student use`** until a named independent engineering, educational, safety, and simulation review record exists. The lesson correctly remains `internal` and `Engineering review required`.

## 1. Student Experience Created

`/lessons/hydraulic-cylinder-force` now opens with a compact lesson identity followed by the visual experience before metadata, progress guidance, the knowledge check, Deep Dive, and source details. The hero provides a paused cutaway, pressure/diameter controls, live measurements, playback, linked representations, observations, Quick/Engineering/Deep Dive explanations, a load challenge, an excavator application, and next actions.

## 2. Existing Systems Reused

- structured lesson engine and generic visual-stage override contract;
- Prompt 39B simulation shell, viewport, playback, gauge, digital measurement, force vector, measurement selector, representation switcher, linked component state, observation prompt, Micro Theory, Live Equation, challenge, and application components;
- `engineering-core` SI conversion and force calculation;
- `simulation-engine` normal-state hydraulic-cylinder definition;
- design-system controls, alerts, badges, and source references;
- content-system schema and source validation;
- existing authenticated, server-scored assessment route.

No dependency, database change, authentication path, new analytics system, or unrelated simulation was added.

## 3. Engineering Calculations Used

- `convertToSi`: MPa to Pa and mm to m;
- `pistonAreaFromDiameter`: `EQ-HYD-PISTON-AREA-DIAMETER-001`;
- `forceFromPressureAndArea`: `EQ-FLUID-FORCE-PRESSURE-AREA-001`;
- simulation/runtime result comparison before a valid visual state is returned;
- pure challenge threshold and signed-margin evaluation.

The existing force implementation was not changed.

## 4. Visual Components Used

The lesson uses an original SVG cylinder scene with External, Cutaway, and Schematic modes; a pressure gauge and P1 measurement point; a clamped, labelled theoretical-force vector; live area/force outputs; and an original simplified excavator boom-cylinder application. The scene labels the supply line as a pressurised state and explicitly denies calculated flow, speed, stroke, or real load motion.

## 5. Challenge Behaviour

The `Lift the load` challenge compares checked theoretical force against a 15,000 N educational opposing-force target. It displays required force, calculated force, and signed margin. Feedback is announced and limited to whether theoretical force meets the idealised target. It does not claim a safe design and awards no competency.

## 6. Schematic Behaviour

The physical piston/cylinder and schematic cylinder symbol use shared component selection state. Mouse and keyboard selection persist across view switching. The schematic contains only the reviewed model context: generic pressure source, line, cylinder, P1, and theoretical-force direction.

## 7. Real-World Application

The original excavator visual and short explanation are linked to `SRC-CAT-BOOM-CYLINDER-6040431-2026`. The lesson states that linkage geometry, load position, losses, cylinder mounting, machine structure, and system pressure prevent `F = pA` alone from predicting boom lifting capacity.

## 8. Theory Migration

The default Quick view contains only a concise pressure-area-force explanation and model boundary. Engineering mode reveals current SI substitution, checked equation IDs, steps, symbols, assumptions, and interpretation. Deep Dive preserves derivation, units, limitations, and references. No useful theory was deleted.

## 9. Source And Review Status

Parker evidence supports cap-end ideal push force and circular piston area. NIST supports SI/prefix treatment. The Cat source supports only the narrow boom-cylinder application statement. The equations are `Equation checked`; the content and simulation visuals are not independently approved. Rod-side behaviour, faults, ratings, efficiency, and professional design claims are excluded.

## 10. Tests Executed

Focused verification completed during implementation:

- 93 engineering-core, simulation-engine, content, lesson-engine, and visual-foundation tests passed before final hierarchy refinement;
- 18 focused lesson-engine, hydraulic model, and visual-lesson tests passed after the hierarchy refinement;
- strict web TypeScript check passed;
- focused changed-surface lint passed;
- 9 focused production Playwright tests passed, covering the new lesson and legacy lesson-engine routes;
- optimized production build passed with 53 generated routes.

The final repository-wide quality gate results are recorded in the final verification section below.

## 11. Performance Result

The optimized lesson-route client chunks total 76,150 B raw / 21,317 B gzip, passing the 35 KB gzip pilot budget. Total static JavaScript is 804,774 B across 27 chunks, an 85,508 B increase from the Prompt 39B build. No WebGL, bitmap simulation asset, or dependency was added.

Twenty production-mode input/update/readback samples had a 198 ms median. This includes automation transport and DOM readback and is not represented as raw main-thread time. Both desktop and 375 px production renders had zero document-level horizontal overflow.

## 12. Accessibility Result

The focused production flow verified keyboard input, linked schematic selection, reset, reduced-motion step operation, mobile ordering, accessible labels, dynamic text feedback, and hidden formal-answer absence. Sliders have number alternatives; gauge/vector/state have text; success does not rely on colour; browser zoom remains available.

## 13. Before And After

| Measure                             | Before Prompt 39C                                                                                                         | After Prompt 39C                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Dedicated cylinder-force lesson     | None; a generic standalone simulation existed                                                                             | One structured internal `visual-v2` lesson                                         |
| Mandatory theory before interaction | Not comparable for a dedicated lesson; the legacy lesson order placed 11 prescribed sections before `interactiveActivity` | 0 theory blocks; visual hero follows lesson identity                               |
| Engineering input controls          | Generic pressure and explicit area inputs in the standalone simulation                                                    | Pressure and diameter, each with synced slider and number input                    |
| Visual representations              | Generic simulation/instrument presentation                                                                                | External, Cutaway, and linked Schematic SVG views                                  |
| Engineering calculations            | Ideal force from explicit pressure and area                                                                               | Explicit SI conversions, circular cap-end area, ideal force, runtime cross-check   |
| Measurements                        | Generic runtime readings                                                                                                  | P1 pressure gauge, digital value, area, force, vector, accessible state            |
| Observation activities              | None in a cylinder-force lesson                                                                                           | 3 non-graded observation prompts                                                   |
| Practical challenges                | None in a cylinder-force lesson                                                                                           | 1 idealised 15 kN load challenge with margin                                       |
| Real-world examples                 | None in a cylinder-force lesson                                                                                           | 1 sourced excavator boom-cylinder context                                          |
| Knowledge checks                    | No dedicated cylinder lesson check                                                                                        | 6 non-graded checks plus secure formal-assessment link                             |
| Reading burden before interaction   | Dedicated lesson unavailable                                                                                              | 0 mandatory theory words; roughly 65 words of Quick micro theory after interaction |

The before state is not assigned invented reading counts. The 11-section comparison is the existing reusable legacy lesson order, not a claim that a prior cylinder lesson existed.

## 14. Known Limitations

- Independent reviewers remain unassigned; publication is blocked.
- Input bounds and the load target are educational controls, not ratings.
- Piston movement is demonstrative; flow, speed, stroke, dynamics, and real load motion are absent.
- Rod-side/retraction and reviewed faults are absent.
- The challenge excludes losses, efficiency, safety factors, structures, mounting, stability, and linkage.
- Production-mode timing is synthetic; no field, low-end-device, React commit-count, or raw main-thread trace exists.
- Existing platform analytics did not provide an applicable privacy-reviewed client event path, so no new learning-event infrastructure was added.
- The formal assessment is related pressure content; a new large cylinder assessment was intentionally not created.

## Final Verification

Repository-wide final verification passed:

- `npm run scan:secrets`: PASS;
- `npm run format:check`: PASS;
- `npm run typecheck`: PASS across all workspaces;
- `npm run lint`: PASS;
- `npm run validate:content`: PASS, 15 tests;
- `npm run validate:migrations`: PASS, 13 tests;
- `npm run test:unit`: PASS, 217 passed and 4 intentionally skipped;
- `npm run build`: PASS, 53 generated routes;
- `npm run test:e2e`: PASS, 84 Chromium tests, including Axe, mobile overflow, authentication, ownership, assessment protection, simulation, and hydraulic pilot flows;
- `git diff --check`: PASS.

The Playwright server emitted the repository's existing `NO_COLOR`/`FORCE_COLOR` warning and an intentional simulated dashboard-database error used by its passing safe-error test. Neither is a product test failure.

## 15. Recommended Next Prompt

Conduct a named independent review of `LES-HYD-CYL-FORCE-VISUAL-001` version `0.1.0`: verify source use, equation presentation, visual direction/sign conventions, educational sequencing, accessible operation, safety wording, challenge bounds, and normal/boundary/invalid-state evidence. Record the review decision without adding rod-side behaviour, faults, ratings, or publication approval unless each has separately approved evidence.
