# Prompt 47 Controlled Staging Publication Audit

Audit date: 2026-09-04

Target: Basic Fluid Pressure version `0.4.0`

Environment: protected staging only

## Executive Verdict

Prompt 47 outcome: **PASS**

One exact independently approved lesson version was published to protected staging using
an atomic, idempotent governance function. The student route is available, all tested
draft and internal surfaces remain denied, no simulation or assessment inherited the
lesson's approval, and production remained unchanged.

| Final gate                 | Verdict  |
| -------------------------- | -------- |
| Approved version integrity | **PASS** |
| Publication gate           | **PASS** |
| Staging publication        | **PASS** |
| Student visibility         | **PASS** |
| Draft isolation            | **PASS** |
| Simulation governance      | **PASS** |
| Prompt 48 readiness        | **GO**   |

## Exact Version And Approval

| Evidence                     | Result                                                             |
| ---------------------------- | ------------------------------------------------------------------ |
| Lesson identity              | `LES-FLUID-PRESSURE-001` / `basic-fluid-pressure`                  |
| Reviewed version             | `0.4.0`                                                            |
| Reviewed artifact commit     | `bbd81abc0e1351d6280e3fc022d1138ad316ec1e`                         |
| Artifact SHA-256             | `f3746a0730b154023a1faea80719f1cfde27477aae22b164bcfe71cab3ca552a` |
| Source set                   | OpenStax and Penn State source IDs, exact set match                |
| Equation set                 | `EQ-FLUID-PRESSURE-001`, exact set match                           |
| Engineering approval         | Staging record `31510bc1-aecf-48fb-a40e-c427a86f115e`              |
| Approval timestamp           | `2026-09-03T17:55:56.269Z`                                         |
| Author/reviewer independence | PASS; protected identities differ                                  |
| Repository approval records  | Engineering approval plus separate publication authorization       |

The full-file hash belongs to the frozen reviewed file. The published repository file
contains the same instructional object with only its authorized publication envelope
changed. A normalized deep comparison passed before publication.

## Gate Evaluation

Source completeness, academic source quality, equation review, safety/limitations,
accessibility, independent review, assignment completion, exact-version selection,
author/reviewer separation, archive/withdrawal state, unresolved rejection checks, and CI
requirements all passed. The database function rechecked the durable governance fields
under row locks instead of trusting browser or repository status labels alone.

The Basic Fluid Pressure lesson declares an empty simulation set. Consequently, its
publication did not expose any simulation. All public simulation catalogue entries remain
empty under the current review gates, and guessed review-required simulation URLs remain
unavailable.

## Publication Transaction

Migration `0018_atomic_staging_content_publication.sql` was applied only to staging and
registered in the Supabase migration ledger as `atomic_staging_content_publication`.

The controlled call produced:

- status transition: approved/draft to approved/published;
- governance revision: `4`;
- published content version: `0.4.0`;
- timestamp: `2026-09-04T14:28:13.657991Z`;
- release candidate: `basic-fluid-pressure-staging-v0.4.0-rc1`;
- release commit: `9b8329a589dee3ac953d6245de51ad2c876a8bae`;
- one audit event: `ce2b68d1-6d7e-4f4d-8593-86da3d729c71`.

The first call reported a new publication. The exact retry returned the existing result,
reported an idempotent publication, and left the audit-event count at one. Function
privileges deny anonymous execution; authenticated invocation remains subject to the
internal Platform Owner/Administrator authorization check.

## Live Staging Verification

The staging application exposed the lesson at `/lessons/basic-fluid-pressure`. A
synthetic staging student verified that:

- Learn and Core Engineering list only the approved lesson;
- deterministic search finds Basic Fluid Pressure and does not reveal Bernoulli content;
- force and area inputs update the approved pressure calculation and live equation;
- the 200 kPa educational challenge completes only at a matching state;
- the formal assessment remains unavailable;
- opening the lesson creates no progress or attempt record;
- direct draft lesson and review-required simulation URLs return the generic unavailable
  experience;
