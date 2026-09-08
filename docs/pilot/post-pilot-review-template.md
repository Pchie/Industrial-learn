# Post-Pilot Review Template

Status: blank template. **No pilot results exist in this document.** Complete privately
after the approved pilot; publish only an appropriately redacted summary. Do not commit
participant rosters, identifiers, raw answers or unredacted feedback to the repository.

## Decision Record

| Field                                                           | To complete                                                      |
| --------------------------------------------------------------- | ---------------------------------------------------------------- |
| Pilot ID / actual start and end / timezone                      | `[not run]`                                                      |
| Owner / facilitator / technical lead / independent reviewer     | `[private names and acceptance]`                                 |
| Approved scope and any authorised deviations                    | `[reference]`                                                    |
| Staging release(s), exact lesson/assessment/simulation versions | `[references; simulation N/A for current scope]`                 |
| Start clearance and G01-G06 closure evidence                    | `[references]`                                                   |
| Total invited / consented / attempted / withdrawn / completed   | `[counts, not estimates]`                                        |
| First-use / return sessions / device coverage                   | `[counts and limitations]`                                       |
| Pauses, incidents and release changes during the pilot          | `[private issue references]`                                     |
| Final decision                                                  | `[NO-GO / repeat same size / propose a larger controlled pilot]` |
| Decision date, approvers and conditions                         | `[pending]`                                                      |

## Evidence Quality

- Identify first-session outcomes separately from return visits and assisted completion.
- Include people blocked by authentication, availability or accessibility in attempted N.
  State invited-but-not-attempted and withdrawn counts separately; do not hide technical
  dropout or replace missing responses with positive ratings.
- Honour withdrawal/deletion choices. If data must be removed, report the resulting
  missing-data limitation without retaining identifying evidence against the notice.
- Use only authorised server summaries and minimal consented observations. Record what
  could not be verified; inherited pre-pilot synthetic tests are not student results.
- Do not count repeated attempts as independent participants, infer mastery from time or
  100% progress, or infer population-wide or causal learning effects from 5-10 people.

## Outcomes Against Proposed Targets

