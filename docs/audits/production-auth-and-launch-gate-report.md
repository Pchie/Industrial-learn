# Production Auth And Launch Gate Report

Date: 2026-08-24

## Executive Verdict

CONDITIONAL PASS for protected production auth runtime.

NO-GO for public production launch.

The production deployment is reachable through the approved Vercel
protected-access header path, production readiness health is passing, and a
disposable production Auth user created through a trusted admin path could sign
in through the deployed application. The deployed application then created the
student profile and student role through its server-only Supabase path.

Public production launch remains blocked because public sign-up is currently
rate-limited by Supabase email limits, the production database has no approved
student-facing content for a live assessment attempt, and the private owner and
provider alert-routing evidence is still incomplete.

## Scope

Completed:

- Rechecked the production Vercel health routes through the approved
  protected-access header.
- Re-ran the disposable production sign-up smoke with cleanup.
- Diagnosed the Supabase Auth provider response directly with the production
  anon key held only in memory.
- Created a disposable production Auth user through a service-role admin path
  held only in memory.
- Signed that disposable user into the deployed production application.
- Verified the deployed application reached `/dashboard`.
- Verified the deployed application created a student profile and profile role.
- Removed the disposable Auth user, identity, profile, and profile-role rows.
- Rechecked that no disposable production smoke users or profiles remain.
- Rechecked the private owner record completion status without printing values.

Not completed:

- No production content seed was added.
- No production assessment attempt was completed.
- No Supabase Auth rate limit was weakened.
- No provider alert route was configured or acknowledged.
- No production protection was disabled.
- No application feature, curriculum content, engineering equation, database
  schema, or migration was changed.

## Production Health Evidence

| Route               | Status | Result |
| ------------------- | -----: | ------ |
| `/api/health/live`  |    200 | Passed |
| `/api/health/ready` |    200 | Passed |

Readiness checks returned:

| Check          | Result                                     |
| -------------- | ------------------------------------------ |
| Configuration  | `ok`                                       |
| Auth provider  | `ok`                                       |
| Database       | `ok`                                       |
| Environment    | `production`                               |
| Release commit | `26a2022c4a04761abe6c6ca8611d849b6794a615` |

## Public Sign-Up Diagnostic

| Check                            | Result                |
| -------------------------------- | --------------------- |
| Protected sign-up page reachable | Passed                |
| Form enabled                     | Passed                |
| Sign-up form POST                | 303 redirect          |
| App redirect error code          | `invalid_credentials` |
| Auth users created               | 0                     |
| Profiles created                 | 0                     |
| Profile roles created            | 0                     |
| Disposable cleanup               | Passed                |

Direct Supabase Auth diagnostic using the production anon key in memory returned:

| Check                        | Result                    |
| ---------------------------- | ------------------------- |
| Supabase Auth sign-up status | 429                       |
| Auth user returned           | No                        |
| Session returned             | No                        |
| Provider message class       | Email rate limit exceeded |
| Disposable cleanup           | Passed                    |

Interpretation: the deployed app maps the provider sign-up failure to the safe
public `invalid_credentials` code. The underlying provider cause for this smoke
run was Supabase email rate limiting. Production rate limits were not weakened.

## Deployed Sign-In And Dashboard Smoke

| Check                               | Result       |
| ----------------------------------- | ------------ |
| Disposable admin-created Auth user  | Passed       |
| Deployed sign-in route reached      | Passed       |
| Final deployed app route            | `/dashboard` |
| App error code                      | None         |
| Auth user count after dashboard     | 1            |
| Profile count after dashboard       | 1            |
| Profile-role count after dashboard  | 1            |
| Cleanup removed profile role        | 1            |
| Cleanup removed profile             | 1            |
| Cleanup removed identity            | 1            |
| Cleanup removed Auth user           | 1            |
| Remaining disposable users/profiles | 0            |

Interpretation: production sign-in, server-side session resolution, server-only
profile creation, and student-role assignment work when a valid production Auth
user exists. Public self-service sign-up remains blocked for smoke testing until
the Supabase email rate limit window clears or a reviewed non-email-sending test
method is approved.

## Private Owner And Alert Evidence

| Check                                 | Result     |
| ------------------------------------- | ---------- |
| Private owner record exists           | Passed     |
| Required private fields complete      | Failed     |
| Required fields complete              | 0 of 22    |
| Critical/high alert keywords present  | Passed     |
| Provider alert route configured       | Not proven |
| Provider alert acknowledgement tested | Not proven |

The private file was checked only for field completion. Private values were not
printed. Because the checked file still matches placeholder-style wording, the
launch ownership and alert-routing gates remain blocked.

## Local Quality Gates

| Command                       | Result                                                          |
| ----------------------------- | --------------------------------------------------------------- |
| `npm run scan:secrets`        | Passed                                                          |
| `npm run format:check`        | Passed                                                          |
| `npm run typecheck`           | Passed                                                          |
| `npm run lint`                | Passed                                                          |
| `npm run validate:content`    | Passed: 1 file, 7 tests                                         |
| `npm run validate:migrations` | Passed: 1 file, 13 tests                                        |
| `npm run test:unit`           | Passed: 25 files passed, 1 skipped; 175 tests passed, 4 skipped |
| `npm run build`               | Passed                                                          |
| `npm run test:smoke`          | Passed: 5 tests                                                 |
| `npm run test:e2e`            | Passed: 69 tests                                                |

The E2E suite includes one intentional simulated dashboard database failure
test. The server log emitted the expected simulated error while the test passed
and verified the safe user-facing error state.

## Remaining Launch Gates

| Gate                               | Verdict     | Reason                                                                        |
| ---------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| Production health                  | PASS        | Live and ready routes passed through protected access                         |
| Production sign-in/dashboard       | PASS        | Disposable admin-created Auth user reached dashboard and created profile/role |
| Production public sign-up          | CONDITIONAL | Blocked by Supabase email rate limit during smoke                             |
| Production live assessment attempt | BLOCKED     | No approved production lesson/assessment seed content exists                  |
| Private owner record               | BLOCKED     | Placeholder-style private fields remain                                       |
| Alert routing acknowledgement      | BLOCKED     | No provider alert acknowledgement evidence                                    |
| Public launch                      | NO-GO       | Blocked gates remain                                                          |

## Recommended Next Step

Complete the private production owner record with real restricted values, then
configure provider-native Vercel/Supabase alert routing to those private owner
routes and record a test acknowledgement. After the Supabase email rate limit
window clears, rerun public sign-up once. Add only approved production seed
content through a reviewed seed plan before attempting a live production
assessment.
