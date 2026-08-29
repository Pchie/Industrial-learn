# Hydraulic Cylinder Simulation Review

Source IDs: IL-AGENTS-001, IL-SIM-001, SRC-PARKER-140H8-CYLINDER-2024.

## Simulation

- Simulation ID: `SIM-HYD-CYL-FORCE-001`
- Slug: `hydraulic-cylinder-force`
- Version: `1`
- Discipline: Fluid mechanics
- Lesson IDs: `LES-FLUID-PRESSURE-001`, `LES-HYD-CYL-FORCE-VISUAL-001`
- Knowledge file IDs: `KF-HYD-CYL-FORCE-001`, `KF-FLUID-PRESSURE-FUNDAMENTALS-001`
- Equation IDs: `EQ-FLUID-FORCE-PRESSURE-AREA-001`
- Review status: `Equation checked`

## Review Verdict

The ideal extension-force calculation is traceable to the manufacturer catalog and the engineering-core equation is checked. The simulation cannot advance to `Simulation checked` because its input ranges, fixed fault percentages, gauge behavior, flow reading, and temperature reading remain pedagogical implementation choices rather than reviewed manufacturer data.

## Accepted Pilot Faults

The browser exposes existing simulation-engine pilot faults only:

- pressure loss
- gauge stuck
- seal leak

These are pedagogical fault states, not manufacturer diagnostic data. The fixed 60 percent pressure-loss behavior and 25 percent seal-leak force reduction are not supported by `SRC-PARKER-140H8-CYLINDER-2024`.

## Effective Area Decision

The reusable simulation models cap-end extension only and accepts an explicit effective `pistonArea` input. The Prompt 39C visual lesson calculates circular cap-end area from piston diameter with the separately checked `EQ-HYD-PISTON-AREA-DIAMETER-001` function before passing area into the simulation. Neither layer implements rod-side annular area.

## Visual Lesson Boundary

The visual lesson uses normal state only. It does not expose the simulation's existing unreviewed fault multipliers. Pressure colour, gauge, force vector, piston display size, schematic highlighting, and demonstrative piston position all derive from the same validated state, but pixel lengths and demonstrative position are not physical dimensions, stroke, or velocity. Input ranges and the load target are educational challenge values, not manufacturer data.

## Safety Boundary

Students must not treat the simulation as permission to inspect, adjust, disconnect, or operate pressurised hydraulic equipment. Real equipment decisions remain with authorised supervision and approved procedures.

## Remaining Review Work

- Obtain or approve evidence for pedagogical input ranges and fault behavior, or redesign them as clearly arbitrary exercises with a human-reviewed learning rationale.
- Complete independent educational, safety, and engineering review.
- Record named engineering reviewer, date, and version before any `Approved for student use` label.
