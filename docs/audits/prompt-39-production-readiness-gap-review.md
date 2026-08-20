# Prompt 39 Production Readiness Gap Review

Date: 2026-08-12

## Executive Verdict

NO-GO for production deployment.

GO for continued staging hardening and production-control preparation.

Industrial Learn has a verified staging release candidate and strong production
release documentation, but production must not be deployed until the remaining
live controls are configured, verified, and recorded.

## Scope

This review covered production readiness gaps only. No production deployment was
triggered, no Supabase production project was modified, no schema changes were
created, and no application features or engineering content were changed.

## Evidence Inspected

- `AGENTS.md`
- `README.md`
- `.github/workflows/ci.yml`
- `.gitignore`
- `vercel.json`
- `.vercel/project.json`
- `docs/audits/prompt-38-staging-release-candidate-report.md`
- `docs/deployment/environment-strategy.md`
- `docs/deployment/production-release-checklist.md`
- `docs/deployment/database-migration-runbook.md`
- `docs/deployment/backup-and-restore-plan.md`
- `docs/deployment/rollback-runbook.md`
- `docs/deployment/incident-response.md`
- `docs/operations/monitoring-architecture.md`
- `docs/security/staging-web-security.md`
- `docs/security/supabase-staging-security.md`
- GitHub repository metadata, branch state, rulesets, deployment records, and CI
  run history through read-only GitHub CLI/API checks

## Verified Current State

| Area              | Verified state                                                                                                                                                                     | Verdict              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Repository branch | Local branch is `development`, tracking `origin/development`. `main` exists locally and remotely.                                                                                  | PASS                 |
| Default branch    | GitHub repository default branch is `development`.                                                                                                                                 | ACCEPTED FOR STAGING |
| Latest commit     | `569f6a80e478fbf0eef0989a1761b3aa3734db1c` on `development`.                                                                                                                       | PASS                 |
| Working tree      | Only pre-existing untracked `docs/proposals/` remains. It was not changed by this review.                                                                                          | CONDITIONAL PASS     |
| Main protection   | Active GitHub ruleset named `Protect main branch` applies to `refs/heads/main`.                                                                                                    | PASS                 |
| Development guard | GitHub branch endpoint reports `development` is not protected.                                                                                                                     | GAP                  |
| Main ruleset      | Requires status check `Verify repository`, strict up-to-date checks, pull request, two approvals, thread resolution, linear history, no deletion, and no non-fast-forward updates. | PASS                 |
| CI history        | Latest observed `development` CI run `31398287571` passed for commit `569f6a80e478fbf0eef0989a1761b3aa3734db1c`.                                                                   | PASS                 |
| Production deploy | `vercel.json` disables Git deployment for `main`; GitHub deployment records reviewed were preview environments, not production.                                                    | PASS                 |
| Staging deploy    | Staging release candidate passed in Prompt 38 with health checks and log-redaction verification.                                                                                   | PASS                 |
| Secret exclusion  | `.gitignore` excludes `.env`, `.env.*`, `.vercel/`, build outputs, reports, local editor files, and generated dependency folders.                                                  | PASS                 |
| Tracked secrets   | Tracked-file pattern check did not show env files, private keys, build outputs, dependency folders, or report folders.                                                             | PASS                 |

## Branch Protection Gap Review

### Verified Protection

`main` is protected by an active GitHub ruleset:

- Target: `refs/heads/main`
- Required status check: `Verify repository`
- Strict required status checks: enabled
- Pull request required
- Required approving reviews: 2
- Required review thread resolution: enabled
- Required linear history: enabled
- Branch deletion blocked
- Non-fast-forward updates blocked

The legacy branch-protection endpoint returns `404 Branch not protected` because
protection is implemented through a ruleset, not the older branch-protection API.
The ruleset evidence is therefore the authoritative protection evidence for
`main`.

### Remaining Branch Gap

`development` is not protected according to the GitHub branch endpoint. This is
not a production deployment blocker by itself while `main` remains protected and
production deployment is disabled, but it is a staging-quality risk because
`development` is the integration and staging branch.

Recommended control:

- Add a `development` ruleset requiring the `Verify repository` status check
  before updates land through normal pull-request flow.
- Block deletion and non-fast-forward updates for `development`.
- Require pull requests or an explicitly documented automation exception for
  controlled release-engineering operations.

## Production Supabase Separation Gap Review

### Verified Staging State

Repository documentation requires dedicated staging and production Supabase
projects. Staging is documented as using a dedicated Supabase staging project
with synthetic or approved test data only.

### Production Gaps

Production Supabase is not ready until the following are completed and recorded:

- Dedicated production Supabase project exists and is separate from staging.
- Production auth site URL and redirect allowlist are configured.
- Production anon key and service-role key are stored only in the production
  hosting secret manager.
- Production `SUPABASE_SERVICE_ROLE_KEY` is available only to trusted server-side
  contexts.
