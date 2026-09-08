# Prompt 49: Independent Student Pilot Readiness

Audit date: 2026-09-06. Live read-only evidence includes a database timestamp of
`2026-09-06T18:10:34Z`. **Controlled student pilot: NO-GO.**

Do not invite students yet. This is not a rejection of the reviewed foundation lesson:
its application flow and privacy controls have substantial positive evidence. It is a
finding that student-visible database governance and the operational start gates are not
yet adequate for the proposed 5-10 external participants. Production and AI Mentor are
not approved.

## Scope and Method

Read-only audit of the current repository and Supabase staging
`lgjujyaclrpaopdabyzg`, plus GitHub release/CI metadata and anonymous staging requests.
Live SQL used `BEGIN READ ONLY`, scoped existing synthetic fixture identities with
`SET LOCAL ROLE authenticated` and `request.jwt.claims`, SELECT-only assertions, then
`ROLLBACK`. These checks exercise live PostgreSQL policies but are not fresh signed JWT
requests. No accounts, sessions, attempts, emails, invitations, migrations, deployments,
publication changes, commits, pushes or production queries were performed.

Only the four requested documents were created. Existing local test commands generated
their normal ignored build/test outputs. No source, content, dependency or lock file was
edited. Prior live tests are explicitly attributed below rather than presented as rerun.

## Release Identity

