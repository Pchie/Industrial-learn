# Prompt 53E frontend-to-backend map

Audit revision: `5fd8fc5253314deb403172d2084dc3d216adcd1f` plus the pre-existing working tree identified in the main report. All paths below are relative to the repository root. **The running 3167 preview and fresh 3100 browser tests use explicit local fixtures.** “Supabase path” describes inspected application code; it is not a claim that this path was exercised by the local preview.

Real staging evidence is limited to privileged read-only schema/publication metadata and credential acceptance. No live synthetic-user persistence or deployed authenticated browser result is inferred from it. PASS/FAIL/PARTIAL/BLOCKED describe the audit result; an implemented adapter can still be partial or disconnected.

## Dashboard summary — PARTIAL

| Field           | Evidence                                                                                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | /dashboard → dashboard-overview.tsx, ProtectedPage                                                                                                                                                                                                                                                                        |
| Execution path  | student-dashboard/server-data.ts::loadStudentDashboardData → readDashboardSummaries → createRestClient GET enrolments, lesson_progress, assessment_attempts, simulation_attempts, project_submissions, saved_lessons, dashboard_recommendation_dismissals → row mappers → buildDashboardExperience/buildDashboardOverview |
| Identity source | requireStudentProfile → cookies → verified auth user/profile/roles                                                                                                                                                                                                                                                        |
| Data source     | 3167 and browser suite: per-profile in-memory fixtures. Supabase branch: session-token REST plus repository public catalogue.                                                                                                                                                                                             |
| Access control  | Server workspace:student guard; every summary query adds student_profile_id from session; table RLS remains active.                                                                                                                                                                                                       |
| Persistence     | Reads existing records; does not award completion. Recommendation dismissal uses session-bound POST.                                                                                                                                                                                                                      |
| Verification    | Fresh fixture browser + static path; live schema inspected; deployed authenticated browser blocked.                                                                                                                                                                                                                       |

## Continue learning — PARTIAL

| Field           | Evidence                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | Dashboard/My Learning hero → lesson URL                                                                                       |
| Execution path  | buildDashboardExperience selects eligible in-progress lesson, otherwise a public not-completed lesson → /lessons/[lessonSlug] |
| Identity source | Protected parent page session; public lesson gate at destination                                                              |
| Data source     | Summary records joined to getPublicLessons; no separate recommendation service.                                               |
| Access control  | Public catalogue and recorded completion checks; no identity from URL.                                                        |
| Persistence     | Navigation only.                                                                                                              |
| Verification    | Static + fresh fixture browser; depends on bounded summaries.                                                                 |

## My Learning search and filters — PARTIAL

| Field           | Evidence                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Entry point     | /my-learning → LearningLibrary                                                                                                       |
| Execution path  | page.tsx bounds q to 200 chars, learningView allow-list → loadStudentDashboardData → buildLearningLibrary → rendered cards/counts    |
| Identity source | requireStudentProfile; foreign query identifiers ignored                                                                             |
| Data source     | Repository-approved lesson catalogue, joined to memory or session-token summary records.                                             |
| Access control  | Only public lessons enter search/counts; invalid view defaults to all; React escapes query.                                          |
| Persistence     | URL preference only; no search write.                                                                                                |
| Verification    | Fixture search/accessibility/direct-input probes; current staging bookmark join mismatch and capped history prevent end-to-end pass. |

## Add/remove bookmark — FAIL

| Field           | Evidence                                                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | SaveLesson form on lesson and library                                                                                                                       |
| Execution path  | saveLessonAction → setSavedLesson → createSavedLessonRepository.setSaved → SELECT lessons.id by slug/status → POST or DELETE saved_lessons → revalidatePath |
| Identity source | requireStudentProfile; profile ID derived server-side; access token from HttpOnly cookie                                                                    |
| Data source     | Local mode: Map keyed by profile ID. Supabase mode: ordinary user REST.                                                                                     |
| Access control  | Slug pattern/length and intent enum; static visibility plus lesson RLS; saved_lessons self ownership USING/WITH CHECK.                                      |
| Persistence     | Durable DB row in Supabase branch; duplicate POST ignores conflict; local Map lasts only for server process.                                                |
| Verification    | 13 extra browser probes include direct action spoof/invalid intent; local SQL ownership passes. Read-only staging metadata has no matching lesson row.      |

## Saved lessons — PARTIAL

| Field           | Evidence                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | /my-learning?view=saved; /dashboard#saved                                                                                                 |
| Execution path  | readDashboardSummaries saved_lessons select id,saved_at,lessons(slug) limit 10 → mapSavedLessonRow → public catalogue filter → SaveLesson |
| Identity source | Same authenticated dashboard actor                                                                                                        |
| Data source     | Fixture Map or DB saved_lessons join                                                                                                      |
| Access control  | Owner filter in query and RLS; withdrawn/private slugs filtered out.                                                                      |
| Persistence     | Reads bookmarks; removal delegates to bookmark action.                                                                                    |
| Verification    | Fixture new-session flow in full suite; live persistence blocked; removal also fails if lesson no longer visible.                         |

