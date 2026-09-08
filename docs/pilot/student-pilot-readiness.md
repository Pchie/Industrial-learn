# Controlled Student Pilot Readiness

Audit date: 2026-09-06. Decision: **NO-GO for invitations or starting the pilot**.

This is an independent readiness assessment, not permission to run a pilot. Production,
AI Mentor, public certificates, high-stakes grading, and university records are excluded.
No students were invited and no application, content, configuration, or database state
was changed by this audit.

## Decision Basis

The approved Basic Fluid Pressure learning path is substantially stronger than the wider
operational readiness picture. Its reviewed lesson, exact-version assessment, server-side
scoring, private progress, and application publication checks have supporting evidence.
Fresh local checks pass, including 113 browser tests. Fresh live read-only RLS checks
isolate student records across all five requested data categories.

However, six legacy staging lesson/simulation records remain student-readable under
database policies that trust publication/review labels without requiring review records.
None of those six has a governance item, content version, or review record. The application
catalogue excludes them, but that is not equivalent to protecting every student data path.
Email recovery, emergency withdrawal, current backup recovery, and a workable external
participant access procedure also lack sufficient evidence. Do not interpret the previous
Prompt 48A recommendation to conduct a readiness assessment as approval to invite students.

Detailed evidence and limitations are in
[the independent audit](../audits/prompt-49-student-pilot-readiness.md).

## Candidate Pilot Allowlist

These are the only proposed instructional artifacts after all start gates are closed.

| Item                   | Candidate scope                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Participants           | 5-10 individually invited, consenting adult engineering students; voluntary and unrelated to academic marks                                     |
| Environment            | Staging Supabase `lgjujyaclrpaopdabyzg`; Vercel `industrial-learn-staging` Preview on `development`                                             |
| Entry                  | Stable staging alias, then `/workspace` and `/learn/pilot`; external access method must first be verified                                       |
| Lesson                 | `LES-FLUID-PRESSURE-001`, `/lessons/basic-fluid-pressure`, version `0.4.0`, governance revision `4`                                             |
| Lesson review          | `31510bc1-aecf-48fb-a40e-c427a86f115e`, approved 2026-09-03                                                                                     |
| Assessment             | `basic-fluid-pressure-check`, version `2`, five questions / six points; low-stakes learning feedback only                                       |
| Assessment review      | `6e326982-ce64-480b-a779-96cf4fdf3b13`, approved 2026-09-06                                                                                     |
| Sources                | `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`, `SRC-PSU-CIMBALA-PRESSURE-BASICS`                                                                          |
| Equation               | Existing reviewed `EQ-FLUID-PRESSURE-001`; no equation changes or new technical approval in this audit                                          |
| Visual activity        | Existing bounded, static pressure calculation activity and explicit challenge save; not a dynamic hydraulic simulation                          |
| Standalone simulations | None currently approved for this pilot; the honest empty Simulation Lab is expected                                                             |
| Other content          | Unpublished parent module, hydraulic cylinder, Bernoulli, thermodynamics, projects, internal previews, and draft materials remain outside scope |

Use a release freeze during each facilitated session. A new artifact version requires its
own review/publication evidence and revalidation; this document is not a standing approval.

## Student Journey Verification

