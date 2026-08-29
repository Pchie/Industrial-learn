# Prompt 39 Approved Source Report

Report date: 2026-08-26

Branch: `codex/prompt-39-approved-sources`

Baseline commit: `e094d985f2be`

## Executive Verdict

**PASS for source onboarding and technical-review preparation.** Five real engineering source documents were verified through official access points, rights constraints were recorded, four focused knowledge topics are traceable, three implemented pilot equation records are checked, the hydraulic simulation has an honest intermediate status, and the first thermodynamics lesson is implemented as an unpublished structured draft.

This verdict does not approve any content for student use. Independent human educational, engineering, and safety reviews remain outstanding.

## Sources Verified

| Source ID                                  | Verification result                                                                                              | Technical use                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`        | Official OpenStax web edition, authorship, publication information, sections, and CC BY 4.0 text licence checked | Pressure definition, `p = F / A`, Pascal relationship context, cycle definition                                 |
| `SRC-PARKER-140H8-CYLINDER-2024`           | Official Parker-hosted 42-page catalog checked; catalog and PDF page references recorded                         | Theoretical cylinder force, cap-end full piston area, rod-end annular area, actual-output limitation            |
| `SRC-NIST-SP330-2019`                      | Official NIST page and 138-page PDF checked; SHA-256 recorded                                                    | SI derived units, SI prefixes, litre and minute conversion evidence                                             |
| `SRC-DOE-PUMP-SOURCEBOOK-2006`             | Official DOE-hosted 122-page sourcebook checked; SHA-256 and embedded-JavaScript warning recorded                | Pump-system measurement context, instrument accuracy, and calibration limitations                               |
| `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021` | Official Purdue course page and seven-page lecture document checked; SHA-256 recorded                            | Systems, surroundings, boundaries, classifications, properties, state, process, intensive/extensive definitions |

All records use `evidenceStatus: approved` to mean verified documentary evidence and `reviewStatus: Source checked`. All set `independentHumanReviewRequired: true`. None is `Approved for student use`.

## Sources Rejected Or Excluded

No unverified blog, search snippet, anonymous note, content farm, pirated document, or AI-generated reference was accepted.

No candidate passed metadata review and was then rejected on technical grounds. Repository copies were intentionally excluded for Parker, NIST, DOE, and Purdue because repository redistribution permission was not established. The DOE PDF also reported embedded JavaScript and was not stored or executed. OpenStax text permits attributed reuse, but no source chapter, figure, branding, or long excerpt was copied.

## Placeholder Migration

The four original placeholder records remain as historical audit artifacts and identify their replacements through `supersededBy`. Active pilot knowledge, lesson, equation, assessment, project, simulation, and rendering references now use real source IDs. The broader unimplemented Smart Pump Systems curriculum still retains its placeholder because the two newly checked pump sources do not support the full Bernoulli, cavitation, selection, predictive-maintenance, digital-twin, and AI scope.

## Knowledge Files Updated

| Focused topic                        | Primary file                                                    | Status                        |
| ------------------------------------ | --------------------------------------------------------------- | ----------------------------- |
| Fluid pressure fundamentals          | `knowledge/fluid-mechanics/pressure-fundamentals.json`          | `Engineering review required` |
| Hydraulic cylinder force             | `knowledge/hydraulics/hydraulic-cylinder-force.json`            | `Engineering review required` |
| Pump-system units and measurement    | `knowledge/smart-pump-systems/si-units-and-measurement.json`    | `Engineering review required` |
| Thermodynamic systems and boundaries | `knowledge/thermodynamics/systems-surroundings-boundaries.json` | `Engineering review required` |

Each file is under the 18,000-character focused-topic limit and includes the required definitions, principles, equation section, symbol and SI-unit section, assumptions, limitations, worked example, common mistakes, safety boundary, related content, source references, and review status. Existing duplicate pilot knowledge files were updated for traceability but not merged during this scoped task.

## Equations Reviewed

| Equation ID                        | Decision                                                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `EQ-FLUID-PRESSURE-001`            | `Equation checked`; expression, symbols, SI units, positive-area rule, assumptions, source section, and tests confirmed |
| `EQ-FLUID-FORCE-PRESSURE-AREA-001` | `Equation checked`; ideal theoretical extension-force scope, SI units, source page, limitations, and tests confirmed    |
| `EQ-SI-CONVERSION-EXPLICIT-001`    | `Equation checked`; explicit allow-listed conversions, source tables, no-silent-conversion rule, and tests confirmed    |

No engineering calculation implementation was changed. The review updated metadata and tests only.

The Parker source documents cap-end and rod-end effective-area rules. The current pilot does not calculate those areas from bore or rod diameter; it accepts an explicit effective area and models extension only. No unrequested rod-side equation was added.

## Hydraulic Simulation Status

Final status: `Equation checked`

The source-backed ideal force equation and explicit SI inputs are confirmed. `Simulation checked` is not supported because the 60 percent pressure-loss behavior, 25 percent seal-leak force reduction, gauge behavior, nominal flow and temperature readings, maximum pressure, and area range are pedagogical choices without independent source evidence. The simulation continues to state that its limits are not equipment ratings and that it does not authorise work on pressurised equipment.

## Thermodynamics Status

Final status: **technically reviewable unpublished draft**

`content/lessons/thermodynamics/systems-surroundings-boundaries.json` now implements all required structured lesson sections and is registered with the reusable `/lessons/[lessonSlug]` route. It remains `publicationStatus: draft` and `reviewStatus: Engineering review required`.

The lesson contains no thermodynamic equation, property table, steam data, refrigerant data, material-property data, unsupported property value, equipment rating, or equilibrium criterion.

## Reviewers Required

| Role                 | Current state                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Source reviewer      | Codex automated-assisted source verification completed; independent human review still required        |
| Equation reviewer    | Codex automated-assisted review and automated tests completed; independent human review still required |
| Educational reviewer | Unassigned                                                                                             |
| Engineering reviewer | Unassigned                                                                                             |
| Safety reviewer      | Unassigned for hydraulic and equipment-adjacent material                                               |

The same automated agent prepared source and equation decisions. This limitation is explicit and prevents self-approval.

## Commands And Results

| Command                                  | Result                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `npm run format`                         | PASS; repository-owned changes formatted                                 |
| `npm run format:check`                   | PASS                                                                     |
| `npm run typecheck`                      | PASS across all workspaces                                               |
| `npm run lint`                           | PASS                                                                     |
| `npm run scan:secrets`                   | PASS                                                                     |
| `npm run validate:content`               | PASS, 12 tests                                                           |
| `npm run validate:migrations`            | PASS, 13 tests; no migration changed                                     |
| Focused engineering and simulation tests | PASS, 50 tests                                                           |
| `npm run test:unit`                      | PASS, 181 passed and 4 skipped across 26 files                           |
| `npm run build`                          | PASS; 51 pages generated and the thermodynamics lesson route prerendered |
| `npm run test:smoke`                     | PASS, 5 tests                                                            |
| `npm run test:e2e`                       | PASS, 70 tests including accessibility and the thermodynamics route      |
| `git diff --check`                       | PASS                                                                     |

The first sandboxed smoke invocation could not bind the local port (`EPERM`). The identical command passed when rerun with local-server permission. Two stale placeholder-era test expectations were corrected; no failure was suppressed.

## Remaining Content Blockers

- Independent human review records do not yet exist.
- Hydraulic simulation fault behavior and training ranges need reviewed evidence or an approved pedagogical rationale.
- Hydraulic and thermodynamics safety wording requires a named safety or engineering reviewer.
- The fluid, pump, and thermodynamics lessons remain drafts and must pass the versioned content-review workflow before publication.
- The full Smart Pump Systems and thermodynamics curricula still require many sources beyond this four-topic onboarding scope.
- Metadata-only source URLs can change; periodic source-link and document-hash verification is required.

## Prompt 40 Readiness

**CONDITIONAL GO.** Prompt 40 may proceed for independent review workflow, additional source acquisition, or development that preserves the current draft gates. It must not publish these lessons or mark the hydraulic simulation `Simulation checked` or `Approved for student use` until the named human review and remaining evidence requirements are complete.