- Production `SUPABASE_DB_URL` is restricted to approved migration operations.
- Production database starts from version-controlled migrations only.
- Production RLS verification is run and recorded before launch.
- Production seed strategy excludes test users, test assessment attempts, and
  staging-only records.

Verdict: GAP. Do not connect real student data until this separation is proven.

## Backup And Restore Gap Review

### Existing Documentation

The repository contains a backup and restore plan covering database backups,
content storage backup, restore testing, RPO, RTO, and ownership.

### Production Gaps

Production backup/restore is not ready until the following are proven:

- Production backup schedule is enabled in the selected Supabase plan.
- Pre-migration backup procedure is rehearsed.
- Restore target is selected and documented.
- Restore drill is completed before first student launch.
- RLS and private-student-data boundaries are verified after restore.
- Backup retention is reconciled with the final privacy and data-retention
  policy.

Verdict: GAP. Backup documentation exists, but restore proof is still missing.

## Production Monitoring Gap Review

### Verified Staging State

Prompt 38 verified staging health checks and redacted structured operational
events using Vercel runtime logs and Supabase staging logs. No production
monitoring provider was configured.

### Production Gaps

Production monitoring is not ready until the following are decided and verified:

- Production monitoring destination is selected.
- Alert routing destination is configured.
- Incident owner receives and acknowledges a test alert.
- Privacy-safe redaction is verified against production monitoring settings.
- Error-rate, auth-failure, RLS-denial, assessment-persistence, and
  simulation-persistence alert thresholds are defined.
- The staging-only monitoring probe is not promoted to production without a
  separate approved design.

Verdict: GAP. Staging observability exists; production alerting is not yet
operational.

## Incident Ownership Gap Review

### Existing Documentation

The incident response and rollback runbooks define severity levels, response
steps, rollback triggers, and communication groups.

### Production Gaps

Incident response is not production-ready until named ownership is recorded:

- Release owner
- Incident owner
- Security reviewer
- Database/Supabase owner
- Vercel/project owner
- Content or education owner for student-facing content incidents
- Escalation path and expected response window

Verdict: GAP. Roles are described, but named accountable owners are not yet
recorded for production.

## Deployment Environment Gap Review

`vercel.json` currently uses:

- `framework`: `nextjs`
- `installCommand`: `npm ci`
- `buildCommand`: `npm run build`
- `outputDirectory`: `apps/web/.next`
- `git.deploymentEnabled.development`: `true`
- `git.deploymentEnabled.main`: `false`

This is correct for staging-only readiness. It is also a deliberate production
blocker: production deployment from `main` is disabled.

GitHub deployment records reviewed during this prompt showed preview
deployments for `industrial-learn-staging` and `industrial-learn`. They did not
show a production deployment, but the duplicate preview naming should be cleaned
up before production to avoid ambiguous ownership and environment reporting.

Verdict: PASS for no-production-deploy safety; GAP for production deployment
clarity.

## Go / No-Go Criteria

Production remains NO-GO until every required criterion below is met.

| Criterion                                          | Required for production | Current status                  |
| -------------------------------------------------- | ----------------------- | ------------------------------- |
| `main` protected                                   | Yes                     | PASS                            |
| `development` protected                            | Yes                     | GAP                             |
| Latest release commit CI passed                    | Yes                     | PASS for current staging commit |
| Production deployment disabled until approval      | Yes                     | PASS                            |
| Dedicated production Supabase project              | Yes                     | NOT VERIFIED                    |
| Production env vars configured in provider secrets | Yes                     | NOT VERIFIED                    |
| Production RLS verification passed                 | Yes                     | NOT RUN                         |
| Production backup enabled                          | Yes                     | NOT VERIFIED                    |
| Restore drill completed                            | Yes                     | NOT RUN                         |
| Production monitoring selected                     | Yes                     | NOT DECIDED                     |
| Alert routing tested                               | Yes                     | NOT RUN                         |
| Incident owners named                              | Yes                     | GAP                             |
| Rollback target named                              | Yes                     | GAP for production release      |
| Production release approver named                  | Yes                     | GAP for production release      |
| Staging release candidate passed                   | Yes                     | PASS                            |
| Production-safe smoke checks ready                 | Yes                     | PARTIAL; health checks exist    |
| Production content/data seed policy approved       | Yes                     | GAP                             |

## Remaining Risks

- `development` branch lacks verified protection.
- Production Supabase project separation has not been verified.
- Production backup and restore have not been rehearsed.
- Production monitoring and alert routing are not yet selected or connected.
- Incident ownership is documented by role, but not assigned to named people.
- Duplicate preview deployment environment names may confuse release evidence.
- `README.md` still contains early-foundation wording that no longer reflects
  all implemented staging/authentication/persistence work.

## Recommended Next Prompt

Configure and verify GitHub protection for the `development` branch without
changing application features or deploying production. Require CI before normal
updates, block deletion and non-fast-forward updates, document any automation
exception, then create an audit report confirming `main` and `development`
branch safety.
