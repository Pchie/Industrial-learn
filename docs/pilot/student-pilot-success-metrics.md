# Student Pilot Success Metrics

Defined 2026-09-06, before recruiting or collecting results. **No pilot has begun and
there are no student outcome results.** Start remains NO-GO until the
[readiness gates](student-pilot-readiness.md#mandatory-start-gates) are closed.

## Measurement Rules

Use one supervised first session for each of 5-10 invited, consenting adults. Record
only a pilot alias, session, artifact versions, broad device/browser category, voluntary
feedback and the minimal completion observations authorised in the participant notice.
No broad analytics infrastructure, recordings, raw input histories or university records
are required. Use existing permitted server evidence, not time on page or invented data.

Report every metric as numerator/denominator as well as percentage. Let N be the number
of consenting participants who attempt the scheduled pilot, including anyone blocked by
sign-in, availability or accessibility. Report invited, consented, attempted, withdrawn
and completed counts separately. Do not remove technical failures from N. Record voluntary
withdrawals separately and honour the approved data-deletion process.

First attempts measure unaided usability; repeat attempts and facilitator-assisted
completion are reported separately. Missing feedback is not a positive score. With this
small sample, results are descriptive and cannot establish causal learning gains,
population-wide accessibility or professional competence.

## Proposed Expansion Thresholds

These are predeclared product decision thresholds, not externally validated educational
benchmarks. The pilot owner and reviewer must accept them before recruitment.

| Measure                          | Definition / collection                                                                                                                           | Required result before considering expansion                                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Security and privacy             | Confirmed cross-student disclosure, hidden-answer exposure, credential exposure or unauthorised content delivery; incident log                    | Zero. Any occurrence stops the session and requires remediation plus re-audit.                                                                                                                                                 |
| Engineering correctness          | Reviewer-confirmed error in the approved equation, unit handling, explanation or visual interpretation                                            | Zero unresolved defects. A credible safety concern pauses affected activity pending review.                                                                                                                                    |
| Access lifecycle                 | External-mailbox entry/confirmation/reset preflight, then participant entry success and failures                                                  | All preflight lifecycle cases pass; at least 80% of N enter without operator intervention. Report assisted access and every failure. Never waive verification to improve the rate.                                             |
| Lesson completion                | First-session participants who explicitly finish/save the reviewed challenge and submit exact assessment v2, with server evidence where available | At least 80% of N complete within the declared session; also report unassisted completion, partial progress and blocker reasons. Page opening is not completion.                                                               |
| Assessment reliability           | First final submissions stored exactly once with stable score, unit feedback and competency evidence; submitted attempts / initiated attempts     | Zero corrupt/duplicate final submissions or false awards; at least 90% of intended submissions succeed without technical recovery. For N below ten this effectively requires all intended first submissions. Report the count. |
| Numeric correctness              | Existing known-answer/wrong-dimension regression tests, plus reviewer triage of reported anomalies                                                | Tests stay green; no accepted wrong-dimension response or incorrect score. Do not publish participant answers.                                                                                                                 |
| Visual usefulness                | Voluntary 1-5 response to whether the visual helped explain the concept; also report respondent count                                             | At least 80% of respondents rate 4 or 5, median at least 4, and feedback from at least 80% of N. Otherwise evidence is insufficient.                                                                                           |
| Concept explanation              | Brief before/after explanation scored 0-2 against an independently approved rubric; facilitated notes under the privacy plan                      | At least 80% of respondents reach 2 after use. Report paired changes and baseline ceiling cases; do not claim causal improvement or alter formal assessment scoring.                                                           |
| Text and navigation              | Confusion reports, assistance needed to locate the activity, equation, source, assessment and next step                                           | No unresolved critical path blocker; classify every recurring confusion and assign an improvement owner.                                                                                                                       |
| Mobile and accessibility         | Preflight keyboard/screen-reader/zoom checks, plus feedback from actual participant devices                                                       | G06 passes; no unresolved blocking issue. Seek at least two actual mobile participants, otherwise label mobile evidence insufficient rather than successful.                                                                   |
| Standalone simulation completion | No approved standalone simulation is in this release                                                                                              | N/A, denominator zero. Do not mark 0% or 100%, count private/internal simulations, or rename the pressure activity to inflate this metric.                                                                                     |
| Feedback and improvements        | Private issue register linked to version, severity, category, owner and disposition                                                               | All critical/high findings closed and regression-checked; each other finding has a recorded decision. Enough qualitative feedback to explain abandonment and confusion.                                                        |

Examples of small-sample thresholds: an 80% requirement means at least 4/5, 5/6, 6/7,
7/8, 8/9 or 8/10. Publish the underlying counts rather than implying precision.

The current dashboard's 100% path completion denotes graded activity, not a passing mark.
Its competency projection is bounded to ten recent attempts and is not a validated
mastery scale. Do not use cumulative award totals or time spent as pilot learning outcomes.

## Minimal Feedback Questionnaire

Use an approved private channel or facilitator interview. Participation in feedback is
optional. Explain the 1-5 scale consistently: 1 strongly disagree, 3 neutral, 5 strongly
agree; allow Not applicable and Prefer not to answer.

1. The visual helped me understand the relationship shown in the lesson. (1-5)
2. After using it, I can explain the main concept in my own words. (1-5, with an optional short explanation)
3. The visual activity's controls behaved as I expected. (1-5; call it an activity, not an unavailable simulation)
4. The amount of required text felt appropriate. (1-5; optionally say which section was too long or too short)
5. What was confusing or made you stop? (Optional short text; ask for the section, not passwords or submitted answers)
6. Could you use the activity and assessment on your device, including zoom or keyboard where relevant? (Yes / Partly / No / Not applicable; optional detail without medical disclosure)
7. The answer feedback helped me understand a mistake or confirm my reasoning. (1-5 / Not applicable)
8. Would this type of lesson help your coursework? Why or why not? (Optional short text)
9. What one change would most improve the experience? (Optional short text)

For the concept measure, the engineering reviewer must approve a short prompt and rubric
using only this lesson's existing outcomes and approved source IDs before use. Suggested
rubric: 0 = cannot yet explain; 1 = partly correct with a material omission; 2 = correct
within the reviewed assumptions. Keep it non-graded and separate from assessment answers.
This audit creates no new question bank or technical review approval.

## Session and Exit Decisions

Before a session, record the release/content versions, confirmed recovery point, named
facilitator/responder, stop method and consent/notice version. During it, record starts,
explicit saves/submissions, assistance and errors using aliases. After it, reconcile
minimal server evidence, collect optional feedback, and triage concerns with the reviewer.

Expansion is a new decision, not automatic when one percentage is met:

- **Stop / NO-GO:** any critical safety, security, privacy, governance or scoring failure;
  loss of a mandatory start gate; uncontained availability failure.
- **Repeat the same small pilot:** thresholds missed, limited responses/device evidence,
  or unresolved noncritical usability findings. Correct/review and remeasure; do not
  quietly lower thresholds or remove failed sessions.
- **Consider a larger controlled pilot:** all mandatory gates stay closed, all safety
  thresholds pass, outcome/feedback thresholds pass, and owner, independent reviewer
  and security lead accept a written exit report with remaining limitations.

Even a successful exit does not approve production, certificates, high-stakes grading,
additional simulations, or AI Mentor. Each needs its own scope and evidence.
