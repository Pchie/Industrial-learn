# Prompt 53E operator actions

The audit made no remediation or live staging writes. The backend-security gate is **FAIL** because F01 is confirmed in the current schema and reproduced locally. A future passing focused audit would still not be a general pilot/production approval.

## First remediation tasks

1. **F01 — database suspension boundary:** introduce a reviewed migration that limits self-profile updates and enforces disabled-user access at ordinary database/RPC boundaries. Retest valid pre-disable JWT access, blocked self-reactivation and authorized restoration.
2. **F02 — bookmark identity:** reconcile the repository/governance lesson ID with the relational bookmark foreign key. Current staging has no `lessons` row for the public pilot; a labels-only insert is not a valid repair. Preserve review evidence and existing ownership.
3. **F03 — attempt version binding:** return exact historical reviewed content or deny mismatched review/delivery. Test direct URLs, not just hidden dashboard links.
4. **F04 — configuration selection:** use one validated backend mode for auth and every repository. Reject mixed real-auth/fixture-data configuration.
5. **F05 — author workspace:** implement scoped draft reads/operations or show explicit unavailable/deferred status. The current empty model is not a connected draft workspace.
6. **F06 — future simulation enablement:** add exact-version independent DB publication checks before exposing a student simulation. Current zero-eligible catalogue should remain gated until authorized review and tests.
7. **F07–F09:** use library-specific state/pagination, reject invalid admin enums, and allow safe owner-only removal of withdrawn bookmarks.
8. **F10 — account switching:** invalidate private page bodies on cross-tab/session identity change; a new header identity must not coexist with the prior user’s library.
9. Investigate the retained full-suite failures. Fresh owner/support rechecks passed, but no root cause or clean full-suite result has been established. Do not weaken assertions or enlarge test timeouts merely to pass.

These are proposed smallest follow-up tasks, not changes made by this audit. Each finding’s precise retest appears in the main report.

## Verify staging access and deployment before any live journey

