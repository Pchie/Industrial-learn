# Pilot Approved Source Register

Review date: 2026-08-30

## Status Meaning

In this register, `approved` evidence means that the source document, origin, metadata, relevance, access route, and rights constraints were verified. It does not mean that any Industrial Learn lesson, assessment, knowledge file, equation, or simulation is approved for student use.

All nine records remain `Source checked`, require independent human review, and are retained as metadata-only references. No restricted source document is copied into the repository.

## Verified Sources

| Source ID                                  | Scope                                                         | Authority                                               | Version and date                         | Evidence                            | Repository access                               |
| ------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- | ----------------------------------- | ----------------------------------------------- |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`        | Pressure, Pascal principle, cycle definition                  | Level 4, OpenStax/Rice University                       | Web edition, 2012-06-21                  | Sections 11.3, 11.5, 15.2 verified  | Metadata-only HTTPS reference                   |
| `SRC-PSU-CIMBALA-PRESSURE-BASICS`          | Introductory pressure definition and SI relationship          | Level 4, Penn State                                     | Page accessed 2026-08-30                 | Pressure learning module verified   | Metadata-only HTTPS reference                   |
| `SRC-PARKER-140H8-CYLINDER-2024`           | Theoretical hydraulic cylinder force and effective area       | Level 2, Parker/Taiyo America                           | Catalog `HY08-T1151-1/NA`, 2024          | Catalog p. 26, PDF p. 28 verified   | Metadata-only HTTPS reference                   |
| `SRC-CAT-BOOM-CYLINDER-6040431-2026`       | Boom-cylinder application context                             | Level 2, Caterpillar                                    | Page accessed 2026-08-27                 | Product description verified        | Metadata-only HTTPS reference                   |
| `SRC-NIST-SP330-2019`                      | SI derived units, prefixes, accepted non-SI units             | Level 1, NIST                                           | NIST SP 330-2019, 2019-08-20             | Printed pp. 15, 17, 23, 25 verified | Metadata-only HTTPS reference; SHA-256 recorded |
| `SRC-DOE-PUMP-SOURCEBOOK-2006`             | Pump-system measurement context                               | Level 2, U.S. DOE and Hydraulic Institute collaboration | Second edition, May 2006                 | Printed pp. 56-60 verified          | Metadata-only HTTPS reference; SHA-256 recorded |
| `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021` | Thermodynamic systems, boundaries, properties, state, process | Level 4, Purdue University                              | Lecture 1 notes, PDF revision 2021-07-06 | Printed pp. 6-7 verified            | Metadata-only HTTPS reference; SHA-256 recorded |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`     | Flow rate, continuity, and Bernoulli relationships            | Level 4, OpenStax/Rice University                       | Official web edition, 2022-07-13         | Sections 12.1 and 12.2 verified     | Metadata-only HTTPS reference                   |
| `SRC-NASA-GLENN-BERNOULLI`                 | Bernoulli assumptions and limitations                         | Level 4, NASA Glenn educational material                | Updated 2021-05-13                       | Official educational page verified  | Metadata-only HTTPS reference                   |

## Rights Decisions

| Source ID                                  | Copyright and permitted use                                                     | Distribution decision                                                  | Student access                 |
| ------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`        | Text is CC BY 4.0 except separately identified material; attribution required   | No source assets copied during this task                               | Direct official link permitted |
| `SRC-PARKER-140H8-CYLINDER-2024`           | Copyright 2024 Taiyo America; factual verification and citation only            | PDF not redistributed                                                  | Direct official link permitted |
| `SRC-NIST-SP330-2019`                      | Free official access; no repository redistribution right asserted               | PDF not redistributed                                                  | Direct official link permitted |
| `SRC-DOE-PUMP-SOURCEBOOK-2006`             | Public DOE distribution; no explicit repository redistribution licence verified | PDF not redistributed; embedded JavaScript reported and never executed | Direct official link permitted |
| `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021` | Public university course notes; no explicit redistribution licence verified     | PDF not redistributed                                                  | Direct official link permitted |
| `SRC-PSU-CIMBALA-PRESSURE-BASICS`          | Public university course material; no explicit redistribution licence verified  | Page and source images not reproduced                                  | Direct official link permitted |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`     | CC BY-NC-SA 4.0 except where otherwise noted                                    | No source assets copied                                                | Direct official link permitted |
| `SRC-NASA-GLENN-BERNOULLI`                 | United States government educational page; third-party rights may differ        | No source visual asset copied                                          | Direct official link permitted |
| `SRC-CAT-BOOM-CYLINDER-6040431-2026`       | Copyright Caterpillar Inc.; factual verification and citation only              | Product image and page content not reproduced                          | Direct official link permitted |

## Superseded Placeholders

The original placeholder records remain in version control as audit evidence and now declare their replacement source IDs:

- `SRC-FLUID-PRESSURE-PLACEHOLDER-001` is superseded by `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`.
- `SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001` is superseded by `SRC-PARKER-140H8-CYLINDER-2024`.
- `SRC-SMART-PUMP-PLACEHOLDER-001` is superseded by `SRC-NIST-SP330-2019` and `SRC-DOE-PUMP-SOURCEBOOK-2006`.
- `SRC-THERMO-FOUNDATIONS-PLACEHOLDER-001` is superseded by `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021` and the cycle definition in `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`.

No placeholder ID was silently repurposed.

## Authority Policy Update

The `Reliability` field used by the earlier register has been replaced by the Level 1-5
authority hierarchy in `docs/content/academic-source-quality-policy.md`. No Level 3
university engineering textbook is currently registered as lawfully available to the
project. McGraw Hill remains a preferred academic benchmark, not an automatic authority
or a licence grant.

## Review Limitation

The source review was performed by `Codex source-verification agent` as an automated-assisted technical librarian review. No independent human source reviewer participated. Each source record therefore sets `independentHumanReviewRequired` to `true`, and none is labelled `Approved for student use`.
