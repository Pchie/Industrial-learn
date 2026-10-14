**Is the redesigned frontend correctly connected to the secure backend?**

Only partially. Real authenticated backend paths remain in the source, but the supplied local preview uses in-memory test data. The new bookmark adapter is incompatible with the current staging lesson identity, the author workspace has no live draft loader, and a confirmed database account-suspension bypass prevents a backend-security pass. Current staging assessment publication metadata matches the repository; that does not establish live end-to-end persistence.

| Decision                                        | Verdict        | Basis                                                                                                                                                                              |
| ----------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Local frontend/backend integration           | PARTIAL        | Fixture journeys work; new bookmarks do not map to current staging lesson records.                                                                                                 |
| 2. Local-test-data isolation                    | PARTIAL        | Proper staging/local configuration is rejected; mixed configured-auth/fixture-data mode remains possible.                                                                          |
| 3. Authentication and authorisation             | FAIL           | Verified-session application guards exist, but disabled users can bypass the database suspension boundary (F01).                                                                   |
| 4. Live staging RLS                             | FAIL           | Current staging grants/policy expose the F01 defect. Ordinary synthetic-user live behavior remains BLOCKED; this verdict is based on live schema evidence plus local reproduction. |
| 5. Publication/version integrity                | PARTIAL        | Current pilot metadata and launch gates match; historical review rebinding and dormant simulation privileged gates remain unresolved.                                              |
| 6. Assessment/progress persistence              | PARTIAL        | Trusted SQL/RPC paths and fixture tests exist; historical review mismatch and missing authorized live persistence tests remain.                                                    |
| 7. Safe to continue frontend development        | CONDITIONAL GO | Continue isolated development while keeping backend defects visible and release gates closed.                                                                                      |
| 8. Backend-security gate for a controlled pilot | FAIL           | F01 must be remediated and independently retested; F02 and the blocked deployed/live checks also prevent a complete integration claim.                                             |

This is an audit, not remediation, deployment, production approval or a new student-pilot approval. No application source, engineering content, equations, tests, environment files, policies or migrations were changed.

## Baseline and scope

