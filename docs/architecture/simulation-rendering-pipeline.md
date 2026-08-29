# Simulation Rendering Pipeline

## Authoritative Flow

```text
Student control
    |
    v
Feature command and input validation
    |
    v
Engineering Core <-> Simulation Engine
    |
    v
Serializable domain simulation state
    |
    v
Pure VisualState adapter
    |
    +---- equipment / cutaway / schematic
    +---- virtual instruments
    +---- accessible state summary
    +---- Live Equation supplied result
    +---- challenge comparison
```

The rendering layer dispatches declared commands and renders returned state. It never becomes a parallel source of engineering truth.

## Playback

The Prompt 39B playback utility tracks display status, frame, display time, and a 0.5x/1x/2x speed. Play, Pause, Reset, and Step are deterministic transformations. These fields do not alter engineering values.

When Prompt 39C binds a time-based simulation, the simulation runtime remains responsible for engineering time progression. Display speed may change how state transitions are shown, but it cannot silently change a model unless the runtime explicitly processes that time command.

## Live Equation

Live Equation accepts:

- Equation name and reviewed expression metadata.
- Symbol definitions and SI units.
- An `EngineeringCalculationResult` supplied by engineering-core or simulation state.

It displays input values, result, unit, assumptions, validity errors, warnings, and equation ID. It does no arithmetic. A unit test supplies inputs whose product is 200 N but a result of 777 N and verifies that 777 N is displayed, proving the component is presentation-only.

## Instruments

Instrument configuration owns type, quantity, unit, min/max display range, warning range, and precision. Measurement point selection resolves a state-supplied reading. Gauge clamping affects only needle position; digital text retains the supplied value and reports invalid or out-of-range states.

## Flow And Vectors

- Flow uses direction markers, line weight, pattern, optional deterministic particles, stop marks, and labels.
- Reduced-motion and low-data modes replace particles with static arrows.
- Vectors show type, direction, supplied numeric value/unit, and a declared normalized length.
- Torque uses an arc; other supported vectors use a directional line.

No random values or decorative motion are present.

## Faults

`FaultVisualisationContract` records identity, affected component, symptoms, visual indicators, measurement changes, diagnostic evidence, supported modes, source IDs, and review status. Prompt 39B implements the contract and a status panel only. It injects no fault and creates no engineering fault behavior.

## Lesson Rendering

Existing lessons continue through the fixed `linear-v1` section path. A validated `visual-v2` lesson may declare its own `experienceSequence`. The lesson renderer handles new visual blocks through feature components or a reference/fallback until Prompt 39C supplies runtime state.

## Loading Boundary

The internal lab is a route-specific client boundary. Future heavy simulation visuals must be dynamically imported by simulation ID and may not be imported into the root layout. The lesson shell and text fallback must render before optional visual assets.
