# Production Verification Preflight Report

Date: 2026-08-16

## Executive Verdict

NO-GO for production launch.

CONDITIONAL GO for continuing production setup.

The private production owner record is structurally complete, and a separate
Supabase production project exists. Production is not ready because the Vercel
production project has no Production environment variables, production health
endpoints redirect to Vercel login/protection, production migration tracking has
not been verified, production alert routing has not been acknowledged, and
production backup/restore evidence is incomplete.

No production deployment, migration, database schema change, application feature
change, curriculum change, or secret upload was performed during this
verification.

## Safety Handling

- The completed owner information was moved out of the tracked public template
  into `docs/deployment/production-owner-record.private.md`.
- The private owner record path is ignored by Git.
- The public owner-record template was restored to the committed blank template.
- Duplicate local copy files were removed after verifying they were either
  identical to tracked documentation or matched the committed blank template.
- No private owner names, contact routes, tokens, passwords, database URLs, or
  service-role keys are recorded in this report.

## Repository State

| Check                          | Result                                                          |
| ------------------------------ | --------------------------------------------------------------- |
| Starting branch                | `development`                                                   |
| Verification branch            | `codex/production-verification-preflight`                       |
| Public template safe           | Passed                                                          |
| Private owner record ignored   | Passed                                                          |
| `.env.local` ignored           | Passed                                                          |
| `.env.staging.local` ignored   | Passed                                                          |
| Committed secret scan          | Passed                                                          |
| Product code changed           | No                                                              |
| Database migrations changed    | No                                                              |
| Curriculum content changed     | No                                                              |
| Production credentials printed | No credential values are intentionally recorded in repo reports |

## Private Owner Record Check

The private owner record exists locally and includes all required fields from
`docs/deployment/production-owner-record-template.md`.

| Check                   | Result |
| ----------------------- | ------ |
| Private record present  | Passed |
| Required fields checked | 32     |
| Missing fields          | 0      |
| Blank fields            | 0      |

This verifies structure only. It does not publicly disclose or validate the
identity, authority, or availability of the named owners.

## Supabase Production Check

Safe Supabase project metadata showed a separate production project:

| Item                       | Result                          |
| -------------------------- | ------------------------------- |
| Production project present | Passed                          |
| Production project name    | `Industrial-learn Production`   |
| Production project ref     | `vhjjfapkxytmaakbleee`          |
| Production status          | `ACTIVE_HEALTHY`                |
| Production region          | `eu-west-2`                     |
| PostgreSQL engine          | 17                              |
| PostgreSQL version         | `17.6.1.155`                    |
| Staging project ref        | `lgjujyaclrpaopdabyzg`          |
| Project separation         | Passed; refs and regions differ |

Production is not linked as the local Supabase project. The local repository
remains linked to staging, which is appropriate for avoiding accidental
production operations.

## Supabase Backup Check

| Backup item                 | Result      |
| --------------------------- | ----------- |
| WAL-G metadata              | Present     |
| PITR                        | Not enabled |
| Physical backup list output | Empty       |
| Production restore drill    | Not run     |

Production backup capability is not launch-ready until backup retention,
restore target, restore rehearsal, and post-restore RLS checks are verified.

## Supabase Migration Check

Production migration tracking was not verified.

The available Supabase CLI requires a database URL or password for
`supabase migration list`. No production database credential was available in a
safe, approved operator path during this verification.

Production migrations must not be applied or verified through copied staging
credentials.

## Vercel Production Check

Safe Vercel project metadata showed the production project exists:

| Item                         | Result                                       |
| ---------------------------- | -------------------------------------------- |
| Production project present   | Passed                                       |
| Production project name      | `industrial-learn`                           |
| Production project URL       | `https://industrial-learn-kolobe.vercel.app` |
| Latest inspected deployment  | Ready                                        |
| Deployment target            | `production`                                 |
| Deployment age at check time | 17 days                                      |

However, Vercel Production environment variables for `industrial-learn` were
empty.

| Required production variable    | Vercel Production status |
| ------------------------------- | ------------------------ |
| `NEXT_PUBLIC_APP_ENV`           | Missing                  |
| `APP_BASE_URL`                  | Missing                  |
| `NEXT_PUBLIC_SUPABASE_URL`      | Missing                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Missing                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Missing                  |
| `SUPABASE_PROJECT_REF`          | Missing                  |
| `SUPABASE_DB_URL`               | Missing                  |
| `INDUSTRIAL_LEARN_AUTH_MODE`    | Missing                  |

Do not add these values to Git. They must be added through the Vercel provider
secret manager for the Production environment only.

## Production Health Check

| Endpoint                          | Result                       |
| --------------------------------- | ---------------------------- |
| `/api/health/live` direct status  | 302                          |
| `/api/health/ready` direct status | 302                          |
| Redirect target                   | Vercel login/protection flow |

The production health endpoints are not currently usable as public production
health checks. This may be intentional while production deployment protection is
enabled, but launch readiness requires either production-safe health-check
access or an explicitly approved private monitoring method.

## GitHub Protection Check

Classic branch protection API calls returned `Branch not protected`, but
repository rulesets are active:

| Ruleset                      | Enforcement |
| ---------------------------- | ----------- |
| Protect `development` branch | Active      |
| Protect `main` branch        | Active      |

Future reports should identify rulesets rather than classic branch protection
when describing GitHub protection.

## Remaining Blockers

- Add production Vercel environment variables to the `industrial-learn`
  Production environment through Vercel secret management.
- Confirm production Supabase Auth Site URL and redirect allowlist.
- Verify production migration tracking through the approved private production
  database credential path.
- Apply version-controlled migrations to production only after approval.
- Run production-safe RLS verification using synthetic users.
- Configure and acknowledge production alert routing.
- Confirm backup retention and complete a restore rehearsal into a
  non-production restore target.
- Decide whether production health endpoints should be publicly accessible,
  protected with an approved bypass, or monitored through provider-native
  checks.

## Recommended Next Step

Configure the Vercel `industrial-learn` Production environment variables from
the private owner record and production Supabase project, then rerun production
verification before applying migrations or enabling production launch.
