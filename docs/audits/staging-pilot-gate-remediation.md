# Staging Pilot Gate Remediation

Date: 2026-09-08. Branch: `codex/close-staging-pilot-gates`.
Starting commit: `da1078cc6724cf27d8b8c699debbf51817ccd188`.

## Scope And Verdict

Close the remaining safeguards after the dashboard staging release without changing its
layout, engineering content, equations or assessment scoring. No production deployment,
production database operation, student invitation or content approval is authorized by
this report.

**Student pilot invitations remain NO-GO.** Technical fixes and operating checks reduce
the remaining work, but external mail, owner decisions and human accessibility sign-off
must not be reported as completed merely because automated tests pass.

## Gate Status

| Gate                            | Current result                                                                                                    | Remaining evidence                                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| G01: Student-visible governance | Closed by the preceding release; restored exact-version/RLS regression also passes                                | No new publication approval; unapproved standalone simulations stay locked                                                                        |
| G02: Account lifecycle          | Server confirmation/recovery fixes and regression tests implemented                                               | Custom SMTP is disabled; install provider/template configuration, prove actual external receipt and complete the delivered-mail browser journey   |
| G03: Emergency withdrawal       | Staging project firewall containment rehearsed successfully and left inactive; saved attempts unchanged           | Named operator/backup with verified access; content withdrawal/re-review and direct-Supabase incident steps remain distinct from edge containment |
| G04: Recovery                   | Current encrypted archive retained; isolated PostgreSQL restore, all 69 table digests, 21 migrations and RLS pass | Owner-approved RPO/RTO/retention and off-device/key custody; managed service/configuration recovery                                               |
| G05: Pilot operations/privacy   | Private owner record prepared; nominated contact recorded privately                                               | Backup, staffed roles/support channel, retention/admission notice approval, non-team participant access verification                              |
| G06: Accessibility              | Automated regression verification in progress                                                                     | Actual device/screen-reader/keyboard/zoom pass by a human; no fabricated sign-off                                                                 |

## Implementation

- Auth links now use an explicit same-origin confirmation action and typed Supabase
  token-hash exchange. Recovery authority is separate from ordinary login, short-lived
  and HttpOnly. Reset actions ignore browser-supplied tokens. Signup does not provision
  a profile before verified identity; privileged metadata is ignored.
- Preserve password whitespace; clear recovery on logout; reject unconfirmed identities;
  fail on profile lookup or role-assignment errors. Auth calls have bounded/no-store requests.
- Independent recheck found that a separate cookie name alone did not prove recovery
  purpose. Recovery authority now requires a server-signed, purpose-bound ticket with
  server-enforced expiry; raw session tokens and tampered tickets are rejected.
- The staging monitoring probe requires platform management permission. Readiness requires
  2xx responses and bounded dependency timeouts. Recovery transport failures are logged
  without exposing whether a mailbox exists.
- Exact mail templates and the operator runbooks are prepared. No SMTP credential was
  invented, displayed or installed. Live callback destinations are already exact and correct.
- A staging-only emergency firewall control was added and rehearsed, then disabled. The
  production project and database are excluded by hard project-ID guards.
- A current encrypted backup/key was retained privately, with a disposable local restore.
  `.private-operations/` is ignored; operator records and data-bearing artifacts are not
  included in commits.

## Verification Log

- Final full unit run: **480 passed**, seven explicitly opt-in live tests skipped.
  The final cookie/provider regression subset also passed all 16 tests.
- Live authenticated database integration: **7 passed, zero skipped**. Both exact
  temporary accounts and their profiles were removed; 37/37 public tables retain RLS
  and the ledger remains 21 applied migrations through `0022`.
- Local type checking passed. Initial local/CI lint found repeated FormData reads losing
  type narrowing and an untyped cookie-test mock. Both were corrected without rule changes.
- Initial secret scan flagged a long **synthetic test token**, not a real credential. The
  fixture was changed to an unmistakably short test value; scanner rules were not weakened.
- Formatting found one newly edited test file; the existing formatter corrected it.
- Initial full unit run: 478 passed, one timeout importing the cookie test's unnecessary
  provider dependency, seven explicitly opt-in live tests skipped. The cookie unit now
  imports setup before the test timer and mocks unrelated provider/navigation boundaries;
  it does not relax the timeout. The complete unit rerun passed.
- Two browser runs timed out at the old two-minute server startup allowance; a third
  exceeded five minutes. A cold build passed with the new local ten-minute allowance.
  CI retains five minutes. No test/assertion timeout was changed. Some broad browser scans
  subsequently reached their 30-second limit under concurrent laptop load: **59 passed,
  four timed out**. All 12 auth and five staging smoke cases passed in that run; final
  accessibility reruns and CI evidence remain required before declaring the release verified.
- Restore initially caught a timezone-dependent comparison and an enum cast error in the
  read-only harness. Both were corrected; all restored data matched without schema changes.
- First firewall check observed edge propagation. The second rehearsal verified sustained
  403 denial on stable and immutable URLs, readiness 200, restored access and unchanged attempts.

Final local quality, deployment and live generated-link results will be added before this
release is declared verified. No claim of external mail receipt, full managed-service
restore, independent engineering approval or human accessibility acceptance is made.

## Evidence And Next Actions

- [Previous staged dashboard/database release](dashboard-live-staging-release-verification.md).
- [Account lifecycle](../operations/staging-account-lifecycle.md).
- [Emergency containment](../operations/staging-emergency-containment.md).
- [Current encrypted recovery](../operations/staging-recovery-current.md).
- Private, ignored owner record: `.private-operations/pilot-owner-record.md`.

Next: finish the external SMTP and delivered-mail test, confirm pilot operators/privacy
decisions and off-device recovery custody, verify non-team entry and human accessibility,
then make a fresh controlled-pilot start decision. Do not expand content or start AI Mentor
to work around these gates.
