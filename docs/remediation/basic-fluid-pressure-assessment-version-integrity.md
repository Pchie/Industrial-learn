# Basic Fluid Pressure Assessment Version Integrity

Date: 2026-09-04

Scope: staging-only remediation for the Basic Fluid Pressure controlled pilot

## Canonical Decision

The canonical assessment is `ASM-FLUID-PRESSURE-001`, slug
`basic-fluid-pressure-check`, version `2`.

This decision is based on repository history and review evidence, not on the version
number alone:

- Commit `2606f487f35d80dad51d4f5ac73720e44726d6e5` removed unsupported simulation,
  fault-diagnosis, and design items from the earlier repository assessment.
- The resulting five-question artifact is limited to outcomes `LO-FP-001`, `LO-FP-002`,
  and `LO-FP-003` taught by Basic Fluid Pressure `0.4.0`.
- Its frozen SHA-256 is
  `db6268839cdfb959e7f7e392d9879cb3518b30d8b13ee01686cdd88ec71cec88`.
- The review package in `docs/reviews/basic-fluid-pressure-review-evidence.md` presents
  all five questions, answers, explanations, units, tolerance, sources, and equation
  evidence.
- The assessment remains blocked until it receives its own independent exact-version
  review record. The lesson approval is supporting evidence, not an assessment approval.

## Version Lineage

### Repository assessment v1

The earlier repository artifact used the same stable content ID but included eight items.
It extended beyond the published lesson into a hydraulic-cylinder simulation task, a
pedagogical fault diagnosis, and a design response. Prompt 46A found that scope unsuitable
for this foundation lesson and replaced it through a new assessment version. Historical
Git evidence remains unchanged.

### Repository assessment v2

Version 2 contains five items and six available points:

1. pressure meaning;
2. a numeric `p = F / A` calculation;
3. visual comparison at constant force;
4. the SI relationship `1 Pa = 1 N/m^2`; and
5. simple application reasoning at constant force.

Competency is limited to `Understood` and `Calculated`. The governing equation is
`EQ-FLUID-PRESSURE-001`, supported by
`SRC-OPENSTAX-COLLEGE-PHYSICS-2012` and
`SRC-PSU-CIMBALA-PRESSURE-BASICS`.

### Live staging v1 fixture

The row observed during Prompt 48 is not repository assessment v1. It is a one-question
staging RLS fixture:

- database ID `10000000-0000-4000-8000-000000003309`;
- slug `staging-pressure-check`;
- title `Staging Pressure Check`;
- version `1`; and
- related fixture lesson `staging-fluid-pressure`.

Migration `0019_assessment_version_integrity_and_pilot_progress.sql` leaves this history
in place but prevents it from satisfying the student assessment publication gate.

## Exact Traceability Chain

```text
Basic Fluid Pressure
lesson ID LES-FLUID-PRESSURE-001
lesson version 0.4.0
  -> assessment ID ASM-FLUID-PRESSURE-001
  -> assessment slug basic-fluid-pressure-check
  -> assessment version 2
  -> artifact SHA-256 db6268839cdfb959e7f7e392d9879cb3518b30d8b13ee01686cdd88ec71cec88
  -> assessment-specific governance item
  -> independent exact-version review record
  -> authorized staging publication record
```

Any future question, answer, tolerance, explanation, outcome, source, or equation change
requires a new governed content version and a new independent review. Published evidence
must not be rewritten in place.

## Publication Gate

Student visibility requires all of the following to agree:

- canonical slug and content ID;
- exact assessment and published version `2`;
- frozen artifact SHA-256;
- lesson ID, slug, and exact lesson version `0.4.0`;
- module relationship metadata without publishing the module;
- current assessment governance and content-version rows;
- independent approval record and completed assignment;
- exact reviewed source and equation sets;
- approved technical status and published status;
- server-only answer delivery; and
- no later unresolved rejection or change request.

The application, RLS policy, attempt-start transaction, and attempt-completion transaction
all fail closed when this evidence disagrees.

## Controlled Synchronisation

Migration `0019` creates the exact-version controls and service transactions. Staging seed
`0007_basic_fluid_pressure_assessment_review_item.staging.sql` creates only the draft
assessment review item. It does not approve or publish content. Publication is available
only through `publish_approved_assessment_version_to_staging` after an independent reviewer
records a complete assessment-specific decision.

On 2026-09-04, migration `0019` and seed `0007` were applied to staging project
`lgjujyaclrpaopdabyzg`. The resulting assessment governance item is
`3c91523e-e30c-4f7b-89ef-0c8f7eeb3803`, exact version `2`, with content-version record
`acf25cec-cac1-41a0-9ff1-7fa5614919c3`. Its live state is intentionally
`Engineering review required / draft`; no assessment publication row was created.

Live rollback-only RLS probes confirmed that the old v1 fixture fails the exact gate,
students cannot read protected questions or answer choices, students see only their own
progress and attempts, and neither a reviewer nor a content author inherits student-data
access. The probes rolled back and retained no test rows.

Production is outside this remediation and must not receive migration `0019` or the
staging review seed as part of Prompt 48A.
