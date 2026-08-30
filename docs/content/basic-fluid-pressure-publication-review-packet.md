# Basic Fluid Pressure Publication Review Packet

## Purpose

This packet prepares one bounded Industrial Learn lesson for independent human review.
It is not an approval record and does not authorise publication.

Candidate: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.2.0`.

Current state: `draft` and `Engineering review required`.

## Frozen Candidate

| Artifact                                                   | ID or purpose                              | SHA-256                                                            |
| ---------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `content/lessons/fluid-pressure/basic-fluid-pressure.json` | Student lesson `LES-FLUID-PRESSURE-001`    | `712437b65d449c47eb9fd68f9dc6058a4834e311c9e248616f5a989c39db88d8` |
| `knowledge/fluid-mechanics/pressure-fundamentals.json`     | Knowledge file `KF-FLUID-PRESSURE-001`     | `3173350823f2f8846448a458224493246987272f6430cb34480c9251d7bf2ca8` |
| `sources/fluid-pressure/openstax-college-physics.json`     | Source `SRC-OPENSTAX-COLLEGE-PHYSICS-2012` | `62c44ec05685c3a56552e0bc8de8c52903ab8f6c4c44437976a874d8b9c875b0` |
| `packages/engineering-core/src/index.ts`                   | Pure engineering implementation            | `5b71611bf31c82c02bab8abddf2796419e5b98f7f7b712600259abf6153f1173` |
| `packages/engineering-core/src/index.test.ts`              | Engineering calculation tests              | `9b1c04449add07a60c4994c96b9bd2663340b03dce8fbf123c8e56ceb9c29544` |

Any change to a frozen artifact requires a new content version, new checksums, and new
review records. Reviewers must not approve a different working copy under version
`0.2.0`.

## Reviewed Technical Boundary

The lesson introduces pressure as normal force distributed over area, using
`EQ-FLUID-PRESSURE-001`, `p = F / A`. The implementation accepts force in newtons and
area in square metres, returns pressure in pascals, and rejects non-positive area and
invalid numeric input. Source: `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`, section 11.3.

The lesson is an introductory educational model. It does not establish equipment
ratings, pressure-vessel adequacy, operating permission, or a professional engineering
design. Source and limitation record: `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`.

The candidate has one equation and no simulation. A simulation review is therefore not
required for this version.

## Required Human Decisions

| Review                    | Permitted role                                   | Required decision evidence                                                                                           |
| ------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Authorship                | Content owner                                    | Identify the accountable author ID for version `0.2.0`.                                                              |
| Source                    | Engineering reviewer or administrator            | Confirm the cited official source supports the lesson statements and record the checked source ID.                   |
| Educational structure     | Lecturer, engineering reviewer, or administrator | Confirm the outcomes, sequence, explanations, and knowledge check are appropriate for the stated introductory level. |
| Equation                  | Engineering reviewer or administrator            | Confirm expression, symbols, SI units, assumptions, guards, worked example, and engineering interpretation.          |
| Safety                    | Engineering reviewer or administrator            | Confirm the safety boundary and non-design limitation are clear and sufficient for this lesson.                      |
| Engineering approval      | Engineering reviewer or administrator            | Give a named independent decision on the exact candidate version after all preceding reviews pass.                   |
| Publication authorization | Administrator                                    | Authorise publication only after the independent review package is complete.                                         |

The source, educational, equation, safety, and engineering approvals must not be made by
the lesson author. Administrator publication authorization is separate from technical
approval and cannot replace it.

## Reviewer Submission Fields

For every review, record:

- Review type.
- Candidate lesson ID and version.
- Candidate author ID.
- Reviewer ID, full name, and authorised role.
- Decision: `approved`, `changes_requested`, or `rejected`.
- Concise notes explaining the decision.
- Evidence checked.
- Source IDs, equation IDs, or test IDs checked where applicable.
- Safety outcome where applicable.
- Review timestamp in UTC.
- Confirmation that the reviewer is not the author for technical review decisions.

Records must validate against
`content/schemas/technical-review-record.schema.json`. No record should be created from
assumed, incomplete, or verbal approval.

## Publication Procedure

1. Confirm the accountable author ID.
2. Complete source, educational, equation, and safety review against the frozen files.
3. Resolve every requested change and increment the lesson version if content changes.
4. Obtain named independent engineering approval for the final exact version.
5. Obtain administrator publication authorization.
6. Add immutable JSON review records under `content/reviews/`.
7. Register those records in the server-side static review-record registry.
8. Change the lesson to `Approved for student use` and `published` in the same scoped
   release change.
9. Run all repository quality gates and publication-security tests.
10. Merge through a reviewed pull request to `development`, deploy staging, and verify
    the lesson is visible while all unapproved lessons remain hidden.

## Current Decision

Human review may begin. Publication remains **NO-GO** until every required decision and
the accountable author identity are recorded for version `0.2.0`.
