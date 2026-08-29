# Prompt 40 Remediation Plan

Date: 2026-08-28
Task: Prompt 41 planning and verification
Scope: continued staging development and a controlled student pilot only

## Executive Decision

The Prompt 40 blockers are confirmed. Continued remediation work may proceed on the
current feature branch, but the current worktree must not be integrated or deployed.
The shortest safe path is:

1. recover a reviewable Git baseline;
2. add one shared fail-closed student-visibility rule;
3. enforce it at every lesson and simulation delivery boundary;
4. restore and reconcile Supabase staging;
5. prove the controls locally and live with synthetic users; and
6. obtain named independent review for one bounded pilot version before exposing it.

Technical remediation alone will initially produce a secure empty or reduced student
catalogue because every current visual lesson remains `draft` or `internal` and
`Engineering review required`. That is the correct fail-closed result. It is not evidence
that content has been approved.

## Evidence Boundary

| Evidence                               | Verified state                                                   |
| -------------------------------------- | ---------------------------------------------------------------- |
| Repository root                        | `/Users/zungu/Documents/Master Industrial Learning`              |
| Branch                                 | `codex/prompt-39-approved-sources`                               |
| HEAD                                   | `e094d985f2be55f3ac96bcb23750863ed4a05d7f`                       |
| Remote baseline                        | HEAD matches `origin/development`                                |
| Worktree before Prompt 41 deliverables | 58 tracked changes and 105 untracked files                       |
| Worktree after Prompt 41 deliverables  | 58 tracked changes and 109 untracked files                       |
| Supabase staging                       | `lgjujyaclrpaopdabyzg`, linked, `INACTIVE` on 2026-08-28         |
| Supabase production                    | `vhjjfapkxytmaakbleee`, not linked and not touched               |
| Staging Auth health                    | DNS unresolved; HTTP result `000`                                |
| Linked migration query                 | Could not create the login role; connection timeout              |
| Local staging environment              | Required key-presence validation passed; values were not printed |

Line references in this plan describe the inspected uncommitted Prompt 39 worktree. They
may move when remediation is implemented.

## Blocker 1: Lesson Visibility

### Root Cause

The public lesson delivery path uses a repository-owned static array as a publication
registry. It treats successful slug resolution as sufficient authority to render content.
The route never evaluates `publicationStatus` or `reviewStatus`.

The database policy is stricter, but it is irrelevant to JSON already bundled into the
Next.js application. Content validation also correctly rejects a published lesson that is
not approved, but validation does not prevent a draft lesson from being imported into a
public route.

### Exact Routes, Files, And Symbols

| Surface             | File and symbol                                                                                                                                                                                | Defect                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Full lesson route   | `apps/web/src/app/lessons/[lessonSlug]/page.tsx`, `generateStaticParams` (lines 17-21)                                                                                                         | Enumerates every imported lesson.                                          |
| Full lesson route   | same file, `LessonPage` (lines 23-39)                                                                                                                                                          | Checks only whether a slug exists, then renders `LessonRenderer`.          |
| Lesson registry     | `apps/web/src/features/lesson-engine/data.ts`, `lessons` (lines 17-23)                                                                                                                         | Contains every current lesson regardless of publication or review state.   |
| Lesson lookup       | same file, `getLessons` and `getLessonBySlug` (lines 35-41)                                                                                                                                    | Return unrestricted records.                                               |
| Lesson renderer     | `apps/web/src/features/lesson-engine/components.tsx`, `LessonRenderer`                                                                                                                         | Displays review/publication badges but does not authorize delivery.        |
| Embedded visual     | `apps/web/src/features/lesson-engine/visual-experience-registry.tsx`, `getVisualExperienceOverrides` (lines 38-48)                                                                             | Resolves by simulation ID only and inherits the parent route bypass.       |
| Curriculum registry | `apps/web/src/features/curriculum/data.ts`, `getCurriculum`, `getSchool`, `getProgramme`, `getModule`, and `getPathway`                                                                        | Returns draft modules, lessons, and pathways without a student projection. |
| Curriculum routes   | `/learn`, `/learn/core-engineering`, `/learn/future-engineering`, `/programmes/[programmeSlug]`, `/programmes/[programmeSlug]/year/[year]`, `/modules/[moduleSlug]`, `/pathways/[pathwaySlug]` | Expose draft curriculum metadata and generate static params from it.       |

### Ignored Fields And Affected Records

