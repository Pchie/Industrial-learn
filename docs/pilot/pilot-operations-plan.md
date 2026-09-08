# First Student Pilot Operations Plan

Version: Prompt 50 planning draft, 2026-09-06. Proposed cohort: 5-10 students.

The owner has stated that pilot approval has been received. This plan records that
direction, but does not substitute it for technical readiness evidence. The latest
[independent audit](../audits/prompt-49-student-pilot-readiness.md) remains NO-GO, with
G01-G06 open. No closure evidence was supplied or generated in this planning task.
**Prepare the team now; do not issue invitations or open participant access until the
release decision below is complete.** No emails or invitations are sent by this plan.

## Purpose and Boundaries

Learn whether a small group can navigate, understand and use the approved visual lesson
and its low-stakes assessment, and identify engineering, usability and operational
problems before expansion. This is a formative product pilot, not a certification,
professional engineering service or controlled proof of learning effectiveness.

| Boundary          | Operating rule                                                                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Participants      | Start with five consenting adult engineering students; cap the entire pilot at ten                                                                                                           |
| Environment       | Staging only: Supabase `lgjujyaclrpaopdabyzg`, Vercel `industrial-learn-staging` Preview on `development`                                                                                    |
| Entry             | [Stable staging address](https://industrial-learn-staging-git-development-kolobe.vercel.app), with the separately tested private participant-access method                                   |
| Lesson            | Basic Fluid Pressure, `LES-FLUID-PRESSURE-001`, version `0.4.0`, governance revision `4`                                                                                                     |
| Assessment        | `basic-fluid-pressure-check`, exact version `2`; practice feedback, not university marks                                                                                                     |
| Approval evidence | Lesson review `31510bc1-aecf-48fb-a40e-c427a86f115e`; assessment review `6e326982-ce64-480b-a779-96cf4fdf3b13`                                                                               |
| Sources           | Existing `SRC-OPENSTAX-COLLEGE-PHYSICS-2012` and `SRC-PSU-CIMBALA-PRESSURE-BASICS`; no technical claims, questions or equations newly approved by this plan                                  |
| Simulation scope  | No standalone simulation is currently approved. Use the lesson's reviewed static pressure activity; skip standalone simulation launch. The empty Simulation Lab is not a defect.             |
| Excluded          | Production, AI Mentor, certificates, high-stakes grading, university records, project uploads, draft lessons, internal previews and unreviewed simulations                                   |
| Change control    | Freeze release and content versions during sessions; no direct commits to `main`. Any correction follows feature branch, review, quality checks and a separately authorised staging release. |

The six historical synthetic lesson/simulation records identified in Prompt 49 are not
pilot content, regardless of their publication labels. G01 must close before real
participants receive accounts. Do not fabricate reviews or delete evidence to achieve it.

## Schedule: Two Calendar Weeks

All dates and times below are **proposed**. The pilot owner must set a real calendar
start and end in the private launch record after readiness closure. Day 1 is the first
manual invitation day; Day 14 is the last collection day, thirteen calendar days later.
Use `Africa/Johannesburg` for the published schedule and include the timezone in invites.
No date is booked or automation scheduled here.

| Period                               | Human activity                                                                                                                                                  | Exit condition                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Before Day 1                         | Close G01-G06, verify release/content, rehearse account recovery and withdrawal, test backup recovery, approve notice and questionnaire, assign staff and dates | Signed launch record, tested participant entry and staffed support windows                     |
| Days 1-2                             | Manually invite up to five people individually; consent/notice, signup, verification and orientation                                                            | Each participant has only Student access; failures are recorded rather than bypassed           |
| Days 2-5                             | One facilitated 45-60 minute first-use session per participant or small group; immediate optional 3-5 minute feedback                                           | First-use observations and permitted saved evidence reconciled                                 |
| Days 6-7                             | Midpoint safety and usability review; address blocking issues before further use                                                                                | Owner/security/reviewer checkpoint; no unresolved stop condition                               |
| Days 8-11                            | Optional invitation of up to five additional participants if checkpoint permits; otherwise retain the original cohort                                           | Total invited/consenting/attempted counts remain explicit, total participants no more than ten |
| Days 10-13                           | Optional 20-30 minute return session for existing participants; check retention of navigation and understanding, not memorised assessment answers               | First-use and repeat evidence remain separate                                                  |
| Day 14                               | Close feedback collection at the announced end time; explain any continuing account-access restrictions                                                         | No new participants; staff begin evidence review and follow the retention plan                 |
| Within five working days after close | Complete post-pilot review, triage improvements and make a new scope decision                                                                                   | Written decision with owners, evidence and unresolved risks; no automatic expansion            |

Any P0 incident during the first wave blocks additional invitations in this run, even if
subsequently contained. Resolve it, re-audit and repeat at the same small size before
considering expansion; do not erase the incident from the success metrics.

Proposed access/support windows: prebooked two-hour blocks on session days, with the
named facilitator and technical responder available throughout. Publish actual blocks
before invitations. This is not a 24/7 service. Restrict study use to those blocks using
the verified admission/containment procedure; an instruction alone is not a security
boundary. If controlled access cannot be maintained, revise the operating model and
readiness decision before launch. Delays do not silently extend the end date or retention.

## Student Mix and Recruitment

Recruit manually from students currently studying the approved topic or its prerequisites.
For the first five, aim for at least two first-year and two second-year students, with
the remaining place flexible. Across that same overlapping group, seek at least two
mobile-first users, students who prefer visual explanations, one comfortable with the
topic and one who wants more practice. If ten participate, broaden that mix rather than
treating it as statistically representative. These are proposed sampling aims, not quotas
that justify collecting sensitive data or excluding someone needing accessibility support.

Ask only topic relevance, optional year of study, preferred device and optionally whether
the student feels comfortable with the topic or wants more practice. Do not request marks,
student numbers, transcripts, diagnoses, income, university records or reasons for a
learning difficulty. Do not label anyone a "struggling student" in shared records.
Visual preference is a preference, not a diagnosed learning type. Keep confidence answers
optional and separate from engineering assessment results.

Keep contacts and invitation/consent status in the approved private roster, not this
repository. Assign aliases such as `P01`; keep the contact mapping separately restricted.
Do not create a public group or reveal the other invitees. No bulk invitations, reminders
or replacement invites are automatic. Participation is voluntary and unrelated to grades.

## People and Authority

One person may hold several operational roles, but must not replace the independent
engineering reviewer for their own technical changes. No role here grants database or
student-record access automatically. Record named primary/backup coverage privately.

| Role                                   | Responsibilities and authority                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pilot owner / founder                  | Own cohort, calendar, notice, scope, resources and final go/no-go; cannot waive a confirmed governance or safety failure                                           |
| Facilitator / support lead             | Orient students, receive reports, record minimal observations, check staff coverage; can pause immediately                                                         |
| Technical responder / release operator | Inspect redacted staging errors, contain access using the rehearsed method, preserve evidence, organise reviewed fixes; no unapproved production actions           |
| Independent engineering reviewer       | Highest-priority review of calculation, equation, source, model and interpretation concerns; authorises technical content re-review, not broad student-data access |
| Privacy/security owner                 | Handle suspected exposure, restricted access, notice/retention/deletion decisions, participant requests and any required external notification assessment          |
| Recovery operator                      | Maintain verified current backup and compatible staging recovery procedure; restore only under specific authorisation and data-loss assessment                     |
| Named backup                           | Cover absence of facilitator/technical responder; no staffed cover means no session                                                                                |

The facilitator can stop first and escalate immediately; no committee approval is needed
to pause. Restart requires the evidence and approvals in the incident process.

## Launch Record: Required Private Fields

Keep the completed record in an approved access-controlled operations location, not in
Git. Do not add personal contacts, credentials, participant lists or backup keys here.

- Pilot ID, explicit start/end dates, timezone, session/support windows and headcount cap.
- Named primary/backup owner, facilitator, technical responder, reviewer and privacy contact.
- Approved individual invitation method, participant-facing support contact and private
  feedback link; test both without sending real invitations during preparation.
- Release commit/deployment, staging project identity, exact artifact allowlist and reviews.
- G01-G06 closure evidence references, independent readiness verdict/date and owner approval.
- Tested external signup/verification/recovery and Student-only access evidence.
- Tested containment action, authorised operator access, known-safe release and drill result.
- Current encrypted backup reference, tested restore result, recovery point/time objectives.
- Participant notice version, collection/access/retention decisions, deletion/export owner,
  and dates for account/detail and feedback disposal, including backup/audit exceptions.
- Questionnaire version, approved concept-measure rubric, observation-consent method and
  private issue register; all outcome targets accepted before invitations.

Start only when every item is complete and G01-G06 are closed. This plan helps address
G05 but does not itself assign people, verify live services or close any gate.

## Facilitated Session

1. Confirm the freeze, approved versions, monitoring access, support cover and containment
   readiness. Start no session if a gate has regressed.
2. Explain voluntary participation, scope, privacy and the stop/report route. Ask permission
   to take minimal observation notes; no recording by default.
3. Let the student reach `/workspace` and `/learn/pilot` using their own account. Never
   request passwords or verification links. Assist without taking over credentials.
4. Observe the approved lesson and pressure activity before offering help. Encourage
   exploration within its controls; do not provide hidden assessment answers.
5. Skip standalone simulations for this release. If a future pilot adds one, require an
   amended exact-version allowlist, technical approval, tests and new readiness decision.
6. Let the student complete the challenge and assessment, review feedback and find saved
   progress. Record help and technical interruptions without penalising the student.
7. Offer the short private questionnaire, answer process questions, explain next session
   and end date, and confirm sign-out on a shared device.

Suggested first-session allocation: 10 minutes entry/orientation, 20 minutes lesson/activity,
15 minutes challenge/assessment, 5 minutes feedback, 10 minutes flexible time. It is not
a timed test; accessibility needs, pauses and account issues must not reduce credit.

## Support, Monitoring and Data

Use the [incident process](pilot-incident-process.md) for bug, account, content, accuracy
and accessibility reports. Engineering accuracy takes priority over routine product
feedback. Security/privacy incidents share the immediate pause lane.

At each session's start, every five minutes while staffed, and after it, the responder
checks staging runtime/Auth/database errors and submission failures. This is a proposed
manual operating target, not an existing alert service or uptime guarantee. Health status
alone is insufficient: Prompt 49 identified permissive health probes. The facilitator
also asks about user-visible failures; no new analytics collector is introduced.

Use the privacy conditions in [readiness](student-pilot-readiness.md#privacy-requirements-before-collection).
Proposed retention remains: detailed pilot account/learning records removed within 30 days
of close and pseudonymous feedback within 90 days, subject to owner/privacy approval and
explicit audit/backup exceptions in the notice. No automatic deletion exists by virtue
of this plan. Verify the chosen process before promising it. Do not copy student answers
into Git, spreadsheets shared publicly, feedback tickets or screen recordings.

## Success and Review

The [existing proposed metrics](student-pilot-success-metrics.md) remain the baseline:
zero critical security/privacy/engineering defects, at least 80% unassisted entry
and first-session completion, at least 90% technically successful intended final
submissions, and visual usefulness rated 4/5 or 5/5 by at least 80% of respondents with response coverage
of at least 80% of participants. Always report counts and assistance, not just percentages.
No standalone simulation completion rate exists for this scope: report N/A.

Additional **proposed** operational measures: activation in at least 80% of attempted
participants, defined as verified Student sign-in, reaching the approved lesson and making
one intentional activity-control change without help. Observe this with permission; it
does not award progress. Report assisted activation separately. A navigation rating of
4 or 5 is sought from at least 80% of valid F03 respondents, with F03 coverage of at least
80% of attempted participants. All bugs must be counted and triaged, with zero unresolved
critical/high issues at expansion; no target of zero ordinary bug reports that might
discourage reporting.
First/repeat assessment differences are exploratory, not proof of improvement. Use the
approved before/after concept rubric for the separate understanding measure, or report it
as not measured. Do not infer competence from 100% progress, time, or repeated award totals.

Close with the [review template](post-pilot-review-template.md). Fix critical issues first,
prioritise UX, version/re-review technical changes, then decide whether to repeat the same
cohort or propose a separately approved next size. Nothing expands or launches automatically.
