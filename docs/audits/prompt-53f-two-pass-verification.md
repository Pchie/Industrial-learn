# Prompt 53F two-pass verification

## Current status — October 12, 2026

Hosted verification and the staging-link switch are complete: 44 qualifying hosted checks, two unchanged seven-test integration runs, five expired-token checks, five retired test accounts and final preservation passed. See [October 12 verification](platform-verification-2026-10-12.md) for dates, coverage limits and the current staging link. AI Mentor is deferred. No approval request remains pending for this completed staging work.

## Historical record — superseded status below

The following dated record is retained for evidence continuity; its statements about pending account approval, unexecuted hosted tests or an unchanged staging alias are no longer current.

Updated 2026-09-14T19:33:29.574210+00:00. Exact frozen source `6678b3cc80c7e388567311bb7d2caa4316ea26f6604d7ce82fad3be16839ef24`. The implementation remains uncommitted on the existing feature branch.

## Complete local runs

| Check                                                            | Pass 1                                            | Pass 2                                            |
| ---------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| Full Chromium suite                                              | 217 passed; 0 failed/skipped/retried              | 217 passed; 0 failed/skipped/retried              |
| Unit suite                                                       | 550 passed; 7 opt-in live skips                   | 550 passed; 7 opt-in live skips                   |
| Fresh disposable database                                        | 61 passed; original publication regression passed | 61 passed; original publication regression passed |
| Source, types, lint, content, migrations, secrets and formatting | Passed                                            | Same frozen source; relevant checks retained      |
| Fresh production build and browser context                       | Passed                                            | Passed                                            |

The local database uses a test-only `auth.uid()` shim and simulated request claims. It is not signed JWT evidence. Both complete browser runs used one worker, zero retries and original timeouts/assertions. Per-test results, timestamps, command records and exact source/harness manifests are preserved in the matrix.

## Additional real-service rounds

The following checks use genuine Supabase Auth and real staging RLS. Browser checks host the exact production app locally against that backend. Privileged fixture lifecycle checks are excluded from these scenario totals.

| Scenario                                                        | Round 1              | Round 2              |
| --------------------------------------------------------------- | -------------------- | -------------------- |
| Ordinary JWT: identity, bookmarks, suspension                   | 33 passed / 0 failed | 33 passed / 0 failed |
| Browser learning journey with real backend                      | 13 passed / 0 failed | 13 passed / 0 failed |
| Delayed private responses, session and account boundaries       | 9 passed / 0 failed  | 9 passed / 0 failed  |
| Roles, exact review assignment, hidden answers and cohort scope | 73 passed / 0 failed | 73 passed / 0 failed |
| Stored scores, private records and legacy content               | 27 passed / 0 failed | 27 passed / 0 failed |
| Controlled transport outage and recovery                        | 6 passed / 0 failed  | 6 passed / 0 failed  |

Total scenario checks passed: **322**. Historical outage-harness failures retained: **3**. The final scenario totals above exclude superseded harness attempts; their complete results remain in the matrix. These are bounded checks, not a claim of complete security coverage. Three earlier outage attempts are preserved: the first used a nonexistent readiness route and ran no scenario; the second passed round 1 and four round-2 checks before a browser navigation was cancelled during recovery. The third attempt reached recovery but looked for a library-only identity element on the dashboard. The corrected harness uses the actual shared account control, waits for the redirected sign-in form and verified account state, then uses that form instead of overlapping another navigation. No app code, assertion timeout or retry setting changed. The original seven opt-in tests were not executed unchanged. Neither full contractual acceptance round is complete until deployed and content/history requirements are resolved.

Private evidence directory: `.private-operations/53f-2026-09-14/staging-completion`. The matrix embeds sanitized checks and exact command paths. Passwords, JWTs, cookies and environment values are excluded. The app-source fingerprint is unchanged; scenario harness files have separate hashes. Each browser round uses fresh contexts and A/B actors; staff actors reuse only their approved roles with separate fixture UUIDs per round. All requests that can mutate shared fixture state are serialized.

## Protection and positive controls

- Owner bookmark/attempt/progress reads precede cross-account denials.
- Suspension retains an already-issued token and confirms Auth still recognizes it while protected RLS and app admission deny access.
- A reviewer has the exact role and an existing self-authored target before the self-approval probe; the exact `42501` self-author message is required. No attestation is supplied, preventing approval even if that guard failed.
- Staff can read the synthetic hidden-content fixture before students are denied. Three named legacy lesson and three named legacy simulation fixtures were found through staff metadata reads, then denied to students.
- Delayed tests release actual identity and private RSC responses after another account signs in. Offline identity checks mask private content.
- The outage scenario blocks only the test server's backend transport, challenges a normal save action, checks durable rows separately and verifies recovery.

## Original failures and evidence continuity

The original 53E baseline remains 508 unit passes/7 skips and 212 browser passes/2 failures. Earlier artifacts and the complete historical failure record are retained in the matrix and pre-continuation report backups. The Sep11 temporary raw artifacts lost at restart were not reconstructed or represented as newly inspected evidence.

The original mobile Study Support failure had a demonstrated portal/ref readiness defect that was fixed without removing its test. The original owner reviewer-assignment test is unchanged and passed both final full runs, but its earlier intermittent cause is unconfirmed; **UNRESOLVED** remains the causal verdict.

The initial Sep14 full run recorded 213 passes, two assertion failures and two timeouts. Reduced machine load plus precise semantic readiness/message assertions preceded the two clean final runs. Earlier failures are preserved and are not erased by targeted rechecks. No retry or timeout increase concealed them.

## Live database and cleanup

Migrations 0023–0025 were applied once after explicit approval. Sixteen schema/preservation checks and three public lesson-resolution checks passed. Both original bookmarks retain their original-column checksum after cleanup; exact pilot identities, versions, published state and assessment hash are compared again in the final preservation record. Synthetic learning and review/audit history remains labeled and retained. Retired actors: **True**.

## Independent review and limits

A separate AI agent reviewed implementation, evidence and these bounded fixture/test scripts. It is not human engineering approval. Any final observations are recorded in `live_completion.independent_review`. Earlier review findings and their fixes remain in the matrix.

Updated 2026-09-22T19:09:43.592780+00:00. The existing Supabase staging project was resumed through the approved dashboard flow and now reports Healthy. Hosted liveness and readiness both return 200, including auth and database checks. Four preservation checks match the September 14 ledger, original bookmarks and approved pilot metadata; three canonical-resolution checks and five anonymous hosted checks pass. Authenticated hosted acceptance is **BLOCKED: explicit temporary test-account approval pending**. The 322 prior real-backend passes remain September 14 evidence. See [current hosted status](prompt-53f-hosted-staging-status-2026-09-22.md).

The original seven opt-in cases are prepared for unchanged execution with real student sessions. No current authenticated hosted round has run while exact fixture-account approval remains pending. The zero-visible-row publication case will be reported as vacuous, not as positive publication proof. The older content/history, natural JWT expiry and owner-assignment causal gaps remain. Chromium is the only configured browser.

**PARTIAL: REMAINING DEFECTS OR VERIFICATION GAPS**
