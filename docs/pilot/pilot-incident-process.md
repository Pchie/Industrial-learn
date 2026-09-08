# Pilot Support and Incident Process

Version: Prompt 50 planning draft, 2026-09-06. Applies only to the small staging pilot.
This document does not create a support channel, on-call rota, unpublish button or new
operator permission. Those must be named and tested before the first invitation.
It supplements, without changing, the repository
[incident response](../deployment/incident-response.md) and
[rollback runbook](../deployment/rollback-runbook.md). Production is outside scope.

## Intake and Ownership

Students use the private support contact in their onboarding guide; during a session,
they can simply tell the facilitator. Maintain a restricted issue register with: issue
ID, time/timezone, alias if follow-up is consented, category, severity, staging release,
affected content version, expected/actual behaviour, safe error reference, owner, next
update time, containment, resolution and evidence. Do not store tokens, email links,
private answers, personal screenshots or other students' data in it.

| Report type                               | First owner                                                                    | Triage rule                                                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bug report                                | Support lead, then technical responder                                         | Identify reproducible steps using synthetic data. UI confusion is not automatically a code defect.                                                            |
| Content concern                           | Education lead / independent reviewer                                          | Check clarity, source and reviewed scope; possible technical incorrectness immediately enters the engineering-accuracy lane.                                  |
| Account issue                             | Support lead / auth responder                                                  | Protect privacy; never request credentials, manually confirm participants as a workaround, grant staff roles, or repeatedly send reset emails.                |
| Engineering accuracy concern              | Independent engineering reviewer, technical responder if calculations involved | Highest-priority safety lane. Pause the suspect activity immediately while verifying; do not put it behind cosmetic or feature requests.                      |
| Accessibility problem                     | Accessibility lead and facilitator                                             | If entry, core interaction, assessment or feedback cannot be used, pause the pilot; provide support without excluding the affected participant from findings. |
| Security/privacy or hidden-answer concern | Security/privacy owner and technical responder                                 | Immediate pilot pause and containment; minimise further access or copying.                                                                                    |

## Priority and Response Targets

All times are **proposed staffing targets**, not current service guarantees. The owner
must accept them and assign backup coverage before launch. Staffed windows appear in
the invitation; this is not continuous monitoring.

| Priority                   | Examples                                                                                                                                                                                              | Proposed response                                                                                                                                                                                                                                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0: immediate pause        | Suspected/confirmed incorrect engineering result; security incident; cross-student data; hidden answers before completion; major auth failure; inaccessible core experience; corrupted scoring/awards | Stop use immediately, call the technical/reviewer lead, acknowledge within five minutes while staffed; aim to enforce containment within five minutes using the rehearsed method. Maintain updates every 30 minutes while actively responding. Missing the containment target is an escalation, not permission to continue. |
| P1: blocking but contained | Individual account issue without wider auth failure, save failure without corruption, confusing instruction that prevents a task                                                                      | Acknowledge in the same staffed window, assign owner before it ends, provide a plan by the next staffed window. Escalate if systemic, unsafe or privacy-related.                                                                                                                                                            |
| P2: nonblocking            | Minor navigation, presentation or optional-detail feedback                                                                                                                                            | Acknowledge by the next staffed window; triage within two working days; prioritise in the post-pilot review.                                                                                                                                                                                                                |

Engineering accuracy and security/privacy share the highest lane. Do not wait for a
definitive root cause before pausing credible unsafe content. A proposed major-auth
threshold is two independent participants unable to authenticate, or one entire scheduled
group blocked; a broken access-control boundary is P0 even for one person. A blocking
accessibility failure affecting one participant also qualifies. No minimum incident count
is required for confirmed incorrect content, private-data exposure or answer leakage.

Outside staffed windows, students should stop and leave a private report; no immediate
response is promised. Approved controls must prevent unsupported pilot use. If the pilot
requires unstaffed access, change staffing/controls and repeat readiness review first.

## Immediate Pause Procedure

1. The facilitator or any responsible team member declares **PILOT PAUSED**, records
   the time, stops invitations and sessions, and tells participants not to continue,
   retry submissions, rely on results or share the material. No automatic messages are sent.
2. Identify staging and the affected release/content, assign an incident commander and
   engage the independent reviewer for engineering issues and security/privacy owner for
   exposure. Unknown scope means pause the whole pilot.
3. The authorised release operator uses the pretested containment action from the private
   launch record. Stop new content delivery and affected activity/attempt starts. A
   message alone does not enforce containment.