- reviewer and exact-version preview routes deny student access; and
- source delivery contains citation metadata only.

The protected reviewer workflow and revision history remain available to an assigned
Engineering Reviewer in the automated role-based route suite. This access does not extend
to the student context used for the live checks.

The same checks were repeated after delivery hardening commit
`e3804a3ae4ab6fa1b79ef1192703f5ef35814a52` reached staging. The temporary student account
was then removed through the Supabase Admin API. Follow-up counts confirmed zero recent
auth users, profiles, lesson-progress rows, assessment attempts, and simulation attempts.

## RLS And Security Regression

Under an authenticated nonprivileged student context, live RLS checks returned no rows
from protected content versions, review records, audit events, hidden assessment answers,
unapproved simulations, or another student's attempts. The student could not invoke the
publication function. A reviewer context did not acquire access to another student's
attempts.

Public-delivery projection tests additionally prove that source file paths, reviewer
types, copyright registry fields, author identifiers, approval record IDs, and internal
multiple-source verification data are absent from the delivered lesson model.

## Production Isolation

Production project `vhjjfapkxytmaakbleee` was inspected inside an explicit read-only
transaction. It contained no migration `0018`, Basic Fluid Pressure publication row, or
Prompt 47 audit event. No production deployment or write occurred.

## Quality Results

| Command or verification       | Result                                                                      |
| ----------------------------- | --------------------------------------------------------------------------- |
| Secret scan                   | PASS                                                                        |
| Formatting                    | PASS                                                                        |
| Strict type checking          | PASS across all workspaces                                                  |
| Lint                          | PASS                                                                        |
| Content validation            | PASS, 29 tests                                                              |
| Migration validation          | PASS, 21 tests                                                              |
| Unit/integration tests        | PASS, 375 passed and 5 intentionally skipped                                |
| Accessibility                 | PASS, 42 checks                                                             |
| Production build              | PASS, Basic Fluid Pressure prerendered as sole public lesson                |
| Smoke                         | PASS, 5 tests                                                               |
| End-to-end                    | PASS, 108 tests                                                             |
| Atomic publication dry run    | PASS, transaction rolled back                                               |
| Durable publication and retry | PASS, one audit event                                                       |
| Live visibility and RLS       | PASS                                                                        |
| GitHub CI                     | PASS for publication implementation and post-merge delivery hardening       |
| Vercel deployment isolation   | PASS; deployments `6267354865` and `6267366171` are Preview, not production |

The first local accessibility invocation could not bind its localhost test server inside
the restricted sandbox. The unchanged command passed when local-server permission was
granted. Playwright also reports an informational `NO_COLOR`/`FORCE_COLOR` warning. The
dashboard database error printed during E2E is the expected input to a passing safe-error
test.

## Catalogue And Related Content

Basic Fluid Pressure appears in Learn, Core Engineering, and deterministic search. Its
unapproved parent module remains hidden, so module and programme-year routes do not imply
approval. No deterministic student recommendation currently adds it through an
unpublished module, and related-lesson projection does not reveal an unpublished target.
The related formal assessment is separately gated and unavailable.

## Change Summary

Prompt 47 added an atomic staging-only publication migration, synchronized repository
publication metadata and approval references, exposed only the exact approved lesson,
strengthened public source and lesson projections, added publication regression tests,
published the durable staging governance record once, and verified student delivery.

No engineering equation, calculation, instructional claim, simulation behavior,
assessment content, curriculum content, production schema, or production deployment was
changed.

## Known Limitations

- The public lesson currently does not persist authenticated progress; no false progress
  is awarded.
- The parent module and related assessment remain intentionally unavailable.
- Prompt 47 does not implement a generic atomic withdrawal function.

## Prompt 48 Readiness

**GO.** Prompt 48 must preserve independent governance for the parent module, assessment,
and any simulation; none inherits approval from this lesson publication.