The lesson route ignores both `publicationStatus` and `reviewStatus`. Curriculum records
name the latter `technicalReviewStatus`; that field and `publicationStatus` are also not
used to decide student visibility.

| Lesson slug                          | Publication | Review                        |
| ------------------------------------ | ----------- | ----------------------------- |
| `basic-fluid-pressure`               | `draft`     | `Engineering review required` |
| `pump-system-units-and-measurements` | `draft`     | `Engineering review required` |
| `hydraulic-cylinder-force`           | `internal`  | `Engineering review required` |
| `bernoulli-flow-lab`                 | `internal`  | `Engineering review required` |
| `systems-surroundings-boundaries`    | `draft`     | `Engineering review required` |

All curriculum modules and pathways inspected are also `draft` or otherwise unapproved.

### Layer Verdict

- Frontend route layer: defective.
- Application/content registry layer: defective.
- Content validation layer: correct for its current validation responsibility, but not a
  delivery authorization boundary.
- Database policy layer: structurally correct in migration `0005`, but bypassed by bundled
  JSON.

### Old Content Versions

There is no public version-specific lesson route and the static registry imports one file
per slug, so database `content_versions` are not directly exposed by this route. Migration
`0005` and existing policies keep `content_versions` staff-only. Residual risks remain:

- old Vercel deployments retain their own bundled lesson snapshots;
- a historical JSON file would be exposed if it were added to the unrestricted registry;
- filtering only `generateStaticParams` would be insufficient because direct slug lookup
  would still render the record.

The remediation must therefore gate both enumeration and direct lookup, and the pilot must
point only to the corrected protected deployment. Historical preview URLs must remain
deployment-protected.

## Blocker 2: Simulation Publication Bypass

### Root Cause

Simulation visibility is decided independently in three places: the application catalogue,
the public detail resolver, and a service-role database query. The first two trust a
hard-coded operational `availability`; the database query filters only `published`.
Neither path requires `Approved for student use`. The service-role key correctly stays on
the server, but it bypasses RLS by design, so application predicates must be complete.

### Exact Entries, Files, And Symbols

| Surface                      | File and symbol                                                                                                                     | Defect                                                                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hydraulic entry              | `apps/web/src/features/simulations/catalog.ts`, `simulationCatalog[hydraulic-cylinder-force]` (lines 70-111)                        | Lesson is `internal` and unapproved, engine review is only `Equation checked`, but `availability` is hard-coded to `available`.                    |
| Bernoulli entry              | same file, `simulationCatalog[bernoulli-flow-lab]` (lines 153-193)                                                                  | Lesson and engine are `Engineering review required`, but `availability` is hard-coded to `available`.                                              |
| Thermodynamics entry         | same file, `thermal-system-boundary-simulation` (lines 112-152)                                                                     | Correctly marked `coming-later`, but direct detail still exposes unapproved technical material because public resolution has no approval gate.     |
| Catalogue model              | `apps/web/src/features/simulations/server.ts`, `loadSimulationLabModel` (lines 110-181)                                             | Maps the full registry for anonymous and authenticated users.                                                                                      |
| Public detail                | same file, `loadPublicSimulationOverview` (lines 183-200)                                                                           | Resolves any registered slug without review/publication checks.                                                                                    |
| Authenticated detail         | same file, `loadSimulationOverview` (lines 202-250)                                                                                 | Trusts registry in local mode and an incomplete service-role query in Supabase mode.                                                               |
| Attempt start                | same file, `startSimulationForStudent` (lines 252-277)                                                                              | Treats derived `availability` as the authorization decision.                                                                                       |
| History resolution           | same file, `listSimulationHistory` (lines 361-380)                                                                                  | Resolves all catalogue rows through the incomplete query.                                                                                          |
| Database lookup              | same file, `getSupabaseSimulationRowBySlug` (lines 601-610)                                                                         | Filters `publication_status=published` only.                                                                                                       |
| Persistence lookup           | same file, `getSupabaseSimulationRowForDefinition` (lines 612-628)                                                                  | Repeats the same incomplete filter.                                                                                                                |
| Projection                   | same file, `summaryFromRow` (lines 439-451)                                                                                         | Copies database publication status but leaves review status from the registry.                                                                     |
| Availability rule            | `apps/web/src/features/simulations/discovery.ts`, `deriveSimulationAvailability` (lines 54-71)                                      | Considers catalogue availability and prerequisites only.                                                                                           |
| Detail route                 | `apps/web/src/app/simulations/[simulationSlug]/page.tsx`, `SimulationOverviewPage` (lines 10-39)                                    | A direct URL always falls back to the unrestricted public model.                                                                                   |
| Embedded lesson simulation   | `apps/web/src/features/lesson-engine/visual-experience-registry.tsx`, `visualExperienceRegistry` and `getVisualExperienceOverrides` | Resolves by simulation ID without simulation or lesson publication authority.                                                                      |
| Hydraulic staging fixture    | `database/migrations/0009_staging_hydraulic_simulation_fixture.sql`                                                                 | Stores `Source required` plus `published`.                                                                                                         |
| Bernoulli registration draft | `database/migrations/0010_bernoulli_flow_simulation_registration.sql`                                                               | Uncommitted and unapplied state is unverified; currently stores `Engineering review required` plus `published`. It must not be applied as written. |

