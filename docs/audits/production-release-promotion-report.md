# Production Release Promotion Report

Date: 2026-08-20

## Executive Verdict

CONDITIONAL PASS for production release promotion.

NO-GO for general production launch.

The current `development` release candidate was promoted to the
production-controlled `main` branch through a pull request, `main` CI passed,
and the promoted commit was deployed explicitly to the Vercel production project
`industrial-learn`. Protected production health and sign-in checks now pass
through the existing Vercel automation bypass.

This task did not approve use with real student data. Production launch remains
blocked by the database, RLS, backup/restore, alert-routing, and final owner
acknowledgement gates listed below.

## Source Release Candidate

| Item                                  | Value                                                  |
| ------------------------------------- | ------------------------------------------------------ |
| Source branch                         | `development`                                          |
| Source commit                         | `ad77709bd239e1c32292862699707c2da63e2c7d`             |
| Source evidence                       | `docs/audits/production-bypass-verification-report.md` |
| Target branch                         | `main`                                                 |
| Production Vercel project             | `industrial-learn`                                     |
| Staging Vercel project linked locally | `industrial-learn-staging`                             |
| Main promotion commit                 | `26a2022c4a04761abe6c6ca8611d849b6794a615`             |

## Promotion Plan

1. Open a pull request from the approved `development` release candidate to
   `main`.
2. Require GitHub CI to pass on the production-control pull request.
3. Merge through GitHub; do not commit directly to `main`.
4. Deploy production explicitly to the Vercel `industrial-learn` project.
5. Verify protected production routes using the existing automation bypass
   without printing or storing bypass secret material.
6. Record production health and auth route results.

## Guardrails

- No production database migration is applied by this task.
- No Supabase data, RLS policy, curriculum content, engineering equation, or
  application feature is changed by this task.
- No secret value is written to Git.
- The local Vercel project link remains the staging project; production
  deployment must explicitly target `industrial-learn`.
- Production remains `NO-GO` until database migration tracking, production RLS,
  backup/restore, alert routing, and owner acknowledgement gates are complete.

## Results

| Check                                 | Result                                                          |
| ------------------------------------- | --------------------------------------------------------------- |
| `main` approval requirement corrected | Passed; GitHub ruleset now requires one approving review        |
| PR from `development` to `main`       | Passed; PR #16 merged normally, without administrator bypass    |
| `main` post-merge CI                  | Passed; GitHub Actions run `32408889449` completed successfully |
| Production deployment target          | Passed; explicit project `industrial-learn` was used            |
| Production deployment ID              | `dpl_3Y28R6HveZ7YoFbRPqrLn9MdRZcW`                              |
| Production deployment URL             | `https://industrial-learn-o4abgbung-kolobe.vercel.app`          |
| Production alias                      | `https://industrial-learn-kolobe.vercel.app`                    |
| Production alias status               | Passed; alias points to the ready deployment                    |
| Bypass secret printed                 | No                                                              |
| Response bodies printed               | No                                                              |
| Protected `/api/health/live`          | Passed; HTTP 200 JSON                                           |
| Protected `/api/health/ready`         | Passed; HTTP 200 JSON                                           |
| Protected `/auth/sign-in`             | Passed; HTTP 200 HTML sign-in page                              |

## Remaining Risks

- Production migration tracking still requires production-specific evidence.
- Production migrations have not been applied by this task.
- Production-safe RLS verification with synthetic users remains required after
  approved production migrations.
- Production backup retention and restore rehearsal remain required before real
  student data.
- Production alert routing must be configured and acknowledged by the private
  owner route.
- The production deployment remains behind Vercel protection; this is acceptable
  for pre-launch verification but is not a public launch state.
- The local workspace remains linked to the staging Vercel project, so future
  production deploys must continue to explicitly target `industrial-learn`.

## Recommended Next Step

Apply and verify production database migrations through the approved production
runbook, then run production-safe RLS verification with synthetic users. Do not
enter real student data until migration tracking, RLS, backup/restore, and alert
routing all have passing evidence.