| Stage                   | Evidence and current limitation                                                                                                                                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reach staging           | Fresh anonymous requests to the stable alias return Vercel SSO redirects. Protection is intact, but access by an invited person without Vercel team membership is not proven. Do not distribute automation bypass secrets or team credentials.                                                |
| Signup and verification | Local signup/default-Student tests pass. Live Supabase settings require email confirmation and permit signup. Prompt 48A used administratively confirmed synthetic users, not delivered signup emails. External delivery and callbacks remain unverified.                                     |
| Sign-in / sign-out      | Fresh local tests pass; same-day Prompt 48A has genuine staging student session and logout evidence. This read-only audit did not create sessions or reauthenticate.                                                                                                                          |
| Password reset          | Only the generic request response has browser coverage. Completion from a delivered recovery email is not proven; the callback implementation has a concrete contract gap described in the audit.                                                                                             |
| Session security        | Server-validated identity, server-derived roles, HttpOnly/SameSite cookies and Secure deployed cookies are implemented. No refresh-token renewal path was found; expired access sessions may require sign-in again. Do not promise uninterrupted sessions from the refresh cookie's lifetime. |
| Onboarding / workspace  | Role-based navigation and honest new-student states pass local tests. No invented programme enrolment. Facilitator should direct participants to the explicit pilot collection.                                                                                                               |
| Learn / lesson          | Local publication, search, exact lesson rendering, visual input, challenge, and draft-denial tests pass. Prior live delivery evidence is inherited, not freshly replayed behind Vercel protection.                                                                                            |
| Simulation Lab          | Empty public catalogue and denial of guessed unpublished simulation URLs pass. Do not advertise a hydraulic simulation pilot.                                                                                                                                                                 |
| Assessment              | Local start/save/submit/review/idempotency tests pass. Prompt 48A live evidence covers server scoring, wrong-unit rejection, ownership and atomic progress. Fresh SQL confirms protected answer tables and service-only completion privileges.                                                |
| Progress                | Explicit challenge save supplies 50%; graded assessment completion supplies 100% for this path. Completion is not mastery or a passing score. Dashboard competency evidence covers at most ten recent attempts.                                                                               |
| Feedback / projects     | No dedicated student feedback or privacy route was found. Projects is a protected placeholder, not an in-scope submission flow. Use an approved private manual feedback process before launch.                                                                                                |

## Mandatory Start Gates

Every row is open. Closing these gates requires a separately authorised remediation or
operational task and recorded evidence, followed by a fresh readiness decision.

| Gate                              | Required evidence before invitations                                                                                                                                                                                                                                                                                                                     | Accountable role                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| G01: Student-visible governance   | Quarantine the six legacy fixtures from ordinary student reads without fabricating approvals or destroying audit history. Verify exact reviewed/current publication for all student-readable lesson/simulation records, not labels alone. Recheck application routes and authenticated database/API access, including old versions and staff separation. | Backend/security lead and engineering governance owner |
| G02: Account lifecycle            | With an authorised synthetic external mailbox, verify signup, delivered confirmation, Student-only profile, sign-in/out, recovery email, password change, old-password denial, expired/reused link handling, and session-expiry recovery. Confirm exact staging redirects and mail delivery configuration; keep confirmation enabled.                    | Authentication lead and staging mail operator          |
| G03: Emergency withdrawal         | Name the operator and backup; prove a staging-only containment/withdrawal procedure that closes direct lesson URLs, catalogues and assessment start together. Select and verify a compatible known-safe release, preserve attempts, and rehearse. A database status change alone is insufficient for bundled lessons.                                    | Release operator and content owner                     |
| G04: Recovery                     | Establish an encrypted current recovery point, record included schemas/configuration, restore to an isolated target through the current migration set, verify RLS and reviewed versions, and obtain owner-approved recovery objectives. Prove access to the backup and restore tools without placing secrets in reports.                                 | Database recovery owner                                |
| G05: Pilot operations and privacy | Record named facilitator, technical responder, backup, reviewer escalation, private feedback/contact channel, participant notice and retention/deletion decisions. Prove a non-team participant can reach protected staging without receiving privileged credentials. Define cohort admission, stop authority and staffed monitoring windows.            | Pilot owner and privacy/security owner                 |
| G06: Human accessibility          | Complete a real-device keyboard/screen-reader/zoom pass through entry, signup, lesson, assessment errors/review and dashboard. Resolve blocking findings and record supported browser/device combinations.                                                                                                                                               | Accessibility lead and facilitator                     |

G01 is a confirmed governance failure, not merely absent testing. G02-G04 include unproven
operational capabilities; passing automated tests does not close them. G05-G06 can be
largely operational and do not require a broad new analytics or feedback platform.

