# First Lesson Source Verification

Review date: 2026-08-30

Candidate: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.3.0`

Review type: evidence audit prepared for independent human review

Formal source-review decision: **CHANGES REQUIRED**

Source completeness verdict: **FAIL**

Academic source quality verdict: **PARTIAL**

This document is not a technical review record and does not approve the lesson.

## Frozen Artifact Check

The candidate checksums match the existing publication-review packet:

| Artifact                                                   | SHA-256                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `content/lessons/fluid-pressure/basic-fluid-pressure.json` | `befa0b1a8190195eee60e8dd3777300542d90dcbdbb73cbab1461b0ae16f5307` |
| `knowledge/fluid-pressure/basic-fluid-pressure.json`       | `7e138d225d17d18b01da4ed27ea6a05c6e7f86fd40c424b54e0ac4414383c370` |
| `sources/fluid-pressure/openstax-college-physics.json`     | `fe740d6f9325f110e6922b8b9395f27e03d74e3158b096eb3c0ec946c3adfaec` |
| `sources/fluid-pressure/penn-state-pressure-basics.json`   | `87ec80fac6237cfe0bee7ba80bf603aee3d6597a81afd8e0508accba2d90132a` |

## Source Record Review

### `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`

| Requirement       | Finding                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Repository record | Exists                                                                                                            |
| Official source   | Available at the recorded OpenStax URL                                                                            |
| Title             | _College Physics_                                                                                                 |
| Authors           | Paul Peter Urone and Roger Hinrichs                                                                               |
| Publisher         | OpenStax, Rice University                                                                                         |
| Edition/version   | Official web edition, published 2012-06-21                                                                        |
| Relevant chapter  | Chapter 11, Fluid Statics                                                                                         |
| Relevant section  | 11.3, Pressure                                                                                                    |
| Page range        | Not applicable; no stable page numbering                                                                          |
| Copyright/access  | OpenStax identifies this book's textbook content as CC BY 4.0 with attribution and excluded-media/mark conditions |
| Authority         | Level 4 university/open educational textbook                                                                      |
| Knowledge files   | `KF-FLUID-PRESSURE-001`, plus registered related pressure/thermodynamics files                                    |
| Equation          | `EQ-FLUID-PRESSURE-001`                                                                                           |

Section 11.3 directly supports `p = F / A`, force perpendicular to the stated area,
and `1 Pa = 1 N/m^2`. It does not provide equipment operating permission, a stored-energy
safety procedure, gauge fault-diagnosis guidance, or a lesson duration.

### `SRC-PSU-CIMBALA-PRESSURE-BASICS`

| Requirement       | Finding                                                              |
| ----------------- | -------------------------------------------------------------------- |
| Repository record | Exists                                                               |
| Official source   | Available at the recorded Penn State URL                             |
| Title             | _Introduction to Pressure in Fluid Mechanics_                        |
| Author            | John M. Cimbala, confirmed by the parent course index                |
| Organisation      | Penn State Department of Mechanical Engineering                      |
| Edition/version   | Official self-paced module; undated                                  |
| Relevant section  | Entire short module, especially the introductory pressure statements |
| Page range        | Not applicable; web module                                           |
| Copyright/access  | Public web access; no redistribution licence verified                |
| Authority         | Level 4 university engineering course material                       |
| Knowledge files   | `KF-FLUID-PRESSURE-001` and the related pressure-fundamentals file   |
| Equation          | `EQ-FLUID-PRESSURE-001`                                              |

The module supports pressure acting normal to a surface, force per unit area, and pascals
as `N/m^2`. It also distinguishes absolute, gauge, and vacuum pressure, but the current
lesson does not teach those distinctions.

## Claim Coverage

| Lesson claim area                                      | Evidence decision                                                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Pressure definition                                    | Supported by both source IDs                                                                                          |
| Normal-force direction                                 | Supported by both source IDs                                                                                          |
| `p = F / A`                                            | Supported directly by OpenStax and conceptually corroborated by Penn State                                            |
| `Pa = N/m^2`                                           | Supported by both source IDs                                                                                          |
| Same force over larger area gives lower pressure       | Supported by OpenStax section 11.3                                                                                    |
| Worked example `200 N / 0.50 m^2 = 400 Pa`             | Original calculation correctly derived from the checked equation                                                      |
| Estimated time, difficulty, prerequisites, next lesson | Editorial decisions; current source citations do not substantiate them and should be identified as editorial metadata |
| Gauge readings and abnormal pressure conditions        | Only partly supported; the cited sections do not establish diagnostic practice                                        |
| Gauge/sensor issue as a likely fault                   | Unsupported by the cited source set                                                                                   |
| Stored-pressure hazard and safe work boundary          | Safety intent is prudent, but no Level 1 or suitable Level 2 safety source is cited                                   |

## Runtime Source Defect

`apps/web/src/features/publication/source-records.ts` does not import or register
`SRC-PSU-CIMBALA-PRESSURE-BASICS`. Because the lesson declares this source ID, the
runtime `aggregateSourceEvidence` path resolves the lesson's evidence as missing. Even a
complete human review package could not publish the current candidate until this defect
is corrected and tested.

## Copyright Review

The student lesson uses original Industrial Learn prose, a CSS-built force/area diagram,
an original numerical example, and short source references. No source figure, complete
chapter, large passage, commercial PDF, standard text, or manufacturer diagram is stored
or reproduced. The current copyright boundary is acceptable.

## Required Corrections

1. Add an appropriate authoritative safety source or narrow/remove the unsourced safety
   and diagnostic claims.
2. Remove or relabel citations attached to editorial metadata that the sources do not
   support.
3. Add the Penn State source record to the server-side static source registry.
4. Record lawful access to a suitable Level 3 engineering textbook, or obtain a named
   reviewer decision accepting the documented Level 4 foundation for this introductory
   scope.
5. Increment the content version after lesson or knowledge-file corrections and refresh
   all frozen hashes.

## Decision

The fundamental pressure evidence is sound, but the complete lesson claim set is not yet
source-complete. No source review record may be marked approved for version `0.3.0`.
