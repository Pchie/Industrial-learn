# Hydraulic Cylinder Force Visual Lesson

## Identity

- Lesson ID: `LES-HYD-CYL-FORCE-VISUAL-001`
- Slug: `hydraulic-cylinder-force`
- Version: `0.1.0`
- Experience model: `visual-v2`
- Visual lesson type: `flagship-simulation`
- Publication status: `internal`
- Technical review status: `Engineering review required`
- Simulation: `SIM-HYD-CYL-FORCE-001`
- Prerequisite: `LES-FLUID-PRESSURE-001`
- Estimated total time: 30 minutes
- Estimated interaction time: 20 minutes

The lesson is not approved for student publication. `Equation checked` and `Source checked` records support technical review; they do not replace a named independent review record.

## Student Experience

The registered visual experience is promoted directly below the compact lesson identity. Metadata, progress guidance, navigation, the knowledge check, Deep Dive, and source records follow it. The main experience follows this sequence:

1. See a controlled cap-end cylinder model in a paused state.
2. Change pressure and piston diameter with synchronized sliders and number inputs.
3. Observe pressure, circular piston area, theoretical force, vector magnitude, and load condition.
4. Reveal concise observation feedback.
5. Move from Quick to Engineering or Deep Dive explanations.
6. Meet a 15 kN educational opposing-force target.
7. Link the cutaway cylinder to its schematic symbol and measurement point.
8. Relate the principle to an excavator boom-cylinder context.
9. Complete six non-graded checks or open the existing formal assessment.

No theory block is mandatory before first interaction.

## Engineering Path

The client feature contains no independent hydraulic formula. Its pure model:

1. validates the educational input bounds;
2. converts MPa to Pa and mm to m with `convertToSi`;
3. calculates cap-end piston area with `pistonAreaFromDiameter`;
4. calculates theoretical force with `forceFromPressureAndArea`;
5. supplies pressure and checked area to the existing simulation runtime;
6. rejects the visual state if the runtime force differs from the engineering-core result.

Equation IDs are `EQ-HYD-PISTON-AREA-DIAMETER-001` and `EQ-FLUID-FORCE-PRESSURE-AREA-001`.

## Visual System

The SVG scene includes a generic pressure source, supply line, cap-end chamber, piston, rod, educational opposing load, P1 pressure point, gauge, and theoretical-force vector. It provides External, Cutaway, and Schematic representations. The physical cylinder and schematic cylinder share `COMP-HYD-CYL-PISTON-001` selection state.

The highlighted line represents a pressurised path. The lesson explicitly says that flow rate, piston velocity, stroke, and real load motion are not calculated. The displayed piston position is demonstrative.

## Learning Activities

Observation prompts are concise and ungraded. The load challenge reports required force, calculated force, and signed margin. Its success wording is limited to sufficient theoretical force for the idealised target. It does not use the phrase `safe design` or award progress or competency.

The formal assessment link uses the existing authenticated, server-scored assessment route. Formal answers remain outside the lesson payload. The six lesson questions are non-graded explanation checks and are not used as assessment credentials.

## Source Boundary

- `SRC-PARKER-140H8-CYLINDER-2024`: ideal push force, cap-end full piston area, annular rod-side context, and actual-output limitation.
- `SRC-NIST-SP330-2019`: SI units and explicit prefix conversion context.
- `SRC-CAT-BOOM-CYLINDER-6040431-2026`: narrow evidence that a boom cylinder converts hydraulic pressure into force for boom movement.

The original excavator visual copies no manufacturer image, dimensions, rating, or geometry. The application explanation explicitly excludes a lifting-capacity prediction from `F = pA` alone.

## Deferred Scope

- rod-side annular area and retraction force;
- flow, piston speed, stroke, and physically timed motion;
- friction, leakage, efficiency, buckling, structural capacity, and load stability;
- manufacturer ratings or operating limits;
- fault diagnosis, because the available pilot fault multipliers are not reviewed evidence;
- automatic progress or competency awards from interaction alone;
- analytics events, because no applicable privacy-reviewed client event path was present.
