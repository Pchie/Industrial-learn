# Prompt 48A Publication Integrity Remediation

Audit updated: 2026-09-06

Target environment: Supabase staging `lgjujyaclrpaopdabyzg`

Production changes: none

## Executive Status

Independent review and controlled publication are complete. Exact assessment v2 now launches
from lesson `0.4.0` on staging. Two synthetic students verified successful scoring, wrong-unit
rejection, private review, and saved progress. The live test identified a dashboard projection
defect, now corrected locally without changing server scoring or assessed content. Its final
release verification is recorded below. No production change or real student pilot occurred.

## Remediation Implemented

- Established assessment v2 as the canonical lesson-aligned artifact without changing its
  questions or answers.
- Added a reusable exact-version application publication gate.
- Added staging migration `0019` with exact governance, review, lesson-version, hash,
  source, equation, outcome, and answer-protection checks.
- Added an unapproved staging review-item seed for v2.
- Moved attempt creation into an atomic service-only transaction.
- Extended atomic completion to persist external governed lesson progress.
- Removed direct authenticated writes to attempts and lesson progress.
- Kept direct student access to answer choices and private question explanations closed.
- Added a server-verified lesson challenge completion action.
- Projected persisted lesson, assessment, and competency evidence into the dashboard.
- Added `/learn/pilot` without publishing the parent module.
- Corrected narrow-screen header flex behavior at 320, 375, and 430 px.
- Extended the reviewer workspace to inspect an assessment-specific exact-version item.

## Local Verification To Date

| Check                                  | Result                                                   |
| -------------------------------------- | -------------------------------------------------------- |
| PostgreSQL staging rollback validation | PASS                                                     |
| Strict type checking                   | PASS                                                     |
| Unit/integration suite                 | PASS: 385 passed; 5 opt-in live tests separately passed  |
| Production build                       | PASS: 39 generated static entries plus dynamic routes    |
| Focused browser/accessibility suite    | PASS: 50 tests                                           |
| Secret scan                            | PASS                                                     |
| Formatting                             | PASS                                                     |
| Lint                                   | PASS                                                     |
| Content validation                     | PASS: 29 tests                                           |
| Migration validation                   | PASS: 24 tests                                           |
| Smoke                                  | PASS: 5 tests                                            |
| Full end-to-end suite                  | PASS: 113 tests                                          |
| Live migration and review-item seed    | PASS: applied to staging only                            |
| Live RLS rollback probes               | PASS                                                     |
| Live function privilege review         | PASS                                                     |
| Independent assessment review          | PASS: exact v2, 2026-09-06                               |
| Controlled assessment publication      | PASS: exact v2, staging only                             |
| Live synthetic-student flow            | PASS: two students; dashboard correction release pending |

## Live Staging Evidence

Historical pre-publication verification at `2026-09-04T17:38:02Z` against project
`lgjujyaclrpaopdabyzg` (superseded by the approved publication below):

- migration ledger version `0019`, name
  `assessment_version_integrity_and_pilot_progress`, is present;
- governance item `3c91523e-e30c-4f7b-89ef-0c8f7eeb3803` represents assessment entity
  `94f5c2b9-a0b9-43f5-8b6b-4a3a67fc4f02`, exact governance version `2`;
- content version `acf25cec-cac1-41a0-9ff1-7fa5614919c3` contains the expected artifact
  SHA-256 and related lesson version `0.4.0`;
- the item remains honestly labelled `Engineering review required / draft`;
- the historical `staging-pressure-check` v1 row remains stored but
  `is_current_published_assessment(...)` returns false;
- no canonical v2 assessment row has been published prematurely; and
- the rollback-only Student A/B RLS probes left zero retained progress or attempt rows.

Function access is fail closed. Assessment start, completion, and pilot-progress writes are
service-role only. The exact-version read predicate is available to authenticated clients and
the service role. The staging publication function is callable by authenticated/service-role
contexts but performs an internal `auth.uid()` and Platform Owner check, exact review checks,
and a staging-only environment check before it can write.

Live RLS probes confirmed:

- Student A could read exactly one own test progress row and one own test attempt;
- Student A could read zero equivalent Student B rows;
- Student A could read zero rows from protected questions, answer choices, content versions,
  and review records;
- Student A could not see the historical mismatched v1 assessment;
- no unapproved lesson or simulation row was visible; and
- the Engineering Reviewer and Content Author each saw zero Student A/B progress and attempt
  rows.

## Security Position

The current code fails closed. A version 1 row cannot launch when the catalogue requires
version 2. The v2 seed cannot make the assessment public. Correct answers remain in the
server-imported assessment artifact and reviewer evidence, not in pre-submission student
delivery. Progress and completion writes require trusted server transactions.

## Verdicts

| Area                               | Verdict                                            |
| ---------------------------------- | -------------------------------------------------- |
| Assessment version integrity       | PASS                                               |
| Assessment governance              | PASS                                               |
| Assessment browser flow            | PASS                                               |
| Authenticated progress persistence | PARTIAL pending dashboard correction release       |
| Parent module / pilot navigation   | PASS WITH PILOT COLLECTION                         |
| Mobile header                      | PASS                                               |
| Publication integrity              | PASS                                               |
| Complete pilot flow                | NOT READY                                          |
| Prompt 49 readiness                | NO-GO pending final dashboard release verification |

No student pilot may begin from this provisional report.

The only recurring informational warning was Playwright's existing note that `NO_COLOR`
is ignored when `FORCE_COLOR` is set. The intentionally simulated dashboard-failure case
logged its expected server error and passed its safe-error-page assertion.

