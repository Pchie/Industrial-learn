# Prompt 53F remediation report

## Current status — October 12, 2026

Hosted verification and the staging-link switch are complete: 44 qualifying hosted checks, two unchanged seven-test integration runs, five expired-token checks, five retired test accounts and final preservation passed. See [October 12 verification](platform-verification-2026-10-12.md) for dates, coverage limits and the current staging link. AI Mentor is deferred. No approval request remains pending for this completed staging work.

## Historical record — superseded status below

The following dated record is retained for evidence continuity; its statements about pending account approval, unexecuted hosted tests or an unchanged staging alias are no longer current.

**PARTIAL: REMAINING DEFECTS OR VERIFICATION GAPS**

Updated 2026-09-22T19:09:43.592780+00:00. The existing Supabase staging project was resumed through the approved dashboard flow and now reports Healthy. Hosted liveness and readiness both return 200, including auth and database checks. Four preservation checks match the September 14 ledger, original bookmarks and approved pilot metadata; three canonical-resolution checks and five anonymous hosted checks pass. Authenticated hosted acceptance is **BLOCKED: explicit temporary test-account approval pending**. The 322 prior real-backend passes remain September 14 evidence. See [current hosted status](prompt-53f-hosted-staging-status-2026-09-22.md).

## Source and preservation

Branch `codex/website-design-consistency`, HEAD `5fd8fc5253314deb403172d2084dc3d216adcd1f`, with preserved uncommitted work. Frozen source: `6678b3cc80c7e388567311bb7d2caa4316ea26f6604d7ce82fad3be16839ef24` (804 nonignored files, excluding these reports). This continuation changed verification scripts and reports only. The original 53E evidence, application code, equations and reviewed artifacts are unchanged. No dependency was installed.

Migrations 0023–0025 were previously approved and committed once to dedicated staging `lgjujyaclrpaopdabyzg` at `2026-09-14T18:36:46.890577+00:00`. Their exact hashes, 16 catalog/preservation checks and three public canonical-resolution checks remain in the matrix. Migration 0010 remains held. Do not reapply these migrations.

## Verified frontend/backend connections

- Normal Supabase sign-in, verified account identity and the same owner across dashboard, My Learning and lesson actions.
- Canonical governed lesson bookmarks: confirmed save, duplicate safety, reload, fresh browser/sign-in, owner removal and cross-account denial.
- Real challenge progress, current assessment v2 submission, exact server score, durable dashboard results and repeated review without score changes.
- Private attempt/progress access, lecturer cohort scope, trusted-write restrictions and hidden draft questions/answers.
- Cross-tab account changes with deliberately delayed identity and actual private-library payloads, return navigation, suspension during a session and missing browser session.
- Controlled transport outage in a separate local app process: protected operations fail, failed saves create no bookmark, no local identity appears, and access recovers after transport is restored.

These browser checks ran the frozen production build locally at `http://127.0.0.1:3168` with real staging configuration. They are not hosted-deployment verification. Chromium responsive checks covered 375, 768 and 1440 pixels, light/dark states, no horizontal overflow and zero selected Axe violations. Existing broader local visual checks remain valid.

## Two bounded live rounds

| Scenario                                                        | Round 1              | Round 2              |
| --------------------------------------------------------------- | -------------------- | -------------------- |
| Ordinary JWT: identity, bookmarks, suspension                   | 33 passed / 0 failed | 33 passed / 0 failed |
| Browser learning journey with real backend                      | 13 passed / 0 failed | 13 passed / 0 failed |
| Delayed private responses, session and account boundaries       | 9 passed / 0 failed  | 9 passed / 0 failed  |
| Roles, exact review assignment, hidden answers and cohort scope | 73 passed / 0 failed | 73 passed / 0 failed |
| Stored scores, private records and legacy content               | 27 passed / 0 failed | 27 passed / 0 failed |
| Controlled transport outage and recovery                        | 6 passed / 0 failed  | 6 passed / 0 failed  |

Every actor signed in through normal Supabase authentication. Privileged access created only allowlisted synthetic fixtures; ordinary JWT tests used database roles and real row policies. Staff positive controls proved the protected draft/answer and legacy content records existed. The reviewer-author self-approval probe required the exact self-author denial; empty attestations independently prevented approval. The positive assigned review requested changes and did not approve engineering content.

The controlled outage rejects backend requests only inside a separate test app process. Supabase itself was never paused. The session-expiry browser check removed `il_session`; it is not a measured JWT-expiration test.

## Findings