### Standalone And Embedded Bypass Verdicts

- `/simulations` bypasses governance through the full registry projection.
- `/simulations/[simulationSlug]` bypasses the catalogue through direct public slug
  resolution.
- authenticated attempt start inherits the incomplete availability decision.
- visual simulations embedded in lesson heroes inherit the lesson bypass and perform no
  independent simulation gate.
- RLS in migration `0005` checks simulation, lesson/module parent, publication, and review
  status correctly for student-scoped database clients. It cannot protect service-role or
  static-registry reads.

## Blocker 3: Supabase Staging

### Current Missing State

| Area                  | Current evidence                                                                                  | Required evidence                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Project status        | `INACTIVE` on 2026-08-28                                                                          | `ACTIVE_HEALTHY` and stable during verification                                                             |
| Auth/REST health      | Project hostname does not resolve                                                                 | Auth and REST health return expected success responses                                                      |
| Database connectivity | Linked login role times out                                                                       | Read-only linked migration query succeeds                                                                   |
| Environment variables | Ignored staging file passes required-key validation                                               | Values must be re-attested against the staging project and Vercel Preview/Development without printing them |
| Migration state       | Unknown live state; historical schema evidence exists, but tracking drift was previously reported | Exact local/live migration comparison with hashes or version identifiers                                    |
| Authentication state  | Historical pass only; inaccessible now                                                            | Registration/sign-in/session/sign-out and role resolution with synthetic users                              |
| RLS credentials       | Four synthetic token/profile variables are absent from the local staging file                     | Two short-lived student tokens and matching profile IDs supplied in an ignored process environment          |
| Synthetic users       | Historical users documented; current availability unknown                                         | Two active synthetic students plus role-specific test identities where needed, with cleanup ownership       |
| Callback URLs         | Historical exact allowlist is documented                                                          | Current dashboard confirmation after project restore; no wildcard                                           |
| Live tests            | Cannot start                                                                                      | Current lesson/simulation visibility, cross-student, reviewer-isolation, and hidden-answer matrix passes    |

The staging runtime and migration environment requires:

- `NODE_ENV`
- `NEXT_PUBLIC_APP_ENV`
- `APP_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_URL`
- `INDUSTRIAL_LEARN_AUTH_MODE`
- `INDUSTRIAL_LEARN_E2E`

Those runtime/migration key names are present in the ignored staging environment file and
the repository validator passes. Their values were deliberately not printed. After restore,
the operator must attest `staging`, `supabase`, the stable staging HTTPS origin, project ref
`lgjujyaclrpaopdabyzg`, and disabled local E2E authentication against Supabase and Vercel.

The session-bound live RLS harness additionally requires ephemeral values that are not
currently present in that file:

- `STAGING_STUDENT_A_ACCESS_TOKEN`
- `STAGING_STUDENT_B_ACCESS_TOKEN`
- `STAGING_STUDENT_A_PROFILE_ID`
- `STAGING_STUDENT_B_PROFILE_ID`

It currently covers anonymous private-table denial, own/cross-profile access, and hidden
answer choices. Prompt 40 exit evidence requires broader live tests for content publication,
simulation publication, reviewer isolation, self-approval denial, and direct URL behavior.

### Action Ownership

| Action class                         | Actions                                                                                                                                                                                                                                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Manual human action                  | Resume/restore the staging project; confirm billing/pausing policy; inspect Auth provider configuration; confirm exact Site URL and redirect allowlist; approve any migration execution; provide named independent content reviewers; approve and merge the remediation PR.                                        |
| Codex-executable after authorization | Recheck health and project status; compare migrations; implement code fixes; create additive corrective migration if live data requires it; prepare synthetic fixtures; run local and live RLS/application tests; create evidence reports.                                                                         |
| Secret-dependent                     | Compare Vercel/Supabase environment bindings; create or authenticate synthetic users; run session-bound RLS tests; apply migrations through `SUPABASE_DB_URL`; query trusted rows with the server-only service role. Secrets must remain in ignored files or secret managers and must not be printed or committed. |

