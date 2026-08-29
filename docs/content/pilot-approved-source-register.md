# Pilot Approved Source Register

Review date: 2026-08-26

## Status Meaning

In this register, `approved` evidence means that the source document, origin, metadata, relevance, access route, and rights constraints were verified. It does not mean that any Industrial Learn lesson, assessment, knowledge file, equation, or simulation is approved for student use.

All five records remain `Source checked`, require independent human review, and are retained as metadata-only references. No restricted source document is copied into the repository.

## Verified Sources

| Source ID                                  | Scope                                                         | Authority                                                       | Version and date                         | Evidence                            | Reliability | Repository access                               |
| ------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------- | ----------------------------------- | ----------- | ----------------------------------------------- |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`        | Pressure, Pascal principle, cycle definition                  | OpenStax, Rice University; Paul Peter Urone and Roger Hinrichs  | Web edition, 2012-06-21                  | Sections 11.3, 11.5, 15.2 verified  | 3           | Metadata-only HTTPS reference                   |
| `SRC-PARKER-140H8-CYLINDER-2024`           | Theoretical hydraulic cylinder force and effective area       | Taiyo America, a Parker Hannifin company                        | Catalog `HY08-T1151-1/NA`, 2024          | Catalog p. 26, PDF p. 28 verified   | 2           | Metadata-only HTTPS reference                   |
| `SRC-NIST-SP330-2019`                      | SI derived units, prefixes, accepted non-SI units             | National Institute of Standards and Technology                  | NIST SP 330-2019, 2019-08-20             | Printed pp. 15, 17, 23, 25 verified | 1           | Metadata-only HTTPS reference; SHA-256 recorded |
| `SRC-DOE-PUMP-SOURCEBOOK-2006`             | Pump-system measurement context                               | U.S. Department of Energy and Hydraulic Institute collaboration | Second edition, May 2006                 | Printed pp. 56-60 verified          | 1           | Metadata-only HTTPS reference; SHA-256 recorded |
| `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021` | Thermodynamic systems, boundaries, properties, state, process | Purdue University; Carl Wassgren                                | Lecture 1 notes, PDF revision 2021-07-06 | Printed pp. 6-7 verified            | 3           | Metadata-only HTTPS reference; SHA-256 recorded |

## Rights Decisions

| Source ID                                  | Copyright and permitted use                                                     | Distribution decision                                                  | Student access                 |
| ------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`        | Text is CC BY 4.0 except separately identified material; attribution required   | No source assets copied during this task                               | Direct official link permitted |
| `SRC-PARKER-140H8-CYLINDER-2024`           | Copyright 2024 Taiyo America; factual verification and citation only            | PDF not redistributed                                                  | Direct official link permitted |
| `SRC-NIST-SP330-2019`                      | Free official access; no repository redistribution right asserted               | PDF not redistributed                                                  | Direct official link permitted |
| `SRC-DOE-PUMP-SOURCEBOOK-2006`             | Public DOE distribution; no explicit repository redistribution licence verified | PDF not redistributed; embedded JavaScript reported and never executed | Direct official link permitted |
| `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021` | Public university course notes; no explicit redistribution licence verified     | PDF not redistributed                                                  | Direct official link permitted |

## Superseded Placeholders

The original placeholder records remain in version control as audit evidence and now declare their replacement source IDs:

- `SRC-FLUID-PRESSURE-PLACEHOLDER-001` is superseded by `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`.
- `SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001` is superseded by `SRC-PARKER-140H8-CYLINDER-2024`.
- `SRC-SMART-PUMP-PLACEHOLDER-001` is superseded by `SRC-NIST-SP330-2019` and `SRC-DOE-PUMP-SOURCEBOOK-2006`.
- `SRC-THERMO-FOUNDATIONS-PLACEHOLDER-001` is superseded by `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021` and the cycle definition in `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`.

No placeholder ID was silently repurposed.

## Review Limitation

The source review was performed by `Codex source-verification agent` as an automated-assisted technical librarian review. No independent human source reviewer participated. Each source record therefore sets `independentHumanReviewRequired` to `true`, and none is labelled `Approved for student use`.
