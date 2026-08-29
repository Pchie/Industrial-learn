# Hydraulic Cylinder Force User Flow

## Entry

The student opens `/lessons/hydraulic-cylinder-force`. A compact lesson identity and honest internal review status are followed immediately by the registered visual experience. Metadata and section navigation follow the hero experience instead of delaying it.

## Primary Flow

| Step      | Student action                               | System response                                                                 |
| --------- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| See       | Reviews the paused cutaway and callout       | Shows pressure, piston diameter, area, gauge, force, load, and text summary     |
| Play      | Changes pressure or diameter                 | Synchronises slider/number input and recomputes the checked SI model            |
| Observe   | Selects hint or explanation                  | Gives concise, non-graded proportionality feedback                              |
| Explain   | Keeps Quick or selects Engineering/Deep Dive | Reveals equation substitution, assumptions, steps, or model limits              |
| Challenge | Starts `Lift the load`                       | Shows target, calculated force, signed margin, and announced condition feedback |
| Apply     | Reviews the excavator boom example           | Connects cylinder force to a mechanism while stating missing real-machine terms |
| Check     | Completes six local explanation checks       | Reveals only local non-graded feedback                                          |
| Continue  | Opens the formal assessment or Deep Dive     | Uses the existing secure route or preserved technical content                   |

## Representation Flow

External, Cutaway, and Schematic are keyboard-operable radio controls. Selecting the physical cylinder or schematic symbol writes the same component ID, so the linked representation remains highlighted when views change. P1 selects the cap-end pressure measurement supplied by simulation state.

## Challenge Feedback

Before the threshold the live region says `Not enough theoretical force.` At or above 15,000 N it says `The cylinder now produces sufficient theoretical force for this idealised load.` The interface always displays required force, calculated force, and margin and never claims that the design is safe.

## Responsive Order

Desktop prioritises the central SVG, with controls and measurements in the simulation shell and equations/challenge below. Mobile follows simulation, playback, primary controls, measurement, equation, challenge, explanation, and application. At 375 px the production render has no document-level horizontal overflow; both range controls retain a 223 px track and numeric alternatives.

## Accessibility Flow

- Every range input has a synchronised labelled number input.
- Playback, representation, component, measurement, depth, observation, and challenge controls are keyboard operable.
- The gauge, force vector, cutaway, schematic, and dynamic state expose text equivalents.
- Challenge feedback uses an announced status and text, not colour alone.
- Reduced-motion mode prevents automatic frame progression and preserves explicit stepping.
- Low-data mode retains all engineering readings and controls while simplifying visuals.
- Browser zoom is not disabled.

## Authentication And Progress

The visual lesson does not create progress merely by opening or operating it. Signed-out users see no fabricated progress. The formal assessment remains authenticated and server scored; its hidden answers are not included in the lesson content or client experience payload.