## Blocker 4: Git State

### Current State

- Branch: `codex/prompt-39-approved-sources`.
- Commit: `e094d985f2be55f3ac96bcb23750863ed4a05d7f`.
- Tracking baseline: same commit as `origin/development`.
- Modified tracked files: 58.
- Untracked files before this task's four deliverables: 105; after them: 109.
- Prompt 39A-39G application, content, source, test, architecture, product, performance,
  and audit work is interleaved.
- Prompt 40 contributes four untracked audit files.
- Migration `0010_bernoulli_flow_simulation_registration.sql` is untracked and has unsafe
  publication semantics for student delivery.
- No obviously unrelated user file was identified. Package/test-runner changes and source
  ID substitutions are related, but must stay with their owning functional commits.

### Safe Commit Split

Do not commit the current tree wholesale and do not push a known publication bypass. Use
path-limited staging and hunk staging for shared files. Every implementation commit must
pass focused tests; the full stack must pass before a pull request.

1. **Audit evidence**: the four Prompt 40 audit files only.
2. **Remediation planning**: the four Prompt 41 files only.
3. **Source governance and traceability**: source records, focused knowledge files, source
   substitutions in content/assessment/project/governance data, content schemas,
   `packages/content-system`, and their tests/docs. Preserve all non-approved statuses.
4. **Visual contracts and design-system foundation**: `features/visual-simulation`, the
   internal lab route, design-system token/tests, visual lesson schema/types, and Prompt
   39A/39B architecture documents.
5. **Pure engineering and simulation domain changes**: `packages/engineering-core`,
   `packages/simulation-engine`, and focused tests. Keep equations and review statuses
   unchanged from reviewed evidence.
6. **Visual lesson implementations**: hydraulic, Bernoulli, and thermodynamic lesson
   adapters/content plus lesson-engine integration. Include the new fail-closed lesson and
   embedded-simulation gate in this commit.
7. **Simulation Lab and persistence integration**: `/simulations` routes,
   `features/simulations`, database tests, and Simulation Lab E2E. Include the fail-closed
   registry/service/direct-route gate. Do not include migration `0010` as currently written.
8. **Migration correction/registration**: only after the live migration state is known.
   If `0010` is unapplied, correct it before first commit. If it is already live, leave its
   history immutable and add the next numbered corrective migration.
9. **Prompt 39 product/performance/audit documentation**: commit with the implementation it
   describes or as one final documentation commit after evidence is regenerated.

The shared files `lesson-engine/components.tsx`, `lesson-engine/types.ts`,
`simulations/catalog.ts`, `simulations/server.ts`, `packages/engineering-core/src/index.ts`,
and `packages/simulation-engine/src/index.ts` contain accumulated multi-prompt changes.
They require hunk review and an intermediate build; chronology alone is not a safe split.

## Strict Remediation Sequence

### Step 1: Establish A Reviewable Checkpoint

- **Objective:** preserve the current work without integrating known defects and separate
  audit/planning evidence from implementation.
- **Files affected:** Git index/commits only; Prompt 40 and Prompt 41 documents first.
- **Security impact:** prevents an unreviewed tree from becoming a release candidate.
- **Tests required:** `git diff --check`, secret scan, formatting for staged documents,
  staged-file review, and confirmation that no ignored environment file is staged.
- **Human action required:** approve the proposed commit split and later review the PR.
- **Rollback risk:** low; no runtime behavior changes.
- **Definition of done:** audit/planning commits are isolated, implementation remains on a
  feature branch, no secret or unsafe migration is staged, and every remaining file has an
  assigned commit group.

### Step 2: Create One Student-Visibility Policy

- **Objective:** define a pure fail-closed predicate requiring `published` and `Approved for
student use`, with explicit handling for missing/unknown values.
- **Files affected:** `packages/content-system/src/index.ts`, its tests, the web workspace
  dependency manifest/lockfile if required, and `docs/architecture/dependency-rationale.md`.
- **Security impact:** establishes one application authority mirroring
  `public.is_student_visible_content` in migration `0005`.
- **Tests required:** full status cross-product, unknown status, missing status, approved
  publication, and parity assertions against migration `0005` text.
