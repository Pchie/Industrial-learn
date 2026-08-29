# Hydraulic Cylinder Visual Model

## Responsibility Boundary

`apps/web/src/features/hydraulic-cylinder-lesson/model.ts` is the lesson adapter between reviewed domain functions, the existing simulation runtime, and Prompt 39B visual contracts. React components consume its results; they do not calculate hydraulic quantities.

## Inputs

| Input           | UI unit | Educational range | Internal unit | Conversion                          |
| --------------- | ------- | ----------------- | ------------- | ----------------------------------- |
| Pressure        | MPa     | 0 to 20           | Pa            | `convertToSi`, explicit `MPa -> Pa` |
| Piston diameter | mm      | 25 to 100         | m             | `convertToSi`, explicit `mm -> m`   |

These ranges are interaction bounds, not equipment ratings. Non-finite values are rejected. Out-of-range UI entries are explicitly constrained and announced; the pure model rejects unvalidated out-of-range calls.

## Calculation Pipeline

1. `A = pi D^2 / 4` is evaluated by `pistonAreaFromDiameter` using `EQ-HYD-PISTON-AREA-DIAMETER-001`.
2. `F = pA` is evaluated by `forceFromPressureAndArea` using `EQ-FLUID-FORCE-PRESSURE-AREA-001`.
3. Pressure and area are sent to `hydraulicCylinderForceSimulation` in Learn mode.
4. The adapter compares the simulation output to the force result with a small floating-point tolerance.
5. A mismatch, invalid state, missing output, or failed conversion produces an invalid lesson model instead of a plausible visual state.

At 10 MPa and 50 mm, the checked model returns approximately `0.0019634954 m^2` and `19,634.954 N`.

## State Mapping

The adapter maps one validated state into:

- a pressure measurement from the simulation runtime;
- pressurised or unpressurised source, line, and chamber states;
- cap-end piston-area and theoretical-force readings;
- a text summary containing Pa, mm, and N;
- a theoretical-force vector;
- a 15,000 N challenge evaluation and signed margin;
- a normal-state visual contract used by all three representations.

No high-frequency frame history is stored. Playback frame count is local demonstrative UI state and does not change the hydraulic calculation.

## Visual Normalisation

Force-vector pixel length is calculated by the reusable `normalizeVisualMagnitude` function:

`L = L_min + clamp((F - F_min) / (F_max - F_min), 0, 1) * (L_max - L_min)`

For this lesson the documented visual domain is 0 to 160,000 N and the rendered length is constrained to 24 to 132 visual units. The arrow remains labelled with the actual N value. Its pixel length is a relative teaching cue, not distance, stroke, displacement, or a drawing scale.

Piston display size uses a separate clamped ratio across the 25 to 100 mm interaction range. The SVG changes proportionally enough to compare states but is not a manufacturing drawing.

## Motion Model

Play, pause, step, reset, and speed controls operate the shared playback contract. They update demonstrative frame/position state only. They do not claim physical time, flow rate, acceleration, piston speed, or stroke. Reduced-motion mode disables automatic progression and retains step operation.

## Challenge Model

The challenge condition is:

`F_theoretical >= 15,000 N`

The margin is `F_theoretical - 15,000 N`. The target is an educational opposing-force condition. No efficiency, safety factor, linkage, stability, structural, pressure-rating, or duty-cycle model is included, so success cannot establish real lifting safety or component selection.