## Lesson detail — PARTIAL

| Field           | Evidence                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | /lessons/[lessonSlug] → LessonRenderer                                                                                                                                             |
| Execution path  | getPublicLessonBySlug → evaluateStaticLessonReviewGate/evaluateStaticPublicationVisibility → projectLessonForPublicDelivery → source citation projection; optional readSavedLesson |
| Identity source | Public content; verified optional session controls save/progress actions                                                                                                           |
| Data source     | Versioned repository JSON and checked-in review/publication records, not a database lesson-body loader.                                                                            |
| Access control  | Exact static review/source/version gate; private visual/assessment attachments projected out; bookmark read uses session token.                                                    |
| Persistence     | Page view has no learning write. Activity action is separate.                                                                                                                      |
| Verification    | One public lesson: Basic Fluid Pressure 0.4.0. Current staging governance metadata matches; live withdrawal synchronization not established.                                       |

## Assessment start — PARTIAL

| Field           | Evidence                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | /assessments/[assessmentSlug] → Start assessment form                                                                                                                              |
| Execution path  | startAssessmentAction → loadAssessmentOverview → exact getSupabaseAssessmentRow/assessmentRowMatchesEntry → services.startAssessmentAttempt → start_assessment_attempt_transaction |
| Identity source | requireStudentProfile; callerContext built from verified session                                                                                                                   |
| Data source     | Local assessment Map or server-only service-role REST/RPC                                                                                                                          |
| Access control  | Exact catalogue ID/version/hash/link/source checks; RPC is service_role-only and checks is_current_published_assessment.                                                           |
| Persistence     | Creates or resumes own in-progress attempt; SQL serializes start.                                                                                                                  |
| Verification    | Current staging assessment metadata matches version 2 and hash; fresh fixture start tested; live write blocked.                                                                    |

## Assessment save/submit/review — PARTIAL

| Field           | Evidence                                                                                                                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | /assessments/[assessmentSlug]/attempt/[attemptId] and /review                                                                                                                                                                                                   |
| Execution path  | saveAssessmentProgressAction/submitAssessmentAction → owned loadAssessmentAttemptPage → parseAssessmentAnswers → persistence service normalizes and scores → complete_assessment_attempt_transaction → loadCompletedAssessmentReview → server-rendered feedback |
| Identity source | Server session supplies studentProfileId; attempt ID is looked up with that ID                                                                                                                                                                                  |
| Data source     | Local Map or privileged server repository with explicit owner predicates                                                                                                                                                                                        |
| Access control  | Own-attempt checks, trusted scoring, completion immutability/idempotency; ordinary users cannot write grades. Review loader omits attempt/current version comparison.                                                                                           |
| Persistence     | SQL completion updates attempt/progress/awards/audit atomically; local fixture approximates this.                                                                                                                                                               |
| Verification    | Fresh existing unit/browser tests + A/B direct route probe; old-version review mismatch reproduced locally; no staging mutation.                                                                                                                                |

## Progress and competency — PARTIAL

| Field           | Evidence                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | Lesson challenge; dashboard results/competency                                                                                                                                                                            |
| Execution path  | completeBasicPressureActivityAction → pure lesson model validation → recordBasicPressureActivityProgress → record_pilot_lesson_activity_progress; assessment completion RPC → summary loader → explicit awards projection |
| Identity source | Verified session and actual student role for lesson progress                                                                                                                                                              |
| Data source     | Local per-profile maps or service-role RPC writes and session-token reads                                                                                                                                                 |
| Access control  | Finite/range/challenge validation; exact lesson version; service-only mutation grants; no credit from navigation/theme/camera. Disabled-account DB bypass is a separate defect.                                           |
| Persistence     | Activity stores in_progress; trusted completion stores graded result and awards; display summarizes a bounded recent window.                                                                                              |
| Verification    | Local fixture session persistence; unit rollback/idempotency; real local SQL direct-write denials; live persistence blocked.                                                                                              |

## Simulation start/completion/history — BLOCKED

| Field           | Evidence                                                                                                                                                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | /simulations; /simulations/[simulationSlug]; attempt/review; /simulations/history                                                                                                                                                                                                             |
| Execution path  | getPublicSimulationCatalog → loadSimulationOverview/startSimulationAction → createSupabaseSimulationRepositories → simulation_attempts; completeSimulationAction → parseSimulationCompletionPayload → server runtime scoring → complete_simulation_attempt_transaction; listSimulationHistory |
| Identity source | requireStudentProfile for private routes; optional session for public catalogue                                                                                                                                                                                                               |
| Data source     | Browser calculations/view state; local attempt Map or privileged REST/RPC for persistence                                                                                                                                                                                                     |
| Access control  | Current catalogue has zero eligible standalone simulations. Parser reconstructs outputs; service scopes attempts to actor. Dormant privileged selector checks status labels but omits exact DB publication-evidence/version predicate.                                                        |
| Persistence     | Start/completion would save attempts; history reads eligible records. View modes only change local UI/history URL.                                                                                                                                                                            |
| Verification    | Fresh browser confirms gated routes/history; service/unit coverage exists. No currently eligible full simulation browser-to-Supabase journey.                                                                                                                                                 |

