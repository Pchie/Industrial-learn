# Prompt 50: Pilot Operations Planning

Date: 2026-09-06. Scope: documentation and human operating procedures only.

## Status and Approval Reconciliation

The user states that approval has been received to run a small pilot. That business
direction is recorded, not disputed. The latest repository evidence is Prompt 49's
NO-GO and open G01-G06; this task supplied no closure records and requested planning,
not remediation or a new live audit. **Planning deliverables are complete; execution
clearance remains HOLD pending verified gate closure and a new readiness decision.**

Do not treat these documents as evidence that the pilot is already safe to start. The
full operational definition of done, a pilot that humans can actually run safely, also
requires those controls to be verified and people/contact/calendar fields to be completed.
No content was newly approved and no prior audit was rewritten.

## Inspection and Current Implementation

Read `AGENTS.md`, Prompt 49 audit/readiness/risk/metrics documents, repository incident
and rollback runbooks, staging alert guidance and `package.json`. The approved candidate
scope is Basic Fluid Pressure `0.4.0` and assessment `2`. The existing visual pressure
activity is not an approved standalone simulation. Existing risks include six
student-readable legacy fixtures without review evidence, external authentication/recovery,
rapid withdrawal, current backup recovery and operating/manual accessibility readiness.

The branch remains `codex/prompt-48a-final-evidence`, HEAD
`adffe83e6842387a00ca818354dfabdbd114d4da`. The four Prompt 49 documents were already
untracked before this task and have been preserved. No branch switch, commit or push is
part of the request.

## Deliverables

| File                                                                       | Purpose                                                                                                     |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Pilot operations plan](../pilot/pilot-operations-plan.md)                 | Two-week calendar, cohort mix, roles, private launch record, session flow, monitoring and proposed targets  |
| [Student onboarding guide](../pilot/student-onboarding-guide.md)           | Concise student instructions, tested-entry requirements, privacy/support fields and honest simulation scope |
| [Feedback questionnaire](../pilot/student-feedback-questionnaire.md)       | Eight core ratings, optional text, conditional simulation question and privacy-conscious collection rules   |
| [Founder observation checklist](../pilot/founder-observation-checklist.md) | Consent-based observation, neutral prompts, support boundaries and minimal private notes                    |
| [Pilot incident process](../pilot/pilot-incident-process.md)               | Support priorities, immediate pause, staged containment/withdrawal, restart and closeout                    |
| [Post-pilot review template](../pilot/post-pilot-review-template.md)       | Blank evidence/metric/action register and next-size decision, with no fabricated results                    |
| This report                                                                | Scope, evidence, verification and remaining work                                                            |

## Requirement Coverage

| Request              | Planned handling                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Size and duration    | Five first, no more than ten total; 14 calendar days with mandatory explicit dates/timezone before invitations                                                                                   |
| Student mix          | Overlapping first/second-year, visual preference, comfortable/more-practice and mobile-first aims; no marks, diagnoses or sensitive records                                                      |
| Onboarding           | Individual manual invite, signup, verification, Student workspace, orientation, approved lesson/activity, assessment, optional feedback; standalone simulation skipped until separately approved |
| Student instructions | Pilot status, narrow scope, support, privacy, withdrawal choice and no professional engineering reliance                                                                                         |
| Feedback             | Visual clarity/usefulness, navigation, text amount, calculation understanding, challenge, mobile and overall value; no invented simulation responses                                             |
| Observation          | Pauses, misunderstood controls, skipped optional theory, retries, confusion, visual errors and questions; no covert recording or raw input logging                                               |
| Support              | Bug/content/account/engineering/accessibility categories; engineering accuracy has the highest safety priority alongside security/privacy                                                        |
| Incident pause       | Security, cross-student data, incorrect engineering content, hidden answers, major auth failure, inaccessible core experience and scoring corruption                                             |
| Withdrawal           | Acknowledges missing verified one-click action; requires rehearsed immediate staging containment plus durable reviewed withdrawal and full-route/API checks                                      |
| Metrics              | Existing proposed thresholds preserved; navigation target explicitly proposed; counts, denominators, assistance and missing data; simulation N/A, score improvement exploratory                  |
| Review               | Collect, classify, fix critical issues, prioritise UX, version/re-review technical changes, decide new scope with human approval                                                                 |
| Safety boundaries    | No invitations, messages, production, AI, feature work, technical content changes, privileged access changes or live writes                                                                      |

## Verification

| Check in this task                                      | Result                                                                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run typecheck`                                     | PASS across the existing workspaces                                                                                                        |
| `npm run lint`                                          | PASS                                                                                                                                       |
| `npm run test:unit`                                     | PASS: 385 tests; 5 existing opt-in live tests skipped because no live test credentials/session flow was enabled                            |
| Prettier on the seven new files; `npm run format:check` | PASS; prior Prompt 49 files were not reformatted                                                                                           |
| `npm run scan:secrets`                                  | PASS                                                                                                                                       |
| Local Markdown links/anchors                            | PASS: 19 references checked, zero missing files/headings                                                                                   |
| Manual plan review                                      | Sampling, questionnaire IDs, proposed targets, conditional simulation scope, support/withdrawal and start/restart conditions cross-checked |
| Git scope check                                         | No tracked-file changes; seven new Prompt 50 documents alongside four pre-existing untracked Prompt 49 documents                           |

Production build, browser/E2E and live RLS/mail/recovery exercises were not rerun for
this documentation-only task. Existing Prompt 49 build/browser/live results are inherited
evidence, not fresh verification. No mailbox, real student, database, hosting or production
operation was performed. No new dependencies, tests, features or content were added.

## Remaining Human and Technical Work

1. Close and independently verify G01-G06, including the confirmed legacy-fixture
   governance problem. Planning does not fix database policies or establish live recovery.
2. Name primary/backup staff privately, select and test the restricted support/feedback
   channel, complete the participant notice/retention decisions and launch dates.
3. Rehearse the exact containment and restore procedures with authorised synthetic data;
   record operator authority, known-safe artifacts and results. No unpublish button or
   immediate recall of already loaded/printed content is assumed.
4. Approve the proposed outcome targets and concept-measure rubric before recruitment.
5. Obtain the final documented release decision, then have humans invite students
   individually. No automatic action follows this report.

Known limitations: no live controls were reverified, no contacts or dates were invented,
no support/form service was configured, and no new standalone simulation is available.
Only the seven requested Markdown files were added. Stop after planning; the pilot has
not begun.