4. Preserve minimal redacted logs, relevant artifact versions, review history and attempt
   references under existing permissions. Never ask students to reproduce a leak or
   collect another person's record. Do not delete history or change awarded points.
5. Determine affected participants, timeframe, source/equation dependencies and data
   impact. The privacy owner assesses communication obligations under the approved
   privacy process; this document makes no legal notification deadline claim.
6. Communicate a plain-language status through the approved private channel, individually
   where necessary. State what is known, what not to use, the next update and the support
   route. Do not include diagnoses of the system that have not been established.

## Content Withdrawal: What Exists and What Must Be Proven

Prompt 49 found that public lesson delivery uses bundled content/review records. Changing
a live review/publication flag alone does not remove that bundle. Generic domain
`archive`/`rollback` methods are not a demonstrated production-ready owner withdrawal UI.
There is no verified one-click unpublish control to promise students or operators.

The owner therefore needs two layers, both rehearsed before launch:

### Layer 1: Immediate Staging Containment

The private launch record must name the exact, already verified operator action that
stops participant access to the affected staging release, including existing access
grants/sessions, stable and shared immutable URLs. This may be a verified hosting access
restriction or a separately prepared fail-closed staging release; neither is assumed
available merely because this plan mentions it. Verify that existing protection bypass
grants cannot keep serving the affected material. Do not share administrative bypass
secrets, disable auth, or change production controls.

Also check direct Supabase student/API exposure and dependent attempt entry: closing the
web page does not necessarily close the data API. The approved procedure must cover
both where relevant, without broad destructive SQL. A containment method that only
hides a catalogue card is inadequate. If no method can enforce this immediately, G03
is open and the pilot must not start.

### Layer 2: Durable Withdrawal or Reviewed Rollback

1. Record the lesson/simulation ID, exact version, incident reason and downstream lesson,
   equation, assessment and source dependencies. Preserve the old version and audit trail.
2. Use only the existing authorised governance mechanism where it covers that artifact.
   If no mechanism exists, keep staging contained and request a separately authorised,
   reviewed remediation; do not improvise database updates or fabricate review states.
3. For bundled delivery, prepare a narrowly scoped release that denies the withdrawn
   version across direct URLs, catalogues, embeds, search and dependent starts. Retain
   historical attempt references. Follow the branch/PR/CI process; containment stays on
   while that happens. This planning task creates no release or code.
4. Restore an older artifact only if its own approval, sources and compatibility with the
   current schema/assessment contract are verified. An older release is not automatically
   safe, and schema rollback is not the default solution to a lesson defect.
5. An independent checker verifies anonymous and Student denial for direct lesson and
   simulation routes, catalogue/search, embedded activities, guessed attempt URLs and
   applicable database/API reads. Confirm safe treatment of existing attempts and no
   new completion/competency for withdrawn material. Test stable and retained shared
   immutable URLs, not just the newest deployment.
6. Log the operator, time, reason, release/content versions, audit reference and verification.
   Have a human tell affected participants which material/results not to rely on.

An already loaded, printed or locally saved page cannot be remotely erased by unpublishing.
Warn participants to stop using it; do not claim that revoking delivery recalls every copy.
The current pilot has no standalone simulation, but any future approved simulation must
meet the same withdrawal requirements before it joins the allowlist.

## Recovery and Restart

Keep releases frozen during investigation. Reproduce defects with synthetic data, fix only
the approved scope, run targeted regressions and all release gates, and obtain independent
technical re-review for changes to equations, assumptions, units, visuals with technical
meaning, answers or source-supported interpretation. Editorial changes still need a
documented decision about whether the reviewed artifact/hash changes.

Database restore requires a specific approval, verified backup, impact/data-loss assessment
and communications plan. Use the tested recovery procedure; do not overwrite staging or
erase attempt evidence just to make the incident disappear. Preserve first/repeat assessment
records and mark affected evidence for exclusion only with a recorded reason, not a silent
score edit or deletion.

Restart requires incident cause/scope understood, containment verified, no unresolved
critical/high risk, tested fix or safe rollback, correct publication/review state, recovery
and staffing ready, and updated G01-G06 evidence. The owner and technical/security lead
approve restart; the independent reviewer must additionally approve for engineering or
content-integrity incidents. The author cannot self-approve. Inform participants before
their next session and allow them to decline further use.

## Close the Incident

Within two working days after resolution, proposed, record the timeline, impact, root
cause, evidence, corrective changes, reviewer decision, tests, notices, retention treatment,
remaining risks and prevention owner. Link the redacted incident summary into the
[post-pilot review](post-pilot-review-template.md). Counts include incidents discovered late;
do not hide them to preserve a success target.
