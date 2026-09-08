# Student Feedback Questionnaire

Instrument: `P50-FEEDBACK-v1`, proposed 2026-09-06. Expected time: 3-5 minutes.
No form, database or analytics service is created by this document. The facilitator must
choose and test an approved private collection channel before invitations. Do not use
GitHub issues or Vercel's optional feedback toolbar to collect student responses.

## Introduction for Students

Your feedback helps us improve this pilot; it is not marked. Every question is optional.
You can skip questions or stop. Please do not include passwords, codes, private assessment
answers, other people's details or sensitive personal information. Use the support contact
immediately for an engineering error or privacy concern rather than waiting for this form.

## Minimal Context

- Pilot alias, optional for general feedback; needed only if you want a private follow-up.
- First visit or return visit (optional).
- Device used: phone, tablet, laptop/desktop, or prefer not to answer (optional).
- Permission to contact you about this feedback: Yes / No (default No). Use the existing
  private roster if consented; do not ask for an email address again in the form.

The facilitator records session and exact lesson/version from the approved allowlist.
Do not require demographics, academic marks, university identity or a device fingerprint.

## Core Ratings

For each item use: **1 strongly disagree, 2 disagree, 3 neutral, 4 agree, 5 strongly agree**,
plus **Not applicable** and **Prefer not to answer**. Leave all ratings unselected by default.

| ID  | Statement                                                              | Dimension                                             |
| --- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| F01 | The diagrams and labels were clear.                                    | Visual clarity                                        |
| F02 | The visual helped me understand the relationship shown in the lesson.  | Visual usefulness / understanding                     |
| F03 | I could find the next step without help.                               | Ease of navigation                                    |
| F04 | The amount of required text felt appropriate.                          | Theory burden                                         |
| F05 | I understand what the calculation result means.                        | Calculation understanding, self-reported              |
| F06 | The challenge helped me apply the concept.                             | Challenge usefulness                                  |
| F07 | I could use the lesson, activity and assessment on my phone or tablet. | Mobile usability; Not applicable for desktop-only use |
| F08 | This type of lesson would be useful for my coursework.                 | Overall value                                         |

Optional follow-up to F04: Was there too much text, too little, or about the right amount?
Which section? Do not reverse-score F04; a higher rating means the amount felt appropriate.

## Conditional Simulation Question

There is **no approved standalone simulation in the current pilot**. Do not display S01
in the current student questionnaire; record simulation usefulness/completion as N/A,
with zero eligible users. The pressure visual is measured by F01/F02, not relabelled as a
dynamic simulation.

Only after an independently approved simulation is added through a new scope/readiness
decision: S01, "The simulation helped me understand the engineering concept." Use the
same scale, and record the exact approved simulation version. Do not ask this of students
who did not use it or backfill responses from the current visual activity.

## Open Feedback

1. What confused you or made you stop? Which page, control or explanation was involved?
2. What one change would make this lesson more useful to you?

Optional follow-up: Was there anything that worked particularly well? Keep responses short;
the facilitator can collect spoken feedback with permission instead of requiring typing.

## Collection and Analysis Rules

The form must work with keyboard, clear labels and mobile zoom, and allow partial
submission. A facilitator may read questions verbatim; mark interviewer-assisted responses
separately. Test the private form's access controls and exports before collecting feedback.
No public response sheet, required login to an unrelated service, hidden tracker, automatic
recording or new data integration is authorised here.

F02 supplies the existing visual-usefulness metric. Proposed success remains at least
80% of valid F02 respondents rating 4/5 or 5/5, median at least 4, with feedback coverage
from at least 80% of attempted participants. F03 supplies the proposed navigation target
in the operations plan. F05 is self-report, not an assessed learning gain. Use a separately
reviewed concept rubric for that measure; do not expose formal assessment answers.

Report each item's valid response count, counts by rating, median, missing/declined/N/A
counts, and first/return-visit split. Do not substitute zero for missing answers, select
only positive responses, or claim a representative sample. Do not combine all ratings
into a new validated "learning score". Retain qualitative concerns even when ratings are high.

Support/incident messages receive immediate triage under
[the incident process](pilot-incident-process.md). Summarise ordinary themes using aliases
and redact quoted responses. Follow the approved notice, access rules and retention plan;
the proposed 90-day feedback maximum is not an already configured deletion job.