- Repository: `/Users/zungu/Documents/Master Industrial Learning`.
- Branch: `codex/website-design-consistency`; commit: `5fd8fc5253314deb403172d2084dc3d216adcd1f`.
- Baseline captured: `2026-09-11T12:10:47.193479+00:00`. Pre-existing state: 52 modified tracked files and 27 untracked files; 779 non-ignored files hashed.
- Working-tree manifest SHA-256: `5d966f91dc0872c7d9c3110fc004cf8fafa830551593382d729fa4480a86718e`.
- Temporary audit workspace: `/private/tmp/industrial-learn-53e-audit`. Tests ran against a byte-copied source tree and APFS-cloned existing dependencies. No dependency installation or upgrade occurred.
- Installed versions: Node 24.17.0; Next 16.3.3; React/React DOM 19.2.7; Supabase JS/auth-js 2.110.7; TypeScript 6.0.3; Zod 4.4.3; Playwright 1.61.1; Chromium 149.0.7827.55; Vitest 4.1.10; ESLint 10.7.0; Three 0.185.1. Disposable local PostgreSQL: 17.11.
- Running preview: `127.0.0.1:3167`, listener PID 12970, Next 16.3.3. Fresh liveness returned HTTP 200, environment `test`, release `0.1.0/local`. It does not expose a source commit, so exact running-build/source correspondence is not asserted. The original server was left running.
- Fresh browser target: `127.0.0.1:3100`, built from the copied current source with the existing Playwright local/test environment. Rechecks used a separate fresh fixture server at port 3125.
- Verified deployment metadata: GitHub deployment `6336125240`, environment `Preview – industrial-learn-staging`, success at `2026-09-08T20:07:15Z`, commit `5fd8fc5253314deb403172d2084dc3d216adcd1f`, URL [immutable staging deployment](https://industrial-learn-staging-a44goaezr-kolobe.vercel.app). Current authenticated deployment inspection is blocked by Vercel SSO. Its environment is identified by deployment metadata, not inferred from its hostname.
- Configured staging alias: [Industrial Learn staging](https://industrial-learn-staging-git-development-kolobe.vercel.app). The local dirty redesign is not part of the deployed commit.

The latest located historical backend verification is [staging-pilot-gate-remediation.md](</Users/zungu/Documents/Master Industrial Learning/docs/audits/staging-pilot-gate-remediation.md>), associated with PR #43/merged `5fd8fc5`, following exact review evidence work in PR #42 and dashboard work in PR #41. That report records prior live checks and still leaves pilot operational gates open. It is historical repository evidence, not a fresh independent proof of this dirty revision. No independent human attestation was established in this audit. The architecture/data-access document is stale where it says runtime adapters are not implemented; the inspected feature repositories take precedence.

`git diff HEAD` identifies 52 tracked changes (1,526 insertions, 353 deletions), plus the 27 pre-existing untracked files. Auth provider/server, simulation server, database policies and migrations are unchanged from HEAD. Assessment server changes only add `lessonSlug` to returned summaries. New bookmark files and My Learning projections are the principal new data integration surface. F01/F03/F04/F05/F06/F08 are inherited; F02/F07/F09 relate to the new integration; F10 is confirmed in the redesigned private library.

## Environment configuration evidence

| Context                        | Verified configuration and limit                                                                                                                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Normal local checkout          | Root `.env` and app-local environment files are absent; root `.env.local` contains `VERCEL_OIDC_TOKEN` only. No value was printed. Without process overrides, the code defaults to development/Supabase and fails unavailable authentication rather than inventing a session. |
| Retained 3167 preview          | Known local-fixture launch and unchanged listener process; fresh liveness reports test. Direct environment enumeration through `ps` did not expose its variables. Do not interpret liveness as independent proof of every runtime variable or the exact built source.         |
| Fresh automated execution      | Original Playwright configuration explicitly sets test/local/E2E=true and clears all Supabase values for the isolated build/server. This mode is directly controlled and verified by the fresh fixture journeys.                                                              |
| Staging configuration file     | `.env.staging.local` declares production Node mode, staging application environment, Supabase auth, E2E=false and the verified staging target. Required public/server credentials and DB URL are present; metadata-only requests accepted them.                               |
| Deployed staging build/runtime | Exact environment scopes and build/runtime agreement remain BLOCKED by protected deployment access. A correct local staging file is not proof of Vercel’s deployed values.                                                                                                    |

The relevant code-defined names are `NODE_ENV`, `NEXT_PUBLIC_APP_ENV`, `APP_BASE_URL`, `INDUSTRIAL_LEARN_AUTH_MODE`, `INDUSTRIAL_LEARN_E2E`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF` and `SUPABASE_DB_URL`. `APP_VERSION` and `VERCEL_GIT_COMMIT_SHA` label health/monitoring releases. The configured anon-named variable contains a public **publishable** key; it is distinct from the server-only service-role credential. No secret value appears in the artifacts.

## Evidence boundaries

| Evidence class          | What was actually established                                                                                                                                                                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static inspection       | Route/action/service/repository/policy chains, publication and role gates, installed framework origin checks.                                                                                                                                                                                 |
| Mock/unit/local fixture | 508 existing unit passes; eight additional probes; full Chromium suite; 13 additional browser/direct-request checks. Fixture session persistence is process memory, not Supabase durability.                                                                                                  |
| Real local database     | Disposable socket-only PostgreSQL using all existing migrations/policies, synthetic auth.uid claim shim and synthetic rows. 16 access checks passed and two suspension checks failed; existing publication rollback regression ran unchanged. This does not exercise Supabase Auth/PostgREST. |
| Live Supabase staging   | Read-only catalog, grants, policies, functions, migration ledger and named publication metadata; configured publishable and service keys accepted on read-only requests. No real student data read.                                                                                           |
| Deployed browser        | Vercel SSO protection observed; app authentication, cache headers, runtime variables and user journeys remain BLOCKED.                                                                                                                                                                        |

No raw cookies, credentials, reset links, page HTML, hidden answers, HAR or traces were saved in these reports. Temporary browser reporting emits titles/status/counts/locations only. A temporary output guard suppresses screenshots/error-context files in the audit output directory while allowing screenshot buffers used by existing assertions. Existing tests, assertions and timeouts were not changed. Temporary probe corrections addressed reused mock Response bodies, Secure cookies in Playwright’s loopback API client and Next’s streamed redirect semantics; they are not application fixes. Some denied requests return HTTP 200 with an action redirect/streamed redirect, so status alone was not treated as authorization evidence.

The existing SQL publication script checks four legacy slugs that were absent in this fresh database. Their zero-row results are **not** counted as isolation proof. The created lesson/simulation positive controls, exact evidence acceptance and 14 mutation denials are meaningful. All local SQL test rows were rolled back, zero profile/bookmark/attempt rows were confirmed, and the disposable cluster was stopped; no engineering approval/publication was made in the project or staging. Browser fixture accounts existed only in the isolated test-server process.

## Frontend connection summary

See the [complete feature map](</Users/zungu/Documents/Master Industrial Learning/docs/audits/prompt-53e-frontend-backend-map.md>). The dashboard and library use a common authenticated summary loader. Its Supabase mode uses the ordinary session token, explicit owner filters and RLS. Lesson bodies come from independently reviewed repository content. Assessments and progress use privileged server repositories with session-derived identity and service-only transaction functions. Owner/reviewer operations use actor-authorized RPCs. The shared shell requests only an account/workspace summary.

Disconnected, local-only or unverified areas:

- Every private journey at port 3167 currently uses local demonstration/test records; memory is lost on server restart.
- Bookmark read/save for the public pilot lesson fails against current staging because no relational lesson row exists (F02).
- Author draft lists/editing/submission have no live implementation in this interface (F05).
- No standalone simulation is currently eligible for public/student launch; persisted simulation start/completion/history cannot receive a current end-to-end PASS. Internal visual inspections and browser calculations are separate.
- Local review decisions produce a demonstration response and do not establish durable review persistence.
- Assessment/progress/bookmark persistence across real authenticated staging sessions, reviewer/lecturer/owner live role checks, and deployed caching/runtime agreement remain unverified.
- AI Mentor and project submission are intentionally deferred; the normal UI uses Study Support and identifies project limitations. Their absence is not a security defect.

## Findings

### 53E-F01 — HIGH: Disabled accounts can bypass the database suspension boundary

Existing backend defect; present at committed baseline and in current staging schema.

**Evidence:** Ordinary authenticated SQL in disposable PostgreSQL read one own progress row while disabled, then updated one own profiles row to clear deleted_at. Staging read-only inspection confirms UPDATE privilege on profiles.deleted_at, the self-update policy, only the timestamp trigger, and has_role without a disabled-profile predicate. No live user token was used.

**Impact:** An account holding a valid Supabase JWT can continue ordinary database access and undo its application suspension through the public API. The application’s disabled-account check can then accept the re-enabled profile.

**Source:** [database/policies/0001_row_level_security.sql](</Users/zungu/Documents/Master Industrial Learning/database/policies/0001_row_level_security.sql>) (`profiles_self_update`); [database/migrations/0015_platform_owner_access_management.sql](</Users/zungu/Documents/Master Industrial Learning/database/migrations/0015_platform_owner_access_management.sql>) (`set_profile_disabled`); [database/migrations/0001_initial_schema.sql](</Users/zungu/Documents/Master Industrial Learning/database/migrations/0001_initial_schema.sql>) (`has_role`); [apps/web/src/features/auth/supabase-provider.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/auth/supabase-provider.ts>) (`resolveSupabaseProfile`).

**Smallest remediation:** Version-controlled migration: remove table-wide self UPDATE, allow only intended editable profile columns, protect deleted_at and other authority fields, and enforce the documented disabled-account rule in ordinary-user RLS/authorization helpers. Keep the audited manager RPC as the authorized status-changing path.

**Required retest:** With approved synthetic A/B sessions: active A positive control; disable A through authorized manager; A GET/PATCH and relevant RPCs must be denied without changing the flag; authorized manager restores only the audit-created account. Verify valid pre-disable JWT, fresh login and re-enabled positive control.

### 53E-F02 — HIGH (integration): New bookmarks cannot target the published pilot lesson in staging

New uncommitted frontend/backend adapter mismatch.

**Evidence:** Fresh privileged read-only metadata finds no lessons row for basic-fluid-pressure, hydraulic-cylinder-force or bernoulli-flow-lab. The pilot lesson exists as governance item ee1c9dd7-83a1-4811-9fce-3cb517186a9f, current/published governance version 4. The new repository requires lessons.id for both isSaved and setSaved. A no-row adapter probe rejects before any bookmark write.

**Impact:** On a deployment of this source against current staging, the only public lesson cannot be read/saved through this bookmark adapter. Existing fixture tests succeed because the local store accepts a slug directly.

**Source:** [apps/web/src/features/student-dashboard/saved-lesson-repository.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/saved-lesson-repository.ts>) (`lessonId`); [apps/web/src/features/student-dashboard/saved-lessons-server.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/saved-lessons-server.ts>) (`setSavedLesson`); [database/migrations/0002_dashboard_student_preferences.sql](</Users/zungu/Documents/Master Industrial Learning/database/migrations/0002_dashboard_student_preferences.sql>) (`saved_lessons`); [database/migrations/0019_assessment_version_integrity_and_pilot_progress.sql](</Users/zungu/Documents/Master Industrial Learning/database/migrations/0019_assessment_version_integrity_and_pilot_progress.sql>) (`lesson_content_id`).

**Smallest remediation:** Choose one canonical lesson identity compatible with the reviewed governance-backed pilot. Either bridge a valid governed relational lesson row or migrate bookmark references to the stable governed content ID. Use a migration if the schema changes; preserve RLS and existing rows. Do not create a merely labelled published row to bypass review evidence.

**Required retest:** Approved synthetic staging bookmark journey: save, verify exact row/owner/lesson mapping, fresh browser, signout/in, B read/update/delete denials with A positive control, duplicate save, remove only audit-created bookmark. Include withdrawal behavior.

### 53E-F03 — MEDIUM: Historical attempt review is paired with the current assessment

Existing assessment read path, not introduced by the added lessonSlug field.

**Evidence:** Audit fixture inserted an owned completed contentVersion 1 attempt. loadCompletedAssessmentReview returned that attempt with summary.contentVersion 2; loadAssessmentAttemptPage likewise returned current content. Dashboard links already apply a stricter version check, but direct URLs omit it. The SQL submission path separately rejects mismatched versions.

**Impact:** Direct historical review can combine an old score with current questions/feedback and potentially disclose current graded feedback based on an earlier-version completion. Actual historical staging attempts were not read.

**Source:** [apps/web/src/features/assessments/server.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/assessments/server.ts>) (`loadAssessmentAttemptPage`); [apps/web/src/features/assessments/server.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/assessments/server.ts>) (`loadCompletedAssessmentReview`); [apps/web/src/features/student-dashboard/summary-access.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/summary-access.ts>) (`canReviewDashboardAssessment`).

**Smallest remediation:** Bind delivery and review to the persisted attempt version/hash. Either load the exact archived reviewed assessment or return an honest unavailable state when it differs from the installed catalogue; do not substitute current feedback.

**Required retest:** Positive current-version owned review; owned prior-version in-progress and completed direct URLs; later-version-only DB row; another owner; no current answers returned for an old completion.

### 53E-F04 — MEDIUM: Authentication and data adapters disagree in mixed local/Supabase configuration

Existing configuration boundary; correctly labelled staging/production rejects local auth.

**Evidence:** With test/local/E2E=true, a configured Supabase URL/key and a non-loopback APP_BASE_URL, the explicit local safety validator rejected the environment. getAuthProvider nevertheless selected Supabase before calling that validator; dashboard data then came from fixture memory without a network request. No actual configured environment was changed.

**Impact:** A mislabelled deployment/development process can authenticate real identities but silently store/show demonstration data. The bookmark selector can fail while other stores still operate locally. This is not a client-controlled mode switch.

**Source:** [apps/web/src/features/auth/server.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/auth/server.ts>) (`getAuthProvider`); [apps/web/src/features/student-dashboard/server-data.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/server-data.ts>) (`isLocalDashboardMode`); [apps/web/src/features/assessments/server.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/assessments/server.ts>) (`isLocalAssessmentMode`); [apps/web/src/features/student-dashboard/saved-lessons-server.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/saved-lessons-server.ts>) (`localMode`); [packages/env/src/index.ts](</Users/zungu/Documents/Master Industrial Learning/packages/env/src/index.ts>) (`validateLocalTestAuthSafety`).

**Smallest remediation:** Centralize one validated backend-mode decision. Reject mixed fixture/live configuration and non-loopback test mode before any provider or repository is selected.

**Required retest:** Complete mode matrix with configured/missing keys, loopback/non-loopback base URL and development/test/staging/production; all features must select the same mode or fail closed.

### 53E-F05 — MEDIUM (incomplete feature): The Supabase author workspace has no draft loading/editing journey

Existing incomplete feature; preserved by frontend redesign.

**Evidence:** In Supabase mode the loader always returns items=[] and dataSource=unavailable. The rendered workspace lists authoring capabilities but does not surface that source state as an unavailable error. Local fixtures populate the view.

**Impact:** An author can see an empty workspace even when governed drafts exist, and the capability copy overstates the available interface. Repository previews and reviewer database paths are separate.

**Source:** [apps/web/src/features/content-governance/server-data.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/content-governance/server-data.ts>) (`loadAuthorGovernanceModel`); [apps/web/src/features/content-governance/components.tsx](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/content-governance/components.tsx>) (`AuthorWorkspace`).

**Smallest remediation:** Wire an ownership-scoped live draft loader and the intended author operations, or explicitly label this workspace and listed operations as unavailable/deferred until implemented.

**Required retest:** Synthetic author with an owned draft positive control, author without drafts, another author’s scope, database outage and unavailable UI. No actual content approval is needed.

### 53E-F06 — MEDIUM (dormant path): Privileged simulation adapter does not enforce exact database publication evidence

Existing dormant integration gap; current public standalone simulation catalogue is empty.

**Evidence:** The server’s service-role selectors filter slug and two status labels, without has_current_engineering_publication or a catalogue/database version comparison. Service role bypasses the restrictive RLS predicate. Current catalogue gates and staging internal/Source required status block the existing simulation; no current student launch bypass was demonstrated.

**Impact:** When simulations become eligible in repository content, this adapter could accept stale or unsupported database publication labels and bind server runtime to a different DB version.

**Source:** [apps/web/src/features/simulations/server.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/simulations/server.ts>) (`getSupabaseSimulationRowBySlug`); [apps/web/src/features/simulations/server.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/simulations/server.ts>) (`getSupabaseSimulationRowForDefinition`); [database/migrations/0020_require_reviewed_lesson_simulation_publication.sql](</Users/zungu/Documents/Master Industrial Learning/database/migrations/0020_require_reviewed_lesson_simulation_publication.sql>) (`has_current_engineering_publication`); [database/migrations/0008_atomic_simulation_completion.sql](</Users/zungu/Documents/Master Industrial Learning/database/migrations/0008_atomic_simulation_completion.sql>) (`complete_simulation_attempt_transaction`).

**Smallest remediation:** Before enabling a simulation, require independent exact-version simulation review/publication evidence in its server path and trusted completion transaction, with matching repository/runtime identity.

**Required retest:** Valid simulation positive control plus missing approval/assignment, later rejection, archived parent, current/version mismatch, service-role path and mid-attempt withdrawal. Keep all fixtures isolated.

### 53E-F07 — LOW: Library counts and save/progress states use a capped dashboard window

New My Learning projection reuses existing summary queries.

**Evidence:** Summary limits are 25 lesson-progress rows and 10 saved rows. The library treats absent entries as Available/unsaved and has no pagination to retrieve older records. Only the saved filter displays a recent-items notice. A capped-progress probe returns Available despite a limited section. Current public catalogue contains only one lesson, limiting present-day impact.

**Impact:** As content grows, older completions/bookmarks can disappear from counts and controls even though durable records remain.

**Source:** [apps/web/src/features/student-dashboard/summary-queries.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/summary-queries.ts>) (`dashboardQueries`); [apps/web/src/features/student-dashboard/learning-library.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/learning-library.ts>) (`buildLearningLibrary`); [apps/web/src/features/student-dashboard/learning-library-view.tsx](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/learning-library-view.tsx>) (`LearningLibrary`).

**Smallest remediation:** Use paginated library-specific queries or fetch complete state for the displayed public lesson IDs; distinguish unknown/truncated state and expose totals honestly.

**Required retest:** More than 25 progress and 10 saved records, including older eligible entries; all filters, counts, card state and pagination.

### 53E-F08 — LOW: Unknown account-status operation is interpreted as enable

Existing manager-only input-validation defect.

**Evidence:** disabled is computed as operation === disable; the validator never checks an enable/disable enum. A valid manager form with any other operation reaches p_disabled=false. This is static evidence; no live account action was invoked.

**Impact:** Malformed authorized requests can enable an account instead of being rejected. It does not grant management rights to students.

**Source:** [apps/web/src/features/platform-administration/actions.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/platform-administration/actions.ts>) (`setAccountStatusAction`).

**Smallest remediation:** Reject missing/unknown operation before computing the boolean or calling the RPC.

**Required retest:** Manager requests with enable/disable positive controls and missing/unknown values; non-manager rejection; unchanged target on validation failure.

### 53E-F09 — LOW: Withdrawn bookmark removal is blocked by the same eligibility lookup as saving

New bookmark adapter behavior.

**Evidence:** Both remove and save require a currently public static lesson and a visible published lessons row. The removal probe with no visible lesson rejects before DELETE. Saved-item projections do filter protected content.

**Impact:** A user cannot remove an existing bookmark once its content is withdrawn; no protected lesson content leak was observed.

**Source:** [apps/web/src/features/student-dashboard/saved-lesson-repository.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/saved-lesson-repository.ts>) (`setSaved`); [apps/web/src/features/student-dashboard/saved-lessons-server.ts](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/saved-lessons-server.ts>) (`setSavedLesson`).

**Smallest remediation:** Allow deletion by an authenticated owner’s existing bookmark identifier/stable lesson reference without requiring content delivery eligibility. Keep read/title delivery gated.

**Required retest:** Save eligible fixture, withdraw its content in isolated/authorized infrastructure, verify no metadata leak and successful owner-only removal.

### 53E-F10 — MEDIUM: Account switching leaves the previous user’s private library in another tab

Confirmed on the redesigned My Learning page in a shared local browser context.

**Evidence:** A saved a bookmark in My Learning. A second tab signed out and registered synthetic B in the same browser context. After returning focus, the original tab’s shell showed B while its protected page still displayed A’s identity and saved bookmark. A fresh B page correctly showed no bookmarks. Only boolean results were retained.

**Impact:** A shared browser can display the previous account’s private data after its session changes. Backend ownership still blocks fresh unauthorized reads; this is stale client-rendered data, not a cross-owner database query.

**Source:** [apps/web/src/features/auth/site-navigation.tsx](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/auth/site-navigation.tsx>) (`refreshAccount`); [apps/web/src/app/my-learning/page.tsx](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/app/my-learning/page.tsx>) (`MyLearningPage`); [apps/web/src/features/student-dashboard/dashboard-sync.tsx](</Users/zungu/Documents/Master Industrial Learning/apps/web/src/features/student-dashboard/dashboard-sync.tsx>) (`DashboardSync`).

**Smallest remediation:** Invalidate or clear every private page when the authenticated identity changes or logout occurs, including cross-tab changes. Refresh/replace the server-rendered library before displaying the newly resolved identity; use a consistent account-change signal rather than updating only the header.

**Required retest:** Two same-context tabs: A to B and A to signed-out, My Learning/dashboard/results and other private routes, focus/visibility/back navigation, delayed or failed account checks. Confirm no mixed identity/private body and retain A/B backend positive controls.

## Authentication, RLS and role conclusions

Real authentication calls Supabase `/auth/v1/user` before trusting the user, checks email confirmation/profile state, and reads current role rows. Sign-in/registration never accept a browser-supplied application role. Session cookies are HttpOnly, Secure for the tested production-mode build, SameSite=Lax and path `/`. Ordinary sessions cannot stand in for purpose-bound recovery tickets. The documented design does not automatically refresh an expired access token; a fresh sign-in is required. Logout clears the browser session and revokes the provider refresh session, with provider access-token expiry behavior remaining relevant.

The live schema has 37/37 public tables with RLS, 91 policies, 32 functions and no public views/materialized views. Privileged completion RPCs grant EXECUTE to service_role only; manager/reviewer RPCs check their authenticated actor internally. Security-definer functions have fixed search paths, and authenticated users lack CREATE on the public schema. None of that compensates for the unrestricted self-update of the suspension column (F01).

| Actor          | Observed/documented boundary                                                                                | Evidence limit                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Visitor        | Eligible public catalogue/lesson only; private direct action redirects to sign-in.                          | Fresh local browser; deployed app blocked.                                                     |
| Student A/B    | Own bookmarks/progress/attempts; foreign IDs denied; client role/score fields ignored.                      | Local browser + real local SQL positive/negative controls; live user-session tests blocked.    |
| Author         | Content-preview capability; broad technical-content read policies; no automatic student-private access.     | Static/schema/local SQL; draft UI disconnected.                                                |
| Reviewer       | Assigned queue/detail and decision scope; broader content-preview/RLS technical read scope.                 | Scope is not universally assignment-only. No live reviewer session.                            |
| Lecturer       | Cohort/module helpers scope course and student data.                                                        | Existing local SQL regression includes unassigned denial and assigned-course positive control. |
| Platform Owner | Operational inspection/management; no owner-only independent approval or automatic student progress access. | Local SQL owner RPC denial and progress isolation; live management writes blocked.             |

Owners may inspect technical evidence under explicit policies; authors cannot change author_profile_id away from themselves through the draft update policy. Student answer-choice access is denied; question-column grants exclude protected explanations. Technical staff read visibility is broader than the reviewer queue filter, and preview routes use the broad content:preview capability. Do not describe the entire technical-content layer as item-assignment confidential. Assessment review rebinding is separately reported in F03.

## Publication and persistence details

The public pilot lesson is `LES-FLUID-PRESSURE-001`, version `0.4.0`, with matching checked-in engineering/publication records. Staging governance item `ee1c9dd7-83a1-4811-9fce-3cb517186a9f` is current/published version 4. The assessment is `ASM-FLUID-PRESSURE-001`, database ID `94f5c2b9-a0b9-43f5-8b6b-4a3a67fc4f02`, current/published version 2, governance item `3c91523e-e30c-4f7b-89ef-0c8f7eeb3803`, review record `6e326982-ce64-480b-a779-96cf4fdf3b13`. Its artifact hash matches the exact repository file. Source/equation/outcome IDs match. The immutable assessment body retains its draft-era review label; delivery derives authorization from the separately verified current publication record, rather than treating that file label as approval.

The live `is_current_published_assessment` predicate returned true for the named pilot. The source’s expected-version mismatch gate and SQL start/completion checks are present and tested locally. Actual later-version staging rows were not created. Opening a page or changing theme/camera does not award progress. The lesson challenge validates finite SI inputs and the pure challenge model before a trusted progress RPC. Assessments normalize units and score server-side; completion writes attempt, progress, awards and audit transactionally. Additional local SQL rejects ordinary direct score/progress changes.

The standalone hydraulic simulation is `internal` / `Source required` in staging and fails the current publication predicate. The public simulation catalogue is empty. Migration `0010` (Bernoulli registration) is absent from the staging ledger; all other numbered migrations through `0022` are recorded. This is a deployment difference to reconcile, not permission to publish content or apply a migration.

Repository-based lesson delivery and live governance publication are separate authorities today. Their current pilot metadata agrees, but immediate withdrawal across repository pages, search, saved cards and static assets without a corresponding content release is not established. No withdrawal test was performed. F06 must be addressed before making standalone simulations eligible.

## Caching, browser payloads and failure behavior

Local dashboard, My Learning, workspace and account-access responses were private/no-store; auth cookies and account responses were not stored as public caches. No service worker or persistent application-data browser store was found. Theme/sidebar localStorage are legitimate preferences. The shell aborts stale account fetches and refreshes on route/focus/visibility changes; signout clears the account API and private route access. However, the additional cross-tab test reproduced a mixed-identity page: the header updated to B while My Learning still rendered A’s identity/bookmark (F10). Deployed CDN behavior remains unverified.

The initial graded-attempt HTML and client-bundle scan did not contain the protected answer/rubric field names checked by the audit; raw payloads were kept only in memory. Existing projection tests and browser checks cover restricted review data, source metadata and draft content. This is bounded leakage testing, not a claim that every possible byte was proven harmless. React renders names/search/content as escaped values; the only raw HTML insertion found is the static theme initialization script. Operational events redact structured details and hash user identifiers. No server credential match was found in client/public build files.

Installed Next 16.3.3 checks action Origin against Host/forwarded Host unless explicitly allowed. A mismatched-origin direct request was rejected. Missing Origin is not rejected universally by the framework; SameSite cookies and the actual browser/proxy design remain part of the boundary. [Next server-action configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions) documents the relevant controls.

Controlled existing mocks/fixtures cover auth outage, all/partial dashboard failure, bookmark read/write rejection, invalid answers, idempotent completion and transaction rollback. They return unavailable/retry states rather than inventing scores. A real database disconnect, mid-submission live expiry, and deployed reconnection were not exercised. Supabase’s [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) explains why service-role reads are not RLS proof; its [SSR authentication guidance](https://supabase.com/docs/guides/auth/server-side/advanced-guide) explains why deployed authenticated cache behavior still needs verification.

## Fresh validation results

| Command/check                               | Result                                                    | Scope                                                                                                                                                |
| ------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/secret-scan.mjs`              | PASS                                                      | Read-only scan in original repository, includes non-ignored untracked files.                                                                         |
| `npm run format:check`                      | PASS                                                      | First cloned-tree run flagged only the temporary audit config; final source-only check is recorded separately.                                       |
| `npm run typecheck`                         | PASS, exit 0                                              | Existing workspace scripts in source clone.                                                                                                          |
| `npm run lint`                              | PASS, exit 0                                              | Existing source, before additional temporary probes were introduced.                                                                                 |
| `npm run validate:content`                  | PASS, 29/29                                               | Existing content validation.                                                                                                                         |
| `npm run validate:migrations`               | PASS, 28/28                                               | Existing migration tests.                                                                                                                            |
| `npm run test:unit`                         | PASS, 508 passed / 7 skipped; 54 files passed / 1 skipped | Skips are opt-in live staging tests, not live passes.                                                                                                |
| Production build in Playwright webServer    | PASS                                                      | Existing `npm run build --workspace @industrial-learn/web`, explicit fixture build environment. No staging deployment build claim.                   |
| Full existing Chromium suite                | FAIL — 212 passed, 2 failed                               | All 214 configured tests, 24 files, fresh server, original tests/assertions/timeouts/retries.                                                        |
| Fresh isolated owner assignment recheck     | PASS — 1 test                                             | Same source and unchanged failing test, separate clean fixture process.                                                                              |
| Fresh isolated study-support recheck        | PASS — 2 tests                                            | Same source and unchanged support spec.                                                                                                              |
| Additional browser/direct-request probes    | 13 PASS                                                   | Own synthetic local A/B accounts; role spoof, missing session, invalid intent, CSRF, private cache, XSS, answer-key fields, foreign attempt, logout. |
| Additional cross-tab browser probe          | FAIL                                                      | Header changed to B while A’s private library remained visible; F10.                                                                                 |
| Additional unit audit probes                | 8 reproduced outcomes                                     | Several intentionally confirm defects F02–F05/F07/F09; not eight security passes.                                                                    |
| Disposable PostgreSQL access checks         | 16 PASS / 2 FAIL                                          | The two failures are F01; all records rolled back.                                                                                                   |
| Existing publication rollback SQL           | Meaningful positive/evidence/14 mutation checks PASS      | Four absent legacy-slug zero-row checks are excluded from proof.                                                                                     |
| Read-only staging schema and named metadata | PASS for inspection; F01 identified                       | Privileged metadata only; no live Student A/B RLS claim.                                                                                             |
| Firefox/WebKit/manual Safari                | BLOCKED                                                   | Not configured/installed; no tools installed.                                                                                                        |

Exact browser command (from the source clone):

```text
NODE_OPTIONS='--require /private/tmp/industrial-learn-53e-audit/artifact-guard.cjs' node node_modules/@playwright/test/cli.js test --config audit.playwright.config.ts
```

The temporary config imports the original Playwright config and changes only output/reporting/trace storage. Full test selection, worker count and test timeouts remain unchanged. `node node_modules/vitest/vitest.mjs run --config audit.vitest.config.ts` ran the eight temporary probes. `python3 /private/tmp/industrial-learn-53e-audit/run-local-security.py` ran only the disposable database checks. The live schema/publication scripts enforce the staging project guard and explicit `BEGIN READ ONLY`; the first metadata SELECT showed that connection-level read-only options did not survive the pooler, so the explicit transaction was used. No write query was sent to staging.

Full-suite failures retained:

- `tests/e2e/content-governance.spec.ts:84` — Platform Owner assigns reviewer role and exact Basic Fluid Pressure version (timeout; assertion locations: tests/e2e/content-governance.spec.ts:113:51).
- `tests/e2e/frontend-support.spec.ts:4` — study support works on mobile with keyboard, search and accessible dialog (timeout; assertion locations: tests/e2e/frontend-support.spec.ts:15:24).

The owner/support rechecks do not erase a failed full-suite result. Concurrent audit load and fixture state are possible contributors, but the cause has not been proven. The smallest follow-up is to reproduce the failures with the unchanged full suite on an otherwise idle runner and inspect sanitized action/dialog timing and state. No tests were relaxed to make them pass.

## Remaining work and audit boundary

Prioritize F01, the bookmark identity repair, historical review version binding and an explicit backend-mode contract. Complete or honestly label author functionality. Keep simulation enablement blocked until its independent publication/persistence tests pass. Reconcile bounded-library behavior, input validation and cross-tab private-page invalidation in separately authorized remediation tasks.

The [operator actions](</Users/zungu/Documents/Master Industrial Learning/docs/audits/prompt-53e-operator-actions.md>) define the missing deployment evidence and the separate live-write checkpoint. Credentials are present and accepted; the outstanding live tests are blocked by missing approved actor sessions, mutation authorization and protected deployed access, not by a claim that the backend is offline. No external dependency-vulnerability audit was requested or run, so installed-package CVE status is outside this evidence.

## Starting modified and untracked inventory

```text
 M apps/web/src/app/account/access/page.tsx
 M apps/web/src/app/globals.css
 M apps/web/src/app/layout.tsx
 M apps/web/src/app/learn/core-engineering/page.tsx
 M apps/web/src/app/learn/future-engineering/page.tsx
 M apps/web/src/app/learn/loading.tsx
 M apps/web/src/app/learn/page.tsx
 M apps/web/src/app/learn/pilot/page.tsx
 M apps/web/src/app/lessons/[lessonSlug]/loading.tsx
 M apps/web/src/app/lessons/[lessonSlug]/page.tsx
 M apps/web/src/app/loading.tsx
 M apps/web/src/app/modules/[moduleSlug]/page.tsx
 M apps/web/src/app/my-learning/page.tsx
 M apps/web/src/app/not-found.tsx
 M apps/web/src/app/owner/page.tsx
 M apps/web/src/app/page.tsx
 M apps/web/src/app/projects/page.tsx
 M apps/web/src/app/simulations/loading.tsx
 M apps/web/src/app/simulations/page.tsx
 M apps/web/src/app/workspace/page.tsx
 M apps/web/src/features/app-shell/navigation.test.ts
 M apps/web/src/features/app-shell/navigation.ts
 M apps/web/src/features/app-shell/shell.css
 M apps/web/src/features/assessments/components.tsx
 M apps/web/src/features/assessments/server.ts
 M apps/web/src/features/auth/components.tsx
 M apps/web/src/features/auth/protected-page.tsx
 M apps/web/src/features/auth/site-navigation.tsx
 M apps/web/src/features/content-governance/components.tsx
 M apps/web/src/features/content-governance/review-detail.module.css
 M apps/web/src/features/curriculum/components.test.tsx
 M apps/web/src/features/curriculum/components.tsx
 M apps/web/src/features/lesson-engine/components.tsx
 M apps/web/src/features/monitoring/error-boundary-view.tsx
 M apps/web/src/features/platform-administration/components.tsx
 M apps/web/src/features/simulations/components.tsx
 M apps/web/src/features/simulations/simulation-lab-client.tsx
 M apps/web/src/features/simulations/simulation-lab.module.css
 M apps/web/src/features/student-dashboard/components.tsx
 M apps/web/src/features/student-dashboard/dashboard-overview.tsx
 M apps/web/src/features/student-dashboard/dashboard.module.css
 M apps/web/src/features/student-dashboard/experience.ts
 M apps/web/src/features/student-dashboard/local-dashboard-store.ts
 M apps/web/src/features/student-dashboard/overview-model.test.ts
 M apps/web/src/features/student-dashboard/overview-model.ts
 M apps/web/src/features/theme/theme.test.ts
 M apps/web/src/features/theme/theme.ts
 M packages/design-system/src/styles.css
 M tests/e2e/curriculum.spec.ts
 M tests/e2e/dashboard-concept.spec.ts
 M tests/e2e/shared-shell.spec.ts
 M tests/e2e/visual-direction.spec.ts
?? apps/web/src/app/my-learning/error.tsx
?? apps/web/src/app/my-learning/loading.tsx
?? "apps/web/src/app/page 2.tsx"
?? apps/web/src/features/app-shell/study-support.tsx
?? apps/web/src/features/page-layout/components.test.tsx
?? apps/web/src/features/page-layout/components.tsx
?? apps/web/src/features/page-layout/loading.tsx
?? apps/web/src/features/page-layout/page-layout.module.css
?? apps/web/src/features/student-dashboard/activity-summary.test.ts
?? apps/web/src/features/student-dashboard/activity-summary.ts
?? apps/web/src/features/student-dashboard/dashboard-sync.tsx
?? apps/web/src/features/student-dashboard/learning-library-view.tsx
?? apps/web/src/features/student-dashboard/learning-library.module.css
?? apps/web/src/features/student-dashboard/learning-library.test.ts
?? apps/web/src/features/student-dashboard/learning-library.ts
?? apps/web/src/features/student-dashboard/save-lesson.tsx
?? apps/web/src/features/student-dashboard/saved-lesson-action.ts
?? apps/web/src/features/student-dashboard/saved-lesson-repository.test.ts
?? apps/web/src/features/student-dashboard/saved-lesson-repository.ts
?? apps/web/src/features/student-dashboard/saved-lessons-server.ts
?? docs/audits/frontend-refinement-2026-09-11.md
?? docs/audits/unified-learning-2026-09-11.md
?? docs/audits/website-design-consistency-report.md
?? docs/design/website-design-consistency.md
?? tests/e2e/connected-learning.spec.ts
?? tests/e2e/frontend-support.spec.ts
?? tests/e2e/website-consistency.spec.ts
```

## Final change summary and preservation check

Only the four requested audit artifacts were created:

- `docs/audits/prompt-53e-backend-security-integration-audit.md`
- `docs/audits/prompt-53e-frontend-backend-map.md`
- `docs/audits/prompt-53e-security-test-matrix.json`
- `docs/audits/prompt-53e-operator-actions.md`

Verified all 779 baseline file hashes: **zero changed or missing**. All 79 starting status entries remain; exactly four new untracked audit artifacts were added. Branch and commit are unchanged. No commit, push, stash, reset, cleanup of existing work, dependency installation, deployment or staging mutation occurred. Sanitized temporary evidence remains in `/private/tmp/industrial-learn-53e-audit`.

Known limitations: no production access, no real student records, no staging mutation or live-user sign-in, no authenticated deployed browser/cache proof, no Firefox/WebKit/manual Safari run, bounded payload scans, and unresolved full-suite instability. This report stops at findings and required retests; it does not remediate or approve the platform.