## Workspace switching — PARTIAL

| Field           | Evidence                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | SiteNavigation; /workspace; /account/access                                                                                                     |
| Execution path  | SiteNavigation fetch /api/account/access → resolveAuthenticatedSession → availableWorkspaces → links; destination requireCapability/requireRole |
| Identity source | Verified cookie session; perspective and next are navigation/display only                                                                       |
| Data source     | Server-resolved role summary, transient client state                                                                                            |
| Access control  | Destination checks independently of menus; shell endpoint returns display name/roles/destinations, no student records or tokens.                |
| Persistence     | No identity/role mutation. Sidebar/theme storage is presentation only.                                                                          |
| Verification    | Fresh direct protected-route, identity-spoof and signout checks; fixture role suite; live roles not behaviorally tested.                        |

## Author workspace and preview — PARTIAL

| Field           | Evidence                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Entry point     | /author; /preview/lessons/[lessonSlug]?version=…                                                                                                                                     |
| Execution path  | loadAuthorGovernanceModel returns fixtures only in local mode, otherwise unavailable/empty; preview → requireCapability(content:preview) → exact repository version → LessonRenderer |
| Identity source | Capability from verified session                                                                                                                                                     |
| Data source     | Author list is disconnected in Supabase mode; previews are repository static content.                                                                                                |
| Access control  | Preview checks content:preview and version, not per-item authorship/assignment; this is broad role-based content visibility, separate from restricted decision scope.                |
| Persistence     | No live draft editor/create/submit flow in this page.                                                                                                                                |
| Verification    | Static disconnection reproduced by audit probe. Student preview denied in browser. Broad staff preview scope must not be advertised as assignment-only.                              |

## Reviewer queue/detail — PARTIAL

| Field           | Evidence                                                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | /review and /review/[lessonSlug]                                                                                                                                                                          |
| Execution path  | loadReviewGovernanceModel → session-token Supabase reads governance items, versions, review records, assignments + list_content_author_labels → filter current assignment → review detail/static evidence |
| Identity source | requireCapability(workspace:review), session token; manager exception for inspection                                                                                                                      |
| Data source     | Fixture queue or live governance metadata joined with repository evidence                                                                                                                                 |
| Access control  | Non-manager queue/detail require assignment; approval action and RPC verify actor/version/evidence/independence. DB technical-content read policies are broader than queue assignment filters.            |
| Persistence     | Read path only until explicit decision. Local decision branch redirects without storing a real review.                                                                                                    |
| Verification    | Fixture role tests; staging schema and named governance metadata; no live reviewer session.                                                                                                               |

## Review decisions — PARTIAL

| Field           | Evidence                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | Review decision form                                                                                                                           |
| Execution path  | recordContentReviewDecisionAction → loadReviewGovernanceModel → RPC record_content_review_decision → review_records and assignment transaction |
| Identity source | requireAnyRole engineering_reviewer/administrator; never owner-only                                                                            |
| Data source     | Local response-only demonstration or session-token RPC                                                                                         |
| Access control  | Exact item/current version, attestation, evidence, assignment and self-review restrictions; owner-only RPC denial verified locally.            |
| Persistence     | Real RPC persists review; no live action invoked by audit.                                                                                     |
| Verification    | Unit/fixture tests and rollback SQL; live mutation blocked.                                                                                    |

## Owner administration — PARTIAL

| Field           | Evidence                                                                                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point     | /owner; /admin/users                                                                                                                                                                                                                                                        |
| Execution path  | requirePlatformOwner/requirePlatformManager → loadPlatformAdministrationModel → list_platform_users/list_platform_access_audit/assignments; manageRoleAction/setAccountStatusAction/manageReviewAssignmentAction → audited RPCs; invitation action uses server admin client |
| Identity source | Verified capability and actor-bound token; invitation additionally uses service role                                                                                                                                                                                        |
| Data source     | Fixture users/audit Map or privileged RPCs authorized by actual actor                                                                                                                                                                                                       |
| Access control  | Self role changes, owner assignment and self-approval constrained. Account-status action treats any non-disable operation as enable; database self-disable bypass is high severity.                                                                                         |
| Persistence     | Role/status/assignment RPCs are durable. Audit made no live invitations, role edits, disable actions or review writes.                                                                                                                                                      |
| Verification    | Fresh local fixture role tests (full-suite instability retained), actual staging grants, synthetic local DB owner boundary tests.                                                                                                                                           |

## Interpretation

There is no general “database error → mock student” fallback in the normal Supabase paths. The explicit fixture branches select memory before calling the database. Their selection is inconsistent in mixed configurations (F04). Fixture accounts, scores and bookmarks have no direct migration/export path to real student records, but a real authenticated profile can enter a fixture data branch under that misconfiguration.

The redesign added live bookmark operations and a My Learning projection over existing dashboard summaries; it did not replace the auth, scoring, RLS or migration implementation. The bookmark adapter assumes a relational lesson row which the current governance-backed pilot does not have (F02). Author editing and standalone simulation persistence are not complete currently available student journeys.
