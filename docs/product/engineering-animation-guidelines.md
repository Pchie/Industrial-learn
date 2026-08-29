# Engineering Animation Guidelines

## Principle

Animation is a representation of engineering state over time or between discrete states. It is not decoration and it is never an independent simulation.

## State Pipeline

`domain state -> visual-state adapter -> renderer -> accessible state summary`

The runtime supplies time, status, values, and transitions. The adapter may map a velocity to arrow cadence or a pressure value to a labelled gauge angle. A CSS duration, frame counter, or particle speed must not feed back as a trusted engineering value.

## Playback Controls

- Play advances runtime time using the declared update policy.
- Pause freezes time progression while controls that are safe at rest remain available.
- Reset restores definition defaults and clears transient visual state.
- Step advances one deterministic interval and announces the resulting state.
- Slow and Normal change presentation/runtime cadence through the runtime speed command.
- Reduced motion uses discrete snapshots, shorter transitions, or step-first operation without changing calculated results.

Every control has an accessible name, visible focus, keyboard activation, and stable dimensions.

## Renderer Selection

| Renderer | Use when                                                                         | Avoid when                                                                                           |
| -------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| SVG      | Components, schematics, vectors, gauges, labels, and most 2D cutaways            | Extremely high element counts or dense continuous fields                                             |
| Canvas   | Particle fields, traces, or many repeated moving marks                           | Semantics, component selection, and labels cannot be supplied separately                             |
| WebGL    | Educationally necessary 3D spatial reasoning or complex continuous visualisation | 2D diagrams communicate the outcome, low-end devices cannot be supported, or 3D is merely decorative |

SVG is the default because it scales, supports component IDs, and permits robust accessible alternatives. Renderer choice does not change calculation ownership.

## Domain Conventions

### Hydraulic And Fluid

- Direction: arrowheads and moving dash or particle pattern, plus a text direction label where needed.
- Pressure: numeric label or gauge, line-weight/pattern state, and optional semantic colour.
- Valve: visible mechanical position and named Open, Closed, Restricted, or Faulted state.
- Restriction: standard narrowing/obstruction shape plus label and before/after measurement points.
- Leakage: explicit alternate path, broken/droplet pattern, and `Leak detected` label.
- Cylinder: stable piston/rod geometry, chamber labels, and a force vector. Position changes only when a reviewed kinematic model exists.

### Electrical

- Energised path: solid emphasized path plus `Energised` label; de-energised remains structurally visible.
- Current: direction arrows and numeric current where available.
- Voltage: node labels and meter readings, not a colour wash alone.
- Contact: geometrically open or closed with a text state.
- Fault: break, bridge, fuse, or relay symbol with an announced fault state.

### Thermal

- Temperature: numeric value, labelled scale, and pattern/texture in addition to colour.
- Heat transfer: directional arrows labelled with transfer direction or rate when calculated.
- Phase/state: explicit text and symbol; particle depictions are explanatory models, not property data.
- Fluid direction and energy transfer use distinct paths and legends.

### Mechanical

- Force and reaction: anchored vectors with magnitude and direction labels.
- Torque/rotation: curved arrows with axis and sign convention.
- Stress: labelled regions and scale; no unlabelled rainbow contour.
- Deflection: undeformed reference plus deformed shape. Any magnification is visibly disclosed.
- Velocity: vector or path markers with value and reference frame.

### Automation

- Signals: directional paths with source/destination, state value such as `0/1` or engineering value, and timestamps when relevant.
- Device state: shape/icon and label as well as colour.
- Stale, bad-quality, or simulated signals receive distinct status text and patterns.

## Visual Integrity Rules

1. Display units and precision come from declared metadata or calculation results.
2. If a model omits losses, the animation must not imply observed real-machine performance.
3. Exaggerated movement, deformation, temperature range, or timing is labelled `visual scale exaggerated` or equivalent.
4. Invalid inputs produce no plausible motion. Dependent state is held or replaced with an explicit invalid state.
5. Alarm and fault motion must be pausable and must not flash above accessibility thresholds.
6. Visual overlays cannot obscure measurements, labels, controls, or focus indicators.
7. A legend explains patterns, arrows, symbols, and semantic colours.

## Accessible Equivalent

Each significant state provides a concise text summary, for example: `Cylinder idle. Cap-end pressure 5.0 MPa. Effective area 0.0020 m2. Theoretical extension force 10.0 kN. No reviewed motion model is active.` Changes are announced selectively and throttled; rapidly changing values are available on demand instead of flooding a live region.

Controls use native elements where possible. Dragging is optional, never exclusive. A screen-reader sequence presents equipment state, available controls, measurements, equation result, alerts, and challenge prompt in a predictable order.

## Performance And Quality

- Animate transforms and opacity where possible; avoid layout-heavy per-frame updates.
- Stop visual loops when paused, offscreen, or hidden.
- Honour device and low-data capabilities without changing domain results.
- Test at mobile, tablet, and desktop dimensions; 200% zoom; reduced motion; keyboard-only; and representative low-end performance.
- Compare renderer outputs to known domain states and canvas/SVG nonblank checks. A passing screenshot alone is not an engineering verification.
