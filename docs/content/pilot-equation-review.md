# Pilot Equation Review

Review date: 2026-08-26

Reviewer: Codex automated-assisted equation review

Independent human equation reviewer: Unassigned

## Decisions

| Equation or rule                                                       | Implementation             | Source evidence                                            | Unit and validity decision                                                                                                                     | Tests                                                                                              | Status             |
| ---------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------ |
| `EQ-FLUID-PRESSURE-001`: `p = F / A`                                   | `pressureFromForceAndArea` | `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`, section 11.3          | `F` in N, `A` in m^2, result in Pa; area must be positive; introductory normal-force case only                                                 | Known answer, zero force, zero area, invalid value, explicit conversion, unit rejection            | `Equation checked` |
| `EQ-FLUID-FORCE-PRESSURE-AREA-001`: `F = p * A`                        | `forceFromPressureAndArea` | `SRC-PARKER-140H8-CYLINDER-2024`, catalog p. 26, PDF p. 28 | `p` in Pa, effective area in m^2, result in N; ideal theoretical output only                                                                   | Known answer, zero boundary, invalid value, unit rejection, simulation result                      | `Equation checked` |
| `EQ-HYD-PISTON-AREA-DIAMETER-001`: `A = pi * D^2 / 4`                  | `pistonAreaFromDiameter`   | `SRC-PARKER-140H8-CYLINDER-2024`, catalog p. 26, PDF p. 28 | `D` in m, result in m^2; circular cap-end piston only; diameter must be positive                                                               | Known answer, zero and negative diameter, non-finite input, SI-unit rejection, explicit conversion | `Equation checked` |
| `EQ-SI-CONVERSION-EXPLICIT-001`: `value_SI = value * conversionFactor` | `convertToSi`              | `SRC-NIST-SP330-2019`, tables 4, 7, and 8                  | Conversion must be explicit; supported prefix conversions, litre, and minute relationships are traceable; unsupported conversions are rejected | Explicit conversion, unsupported conversion, unit-conversion tests across engineering domains      | `Equation checked` |

## Hydraulic Effective Area

`SRC-PARKER-140H8-CYLINDER-2024` gives full piston area for the cap-end extension case and annular area for the rod-end retraction case. The reusable simulation still accepts an explicit `pistonArea` input and models extension only. The Prompt 39C visual lesson now derives the circular cap-end area from a validated piston diameter through `pistonAreaFromDiameter`, then supplies that result to the unchanged simulation force path. It does not calculate rod-side annular area or retraction force.

## Thermodynamic Classification

The first thermodynamics lesson contains no engineering equation or executable classification logic. Its closed, open, and isolated classifications are source-linked definitions in `KF-THERMO-SYSTEMS-SURROUNDINGS-001`. No property relation, equilibrium equation, process equation, or property value was introduced.

## Reviewer Decision

The expressions, symbols, units, implemented guards, assumptions, and cited source locations above are internally consistent and test-backed. `Equation checked` records this review stage only. Independent engineering, educational, and safety review are still required before student-use approval.
