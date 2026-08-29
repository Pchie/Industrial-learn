# Pilot Engineering Review

Review date: 2026-08-26

## Reviewer Separation

| Role                 | Reviewer                                                               | Decision boundary                                                                |
| -------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Source reviewer      | Codex source-verification agent                                        | Metadata, origin, relevance, and rights checked; not an independent human review |
| Equation reviewer    | Codex automated-assisted equation review plus existing automated tests | Four implemented pilot equation records checked; not final engineering approval  |
| Educational reviewer | Unassigned                                                             | Required before publication                                                      |
| Engineering reviewer | Unassigned                                                             | Required before publication                                                      |
| Safety reviewer      | Unassigned                                                             | Required for hydraulic and equipment-adjacent content                            |

One automated agent performed both source and equation preparation. This does not satisfy independent review and cannot approve its own authored content.

## Asset Decisions

| Asset                               | Evidence decision                                                                                                    | Current status                | Publication decision                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------- |
| Fluid-pressure knowledge and lesson | Pressure definition and equation trace to `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`                                        | `Engineering review required` | Draft only                              |
| Hydraulic cylinder knowledge        | Ideal force and effective-area rules trace to `SRC-PARKER-140H8-CYLINDER-2024`                                       | `Engineering review required` | Internal review only                    |
| Hydraulic cylinder simulation       | Force equation is checked; fault percentages and training input ranges are not source-supported equipment data       | `Equation checked`            | Not simulation-checked and not approved |
| Hydraulic cylinder visual lesson    | Cap-end area and ideal force are checked; excavator context traces narrowly to `SRC-CAT-BOOM-CYLINDER-6040431-2026`  | `Engineering review required` | Internal visual pilot only              |
| Pump units knowledge and lesson     | SI units trace to `SRC-NIST-SP330-2019`; measurement context traces to `SRC-DOE-PUMP-SOURCEBOOK-2006`                | `Engineering review required` | Draft only                              |
| Thermodynamics knowledge and lesson | Definitions trace to `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021`; cycle traces to `SRC-OPENSTAX-COLLEGE-PHYSICS-2012` | `Engineering review required` | Draft only                              |

## Hydraulic Simulation Boundary

Normal force output continues to use the tested `F = p * A` engineering-core function. The simulation accepts SI pressure and effective piston area. The Prompt 39C lesson adapter explicitly converts MPa to Pa and mm to m, derives circular cap-end piston area with `EQ-HYD-PISTON-AREA-DIAMETER-001`, and supplies the checked result to the existing simulation. It does not derive rod-side area and does not import manufacturer ratings.

The lesson interaction bounds of 0 to 20 MPa and 25 to 100 mm, and the 15 kN opposing-force target, are labelled educational controls. They are not equipment ratings or professional design limits. Piston movement is demonstrative; flow, speed, stroke, dynamic load motion, structural adequacy, and lifting safety are not modelled.

The pressure-loss multiplier, seal-leak multiplier, gauge behavior, flow reading, temperature reading, maximum pressure, and area range are pedagogical implementation choices. They are explicitly not manufacturer diagnostic data. These gaps prevent `Simulation checked`, `Engineering review required` at simulation level, and `Approved for student use` statuses.

## Safety Boundary

The reviewed sources do not authorise real equipment work. Draft lessons and simulations state that they do not establish equipment ratings, live-work procedures, pressure limits, temperature limits, or operational permission.

## Final Review Decision

The pilot set is technically reviewable and traceable. It is not independently reviewed or approved for student publication. The next valid action is human source, educational, engineering, and safety review followed by versioned review records.
