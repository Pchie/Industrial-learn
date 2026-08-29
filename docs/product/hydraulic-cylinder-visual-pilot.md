# Hydraulic Cylinder Visual Pilot

## Pilot Decision

Use the existing hydraulic-cylinder force simulation as the first visual lesson pilot because its normal calculation path is pure, tested, SI-based, and traceable to `EQ-FLUID-FORCE-PRESSURE-AREA-001` and `SRC-PARKER-140H8-CYLINDER-2024`.

The current simulation is `Equation checked`, not `Simulation checked`. The pilot specification therefore covers a checked ideal theoretical extension-force relationship and clearly separates unreviewed motion, ranges, and faults.

## Learning Outcome

Given pressure and effective cap-end piston area, the student predicts and calculates ideal theoretical extension force, explains the direct proportional relationships, checks SI units, and identifies why the result is not an equipment rating or guaranteed available force.

## Model Boundary

Included in the first pilot:

- Validated pressure and piston diameter controls with explicit MPa-to-Pa and mm-to-m conversion.
- Circular cap-end area `A = pi D^2 / 4` through `engineering-core`.
- Ideal theoretical extension force `F = pA` through `engineering-core`.
- Structured result, substitution, assumptions, warnings, and validity.
- Synchronized pressure gauge, area representation, force vector, measurement, and Live Equation.
- Static or state-transition cutaway representations that do not imply reviewed travel speed.

Excluded until separately sourced, implemented, and reviewed:

- Rod-side annular area and retraction behaviour.
- Retraction force, friction, dynamic losses, buckling, acceleration, load stability, and machine structure.
- Cylinder stroke or speed from flow and geometry.
- Manufacturer pressure, area, force, or temperature ratings.
- Real lifting permission or hydraulic safety procedure.
- Existing draft pressure-loss and seal-leak percentages, gauge behaviour, and unsupported nominal readings.

Prompt 39C satisfied the diameter-input gate with the pure `pistonAreaFromDiameter` function, explicit length conversion, `EQ-HYD-PISTON-AREA-DIAMETER-001`, source linkage, and automated tests. The lesson remains internal pending independent review.

## Experience Sequence

### 1. Hero Experience

Open on an internal cylinder cutaway with cap-end chamber, piston, rod, pressure gauge, effective area highlight, and force vector. A single prompt asks: `What changes the theoretical extension force?` The initial state is valid and clearly labelled as an ideal training model.

The illustration may show force readiness or relative magnitude. It must not animate rod travel until a reviewed kinematic model exists.

### 2. Explore

Students vary pressure and piston diameter with paired sliders and number inputs. Every update is validated, explicitly converted to SI, calculated by `engineering-core`, passed to the simulation runtime, and reflected in the gauge, piston-area cue, force vector, output display, and state summary.

The UI exposes External, Cutaway, and Schematic views using shared IDs for the pressure source, cylinder chamber/piston, and educational load.

### 3. Observe

Before theory, ask:

- What happens to force when pressure increases while area is fixed?
- What happens when area increases while pressure is fixed?
- Which two displayed quantities changed together?

Responses are ungraded observation prompts. Feedback refers to the state the student created rather than exposing an assessment answer.

### 4. Micro Theory

Explain in short sourced statements that pressure acting over effective area produces an ideal theoretical force. Define pressure, force, and effective area. State that actual available force may be lower and that the model is not an equipment rating.

### 5. Live Equation

Quick mode shows `pressure x effective area -> theoretical extension force`. Engineering mode shows the checked equation, SI substitution, calculation steps, assumptions, warnings, and validity from the calculation result. Deep Dive links to pressure fundamentals, effective-area limitations, and the approved sources.

### 6. Load Challenge

Present an abstract opposing-force target, for example a draft 15 kN training target, explicitly labelled as a lesson condition rather than equipment data. Students adjust pressure and effective area until calculated theoretical force meets the target, then submit the state and explain the trade-off.

Success means satisfying the reviewed numerical relationship. The visual reports `calculated force meets target`; it does not claim that a real load has been safely raised. A graded version delegates scoring to the server assessment service.

### 7. Fault Exercise

**Deferred for student release.** Current fixed pressure-loss and seal-leak effects lack sufficient evidence and simulation review. The schema may show this stage to authors as `Evidence required`, but students must not receive a convincing unsupported diagnosis exercise.

After evidence is approved, the fault design must define observable symptoms, valid measurement points, normal comparison, diagnosis options, safety wording, and normal/boundary/fault tests before activation.

### 8. Real-World Application

Use an original simplified excavator linkage illustration to show that a hydraulic cylinder can form part of a larger mechanism. The narrow application statement is linked to `SRC-CAT-BOOM-CYLINDER-6040431-2026`. The drawing contains no copied asset or rating and still requires independent educational, engineering, and safety review.

### 9. Knowledge Check

Provide six local, non-graded knowledge prompts after the visual experience and link to the existing authenticated, server-scored fluid-pressure assessment. The client receives no formal answer key. Merely operating the pilot awards no progress or verified competency.

### 10. Deep Dive

Preserve current worked calculation, symbol definitions, SI notes, assumptions, limitations, extension-only scope, actual-force limitation, and source references. A future reviewed section may introduce cap-end and rod-end area derivation without changing the initial Quick experience.

### 11. Sources

Display source records, equation ID, lesson/content version, simulation version, and technical-review badges. `Source checked` or `Equation checked` must not be presented as `Approved for student use`.

## Visual And Instrument Contract

| Element        | State source                  | Representation                                                                     |
| -------------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| Pressure gauge | Runtime pressure input/result | Needle plus numeric Pa/MPa label and validity                                      |
| Effective area | Validated input               | Labelled piston-face region and numeric m2 value                                   |
| Force vector   | Calculation result            | Direction arrow, numeric N/kN label, scalable length with disclosed visual scaling |
| Cylinder state | Runtime status                | Idle/running/paused/invalid label; no fake travel                                  |
| Schematic      | Shared component state        | Cap-end pressure connection, cylinder symbol, gauge point                          |
| State summary  | Same runtime/result           | Concise sentence reporting pressure, area, theoretical force, and model boundary   |

## Mobile And Accessibility

Mobile order is equipment, controls, measurements, Live Equation, then challenge. Sliders have number inputs, views are keyboard-operable tabs, component selection is mirrored in a list, and current state can be read on demand. Reduced motion uses discrete force-vector/gauge updates. Low-data mode loads simplified SVG and the same calculation controls before any detailed cutaway.

## Review Gates

1. Educational review of observation sequence and challenge language.
2. Engineering review of visual mapping, sign/direction, units, area terminology, and model boundary.
3. Safety review of pressure-system wording and real-world application.
4. Simulation review of normal, boundary, invalid, reset, synchronization, and accessibility test evidence.
5. Asset rights and source review for the excavator application.
6. Named review records and versioned publication approval before student release.

## Acceptance Evidence

The pilot is ready only when equation, gauge, force vector, output, and accessible summary match for known answers; invalid values produce no plausible motion; all controls work without drag; mobile and reduced-motion layouts remain usable; no hidden answer ships early; and unsupported fault/application stages remain unavailable.