Targets must have been accepted before recruitment. Use the
[baseline definitions](student-pilot-success-metrics.md) and
[operations additions](pilot-operations-plan.md#success-and-review). Do not change targets
after seeing results. N = consenting participants who attempted the scheduled pilot,
including those prevented from entering by a technical/accessibility problem.

| Measure                                     | Predeclared proposed target                                                                                              | Actual numerator / denominator and result | Evidence / caveat                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | -------------------------------------------------------------------- |
| Critical security/privacy/answer exposure   | Zero                                                                                                                     | `[not measured]`                          | `[incident register]`                                                |
| Confirmed engineering defects               | Zero unresolved; any occurrence required pause                                                                           | `[not measured]`                          | `[independent reviewer disposition, including corrected defects]`    |
| Unassisted entry                            | At least 80% of N enter successfully                                                                                     | `[not measured]`                          | `[access failures and assisted counts]`                              |
| Unassisted activation                       | At least 80% of N: verified Student sign-in, reach approved lesson, one intentional activity-control change without help | `[not measured]`                          | `[consented observations; no progress awarded for activation]`       |
| First-session lesson completion             | At least 80% of N, explicitly saved challenge and submitted v2 assessment                                                | `[not measured]`                          | `[separate assisted completion; not a pass mark]`                    |
| Intended final-submission reliability       | At least 90%, no corrupt/duplicate final scores or awards                                                                | `[not measured]`                          | `[unique intended submissions and recovery cases]`                   |
| Visual usefulness: F02                      | At least 80% valid ratings 4/5 or 5/5, median at least 4, feedback coverage at least 80% of N                            | `[not measured]`                          | `[valid/missing/declined/N/A counts]`                                |
| Navigation: F03                             | At least 80% valid ratings 4/5 or 5/5, F03 coverage at least 80% of N                                                    | `[not measured]`                          | `[assistance and qualitative confusion]`                             |
| Concept understanding                       | At least 80% of valid post-task rubric responses reach 2 on the preapproved 0-2 rubric                                   | `[not measured]`                          | `[paired before/after counts, baseline ceiling and rubric approval]` |
| Assessment improvement                      | Exploratory only; no asserted improvement target from repeat exposure to the same answers                                | `[not measured]`                          | `[first/repeat scores only if permitted, practice/hint confounding]` |
| Standalone simulation completion/usefulness | N/A: none approved for this scope                                                                                        | `[N/A, zero eligible participants]`       | `[do not count pressure activity as a standalone simulation]`        |
| Mobile usability: F07 / accessibility       | No unresolved core blockers; seek at least two mobile participants                                                       | `[not measured]`                          | `[real device coverage, manual assistive checks, limitations]`       |
| Bug and critical/high issue counts          | Count all, triage all; zero unresolved critical/high issues before expansion                                             | `[not measured]`                          | `[open/closed/deferred by severity, duplicate reports separately]`   |
| Qualitative feedback and overall value: F08 | Explain abandonment/confusion and identify owned improvements; no new numeric F08 threshold                              | `[not measured]`                          | `[redacted themes and contradictory evidence]`                       |

Report F01/F04/F05/F06 distributions as well as F02/F03/F07/F08. A lack of reported bugs
does not prove safety. Self-reported calculation understanding is not the scored concept
rubric. If no approved rubric was used, mark that learning measure not measured; do not
invent a learning gain from satisfaction ratings.

## Findings and Action Register

| ID        | Category / severity                                                           | Evidence and affected version | Impact                         | Owner / due date       | Decision and verification                                  |
| --------- | ----------------------------------------------------------------------------- | ----------------------------- | ------------------------------ | ---------------------- | ---------------------------------------------------------- |
| `[issue]` | `[engineering / security / auth / assessment / UX / accessibility / privacy]` | `[redacted reference]`        | `[scope, no student identity]` | `[private assignment]` | `[fix / investigate / defer with reason; tests/re-review]` |

Review in this order:

1. Collect and reconcile evidence, counts, permissions, incidents and missing data.
2. Classify findings. Engineering accuracy, privacy/security, hidden answers and inaccessible
   core tasks take precedence over cosmetic feedback and feature requests.
3. Fix critical/high issues in separately authorised work; verify containment until closure.
4. Prioritise UX improvements by impact, recurrence and effort, including minority and
   accessibility reports that may not have large counts.
5. Propose precise lesson/visual/support changes without bulk-generating content. Preserve
   historical reviewed versions, attempts, source references and reasons for change.
6. Re-review technical changes independently. Record new artifact/version/hash, source and
   equation checks, test coverage and publication decision. Do not relabel an altered
   artifact as approved on the strength of its old review.
7. Recheck start gates and make a new pilot-size decision. No invitations follow automatically.

## Recovery, Privacy and Support Closeout

- `[ ]` Incident actions, withdrawal/recovery tests and support performance are reviewed.
- `[ ]` Participant access at close follows the announced policy; no indefinite pilot extension.
- `[ ]` Account/learning-record disposal date, feedback disposal date and operator are recorded.
- `[ ]` Exports, contact mapping, screenshots, support notes and backups are included in the
  approved retention inventory; audit/backup exceptions are explained rather than hidden.
- `[ ]` Participant requests are processed through the private contact; no secret values or
  personal data are copied into this summary.
- `[ ]` Any human follow-up uses the authorised private channel; no unconsented public quotes
  or testimonials are published.

## Next Scope Decision

**NO-GO:** unresolved safety, security, privacy, governance, scoring or core-accessibility
failure; missing recovery/withdrawal capability; start gate regression. Keep affected
access contained and specify closure evidence.

**Repeat at 5-10:** noncritical outcomes missed, insufficient feedback/device evidence or
important changes need another small evaluation. Record exactly what will be different.

Any P0 occurrence blocks direct expansion from this run, even after correction. Retain
the incident count, complete remediation and independent re-audit, then repeat a small
pilot. A resolved incident is not the same as no incident having occurred.

**Propose expansion:** all mandatory gates remain closed, zero unresolved critical/high
issues, safety and outcome thresholds met, and documented reviewer/security/owner approval.
Proposed next size: `[choose and justify; do not pre-approve]`. Explain staffing, support,
access, recovery and review capacity at that size. Freeze the new scope before recruiting.

Production, public certification, high-stakes grading, additional unreviewed simulations
and AI Mentor are not authorised by a successful pilot or this template.
