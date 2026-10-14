# Prompt 53F hosted staging status — 2026-09-22

## Current status — October 12, 2026

Hosted verification and the staging-link switch are complete: 44 qualifying hosted checks, two unchanged seven-test integration runs, five expired-token checks, five retired test accounts and final preservation passed. See [October 12 verification](platform-verification-2026-10-12.md) for dates, coverage limits and the current staging link. AI Mentor is deferred. No approval request remains pending for this completed staging work.

## Historical record — superseded status below

The following dated record is retained for evidence continuity; its statements about pending account approval, unexecuted hosted tests or an unchanged staging alias are no longer current.

**PARTIAL: REMAINING DEFECTS OR VERIFICATION GAPS**

Updated 2026-09-22T19:09:43.592780+00:00. Backend recovery: **PASS**. Hosted authenticated acceptance: **BLOCKED: explicit temporary test-account approval pending**.

## Completed and verified

- Resumed the existing Industrial Learn Supabase staging project `lgjujyaclrpaopdabyzg` through the signed-in dashboard, using the user's existing approval. Dashboard status is Healthy. No replacement, reset, billing change or migration reapplication occurred.
- Existing Vercel project `kolobe/industrial-learn-staging` contains READY deployment `dpl_3MpCfxEivqHUfrheW5geR4G8PYh9`: [immutable staging build](https://industrial-learn-staging-l63cwwxzy-kolobe.vercel.app).
- Hosted `/api/health/live` and `/api/health/ready` return 200 in staging mode. Configuration, auth provider and database checks all pass. Direct read-only database connectivity also passes.
- Four preservation comparisons pass: migration ledger, original bookmark count/checksum, approved pilot lesson identity/version/publication evidence, and assessment identity/version/hash/publication evidence. This checks those records, not every row in the database.
- Three public lesson-resolution checks pass: exact current canonical content resolves; wrong content version and wrong identity do not.
- Five anonymous hosted checks pass: sign-in, dashboard redirect without private regions, unauthenticated account response, and liveness. Fifteen observed first-level public JS/CSS assets contain no configured server credentials. This is not full authenticated bundle coverage.
- All 804 frozen source files still match `6678b3cc80c7e388567311bb7d2caa4316ea26f6604d7ce82fad3be16839ef24`. All 803 actually uploaded source paths/content hashes match. Private environment files were excluded.
- Type checking and lint passed on September 22. Application source, dependencies, engineering content and equations are unchanged in this continuation. Deployment protection remains enabled.

## Pending authorization and execution

Automatic approval review rejected creation of five scoped test accounts because four student roles and one platform_owner role constitute a privileged access change requiring specific approval. The precise request names this project, those five roles, reserved `example.invalid` addresses, no email, and cleanup by disabling login/removing roles while retaining test/audit history. It is pending; there is no authorization to bypass this rejection.

All five account IDs/passwords are only locally planned. **Remote test accounts created: 0. Authenticated hosted scenario passes: 0; failures: 0.** The two journey/boundary rounds, unchanged seven-test integration suite, test-account retirement and final post-test preservation are not yet executed.

The alias plan confirms [the staging link](https://industrial-learn-staging-git-development-kolobe.vercel.app) still points to prior deployment `dpl_6MjcHsjCePLMGGbYD3b47dorjUwV`. The guarded switch requires both 13-journey/9-boundary rounds, both original integration-suite runs, exact account retirement and final preservation to pass. No staging alias or production change has occurred.

## Preserved failures and limits

Inactive-backend readiness/RPC failures and recovery-period connection failures remain evidence; they are superseded by actual healthy-backend results, not erased. The dashboard initially showed a database-down advisory after resumption despite Healthy status; direct database access, public RPCs and hosted readiness then passed. No alert dismissal or service reset was used.

Earlier anonymous/upload harness failures remain preserved: streamed Next.js redirects required browser verification; the shared account wrapper also appears on public sign-in; Vercel generated output is not uploaded source. Corrections targeted those mistaken assumptions without changing the application or relaxing security.

Independent review corrected cleanup guards and the original-suite wrapper's preliminary coverage probe. That suite is unchanged; it uses A's JWT against A/B profile IDs and does not make B-token requests. Student-visible row counts under RLS will not be represented as underlying table counts.

September 14 evidence remains 217 Chromium passes, 550 unit passes and 61 disposable-database checks per complete local pass, plus 322 bounded real-backend checks across two further rounds. These totals are separate from the currently pending hosted rounds.

Historical v1 provenance, independently reviewed positive relational-lesson/standalone-simulation/withdrawal fixtures, natural JWT wall-clock expiry and the original owner-assignment failure's unconfirmed cause remain gaps. Author UI CRUD remains deferred under the accepted scope. No 100% or production-readiness claim is made.