- Confirm project reference `lgjujyaclrpaopdabyzg` against the intended staging project in Supabase. Do not use a production project.
- Confirm Vercel project `industrial-learn-staging`, GitHub deployment `6336125240`, commit `5fd8fc5253314deb403172d2084dc3d216adcd1f` or the explicitly selected future candidate. Current immutable URL: [staging deployment](https://industrial-learn-staging-a44goaezr-kolobe.vercel.app).
- Supply operator-authorized access through the normal Vercel protection flow. Do not publish a bypass secret in a report. Capture only sanitized deployment/revision/environment metadata.
- Inspect Vercel build and runtime variable scopes independently: `NEXT_PUBLIC_APP_ENV=staging`, `INDUSTRIAL_LEARN_AUTH_MODE=supabase`, `INDUSTRIAL_LEARN_E2E=false`, `NODE_ENV=production`, and matching `APP_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Report names/presence/target agreement only.
- Verify the active deployment actually contains the intended frontend candidate. Current dirty redesign is not deployed. No deployment is authorized by this audit.
- Inspect the migration ledger and intended release manifest. `0010` is absent; do not automatically apply it or approve its simulation because a number is missing.
- The configured public publishable key and server key were accepted by read-only requests; DB credentials allowed privileged read-only schema inspection. Missing credentials are not the explanation for the remaining blocked user journeys.

## Separate live-write checkpoint — requires explicit authorization

No live mutation below is pre-authorized. Before execution, provide a concrete operator review record containing all of the following:

| Checkpoint field             | Required content                                                                                                                                                                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target                       | Verified staging project reference, protected deployment URL, exact tested commit/build and backend mode.                                                                                                                                                                                                  |
| Actors                       | Operator-provisioned synthetic Student A, Student B, author, assigned reviewer, unassigned reviewer, lecturer and owner/manager labels, their verified application roles, and confirmation that none are real students. Keep passwords/tokens out of the report.                                           |
| Records                      | Exact synthetic bookmark, draft, review assignment, cohort, attempt and progress record identifiers that may be read/changed. Each denial requires an authorized positive control.                                                                                                                         |
| Operations                   | Explicit per-test operations and maximum record counts, including logins/logouts, A bookmark save/duplicate/delete, assessment start/save/submit/retry, challenge progress, any synthetic account disable/restore and any role/assignment test.                                                            |
| Auth and operational effects | Supabase login/logout/auth audit entries, refreshed/session tokens, application audit events, attempt/progress/award rows and bookmark changes. No email/reset/invitation unless specifically added and separately authorized.                                                                             |
| Cleanup                      | Delete only audit-created records where allowed; remove the exact audit-created bookmark; restore only explicitly identified audit-changed synthetic state. Never delete/alter pre-existing attempts, review evidence or real-user records. Immutable audit events remain and are identified as synthetic. |
| Approval                     | Explicit approval covering the target, actors, exact operations and cleanup. Elapsed time or previous read-only authorization is not approval.                                                                                                                                                             |

Do not use a database owner/service-role query as evidence that Student A/B RLS works. Use each synthetic actor’s actual authenticated session and ordinary REST/SDK/browser paths. Privileged queries may separately confirm fixture existence or read schema metadata, without becoming the denial proof.

## Required live retest sequence after authorized remediation

1. Record the actual release, environment and targeted fixture metadata. Verify authenticated A’s own positive controls before testing B denial.
2. Verify the suspension fix with an existing valid synthetic A token. Confirm direct profile PATCH cannot clear disabled state and private reads/mutations follow the intended suspension policy. Restore through the authorized manager path only.
3. Run the complete bookmark journey on the pilot lesson: save, verify correct DB identity/owner, fresh browser context, signout/in, confirm retained bookmark; B cannot read/change/delete it; retry is idempotent; delete only the audit-created row. Test failed save and content withdrawal in separately authorized fixtures.
4. Complete the reviewed lesson challenge and exact current assessment as synthetic A. Verify persistent owned attempt, server-derived score/competency, progress and audit transaction. Retry the same submission without double credit; B and a missing/expired session cannot access or submit it.
5. Test historical-version delivery/review and a database containing only a different assessment version. No current hidden feedback may be returned based on an older completion.
6. Verify assigned/unassigned reviewer decision boundaries, author ownership, lecturer cohort boundaries and owner-only inability to approve. Do not publish or approve real engineering content. Keep any test review fixtures explicitly synthetic.
7. Exercise a standalone simulation only if separately reviewed/eligible and approved for this test. Verify server reconstruction/scoring, exact version, normal/boundary/fault controls and no attempt or competency writes from Anatomy/Exploded/360/Aerial switches. Otherwise record this journey BLOCKED.
8. Inspect authenticated deployment headers and payloads from separate A/B contexts: private no-store, no shared personalized cache, no credential serialization, no stale identity after signout/account switch. Keep screenshots/traces/HAR disabled when they could contain private content or answers.
9. Run the unchanged full configured browser suite on the final candidate, record all pass/fail/skip totals, then document unavailable Firefox/WebKit/manual Safari coverage separately. Do not install browsers/dependencies under this audit’s authorization.

## Commands and safe evidence

Existing read-only/non-destructive source checks are `npm run scan:secrets`, `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run validate:content`, `npm run validate:migrations`, `npm run test:unit`, and the existing build/full Playwright suite. Review test scripts before using any live opt-in flag.

The repository’s live opt-in test expects `RUN_STAGING_DB_INTEGRATION`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STAGING_STUDENT_A_ACCESS_TOKEN`, `STAGING_STUDENT_B_ACCESS_TOKEN`, `STAGING_STUDENT_A_PROFILE_ID` and `STAGING_STUDENT_B_PROFILE_ID`. Merely setting these does not authorize reading arbitrary records. Scope the test to verified synthetic fixtures and supply positive controls first. Never write their values to an evidence artifact.

Use the matrix’s PASS/FAIL/PARTIAL/BLOCKED/NOT APPLICABLE labels. Keep source checks, mocked fixtures, local PostgreSQL, live user RLS and deployed browser evidence distinct. Stop affected tests if a sensitive leak appears; record a redacted finding and obtain authorization before rotating credentials or changing records.