- **Human action required:** architecture review of the shared policy location.
- **Rollback risk:** low until consumers adopt it; medium if a permissive default is used.
- **Definition of done:** the predicate fails closed and no UI component owns the rule.

### Step 3: Close Every Lesson Delivery Path

- **Objective:** apply the policy to lesson enumeration, direct lookup, curriculum
  projections, and embedded visual resolution.
- **Files affected:** `apps/web/src/features/lesson-engine/data.ts`,
  `apps/web/src/app/lessons/[lessonSlug]/page.tsx`,
  `apps/web/src/features/lesson-engine/visual-experience-registry.tsx`, curriculum data and
  route tests, lesson tests, smoke/E2E tests.
- **Security impact:** removes public delivery of draft/internal/unapproved lesson bodies and
  metadata; direct slugs return not found or an authorized staff preview boundary.
- **Tests required:** draft hidden, internal hidden, source-required hidden,
  published-unapproved hidden, approved-published visible, static params exclude hidden
  slugs, direct URL denial, embedded simulation denial, old content version denial, and
  content-staff preview separation if retained.
- **Human action required:** product decision on whether public curriculum taxonomy may show
  empty structural categories; no technical-content exception is permitted.
- **Rollback risk:** medium because the current public lesson catalogue may become empty.
- **Definition of done:** no student/public route can render the five current unapproved
  lessons, while a synthetic approved fixture proves the positive path.

### Step 4: Close Every Simulation Delivery Path

- **Objective:** require publication, technical approval, approved parent content, registry
  availability, and prerequisites before catalogue delivery or attempt start.
- **Files affected:** `apps/web/src/features/simulations/catalog.ts`, `discovery.ts`,
  `server.ts`, simulation routes, visual experience registry, unit/E2E/security tests.
- **Security impact:** removes service-role, direct URL, catalogue, embedded, and attempt-start
  bypasses.
- **Tests required:** unapproved registry item hidden; published-unapproved database row
  hidden; unapproved parent hidden; direct slug denied; embedded simulation denied;
  approved-published path visible; service lookup checks both statuses; attempt start
  rechecks policy; historical completed-attempt review does not reveal withdrawn content;
  no cross-student regression.
- **Human action required:** approve whether withdrawn simulation attempts retain a minimal
  stored summary for student review.
- **Rollback risk:** medium-high because catalogue, detail, attempt, and persistence paths
  share registry data.
- **Definition of done:** hard-coded `availability` can never elevate an unapproved item and
  both service-role lookup functions fail closed.

### Step 5: Resolve Fixture And Migration Semantics

- **Objective:** ensure staging rows do not use `published` as an operational bypass while
  review remains incomplete.
- **Files affected:** `database/migrations/0010_bernoulli_flow_simulation_registration.sql`
  if unapplied; otherwise a new additive migration. A new additive migration is also
  required to demote the applied `0009` fixture unless a valid independent approval record
  exists.
- **Security impact:** aligns stored state with application and RLS intent.
- **Tests required:** migration validation, idempotency, no downgrade of approved records,
  fixture remains unavailable, and policy matrix tests.
- **Human action required:** approve live migration execution after the state comparison.
- **Rollback risk:** high if migration history is guessed; low-medium after state is proven
  and changes are conditional.
- **Definition of done:** no live unapproved simulation row is operationally published, no
  historical applied migration is edited, and migration tracking matches repository state.

### Step 6: Pass Local Release Gates And Form Reviewable Commits

- **Objective:** prove the repaired tree before integration.
- **Files affected:** tests and reports only as required by the repaired surfaces.
- **Security impact:** detects regressions before the staging backend is reintroduced.
- **Tests required:** secret scan, format check, typecheck, lint, content validation,
  migration validation, unit, build, smoke, accessibility, and full E2E, plus focused
  publication-security tests.
- **Human action required:** review commit boundaries and approve the pull request; do not
  merge on failing CI.
- **Rollback risk:** low; failures block progression.
- **Definition of done:** clean feature branch, all commands pass, CI passes at the exact
  commit, and no production deployment occurs.

### Step 7: Restore And Attest Supabase Staging

- **Objective:** return the dedicated staging project to healthy operation and verify its
  environment/auth configuration.
- **Files affected:** no repository file unless evidence documentation is updated.
- **Security impact:** restores the only environment where live RLS can be trusted; wrong
  bindings could connect staging to production.
