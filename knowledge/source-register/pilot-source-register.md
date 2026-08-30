# Pilot Source Register

This register records the first controlled source-onboarding pass for Industrial Learn.

Access date: 2026-07-22

## Availability Finding

The `sources/` directory contains JSON source-needed records only. No original technical source documents, standards metadata files, manufacturer documents, open textbook files, or licensed internal references are currently present.

No source has been marked approved. No page range, clause, chapter, edition, equipment rating, or manufacturer data has been inferred.

## Source Records

| Source ID                                | Topic                                               | Evidence Status | Review Status   | Copyright Status | Authority Level | File Path     |
| ---------------------------------------- | --------------------------------------------------- | --------------- | --------------- | ---------------- | --------------- | ------------- |
| `SRC-FLUID-PRESSURE-PLACEHOLDER-001`     | Basic fluid pressure                                | Missing         | Source required | Source required  | 5               | Not available |
| `SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001` | Hydraulic cylinder force                            | Missing         | Source required | Source required  | 5               | Not available |
| `SRC-SMART-PUMP-PLACEHOLDER-001`         | Pump-system SI units and measurement                | Missing         | Source required | Source required  | 5               | Not available |
| `SRC-THERMO-FOUNDATIONS-PLACEHOLDER-001` | Thermodynamics systems, surroundings and boundaries | Missing         | Source required | Source required  | 5               | Not available |

## Approval Boundary

These records exist only to preserve explicit traceability while the real source documents are missing. Content, equations and simulations citing these records must remain `Source required`.

## Supersession Update: 2026-08-26

The original placeholder records remain for audit history and now identify their replacements. The active pilot evidence records are:

| Source ID                                  | Topic                                       | Authority | Evidence Status   | Review Status  | Access                              |
| ------------------------------------------ | ------------------------------------------- | --------- | ----------------- | -------------- | ----------------------------------- |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`        | Fluid pressure and cycle definition         | Level 4   | Approved evidence | Source checked | Metadata-only official HTTPS source |
| `SRC-PSU-CIMBALA-PRESSURE-BASICS`          | Introductory fluid pressure corroboration   | Level 4   | Approved evidence | Source checked | Metadata-only official HTTPS source |
| `SRC-PARKER-140H8-CYLINDER-2024`           | Hydraulic cylinder force and effective area | Level 2   | Approved evidence | Source checked | Metadata-only official HTTPS source |
| `SRC-CAT-BOOM-CYLINDER-6040431-2026`       | Excavator boom-cylinder application context | Level 2   | Approved evidence | Source checked | Metadata-only official HTTPS source |
| `SRC-NIST-SP330-2019`                      | SI units and conversions                    | Level 1   | Approved evidence | Source checked | Metadata-only official HTTPS source |
| `SRC-DOE-PUMP-SOURCEBOOK-2006`             | Pump-system measurements                    | Level 2   | Approved evidence | Source checked | Metadata-only official HTTPS source |
| `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021` | Thermodynamic systems and boundaries        | Level 4   | Approved evidence | Source checked | Metadata-only official HTTPS source |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`     | Flow rate, continuity, and Bernoulli terms  | Level 4   | Approved evidence | Source checked | Metadata-only official HTTPS source |
| `SRC-NASA-GLENN-BERNOULLI`                 | Bernoulli model assumptions and limitations | Level 4   | Approved evidence | Source checked | Metadata-only official HTTPS source |

`Approved evidence` means the source document and metadata were verified. It is not `Approved for student use`. See `docs/content/pilot-approved-source-register.md` for rights, limitations, and reviewer details.

The Bernoulli records were added on 2026-08-27 for the internal visual pilot. They
are `Source checked`, require independent human review, and do not authorise a
loss model, a cavitation model, component ratings, or publication approval.

The authority values above were migrated on 2026-08-30 to the permanent hierarchy in
`docs/content/academic-source-quality-policy.md`. The DOE sourcebook is Level 2 official
technical guidance, not a Level 1 regulation. Level 4 sources remain valid university or
recognised educational evidence, but no Level 3 textbook is registered as lawfully
available to the project.