## Staff Operations

Engineering review and exact-version assignment exist. Self-approval is denied by the
current review workflow; prior live checks and fresh local tests support this. Content
review permission does not grant access to student profiles, progress, attempts or projects.

There is no implemented student feedback queue. A private facilitator-owned intake with
issue ID, category, severity, affected artifact version and disposition is sufficient for
this cohort, subject to the privacy requirements below. Do not use Vercel's optional
feedback toolbar as a substitute: its script is intentionally excluded by the CSP.

Generic domain `rollback`/`archive` methods are not a demonstrated deployed withdrawal
control. The current public lesson gate reads bundled JSON/review records. Reversing a live
review or publication record does not automatically withdraw that bundle. The owner must
have a verified release-level containment procedure; previous release compatibility with
migration `0019` must not be assumed. See G03 and G04.

## Monitoring Proposal

Manual monitoring can be sufficient for 5-10 people only in scheduled, facilitated
sessions. It is not sufficient evidence for unattended public access or production.

Before launch, assign an on-duty facilitator and a technical responder with access to
staging Vercel runtime logs and Supabase Auth/database logs. Confirm those people can
retrieve a redacted error reference and escalate it. Review readiness, auth failures,
server errors and submission failures before each session, at least every five minutes
during it, and once after it. These are proposed operating targets, not measured service
levels. Pause if the responder or monitoring access becomes unavailable.

Existing server events cover application/auth/submission failures, with safe error
references and redaction. No live external alert channel or client-error collection was
verified. Password-reset request failures are currently flattened to success without a
corresponding failure event. Readiness probes treat HTTP responses below 500 as healthy,
so a green health response alone does not prove credential or transaction health. The
staging diagnostic probe has no application-level permission check; retain protection
and do not expose it as an unauthenticated public log generator.

## Privacy Requirements Before Collection

These are proposed pilot conditions, not a legal-compliance certification or existing
automated retention implementation.

- Give participants a plain-language notice stating the experiment's purpose, staging
  status, data collected, processors used, recipients, retention, withdrawal route and
  contact. Participation must not affect academic marks. Exclude minors from this first
  scope unless a separately approved process covers them.
- Collect only the account data required by the existing platform and the permitted
  lesson/assessment progress. Do not collect student numbers, university records, sensitive
  personal information, public rankings, certificates, or project uploads.
- Use pilot aliases for feedback. Keep any alias-to-contact mapping private and separate.
  Do not copy raw answers, emails, tokens, recovery URLs, screen recordings or browser
  network exports into issue reports. Redact screenshots before sharing.
- Students see their own records. The facilitator receives voluntary feedback and
  aggregate counts; being a reviewer does not authorise broad access to learner data.
  Assign any additional access explicitly, narrowly and with auditability.
- Proposed schedule for owner/privacy approval: delete pilot accounts and detailed learning
  records within 30 days after pilot close; retain pseudonymous feedback for at most 90
  days, then aggregate or delete. Decide audit/security-event and backup retention
  separately, explain delayed backup expiry, and resolve any conflicting retention duties
  before making promises to participants. No deletion schedule was configured here.
- Test the authorised deletion/export process and record responsibility before launch.
  Log identifiers are pseudonymous, not necessarily anonymous. Never promise instant
  deletion from immutable audit history or all backups.

## Stop and Reopen Rules

Stop immediately on cross-student disclosure, a hidden-answer leak, unreviewed content
delivery, an incorrect engineering result, score/award corruption, or a blocking
accessibility failure. Stop affected activity on repeated authentication/submission
failures or loss of monitoring. Preserve minimal redacted evidence, notify the named
owner/reviewer, contain access, and avoid blind retries or manual score edits.

Reopening requires correction/review, regression evidence, verified content withdrawal
or recovery where relevant, and explicit owner/facilitator approval. Expansion additionally
requires the [success metrics](student-pilot-success-metrics.md). None of these rules
authorises changes or invitations during this audit.
