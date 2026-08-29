# Reference Visual Simulation: Thermodynamic System Boundary

Status: Internal replication candidate
Date: 2026-08-27
Simulation ID: `sim-core-thermal-system-001`

## Purpose

This simulation is the first cross-subject replication of Industrial Learn's Visual
Simulation Foundation. It lets a learner state whether mass and energy may cross a selected
boundary, then see the system classified as open, closed, isolated, or indeterminate.

It is a visual classification model, not a thermodynamic property or process calculator.

## Interaction Contract

The learner controls two declared states:

- mass crossing: not permitted or permitted;
- energy crossing: not permitted or permitted.

Both use labelled discrete controls. The simulation exposes one digital classification
measurement and a text summary. No slider implies a continuous physical magnitude.

## Visual Model

The lightweight schematic contains surroundings, a dashed stated boundary, the selected
system, and labelled mass/energy crossing paths. Text and line semantics accompany colour.
The live workspace uses the same state labels as the classifier.

The optional `boundary-shift` diagnostic state changes the boundary depiction and returns
an indeterminate classification. It is explicitly an analysis condition, not an equipment
fault.

## Modes

- Learn introduces the visual parts and classifications.
- Guided supports a structured classification task.
- Explore permits deliberate combinations of the two crossing states.
- Fault diagnosis examines an inconsistent or changed selected boundary.
- Assessment is not supported at this review gate.

Unsupported modes remain absent from the registry definition and user interface.

## Time And Animation

The model has no time progression. Start records an active state, but stepping and speed do
not alter the classification. The UI therefore hides time-speed controls. Visual transitions
may be restrained presentation changes only and must not imply mass-flow rate, heat-transfer
rate, or transient response.

## Curriculum Traceability

- Lesson: `LES-THERMO-SYSTEMS-SURROUNDINGS-001`
- Knowledge file: `KF-THERMO-SYSTEMS-SURROUNDINGS-001`
- Module: Thermodynamics Foundations
- Sources: `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021` and
  `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`
- Internal rule: `RULE-THERMO-SYSTEM-BOUNDARY-001`

The OpenStax record supports wider lesson context but is not needed to execute the
classification rule.

## Accessibility And Responsive Behaviour

Controls have visible labels and keyboard-native selection. The visual has a text
alternative, classification is emitted as text, and the boundary fault has a non-colour
description. The SVG scales without forcing horizontal page overflow. Reduced motion does
not change any learning result because the model is state-based.

## Persistence Contract

The shared attempt service can persist a bounded summary: mode, selected crossing states,
classification code, one digital measurement, optional boundary fault, and competency from
the existing mode policy. It does not store animation frames or fabricated time-series data.

Production persistence remains disabled until the human review and database release gates
are complete.

## Known Limitations

- The model classifies only the learner's stated boundary conditions; it does not infer a
  real apparatus from a photograph or process diagram.
- It does not calculate energy quantity, mass flow, properties, equilibrium, or efficiency.
- The boundary-shift task needs independent education and engineering acceptance before
  student release.
- Review status is `Engineering review required`; operational availability is `Coming later`.