| Evidence                    | Observed value                                                                                                                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository                  | `/Users/zungu/Documents/Master Industrial Learning`                                                                                                                                                                                                |
| Local branch                | `codex/prompt-48a-final-evidence`, tracking its origin branch                                                                                                                                                                                      |
| Local HEAD                  | `adffe83e6842387a00ca818354dfabdbd114d4da`                                                                                                                                                                                                         |
| Remote development          | `c3b396fa00d476c2afc7c77642503ac1a9952cd2`; protected branch reported by GitHub                                                                                                                                                                    |
| Local and remote tree       | Both `8978667b33e4c5c490cffad9acb3b756f2d92aa4` before these audit documents; the tested source trees are identical despite different commit IDs                                                                                                   |
| Development CI              | [34050174547](https://github.com/Pchie/Industrial-learn/actions/runs/34050174547), completed success at the remote development commit                                                                                                              |
| Code-change CI              | [34049690386](https://github.com/Pchie/Industrial-learn/actions/runs/34049690386), completed success for `a99b68cca8363f39aeeaea3ba76c3e0dce927a70`                                                                                                |
| Staging deployment          | GitHub deployment `6296154930`, success, `Preview - industrial-learn-staging`, created `2026-09-06T17:57:44Z`                                                                                                                                      |
| Immutable staging URL       | `https://industrial-learn-staging-9v110mk35-kolobe.vercel.app`                                                                                                                                                                                     |
| Stable alias                | `https://industrial-learn-staging-git-development-kolobe.vercel.app`                                                                                                                                                                               |
| Fresh anonymous access      | `/api/health/live`, `/learn/pilot`, `/auth/sign-up` each returned 302 to `https://vercel.com/sso-api`; authentication query strings were not retained                                                                                              |
| Runtime identity limitation | GitHub confirms the deployment commit/environment; the protected app health body was not read in this audit. No fresh claim that the alias served an inspected runtime commit. Prior same-day authenticated evidence is inherited from Prompt 48A. |
| Working tree                | Clean before audit; final intended changes are only the four requested uncommitted Markdown reports                                                                                                                                                |

CI uses lock-file installation, secret scanning, format/type/lint/content/migration/unit
checks, production build, accessibility and smoke tests. It runs on PRs and pushes to
`development`/`main`, with read-only repository permission and no deployment step. It does
not run the full E2E command; that suite was rerun locally here. Its critical dependency
audit is blocking, while the moderate advisory report is explicitly nonblocking. This
audit is not a fresh comprehensive dependency assessment.

## Principal Findings

### P1: Legacy Metadata Bypasses Evidence-Based Database Publication

Fresh ordinary-student SQL returned the following records, each marked
`Approved for student use / published`, version `1`:

| Entity     | Slug                                       | Reviews | Governance items | Content versions |
| ---------- | ------------------------------------------ | ------- | ---------------- | ---------------- |
| Lesson     | `prompt-33a-published-lesson`              | 0       | 0                | 0                |
| Lesson     | `prompt-33b-lesson-published_approved`     | 0       | 0                | 0                |
| Lesson     | `staging-fluid-pressure`                   | 0       | 0                | 0                |
| Simulation | `prompt-33a-simulation`                    | 0       | 0                | 0                |
| Simulation | `prompt-33b-simulation-published_approved` | 0       | 0                | 0                |
| Simulation | `staging-hydraulic-cylinder`               | 0       | 0                | 0                |

Counts were checked both by entity table and by entity ID without a table-name filter;
there are no alternative matching governance/version/review links. This is metadata
exposure from synthetic historical records, not evidence that the protected UI launches
those simulations or that another student's private data is exposed.

Root cause: `database/migrations/0005_restrict_unapproved_content_visibility.sql`,
`is_student_visible_content` and `lessons_read_approved_or_authorized` /
`simulations_read_approved_or_authorized`, require approved/published labels and qualifying
parents but do not join exact review/version evidence. Fresh `pg_policies` agrees.
Migration `0012` only demotes simulations whose review label is not approved, so it does
not catch these fixtures. Migration `0019` strengthens assessment publication, not these
lesson/simulation policies. Application-level bundled review checks are stronger.

Therefore the statement "students see only independently approved, published, current
content" is not true across the whole exposed data model. G01 is a hard pre-invitation
gate. Quarantine and policy remediation need separate authorisation; nothing was fixed
or deleted in this audit.

### P1: Rapid Withdrawal Is Not Demonstrated

`apps/web/src/features/lesson-engine/data.ts:82` evaluates bundled lesson versions and
`getStaticTechnicalReviewRecords`, not a live revocation record. A live database review
change will not on its own hide an already deployed approved bundle. No current deployed
withdrawal action was found in `features/content-governance/actions.ts`; live public SQL
functions contain no named withdraw/unpublish/rollback/archive function. Generic domain
methods in `packages/database/src/content-governance.ts:408` are not proof of a wired
release/content rollback control.

Existing runbooks describe rollback, but do not demonstrate a current safe artifact and
withdrawal across direct lesson, catalogue and assessment entry. A supervised pilot can
use an explicitly tested staging containment/redeployment procedure instead of demanding
a new product feature, but that evidence must exist first. G03 remains open.

### P1: External Authentication and Recovery Are Not Proven

Fresh Supabase Auth settings respond successfully, with signup enabled, email provider
enabled and mail auto-confirmation disabled. This proves configuration flags, not mail
delivery. Prompt 48A synthetic users were confirmed administratively; their successful
sign-in/out does not establish external signup confirmation or password-reset delivery.

`apps/web/src/features/auth/supabase-provider.ts:132` discards recovery-request errors;
the UI intentionally remains enumeration-safe, but no corresponding failure event is
recorded. `verifyEmail` at line 159 posts only `token` and `type`. The verification page
only reads `token`; the reset page uses a query `token` or existing session, and
`updatePassword` treats the reset token as a bearer access token. No hash-fragment session
handling, token-hash exchange or authorization-code exchange was found in application
source. The provider's default confirmation link returns session information in a URL
fragment, which a server-rendered page cannot consume automatically; documented OTP
verification uses an email plus OTP or a token hash. This is a code-level compatibility
risk, not a newly reproduced delivered-email failure. See the official
[email-template contract](https://supabase.com/docs/guides/auth/auth-email-templates),
[OTP verification inputs](https://supabase.com/docs/reference/javascript/auth-verifyotp),
and [password recovery flow](https://supabase.com/docs/guides/auth/passwords).

The current custom SMTP settings/templates were not verified. Do not claim SMTP is
definitely absent, and do not claim it works because a generic reset success message
appears. The existing troubleshooting guide warns against relying on the built-in mailer
for independent external users. G02 requires end-to-end external mailbox evidence.

Session cookies are HttpOnly, SameSite Lax and Secure in deployed builds. Identity and
roles are resolved on the server; session resolution rejects provider failures. Refresh
tokens are stored but no renewal is performed by `resolveSession` (line 167). The first
pilot needs an explicit, tested expiry/relogin experience, not an unsupported persistence
promise.

### P1: No Evidenced Current Recovery Point

Fresh `supabase backups list --project-ref lgjujyaclrpaopdabyzg --output json` returned
`backups: null`, `pitr_enabled: false`, `physical_backup_data: {}`, and
`walg_enabled: true`. WAL-G being enabled is not evidence of a listed recoverable snapshot.
No assertion is made that Supabase has no internal recovery options; none usable by the
pilot operator was demonstrated here.

The 2026-08-16 rehearsal proved a restore of then-current public/auth/storage data and
RLS into an isolated local database, with later scoped API/session evidence. It predates
migrations `0011`-`0019`; the rehearsal dumps and target were removed. Its approximately
one-second restore command is not an end-to-end recovery-time guarantee. Fresh storage
inventory is empty (zero buckets/objects), so object restore is N/A for this no-upload
pilot. G04 requires a current retained recovery point and tested recovery of the current
version/review/assessment state.

### P2: Pilot Operations and Human Accessibility Remain Open

Vercel protection is active for anonymous requests. A normal external participant entry
path has not been verified, and there is no application invitation allowlist. Do not
remove protection or distribute privileged bypass/team credentials just to make the
pilot accessible. No dedicated `/feedback` or `/privacy` application route was found.
Manual private feedback and a participant notice are viable, but named ownership,
retention/deletion decisions and operator access must be agreed first.

Monitoring is server-console based with redaction, safe errors and correlation IDs.
There is no verified external alert channel or client-error collection. The readiness
route's `probeSupabaseAuth` and `probeSupabaseDatabase` treat any status below 500 as
healthy, including 401/403. The staging diagnostic probe relies on outer deployment
protection rather than application authorisation. It was not invoked during this audit.
For 5-10 users, scheduled staffed monitoring can be acceptable; unattended access is not
covered. See G05 and the proposed monitoring procedure in the readiness document.

Automated accessibility is green, not a complete human conformance assessment. The
46-test suite includes axe WCAG 2/2.1 A/AA scans, keyboard focus, alerts, numeric inputs,
reduced motion, and overflow checks at 320/375/430/768/1024/1366 px. Some unpublished routes
correctly exercise unavailable states. Assessment-start/completed-review screens, actual
mail callbacks, the Vercel access gate, real screen readers, 200%/400% zoom, and physical
mobile/tablet browsers do not have a complete fresh manual audit. G06 stays open.

## Positive Governance and Privacy Evidence

The canonical lesson governance item has current/published revision `4`, Published /
published, with exact lesson `0.4.0` supported by Prompt 47 artifact comparison and review
`31510bc1-aecf-48fb-a40e-c427a86f115e`. Canonical assessment current/published version `2`
has independent review `6e326982-ce64-480b-a779-96cf4fdf3b13`; the reviewer differs from
the author and source/equation/safety checks passed. Fresh live records agree. Assessment
artifact SHA-256 is `db6268839cdfb959e7f7e392d9879cb3518b30d8b13ee01686cdd88ec71cec88`.

The live exact-assessment predicate admits canonical v2 and rejects all thirteen
historical v1 assessment fixtures. Student SQL returns only that canonical assessment.
The approved lesson is delivered as governed bundled content; it is not one of the
three legacy `public.lessons` rows above. The parent module remains unpublished.

The staging ledger has 18 entries: `0001`-`0009` and `0011`-`0019`. Held migration `0010`
registers an internal Bernoulli fixture and is explicitly documented as unapplied in
`docs/deployment/staging-migration-record.md` and Prompt 44. This is a known exception,
not complete migration parity and not a reason to apply it during this audit.

Fresh live RLS observations, using pre-existing synthetic fixtures:

| Data category       | A own rows | A other rows | B own rows | B other rows | Reviewer other/student rows | Author other/student rows |
| ------------------- | ---------- | ------------ | ---------- | ------------ | --------------------------- | ------------------------- |
| Profiles            | 1          | 0            | 1          | 0            | 0                           | 0                         |
| Lesson progress     | 2          | 0            | 2          | 0            | 0                           | 0                         |
| Assessment attempts | 3          | 0            | 2          | 0            | 0                           | 0                         |
| Simulation attempts | 3          | 0            | 2          | 0            | 0                           | 0                         |
| Project submissions | 2          | 0            | 2          | 0            | 0                           | 0                         |

Student A sees zero question, answer-choice, content-version and review-record rows.
Authenticated clients have no INSERT/UPDATE/DELETE privileges on lesson progress or
assessment attempts. Fresh privilege inspection:

| Function                                         | Anonymous execute | Authenticated execute | Service-role execute |
| ------------------------------------------------ | ----------------- | --------------------- | -------------------- |
| `start_assessment_attempt_transaction`           | No                | No                    | Yes                  |
| `complete_assessment_attempt_transaction`        | No                | No                    | Yes                  |
| `record_pilot_lesson_activity_progress`          | No                | No                    | Yes                  |
| `is_current_published_assessment`                | No                | Yes                   | Yes                  |
| `publish_approved_assessment_version_to_staging` | No                | Yes                   | Yes                  |

The publication function's authenticated grant is intentional: its body additionally
requires scoped Platform Owner identity, exact review and staging environment. It is not
an unrestricted student publication permission. No mutating RPC was invoked here.
Existing tests and Prompt 48A cover self-approval denial, student tampering denial and
service-only scoring. A SELECT-only role exercise is not a new write-penetration test.

## Inherited Live Student Evidence

Prompt 48A's 2026-09-06 report records two genuine temporary student JWT/browser flows:
challenge save, assessment start/save/reload/submit/review, sign-out/in and dashboard
persistence. It records correct pressure-unit conversion, wrong-dimension rejection,
unchanged completed retries, cross-student denial and transaction rollback after a late
failure. Both temporary accounts were removed. This audit did not recreate them.

That evidence is relevant because the tested local tree matches the latest deployment
tree and the last follow-up changed dashboard projection, not scoring or content. It
does not close email delivery, current backup recovery, legacy fixture governance,
withdrawal, external entry, or human accessibility gates.

## Commands and Results

| Command / inspection                            | Result in this audit                                                                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm run ci`                                    | PASS; all constituent commands below completed successfully                                                                       |
| `npm run scan:secrets`                          | PASS                                                                                                                              |
| `npm run format:check`                          | PASS                                                                                                                              |
| `npm run typecheck`                             | PASS                                                                                                                              |
| `npm run lint`                                  | PASS                                                                                                                              |
| `npm run validate:content`                      | PASS, 29 tests                                                                                                                    |
| `npm run validate:migrations`                   | PASS, 24 tests                                                                                                                    |
| `npm run test:unit`                             | PASS, 385 passed; 5 opt-in live tests skipped by the existing configuration                                                       |
| `npm run build`                                 | PASS, 39 generated static entries plus dynamic routes                                                                             |
| `npm run test:e2e`                              | PASS, 113 tests, 4.5 minutes; includes all 46 accessibility and 5 smoke tests                                                     |
| Git status/commit/tree and read-only GitHub API | Clean initial tree; local/remote tree match; development CI and staging deployment success                                        |
| Supabase Auth settings GET                      | PASS response; confirmation required, signup enabled; no mail delivered or session created                                        |
| Staging read-only SQL                           | Private ownership PASS; exact assessment/privileges PASS; six unreviewed legacy lesson/simulation metadata records readable: FAIL |
| Supabase backup inventory                       | No listed backup, PITR disabled; recovery evidence gap                                                                            |
| Anonymous stable-alias GETs                     | Vercel protection redirects, not app-page validation                                                                              |

The five opt-in live tests were not enabled with fabricated credentials or bypassed.
Their last genuine JWT pass belongs to Prompt 48A; the read-only live checks above are
fresh but are a different test method. The full browser suite used its existing local
test provider, not real student accounts or a deployed SMTP flow.

Warnings: existing `NO_COLOR`/`FORCE_COLOR` notices; the deliberate dashboard database
failure test logged its expected error and passed the safe-error assertion. Initial
HTTP inspection assumed a JSON health response and failed on a Vercel redirect; a
status/location-only recheck correctly identified protection. Some exploratory file
lookups targeted nonexistent paths before locating the actual files. These are audit
harness/search limitations, not suppressed application test failures.

## Evidence Register

| ID  | Evidence / scope                                                                                                                                                                                                                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | Fresh local Git status/HEAD/tree, GitHub development/CI/deployment GETs, anonymous stable-alias redirects; `.github/workflows/ci.yml`                                                                                                                                                                           |
| E02 | Fresh `npm run ci` and 113 local Playwright tests; `tests/e2e/accessibility.spec.ts`, `auth.spec.ts`, `assessment-browser.spec.ts`, `lesson-engine.spec.ts`, `simulation-lab.spec.ts`, `student-dashboard.spec.ts`                                                                                              |
| E03 | Fresh staging READ ONLY ledger, governance/review/predicate, existing-fixture RLS, function/table privilege, storage and legacy fixture evidence recorded above                                                                                                                                                 |
| E04 | Fresh Supabase `/auth/v1/settings`; email confirmation required, signup enabled; no SMTP/template or mailbox verification                                                                                                                                                                                       |
| E05 | `database/migrations/0005_restrict_unapproved_content_visibility.sql`, `0012_demote_unapproved_simulation_publications.sql`, `0019_assessment_version_integrity_and_pilot_progress.sql`; `apps/web/src/features/lesson-engine/data.ts`; `features/publication/static-publication.ts`                            |
| E06 | `apps/web/src/features/auth/server.ts`, `supabase-provider.ts`, `actions.ts`; `apps/web/src/app/auth/verify/page.tsx`, `auth/reset-password/page.tsx`; `docs/auth/staging-signup-troubleshooting.md`; official Supabase documentation linked in findings                                                        |
| E07 | Inherited `docs/audits/prompt-47-publication-evidence.json`, `prompt-48a-publication-integrity-remediation.md`, `prompt-48a-assessment-version-evidence.json`; current lesson/assessment artifacts and server adapters                                                                                          |
| E08 | `apps/web/src/features/monitoring/server.ts`, `error-boundary-view.tsx`; `app/api/health/ready/route.ts`, `app/api/monitoring/staging-probe/route.ts`; `docs/operations/staging-alerts.md`, `logging-and-redaction-policy.md`; Prompt 37 monitoring report                                                      |
| E09 | Fresh staging `supabase backups list`; inherited `docs/operations/restore-rehearsal-results.md`, `backup-inventory.md`, `docs/audits/prompt-38-backup-restore-report.md`, `supabase-managed-recovery-rehearsal-report.md`, `protected-vercel-session-recovery-report.md`; `docs/deployment/rollback-runbook.md` |
| E10 | Current `apps/web/src/app/workspace/page.tsx`, `learn/pilot/page.tsx`, `projects/page.tsx`; review/owner routes; source inventory has no dedicated privacy/feedback route; product requirements                                                                                                                 |

## Deliverables and Next Decision

- [Readiness and mandatory start gates](../pilot/student-pilot-readiness.md)
- [Risk register](../pilot/student-pilot-risk-register.md)
- [Feedback plan and success metrics](../pilot/student-pilot-success-metrics.md)
- This independent audit, including fresh versus inherited evidence and limitations.

Recommended next task: authorise a narrowly scoped **pilot-start gate remediation**,
starting with quarantine/evidence-based visibility for legacy staging fixtures, then
external authentication/recovery, current backup/withdrawal rehearsal and pilot operating
arrangements. Use a feature branch and review; do not change reviewed engineering content
or production. Return for independent verification of G01-G06 before invitations.

The audit is complete; the student pilot is not approved or started. No commit or push
was made. All four reports remain available for review as uncommitted documentation.
