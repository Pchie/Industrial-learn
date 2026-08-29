# Prompt 43 Publication Enforcement Report

Completed: 2026-08-29
Branch: `codex/prompt-39-approved-sources`
Baseline before Prompt 43: `ee26fceedf27808ec845bdd15367203624fc0e47`
Scope: local lesson and simulation publication enforcement only

## Executive Verdict

| Defect                        | Verdict   |
| ----------------------------- | --------- |
| Lesson publication defect     | **FIXED** |
| Simulation publication defect | **FIXED** |

The shared Prompt 42 policy now controls every identified student/public lesson and
simulation delivery path. Current draft, internal, source-incomplete, review-required, and
version-unproven records fail closed. No lesson or simulation was approved, no equation or
curriculum content was changed for approval, no migration was applied, Supabase was not
activated, and nothing was deployed.

## Root Causes Closed

### Lesson Delivery

The unrestricted static lesson registry previously powered enumeration, direct slug
lookup, static parameters, curriculum pages, dashboard links, and visual embedding. Those
paths ignored `publicationStatus`, `reviewStatus` or `technicalReviewStatus`, source
evidence, and published-version authority.

Prompt 43 added one static adapter around the shared policy and replaced ambiguous public
loaders with explicit public and internal APIs. Curriculum modules, nested lessons,
pathways, prerequisite edges, dashboard links, and static parameters now derive from the
public projection. Direct lesson routes call `notFound()` before source resolution or
rendering.

### Simulation Delivery

The simulation catalogue previously treated hard-coded `availability` as permission.
Anonymous detail, authenticated detail, attempt start, history, embedding, and service-role
database queries inherited that decision. Database lookups checked publication but not
technical approval.

Prompt 43 renamed registry intent to `intendedAvailability` and made public eligibility a
dual shared-policy decision for the simulation and parent lesson. Public catalogue,
collections, search, detail, attempts, history, dashboard projections, and embeds all use
that decision. Service-role reads also require the shared published and approved values.

## Implementation Summary

### Shared And Static Policy

- Added `STUDENT_PUBLICATION_REQUIREMENTS` to the shared workflow package and reused it in
  policy evaluation plus server-side database filters.
- Added static source-record aggregation that treats unknown, invalid, partial, and missing
  evidence as non-approved.
- Added a static content adapter for publication, review, evidence, version, archive, and
  internal access metadata.

### Lessons And Curriculum

- Added `getPublicLessons` and `getPublicLessonBySlug`.
- Added explicit `getInternalLessonBySlug` with trusted role-specific access.
- Filtered public curriculum modules, lessons, pathways, and prerequisite edges.
- Filtered lesson static parameters and direct route resolution.
- Filtered dashboard continuation, weekly plans, saved lessons, recents, and module-targeted
  recommendations.
- Kept public school/programme/year containers with honest empty module states.

### Simulations

- Split registry intent from publication eligibility.
- Added parent-plus-simulation governance evaluation and public-only catalogue lookups.
- Built collections only from public simulation records.
- Rechecked visibility at public/authenticated detail, start, attempt, completion, review,
  history, recommendation, and dashboard boundaries.
- Filtered lesson-embedded simulation IDs and visual blocks.
- Protected the internal visual lab by role.
- Added the honest zero-result Simulation Lab state.

### Assessment And Serialization

- Student-delivered assessment questions no longer include an internal simulation ID.
- Correct answers, expected values, expected measurements, explanations, diagnostic
  evidence, rubrics, and assessment hints remain excluded before submission.
- Trusted scoring continues to use the complete server-side assessment.

### Client Bundle Boundary

The first browser regression run discovered that `dashboard/error.tsx` imported a runtime
competency list through the server-side dashboard data module. Once dashboard data imported
the governed catalogues, that client error chunk also contained hidden lesson and simulation
strings. The component now takes competency levels directly from assessment-core and keeps
the dashboard model import type-only. The browser preload regression then passed.

## Current Student/Public Result

