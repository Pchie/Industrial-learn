# Visual State Contract

## Purpose

Visual state is a disposable presentation model derived from simulation state. It lets SVG and other renderers display engineering state without becoming calculation or simulation engines.

## Contract

`VisualOperatingState` contains:

- Status: idle, running, paused, faulted, or invalid.
- A concise accessible state summary.
- A record of components keyed by stable component ID.

Each `VisualEngineeringState` may declare only the properties it needs:

- Active/inactive and selected/measured flags.
- Direction and relative magnitude.
- Normalized or viewport position and rotation.
- Pressure, flow, temperature, voltage, current, force, torque, or velocity quantities.
- Warning and fault labels.
- A typed discipline-specific extension.

Every quantity contains a supplied value, unit, and optional validity. A visual component may map a value to a bounded coordinate, line weight, gauge angle, or vector length. It cannot derive a new engineering quantity.

## Adapter Rule

```text
VisualStateAdapter<DomainState, DisciplineExtension>
  = domainState -> VisualOperatingState<DisciplineExtension>
```

Adapters are pure and one-way. They may:

- Normalize a reviewed magnitude for display.
- Choose a pattern, label, vector, or component pose from a domain state.
- Generate the accessible state summary.
- Mark selected and measured components.

Adapters may not:

- Implement an equation.
- Apply an unreviewed loss or fault multiplier.
- mutate simulation state.
- Treat animation position as an input measurement.
- invent a value when the supplied state is invalid.

## Display Scaling

Vector length uses a declared scale with domain minimum/maximum and visual minimum/maximum. Values are clamped and linearly normalized; negative values use absolute magnitude while direction is represented separately. This prevents arbitrary arrow lengths and makes visual exaggeration reviewable.

Flow line weight uses a supplied normalized magnitude in `[0, 1]`, clamped to a stable 4-12 px display range. It is a relative visual cue, not a flow calculation.

Gauge needles clamp to the declared instrument display range. The original reading remains printed and an explicit overflow message appears, so visual clamping never changes the underlying measurement.

## Measurement Contract

A measurement point declares component ID, quantity, label, and compatible instrument types. A reading declares point ID, quantity, supplied value/unit, validity, and optional status.

Selection succeeds only when:

1. The point exists.
2. The instrument is compatible.
3. A reading exists for that point.
4. Reading and point quantities match.

The drawing never stores the measurement value. Pointer coordinates are not measurements.

## Linked Representations

External, cutaway, and schematic manifests share `componentId`. The selected component is held once and passed to every representation. Requested unsupported views fall back to the first declared supported representation rather than creating independent state.

## Challenge Contract

Challenges declare state keys, operators, targets, tolerances, units, controls, hints, and competency relationship. The pure evaluator compares supplied state values with those conditions. It does not calculate the state value or award competence.

## Serialization

The contracts use primitives, records, and arrays so domain and visual state remain serializable where practical. React nodes and callbacks exist only at the component boundary, not inside simulation state.
