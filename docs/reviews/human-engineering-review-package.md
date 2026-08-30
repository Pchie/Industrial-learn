# Human Engineering Review Package

Prepared: 2026-08-30

Review target: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.3.0`

Current decision: **CHANGES REQUIRED BEFORE FORMAL REVIEW**

This package enables a qualified lecturer or engineer to review the lesson without
creating implied approval. Blank fields must be completed by the human reviewer. Do not
enter credentials, passwords, or private keys here.

## Review Location

- Intended route after approval: `/lessons/basic-fluid-pressure`
- Current public/staging behavior: hidden with the generic not-found response
- Structured lesson: `content/lessons/fluid-pressure/basic-fluid-pressure.json`
- Knowledge file: `knowledge/fluid-pressure/basic-fluid-pressure.json`
- Assessment: `content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json`

## Frozen Version

Use the hashes in `docs/content/basic-fluid-pressure-publication-review-packet.md` and
`docs/reviews/first-lesson-source-verification.md`. Any correction invalidates the
version `0.3.0` review target and requires a new content version and hashes.

## Source List

1. `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`
   - _College Physics_, Urone and Hinrichs, OpenStax.
   - Chapter 11, section 11.3, Pressure.
   - Supports `p = F / A`, normal force, and `Pa = N/m^2`.
2. `SRC-PSU-CIMBALA-PRESSURE-BASICS`
   - _Introduction to Pressure in Fluid Mechanics_, John M. Cimbala, Penn State.
   - Supports normal pressure action, force per area, and pascal dimensions.
3. McGraw Hill acquisition candidate, not evidence:
   - _Fluid Mechanics: Fundamentals and Applications_, Cengel and Cimbala, 2024
     Release, chapter 3 listed by the publisher.
   - No project access or section inspection is recorded; do not approve from the
     catalogue entry alone.

## Equation And Known Answers

Equation: `EQ-FLUID-PRESSURE-001`, `p = F / A`

Assumptions: normal-force magnitude, finite SI inputs, positive area, introductory
static-pressure use, no equipment rating or pressure-vessel design conclusion.

| Test                                            | Expected                |
| ----------------------------------------------- | ----------------------- |
| `200 N / 0.50 m^2`                              | `400 Pa`                |
| `1 kN / 1000 cm^2` after explicit SI conversion | `10,000 Pa`             |
| `0 N / 1 m^2`                                   | `0 Pa`                  |
| `10 N / 0 m^2`                                  | Invalid                 |
| Direct `kN` input to SI-only calculation        | Invalid until converted |

Implementation: `pressureFromForceAndArea` in
`packages/engineering-core/src/index.ts`.

## Model And Visual Boundary

- The lesson has no simulation.
- The CSS force arrow is representational, not a measured vector length.
- No flow, velocity, pressure gradient, dynamics, or equipment dimensions are modelled.
- The interactive section is a placeholder.
- The associated assessment's hydraulic simulation and seal-leak fault are outside this
  lesson's reviewed model and must not be approved with it.

## Required Corrections To Review

- Source or narrow the safety and fault-diagnosis statements.
- Register the Penn State source in the static runtime source registry.
- Convert the lesson to the approved visual-first structure or obtain an explicit
  educational-governance exception.
- Declare stable learning-outcome IDs and align every retained assessment item.
- Remove or separate unreviewed simulation, fault, and inflated competency items.
- Add a plain-language equation alternative and run the corrected content at mobile
  widths.

## Visual Honesty Checklist

- [ ] The diagram represents normal force over area without implying motion.
- [ ] Arrow length is not described as a physical scale.
- [ ] No colour is the sole carrier of meaning.
- [ ] No equipment rating or safe design is inferred.
- [ ] Any future animation distinguishes calculated and demonstrative behavior.
- [ ] Any real-world example names omitted engineering factors.

## Human Reviewer Form

### Identity And Independence

- Reviewer profile ID:
- Reviewer full name:
- Authorised platform role:
- Engineering discipline:
- Qualification/authority context:
- Organisation, if relevant:
- Candidate author profile ID:
- Confirmation reviewer is not the author: Yes / No
- Review date and UTC time:

### Evidence Checked

- [ ] Exact lesson version and hashes
- [ ] Both official source pages
- [ ] Source rights and access status
- [ ] Knowledge file
- [ ] Equation metadata and implementation
- [ ] Known-answer, boundary, invalid-input, and conversion tests
- [ ] Lesson explanations and worked example
- [ ] Learning outcomes and assessment mapping
- [ ] Safety and limitation statements
- [ ] Visual honesty
- [ ] Keyboard, mobile, zoom, and screen-reader behavior

### Decisions

- Source: Approved / Changes requested / Rejected
- Educational structure: Approved / Changes requested / Rejected
- Equation: Approved / Changes requested / Rejected
- Safety: Approved / Changes requested / Rejected
- Engineering approval: Approved / Changes requested / Rejected
- Notes and required corrections:

### Attestation

I reviewed the exact identified content version and evidence. My decision applies only
to that version and scope. It does not certify equipment, professional design, or site
operation.

- Reviewer signature or controlled approval reference:
- Date:

## Record Creation After Review

After corrections and approval, create immutable records matching
`content/schemas/technical-review-record.schema.json`. The records must use stable human
profile IDs, cover every source and equation, and be registered server-side. A separate
administrator must then provide publication authorization. A completed markdown form
alone is not publication authority.