- `getPublicLessons()` returns no current structured lesson.
- Public curriculum modules and pathways are empty because all current records fail review,
  publication, evidence, or version authority.
- `getPublicSimulationCatalog()` returns no current simulation.
- `/simulations` displays `Reviewed simulations are being prepared.`
- Guessed lesson, module, pathway, simulation, and simulation-attempt routes display a
  generic not-found view without governed metadata.
- Signed-in student recents, dashboard activity, history, saved lessons, continuation, and
  recommendations do not restore hidden records.

## Files Added

- `apps/web/src/features/publication/source-records.ts`
- `apps/web/src/features/publication/static-publication.ts`
- `apps/web/src/features/publication/publication-enforcement.test.ts`
- `docs/security/lesson-publication-enforcement.md`
- `docs/security/simulation-publication-enforcement.md`
- `docs/audits/prompt-43-publication-test-matrix.md`
- `docs/audits/prompt-43-publication-enforcement-report.md`

## Existing Files Updated For Prompt 43

- publication policy and assessment delivery in `packages/content-review-workflow` and
  `packages/assessment-core`;
- web dependency metadata and dependency rationale;
- lesson route/data/visual projection;
- curriculum projection and tests;
- simulation catalogue, discovery, server, local persistence mapping, lab UI, and tests;
- dashboard projection and client/server import boundary;
- assessment service-role status constants;
- internal visual lab authorization; and
- route, smoke, dashboard, simulation, lesson, and accessibility E2E tests.

Several files already contained classified Prompt 39 changes before Prompt 43. This report
does not claim sole authorship of those complete diffs. No pre-existing Prompt 39 or held
database change was reverted.

## Test Evidence

| Gate                               | Final result                                  |
| ---------------------------------- | --------------------------------------------- |
| Focused web typecheck              | PASS                                          |
| Focused policy/security/unit tests | PASS, 86 tests                                |
| Focused route/security E2E         | PASS after one test-only hydration correction |
| Secret scan                        | PASS                                          |
| Formatting                         | PASS                                          |
| Full typecheck                     | PASS across all workspaces                    |
| Lint                               | PASS                                          |
| Content validation                 | PASS, 19 tests                                |
| Migration validation               | PASS, 14 tests                                |
| Full unit suite                    | PASS, 322 passed and 4 skipped                |
| Production build                   | PASS, 33 pages generated                      |
| Smoke suite                        | PASS, 5 tests                                 |
| Full E2E suite                     | PASS, 94 tests                                |
| Accessibility suite                | PASS, 36 tests                                |

The detailed matrix and earlier failure history are in
`docs/audits/prompt-43-publication-test-matrix.md`.

## Scope Compliance

- No lesson, simulation, assessment, or source was marked approved.
- No engineering equation was modified.
- No new lesson or simulation was added.
- No application feature outside publication enforcement was added.
- No database schema, policy, or migration was modified or applied.
- No Supabase project was activated or contacted for mutation.
- No production or staging deployment occurred.
- No commit or push was performed during Prompt 43.

## Remaining Risks

1. Static content lacks authoritative published-version relations, so current delivery is
   safely empty until trusted governance integration exists.
2. Live Supabase staging remains unavailable according to Prompt 40 evidence; RLS and
   service-role behavior have not been reverified live in this task.
3. The worktree still includes the classified uncommitted Prompt 39 stack and the held
   migration `0010`; Prompt 43 does not establish a clean release identity. Final status is
   70 modified and 108 untracked files, with no staged files or deletions. Both cached and
   unstaged diff checks pass.
4. Reviewer assignment is not persisted as a first-class relation. Internal authorization
   must continue to come from a trusted server workflow, never browser input.
5. Historical deployments retain their historical bundles and must remain protected from
   student access.

## Prompt 44 Readiness

**YES: Prompt 44 may proceed.** The local quality table is fully PASS. Prompt 44 must remain
remediation/reverification work: establish a reviewable Git baseline, restore or verify
staging, and run live RLS/application checks. This result does not grant a controlled
student pilot, production release, or AI Mentor implementation.
