# Static Lesson Publication-Approval Readiness

Date: 2026-08-30

Branch: `codex/static-review-record-gate`

> Superseded candidate notice, 2026-08-30: the static review-gate implementation and
> test verdict remain valid, but the version `0.2.0` candidate below is no longer the
> review target. The academic source policy migration added corroborating source evidence
> and created Basic Fluid Pressure version `0.3.0`. Use
> `docs/content/basic-fluid-pressure-publication-review-packet.md` for the current candidate.

## Executive Verdict

**PASS** for the static review-record governance remediation.

**SUPERSEDED** for Basic Fluid Pressure version `0.2.0`; do not create new review
records for that candidate.

**GO** to begin independent human review of version `0.3.0` using the current review
packet after stable author and reviewer identifiers are supplied.

**NO-GO** for lesson publication until the accountable author, required human review
records, named independent engineering approval, and administrator publication
authorization exist for the exact candidate version.

## Defect Closed

Static lesson publication previously relied on approved/published status fields and a
caller-supplied version authority. The repository defined a technical-review schema but
did not validate review-record evidence or derive runtime authority from it.

The remediation now:

- Defines a shared static review-record contract in the content-review workflow package.
- Requires exact lesson ID, version, and author matching.
- Rejects malformed records, stale-version records, and technical self-approval.
- Requires source and educational-structure review for every lesson.
- Requires equation review when equation IDs are present.
- Requires simulation review when simulation IDs are present.
- Requires safety review for structured engineering lessons.
- Requires named independent engineering approval.
- Requires separate administrator publication authorization.
- Validates records at build time through the content system.
- Derives runtime lesson publication authority from the server-side review registry.
- Removes free-form publication authority from the lesson delivery adapter.
- Keeps every current lesson hidden because no approval records have been created.

No database migration, engineering equation, curriculum record, lesson text, simulation,
assessment, or authentication behavior was changed.

## Candidate Prepared for Review

Candidate: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.3.0`.

Current state remains:

- Publication: `draft`.
- Technical review: `Engineering review required`.
- Sources: `SRC-OPENSTAX-COLLEGE-PHYSICS-2012` and
  `SRC-PSU-CIMBALA-PRESSURE-BASICS`.
- Knowledge file: `KF-FLUID-PRESSURE-001`.
- Equation: `EQ-FLUID-PRESSURE-001`.
- Simulations: none.
- Accountable author ID: not yet recorded.
- Independent human reviews: not yet recorded.

The exact artifact checksums and reviewer instructions are in
`docs/content/basic-fluid-pressure-publication-review-packet.md`.

## Files Changed

- Shared policy: `packages/content-review-workflow/src/static-review-record.ts`.
- Shared policy tests: `packages/content-review-workflow/src/static-review-record.test.ts`.
- Content validation: `packages/content-system/src/index.ts` and its tests.
- Runtime lesson authority: `apps/web/src/features/lesson-engine/data.ts`.
- Empty fail-closed registry: `apps/web/src/features/publication/review-records.ts`.
- Runtime publication tests: `apps/web/src/features/publication/publication-enforcement.test.ts`.
- Structured content and review schemas under `content/schemas/`.
- Review-record operating instructions under `content/reviews/`.
- Dependency declarations, lock file, and dependency rationale.
- Review packet and security architecture documentation.

## Verification Results

| Check                      | Result                                       |
| -------------------------- | -------------------------------------------- |
| Dependency lock refresh    | PASS, no external package added              |
| Secret scan                | PASS                                         |
| Formatting                 | PASS                                         |
| Strict TypeScript          | PASS                                         |
| Lint                       | PASS                                         |
| Content validation         | PASS, 22 tests                               |
| Migration validation       | PASS, 16 tests                               |
| Unit and integration tests | PASS, 333 passed and 5 intentionally skipped |
| Production build           | PASS, 33 generated routes/pages              |
| Accessibility suite        | PASS, 36 tests                               |
| Smoke suite                | PASS, 5 tests                                |
| End-to-end suite           | PASS, 94 tests                               |

The first accessibility attempt could not bind the local server inside the filesystem
sandbox (`EPERM`). The unchanged command passed when rerun with permission to bind the
local test port. Playwright continued to emit the existing informational `NO_COLOR` and
`FORCE_COLOR` warning.

## Security Test Coverage

Automated tests prove that:

- Status-only publication remains hidden.
- A complete exact-version review package can provide authority.
- Missing author identity fails closed.
- Self-review fails closed.
- Stale review versions fail closed.
- Incomplete source or equation coverage fails closed.
- Missing engineering approval fails closed.
- Engineering-reviewer credentials cannot satisfy administrator publication authority.
- Current draft lessons remain absent from public lookup and direct public routes.

## Remaining Human Actions

1. Identify the accountable author for Basic Fluid Pressure version `0.3.0`.
2. Assign named, authorised source, educational, equation, and safety reviewers.
3. Complete the reviews against the frozen candidate and record decisions.
4. Resolve any requested changes; if content changes, increment the version and repeat
   review.
5. Obtain named independent engineering approval.
6. Obtain administrator publication authorization.
7. Add and register immutable review records.
8. Change publication metadata only in the same reviewed release change.
9. Re-run all gates and verify the deployed staging lesson and hidden-content matrix.

## Known Limitations

- No human approval can be inferred or supplied by Codex.
- No review record exists yet, by design.
- The lesson has no accountable `authorProfileId` yet; inventing one would undermine
  self-approval controls.
- Review JSON requires an explicit server-side registry import. This deliberate second
  gate prevents an unregistered file or status-only edit from publishing content.
- The existing Playwright colour-environment warning remains informational.

## Change Summary

The repository now has a version-bound, role-aware, fail-closed static lesson approval
gate and an exact human review packet. The lesson itself and its technical content remain
unchanged and unpublished.
