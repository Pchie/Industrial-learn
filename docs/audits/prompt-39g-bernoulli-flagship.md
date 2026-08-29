# Prompt 39G Bernoulli Flagship Audit

Audit date: 2026-08-27

## Executive Verdict

Implementation verdict: **PASS for the internal flagship pilot**.

Publication verdict: **NO-GO for `Approved for student use`**. The source evidence
is checked, but the lesson, simulation, and equations correctly remain
`Engineering review required` pending named independent review.

## Source Gate

**PASS for the declared internal ideal model.** Official OpenStax sections 12.1
and 12.2 support flow rate, average velocity, continuity, Bernoulli terms, and the
ideal pressure-velocity relationship. The official NASA Glenn page supports the
declared model restrictions. The source records are
`SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022` and `SRC-NASA-GLENN-BERNOULLI`.

## 1. Simulation Built

`/lessons/bernoulli-flow-lab` resolves a visual-first horizontal pipe-contraction
experience. The first substantive lesson block is the interactive visual, not a
theory wall. It provides cutaway and linked schematic views, P1/P2 measurements,
head terms, observation, explanation, challenge, application, and check stages.

## 2. Sources Used

- `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`: OpenStax College Physics 2e, sections
  12.1 and 12.2.
- `SRC-NASA-GLENN-BERNOULLI`: official NASA Glenn Bernoulli education page and
  restrictions.

Both records are metadata-only and `Source checked`. Neither is a student-use
approval, component specification, or equipment standard.

## 3. Model Assumptions

The pilot is steady, incompressible, constant-density, frictionless, horizontal,
and leakage-free. It includes no pump work, turbine work, heat transfer, or loss
term. D1, P1, density, gravity, and the datum are declared model parameters. See
`docs/content/bernoulli-model-assumptions.md`.

## 4. Interactions

Students change Q from 1 to 6 L/s and D2 from 20 to 60 mm through synchronised
sliders and number inputs. They select P1 or P2, switch representations, inspect
live measurements, open depth levels, play or pause the presentation cue, reset
deterministically, and answer non-graded prompts.

## 5. Equations

Pure `engineering-core` functions provide explicit SI conversion, circular area,
section-average velocity, two-point ideal Bernoulli pressure, pressure head,
velocity head, and total ideal head. React receives calculation results and
equation metadata; it does not implement the equations. All new equation records
remain `Engineering review required`.

## 6. Challenges

The velocity challenge targets 6 m/s at section 2 within 0.2 m/s and reports the
current value and signed difference. The pressure challenge asks the student to
predict whether P2 is higher, lower, or the same before revealing the calculated
relationship. Both are practice-only and award no competency.

## 7. Real-World Application

An original Venturi-style differential-pressure schematic connects the ideal
contraction to a practical measurement concept. It explicitly states that real
geometry, calibration, fluid properties, and loss treatment are additional
requirements. It is not presented as a calibrated meter.

## 8. Simulation Lab Integration

`/simulations/bernoulli-flow-lab` exposes the registry-driven detail, and
`/simulations` discovers the pilot through search, combined filters, and the Fluid
Mechanics Fundamentals collection. The catalogue entry exposes only Learn,
Guided, and Explore; unsupported fault and assessment modes remain absent.

## 9. Reusable Architecture Assessment

All 11 requested platform capabilities were reused: shell, controls, gauge,
measurement points, LiveEquation, ObservationPrompt, MicroTheory, challenge
evaluation, linked schematic state, content depth, and registry. This is **11/11
capability reuse (100%)**, not a source-line percentage. See
`docs/audits/prompt-39g-architecture-reuse.md`.

## 10. Hard-Coded Exceptions

The two-section SVG, model adapter, control bounds, fixed educational parameters,
pressure-point labels, and challenge targets are intentionally Bernoulli-specific.
They are centralised in domain/content records rather than hidden UI calculation
logic. A third abstraction was not added without evidence of repeated complexity.

## 11. Tests

- `npm run scan:secrets`: PASS.
- `npm run format:check`: PASS after final formatting.
- `npm run typecheck`: PASS across all workspaces; the final production build also
  completed TypeScript validation.
- `npm run lint`: PASS.
- `npm run validate:content`: PASS, 19 tests.
- `npm run validate:migrations`: PASS, 14 tests.
- Focused Bernoulli and reused-surface suite: PASS, 105 tests.
- `npm run test:unit`: PASS, 276 passed and 4 intentionally skipped.
- `npm run build`: PASS, 54 generated routes.
- `npm run test:smoke`: PASS, 5 tests.
- `npm run test:e2e`: PASS, 103 Chromium tests.
- `git diff --check`: PASS.

The Playwright server emitted the existing `NO_COLOR`/`FORCE_COLOR` warning and
the intentional simulated dashboard-database error used by its passing safe-error
test. Neither is a product failure.

## 12. Performance

The two JavaScript chunks containing Bernoulli signatures total 76,648 B raw and
19,347 B gzip. The matched CSS chunk is 38,163 B raw and 4,572 B gzip. Warm
input/update/readback samples had an 85 ms median including automation transport.
There is no WebGL, 3D dependency, or background time-step loop. See
`docs/performance/bernoulli-performance.md` for measurement boundaries.

## 13. Accessibility

Axe found no critical automated violations on the Bernoulli lesson or detail
route. Keyboard selection, linked schematic state, numeric alternatives,
announced challenge feedback, text measurements, reduced motion, and mobile
layout passed. Production checks found zero horizontal overflow; the mobile Play,
Pause, and Reset targets measure 44 px high. Initial presentation particles are
paused, and reduced motion removes their animation.

## 14. Review Status

Lesson publication status is `internal`. Lesson, simulation, knowledge, equation,
safety, and visual records remain `Engineering review required`. No approval was
invented, and no competency or progress is awarded for opening or exploring the
pilot.

## 15. Known Limitations

- Independent source, equation, educational, simulation, and accessibility review
  is not yet recorded.
- The model omits elevation control, losses, turbulence, cavitation,
  compressibility, transients, flow profiles, equipment ratings, and faults.
- Fixed density and P1 are educational boundary conditions, not property or rating
  claims.
- Flow animation is presentational; no velocity-time physics is modelled.
- There is no graded Bernoulli assessment or calibrated instrument model.
- Synthetic timing is not field performance data.
- Migration `0010` is version controlled but has not been applied to a live database.

## 16. Recommended Prompt 40

Conduct a named independent review of the two flagship visual simulations and
Visual Lesson Standard V1. Verify source use, equations, visual conventions,
learning sequence, accessibility, responsive behavior, challenge bounds, and
normal/boundary/invalid-state evidence. Record review decisions before approving
either pilot for student use or beginning a third flagship simulation.