| Finding                                    | Implemented behavior                                                                                                                                                                                                                                                                     | Current evidence and limitation                                                                                                                                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 53E-F01: Account suspension                | Active-profile checks at the server, restrictive RLS, column grants, active role helpers and locked persistence wrappers deny disabled/missing status.                                                                                                                                   | PASS for bounded real JWT and local-app/real-backend scenarios: active, already-issued suspended session, fresh suspended sign-in, denied self-reactivation, restored access. Hosted deployment checks remain pending.                                                     |
| 53E-F02: Canonical bookmark identity       | Add a constrained stable governance UUID target and owner-checked canonical RPCs; preserve legacy references and confirm writes before UI success. Shared eligibility also enforces a linked relational lesson/module when present.                                                      | PASS: live canonical save, duplicate, fresh sign-in/browser persistence, owner-only removal and cross-user denials in both rounds. Hosted deployment remains pending; only task-created bookmarks were removed.                                                            |
| 53E-F03: Historical assessment versions    | Separate historical service verifies owned completed attempt, exact installed version and immutable content snapshot/hash. No current fallback, rescore or awards on review.                                                                                                             | PARTIAL: two genuine v2 assessment submissions, immutable repeated reviews and cross-owner denial passed. Real original v1 archive remains missing; no substitution or historical repair.                                                                                  |
| 53E-F04: Backend-mode consistency          | All adapters use one validated getBackendMode decision. Mixed/live local mode is rejected; missing live configuration never enables fixtures. Local UI identifies temporary test data.                                                                                                   | PASS within the tested local production app against staging: normal mode, controlled backend transport failure, no fake save/identity, recovery. The remote build is READY and actual hosted auth/database readiness passes; authenticated hosted journeys remain pending. |
| 53E-F05: Author workspace honesty          | Surface unavailable state and explicitly defer editing/submission; use the honest-deferred alternative accepted in 53E.                                                                                                                                                                  | PASS for direct ordinary JWT draft ownership and role boundaries; frontend honestly defers author editing/submission. Live author UI CRUD remains deferred under the accepted scope.                                                                                       |
| 53E-F06: Privileged simulation publication | Exact-version service resolver and locked persistence guards intersect independent publication evidence and parent eligibility, including retries and withdrawal.                                                                                                                        | PARTIAL: existing named legacy simulations exist for staff and are hidden from both students; local exact-publication transaction tests pass. No eligible standalone simulation supports a live positive launch or withdrawal test.                                        |
| 53E-F07: Complete private library state    | Dedicated library queries retrieve all pages with deterministic cursors and fail honestly on incomplete data; dashboard retains its bounded recent view.                                                                                                                                 | PASS: both real-backend library/dashboard journeys and durable result/progress presentation; local 135-record pagination regressions remain valid. No production-scale live paging benchmark.                                                                              |
| 53E-F08: Account status input validation   | Reject missing/unknown operation before invoking the manager RPC; retain explicit enable and disable.                                                                                                                                                                                    | PASS: synthetic manager disable/restore through ordinary JWT; strict action input checks remain locally verified. No real person was disabled or modified.                                                                                                                 |
| 53E-F09: Withdrawn bookmark removal        | Owner may delete an existing bookmark by its ID without obtaining withdrawn metadata. Lists return a generic unavailable item; reopening remains publication-gated.                                                                                                                      | PARTIAL: ordinary removal verified twice; withdrawn-item behavior remains locally verified only. No real pilot withdrawal or new technical publication was authorized/performed.                                                                                           |
| 53E-F10: Private account transition        | Shared identity scope binds environment, profile and roles to every rendered payload. Synchronous hiding, generation checks, cancellation and full reload on identity mismatch discard stale private state; same-context delayed identity and delayed RSC tests cover return navigation. | PASS for bounded local-app/real-backend scenarios: cross-tab delayed identity and actual private RSC payloads, return navigation, missing session, failed identity checks. Hosted authenticated journeys and actual JWT wall-clock expiry remain unverified.               |

## Cleanup and remaining work

Nine synthetic Auth users were created with reserved `example.invalid` addresses; no email or invitation was sent. All actors retired: **True**. Account roles were removed and sign-in denied after retirement. Exact-ID cleanup removes only this task's mutable fixture scaffold and bookmarks, while retaining labeled synthetic attempts/progress and archived review/audit evidence. Final original-bookmark checksum and canonical-content preservation check: **PASS**. This is not a whole-database preservation guarantee.

Remaining gaps:

1. Complete the pending exact test-account approval and hosted verification, then verify cleanup and switch the staging alias. Backend recovery, current data preservation, public resolution and anonymous access now pass. All 803 uploaded source paths/content hashes match the candidate; private environment files were excluded.
2. The original seven opt-in test cases remain skipped in the historical complete local runs. Scoped live companions now cover identity, private columns and named legacy fixtures, but do not count as unchanged execution of that test file. A positive eligible relational lesson/simulation case is still unavailable.
3. Live published-content withdrawal and standalone simulation launch require independently reviewed suitable fixtures; the real pilot was not withdrawn or republished.
4. The real historical v1 assessment archive is missing. Original attempts remain intact and unavailable reviews do not substitute v2.
5. The original owner-assignment intermittent failure passed both complete 217-test runs, but its exact cause remains unconfirmed. Its causal verdict stays **UNRESOLVED**.

The full local passes each retain 217 Chromium passes, 550 unit passes and 61 disposable-database checks, with seven explicitly recorded opt-in skips. No production approval is given. See [two-pass evidence](prompt-53f-two-pass-verification.md), [machine matrix](prompt-53f-regression-matrix.json) and [remaining operator action](prompt-53f-operator-actions.md).

The approved staging credential transfer/deployment and existing Supabase resume are complete. No migrations were reapplied and production is unchanged. Automatic approval review separately rejected creation of four synthetic students and one synthetic platform owner because general testing permission did not explicitly authorize that privileged access change. A precise approval question is pending; no new remote test identities or learning writes have occurred.
