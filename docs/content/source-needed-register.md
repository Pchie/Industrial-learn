# Source Needed Register

Access date: 2026-07-22

The initial source-onboarding pass inspected `sources/` and found no actual source documents. The records below block approval until legally obtained documents are added and reviewed.

| Topic                                 | Required Source Type                                                     | Preferred Authority                                                                              | Why Needed                                                                          | Blocked Content                                                                                                        | Open Alternative                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Basic fluid pressure                  | Open textbook, university material, or licensed fluid-mechanics textbook | University OER or reputable engineering textbook                                                 | Verify pressure definition and `p = F / A` assumptions                              | `knowledge/fluid-mechanics/pressure-fundamentals.json`, fluid-pressure lesson and assessment                           | Yes, an open educational fluid-mechanics text may be used                          |
| Hydraulic cylinder force              | Hydraulics textbook or manufacturer/public training documentation        | Hydraulics manufacturer training guide or licensed hydraulics text                               | Verify `F = p * A`, assumptions, training ranges and safety limitations             | `knowledge/hydraulics/hydraulic-cylinder-force.json`, `SIM-HYD-CYL-FORCE-001`                                          | Yes, manufacturer public documentation may be used if copyright permits            |
| Pump-system units and measurements    | SI units reference plus pump/instrumentation educational material        | Official SI reference, university instrumentation material, or manufacturer public documentation | Verify measurement quantities, unit expectations and diagnostic boundaries          | `knowledge/smart-pump-systems/si-units-and-measurement.json`, smart pump units lesson                                  | Yes, open SI documentation and university instrumentation material may be combined |
| Thermodynamics systems and boundaries | Open thermodynamics textbook or university material                      | University OER thermodynamics text                                                               | Verify definitions of system, surroundings, boundary, open system and closed system | `knowledge/thermodynamics/systems-surroundings-boundaries.json` and first thermodynamics foundation lesson preparation | Yes, an open thermodynamics textbook may be used                                   |

Do not approve the blocked content until source files, metadata, review evidence and reviewer identity are recorded.

## Onboarding Update: 2026-08-26

The four pilot source gaps now have verified metadata-only evidence records:

| Topic                                | Verified source IDs                                                             | Current content gate                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Basic fluid pressure                 | `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`                                             | Independent educational, engineering, and safety review required     |
| Hydraulic cylinder force             | `SRC-PARKER-140H8-CYLINDER-2024`                                                | Equation checked; simulation fault and range evidence still required |
| Pump-system units and measurements   | `SRC-NIST-SP330-2019`, `SRC-DOE-PUMP-SOURCEBOOK-2006`                           | Independent educational and engineering review required              |
| Thermodynamic systems and boundaries | `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021`, `SRC-OPENSTAX-COLLEGE-PHYSICS-2012` | Draft lesson prepared; independent review required                   |

The original table is retained as the historical 2026-07-22 acquisition record. No item is approved for student use merely because its source evidence is now checked.

## Bernoulli Pilot Update: 2026-08-27

The source gate for the internal Bernoulli Flow Lab is satisfied by metadata-only
records for `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022` and
`SRC-NASA-GLENN-BERNOULLI`. Together they support continuity, the ideal two-point
Bernoulli relation, pressure, section-average velocity, elevation, density, and
the declared ideal assumptions. They do not support friction factors, cavitation
limits, turbulence models, equipment ratings, or professional design approval.
Independent human source, equation, educational, and simulation review remains
required before student-use approval.
