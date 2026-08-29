# Prompt 39E Visual Standardisation Audit

Audit date: 2026-08-27

Branch: `codex/prompt-39-approved-sources`

## Executive Verdict

**IMPLEMENTED, ENGINEERING REVIEW STILL REQUIRED**

Industrial Learn now has a permanent Visual Lesson Standard V1, six category contracts,
versioned structured metadata, category-aware validation, shared visual-state semantics,
authoring guidance, and a release checklist. The Hydraulic Cylinder Force pilot is the
reference phenomenon lesson and retains its honest internal/review-gated status.

No new subject simulation, dependency, database migration, engineering equation, source
approval, or application feature outside the visual lesson foundation was introduced.

## Standards Created

- `docs/product/visual-lesson-standard-v1.md`
- `docs/product/visual-lesson-types.md`
- `docs/product/visual-authoring-guide.md`
- `docs/product/visual-lesson-release-checklist.md`
- `docs/product/reference-visual-lesson-hydraulic-cylinder.md`

The standard covers first-screen hierarchy, Micro Theory, optional Deep Dive, compact
outcomes, progression, component conventions, state semantics, units, input/output
metadata, challenge patterns, applications, theory-first exceptions, and governance.

## Prompt 39D Findings Corrected

| 39D finding                                      | Prompt 39E correction                                                                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diagram delayed by metadata, progress, and TOC   | Hero remains before those surfaces; outcomes/prerequisites are a compact post-hero disclosure and the visual progression replaces the visual-lesson TOC |
| Visual competed with a separate vector panel     | Force vector is integrated in the cylinder SVG and the canvas uses a single visual column                                                               |
| Playback implied unsupported time dynamics       | Play, Pause, Step, speed, frame, and demonstrative piston/load movement were removed from this static model                                             |
| Primary controls had excessive focus distance    | Pressure and diameter controls are placed in the simulation shell before secondary measurements                                                         |
| Raw Pa/N dominated Quick                         | Gauge and force use explicit MPa/kN display conversions; Engineering Live Equation retains Pa/N                                                         |
| One-option measurement selector added overhead   | The state-derived P1 gauge is shown directly                                                                                                            |
| Linked component buttons repeated SVG selection  | The duplicate button list was removed; physical and schematic cylinder selection remains linked                                                         |
| Challenge success was automatic and duplicated   | Start and Check are explicit; one challenge component owns feedback                                                                                     |
| Quick/Deep Dive and source explanations repeated | The hero exposes Quick/Engineering only; one downstream Deep Dive and one collapsed source-record path remain                                           |
| Mobile was a scaled desktop stack                | The main canvas is single-column, nonessential SVG labels hide at narrow widths, and a readable ordered state-path legend recomposes vertically         |
| Live state was not announced                     | One concise current-state summary uses polite status semantics                                                                                          |
| Slug-specific experience injection               | A simulation-ID visual experience registry now resolves the route override                                                                              |

## Schema And Validation

Visual-v2 lessons now require:

- One of `phenomenon`, `component`, `system`, `calculation`, `diagnostic`, or `design`.
- `visualStandardVersion: 1.0.0`.
- First-screen purpose, primary visual ID, and primary control IDs.
- At least three valid progression steps.
- Complete simulation input and output metadata.
- Category-required block types.
- The declared first-screen visual in the first `heroExperience` stage.

Challenges declare pattern, goal, allowed actions, success condition, structured feedback,
and model assumptions. Deep Dive is optional. Existing linear lessons remain compatible
without new visual metadata.

## Engineering And State Boundaries

No governing equation changed. The existing pure functions remain authoritative:

- `pistonAreaFromDiameter` under `EQ-HYD-PISTON-AREA-DIAMETER-001`.
- `forceFromPressureAndArea` under `EQ-FLUID-FORCE-PRESSURE-AREA-001`.

`convertFromSi` was added as the explicit inverse display conversion of the existing
reviewed conversion table. It returns the standard engineering result structure and does
not alter internal SI calculations.

The design system now exports formal normal, active, selected, warning, fault, disabled,
measurement, and target semantics with text labels and non-colour cues.

## Tests

Final quality-gate evidence was recorded against the completed Prompt 39E worktree.

| Command                       | Result                                                     |
| ----------------------------- | ---------------------------------------------------------- |
| `npm run scan:secrets`        | PASS                                                       |
| `npm run format:check`        | PASS                                                       |
| `npm run typecheck`           | PASS, all TypeScript workspaces                            |
| `npm run lint`                | PASS                                                       |
| `npm run validate:content`    | PASS, 19 tests                                             |
| `npm run validate:migrations` | PASS, 13 tests                                             |
| `npm run test:unit`           | PASS, 228 tests; 4 explicitly skipped                      |
| `npm run build`               | PASS, optimized Next.js build and 53 static pages          |
| `npm run test:smoke`          | PASS, 5 tests                                              |
| Hydraulic visual E2E          | PASS, 7 tests including desktop first-screen guard         |
| `npm run test:e2e`            | PASS, 84 tests including accessibility and security checks |

The E2E server emits the existing `NO_COLOR`/`FORCE_COLOR` Node warning. The dashboard
error-state test also logs its intentional simulated database failure. Neither represents
a failed gate.

## Responsive Verification

- The optimized render has no horizontal page overflow at the tested 320, 375, 430, 768,
  1,024, and 1,366 px widths.
- At 1,440 by 900, an automated first-screen guard verifies that the pressure control and
  identifiable cylinder visual both begin inside the initial viewport.
- At 375 by 900, the title, purpose, honest review state, progression, Adjust Inputs action,
  and the start of the cylinder visual are visible before the first viewport ends.
- Mobile places the main visual before the full control and measurement stack while retaining
  keyboard-operable numeric alternatives.
- Reduced-motion, keyboard interaction, linked schematic selection, and dynamic text
  equivalents pass the browser suite.

## Compatibility And Security

- Linear lesson rendering and schemas remain supported.
- Publication and review statuses were not elevated.
- Formal assessment remains authenticated and server scored.
- No hidden answer, user-data, persistence, RLS, credential, or cross-student path changed.
- Source records remain visible at the end of the lesson without dominating the primary
  interaction.

## Known Limitations

- The hydraulic scene is a responsive SVG with a narrow-screen text legend, not a
  separately authored mobile illustration.
- The 15 kN challenge remains a single idealised educational target; it does not teach a
  sourced pressure constraint or equipment selection.
- No independent human engineering, educational, or accessibility review record was
  created by this implementation.
- Low-end physical-device interaction timing and field telemetry remain unmeasured.
- The registry contains one reference experience by design; a second subject should wait
  for the next replication gate.

## Prompt 39F Readiness

**GO.** Prompt 39F may proceed from Visual Lesson Standard V1 and the Hydraulic Cylinder
Force reference implementation. The next work must keep the named human engineering,
educational, and accessibility review gates explicit; this implementation does not convert
the pilot's `Engineering review required` state into approval for student use.