Initial implementation PR [38](https://github.com/Pchie/Industrial-learn/pull/38) merged
into `development` on 2026-09-04 as `bec15e32473081bb5818d5536df37d3657260cea` after
approved publication to GitHub. Its CI and staging deployment passed. The targeted dashboard
follow-up is on `codex/prompt-48a-live-verification`; final release checks are pending.

## Independent Review And Publication: 2026-09-06

| Evidence                    | Exact value                                |
| --------------------------- | ------------------------------------------ |
| Independent review          | `6e326982-ce64-480b-a779-96cf4fdf3b13`     |
| Reviewer profile            | `8c0f8743-0935-4eb4-a708-6083a5a0fb88`     |
| Author profile              | `539d2cc4-1d9c-4ceb-ad7e-bbad4a582488`     |
| Completed assignment        | `aa352dff-adb9-4eed-ba9b-6b2ce5071519`     |
| Review timestamp (UTC)      | `2026-09-06T17:21:00.670030Z`              |
| Publication audit           | `58f31ab2-b784-4694-a8a8-1aa0cf2075a3`     |
| Publication timestamp (UTC) | `2026-09-06T17:23:51.505751Z`              |
| Publication release commit  | `bec15e32473081bb5818d5536df37d3657260cea` |

The frozen artifact SHA-256 remains
`db6268839cdfb959e7f7e392d9879cb3518b30d8b13ee01686cdd88ec71cec88`.
The independent reviewer passed source, equation, educational, accessibility, and
safety-limitations checks for exact version 2. Simulation review is not claimed or required
for this five-question foundation assessment. No question, answer, equation, or source changed.

Publication used `publish_approved_assessment_version_to_staging`, first in a rolled-back
dry run and then durably under the user's authorization
`PROMPT-48A-USER-AUTHORIZED-STAGING-2026-09-06`. The operator used privileged SQL with scoped
Platform Owner claims on the user's behalf, not a browser owner session. The independent
review was read and verified, never fabricated. A publication retry returned the same single
audit event with `was_already_published=true`. The exact gate accepts canonical v2 and rejects
the old v1 fixture, despite that historical fixture's published-looking labels.

## Live Browser And Persistence Evidence

URL: <https://industrial-learn-staging-git-development-kolobe.vercel.app>.
Only dedicated synthetic student accounts were used; no real student records were changed.

| Check                | Observed result                                                                  |
| -------------------- | -------------------------------------------------------------------------------- |
| Student A path       | Sign-in, pilot path, lesson challenge, save, assessment, review, dashboard: PASS |
| Challenge save       | One private progress row at 50%; no attempt until explicit start                 |
| Student A attempt    | `0f343906-d3e7-4591-b5eb-c1d2d22c4246`, v2, attempt 1                            |
| Save/reload          | Saved numeric value and unit survive a page reload                               |
| Unit conversion      | `0.4 kPa` normalized to `400 Pa`, full numeric credit                            |
| Student A completion | `2026-09-06T17:26:57.375Z`, 6/6, Understood 4, Calculated 2                      |
| Student B attempt    | `bd229bc5-8a58-46e7-89a5-0d715b3fbe7b`, v2, attempt 1                            |
| Wrong dimension      | `400 N` rejected for pressure; 0/2 numeric credit, explicit unit feedback        |
| Student B completion | `2026-09-06T17:32:18.228Z`, 4/6, Understood 4, Calculated 0                      |
| Atomic progress      | One graded 100% progress row per student, linked to exact assessment             |
| Session persistence  | Student A signed out/in; attempt, score, and lesson-graded evidence retained     |
| Private review       | Student B opening Student A review receives `Review unavailable`                 |
| Completed attempt    | Reopening shows already submitted; no editable final answer form                 |
| Before submission    | Expected answers and private explanations absent from student form               |
| Mobile               | Screenshots inspected at 320/375/430; page scroll width equals viewport width    |

The live database held the correct `Understood: 4, Calculated: 2`, but the previous dashboard
adapter discarded all except the highest level and displayed one point. The targeted fix
preserves all positive finite recognised awards from graded attempts. Empty persisted awards
remain empty rather than inferring competency from score. Both the production adapter and
test-only local adapter pass the award object. Three model tests and a sign-out/sign-in browser
regression cover this correction; scoring and reviewed content remain unchanged.

## Post-Publication Security And Transactions

Rollback-scoped SQL roles and genuine student JWT REST requests both passed:

- Each student sees own attempt/progress rows and zero equivalent rows for the other student.
- Students cannot read questions, answers, content versions, or review records. Explicit
  private-explanation column reads are denied.
- Canonical v2 is visible; historical v1 and unapproved lessons/simulations/assessments are not.
- The actual reviewer and author each see zero synthetic student attempts/progress rows.
- Direct score, competency, and version tampering returns HTTP 403.
- Direct completion RPC invocation by a student returns HTTP 403.
- Anonymous/authenticated roles lack attempt/progress INSERT, UPDATE, and DELETE privileges.

The completed-attempt retry submitted changed payloads with the original idempotency key
and returned unchanged stored answers, score, and awards without another audit. A different
final key was rejected. Starting v1 against the v2 release failed closed. A rollback-only
v2 test triggered a late NOT NULL failure with a null audit timestamp: attempt, score,
competency, progress, and completion audit all rolled back. The outer transaction removed
the extra started test attempt, retaining only the two intentional browser attempts.

The repository's opt-in staging integration suite was run with genuine temporary JWTs
provided in process memory: all 5 tests passed. Its 30-second per-test timeout accommodates
live network calls; no assertion was skipped or suppressed.

## Remaining Release Checks And Limitations

- The follow-up full E2E run passed all 113 tests, including 46 accessibility tests and
  5 smoke tests. Final GitHub CI and dashboard staging release checks are pending.
- Temporary synthetic accounts and learning rows will be removed after the release check;
  real review/publication records and non-secret audit evidence will remain.
- The parent module remains unpublished and pilot users have no fabricated enrolment.
- Dashboard awards cover at most ten recent attempts, not lifetime mastery. Completing the
  path is not the same as passing every question; the wrong-unit attempt gets no Calculated credit.
- Synthetic users were email-confirmed administratively. SMTP delivery/public-signup readiness
  was not retested by this flow.
- No production deployment, AI Mentor work, or actual student pilot was performed.
- The next task should be a separately authorised controlled student pilot with a named
  facilitator, feedback collection, and stop/escalation criteria, after final release checks.
