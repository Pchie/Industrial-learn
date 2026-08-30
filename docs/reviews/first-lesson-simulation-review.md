# First Lesson Simulation Review

Review date: 2026-08-30

Candidate: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.3.0`

Engineering-model verdict: **PARTIAL**

Simulation requirement for the lesson: **NOT APPLICABLE**

## Lesson Model Boundary

The selected lesson declares no `simulationIds`. Its model consists of the checked
`p = F / A` relationship, an original static force-over-area diagram, and a worked
example. The interactive-activity section explicitly says that no simulation state is
implemented.

| Element                             | Classification                                      |
| ----------------------------------- | --------------------------------------------------- |
| Pressure result in engineering-core | CALCULATED                                          |
| Worked example substitution         | CALCULATED from the checked equation                |
| Force-over-area diagram             | REPRESENTATIONAL                                    |
| Diagram arrow                       | REPRESENTATIONAL direction only; no magnitude scale |
| Future activity placeholder         | DEMONSTRATIVE text only; no executable model        |

There is no time progression, animation, state transition, measurement model, visual
scaling function, challenge logic, reset behavior, or fault injection to review for this
lesson version.

## Assessment Mismatch

The related assessment `ASM-FLUID-PRESSURE-001` includes:

- a hydraulic-cylinder simulation task using `SIM-HYD-CYL-FORCE-001`;
- a `seal-leak` fault-diagnosis item based on an unreviewed pedagogical fault; and
- `Operated`, `Diagnosed`, and `Designed` competency awards that exceed the lesson's
  declared introductory outcomes.

The lesson itself declares no simulation and does not teach these activities. The
hydraulic simulation remains unapproved and its fixed fault behavior is not manufacturer
diagnostic data. These assessment items cannot be treated as evidence that the selected
lesson's model or outcomes are complete.

## Visual Honesty

The static lesson diagram does not imply velocity, flow, pressure gradients, molecular
behavior, manufacturer construction, or equipment dimensions. That limited visual is
honest. The lesson also states that its calculation is not a pressure-vessel design case.

The fault-finding section is less satisfactory: listing a sensor or gauge issue as a
likely cause is a diagnostic claim without a suitable diagnostic source. It should be
removed, narrowed to an input/unit-check exercise, or supported and reviewed.

## Decision

No simulation review record is required for the current lesson because its
`simulationIds` list is empty. The broader lesson package remains `PARTIAL` because the
associated assessment imports an unapproved simulation and fault model. No simulation
may become public as a consequence of any future lesson approval.