- **Tests required:** project status, Auth/REST health, project-ref comparison, staging-env
  validation, exact callback checks, test-auth disabled, and Vercel Preview/Development
  binding attestation.
- **Human action required:** resume/restore the Supabase project and inspect secret/callback
  configuration in the provider dashboards.
- **Rollback risk:** medium operational risk; production must remain unlinked and untouched.
- **Definition of done:** staging is `ACTIVE_HEALTHY`, health endpoints resolve, callbacks
  are exact, and every runtime secret is attested to the staging project without disclosure.

### Step 8: Reconcile Migrations And Run Live RLS Tests

- **Objective:** prove exact schema state, apply only approved missing migrations, and rerun
  the complete security matrix with synthetic identities.
- **Files affected:** migration record/audit documentation; migrations only as decided in
  Step 5.
- **Security impact:** validates that database enforcement matches repository intent.
- **Tests required:** two-student isolation, draft/internal/unapproved denial, approved
  visibility, hidden answers, content-version/review-record denial, author self-approval
  denial, reviewer student-data denial, service-role confinement, and migration privilege
  checks.
- **Human action required:** provide/approve synthetic accounts and migration execution.
- **Rollback risk:** high for live migration; use preflight, transaction where supported,
  conditional data updates, and a recorded rollback query.
- **Definition of done:** local/live migrations match, the expanded live matrix passes, and
  temporary tokens are revoked or expired.

### Step 9: Obtain One Bounded Pilot Approval

- **Objective:** approve exactly one versioned lesson and its required source, equation,
  safety, simulation, and educational evidence for controlled student use.
- **Files affected:** review records and versioned status metadata through the existing
  governance workflow; no equation or source claim is changed without evidence.
- **Security impact:** prevents technical fixes from being mistaken for engineering approval.
- **Tests required:** self-approval denial, named reviewer/date/version presence, source IDs
  exist, equation/simulation tests attached, and approved publication is the only positive
  student-visible fixture.
- **Human action required:** named independent engineering, education, safety (where
  applicable), and accessibility reviewers must sign their own records.
- **Rollback risk:** medium governance risk; rollback must archive/unpublish the approved
  version without deleting history.
- **Definition of done:** one bounded content version has valid independent review records
  and can be published by an authorized user who is not its author/reviewer.

### Step 10: Deploy To Protected Staging And Decide Pilot Readiness

- **Objective:** deploy the exact reviewed `development` commit to protected staging and
  verify the student journey end to end.
- **Files affected:** final audit/release-gate reports only.
- **Security impact:** confirms application and RLS controls together at the release identity.
- **Tests required:** corrected public route negatives, one approved positive lesson and
  simulation path, authentication, private dashboard, assessment answer protection,
  simulation attempt ownership, accessibility, smoke, and full E2E/live checks.
- **Human action required:** approve deployment, execute student-pilot release decision, and
  keep production disabled.
- **Rollback risk:** medium; rollback to the last protected staging deployment and unpublish
  the pilot version if a gate fails.
- **Definition of done:** exact commit/deployment IDs are recorded, staging-development gates
  are GO, and the pilot matrix is GO or explicitly time-bounded CONDITIONAL GO with no open
  critical security/content gate.

## Risk Summary

| Change                         | Risk                                      | Reason                                                                          |
| ------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------- |
| Git split                      | Medium-high                               | Accumulated changes overlap shared files and cannot be separated by path alone. |
| Shared visibility predicate    | Low-medium                                | Small logic surface, but a permissive default would be critical.                |
| Lesson route gating            | Medium                                    | Expected secure empty states change current public behavior.                    |
| Simulation gating              | Medium-high                               | Catalogue, direct route, attempts, persistence, and history are coupled.        |
| Fixture/migration correction   | High until state known                    | Applied migration history and live rows are currently unobservable.             |
| Supabase restore/configuration | Medium                                    | Environment separation and callbacks require provider-side attestation.         |
| Live RLS testing               | Medium                                    | Requires short-lived secrets and controlled synthetic data.                     |
| Human content approval         | Low code risk, high governance importance | Cannot be automated or self-approved.                                           |

## Prompt 42 Decision

**GO WITH SCOPE RESTRICTION.** Prompt 42 may proceed only as implementation of Steps 1-6:
Git recovery plus fail-closed lesson and simulation delivery remediation. It must not add
features, approve content, apply live migrations, deploy, begin a student pilot, touch
production, or start AI Mentor work. Steps 7-10 require the stated human approvals and live
staging access.
