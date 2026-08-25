# Production Remaining Gates Report

Date: 2026-08-20

## Executive Verdict

CONDITIONAL PASS for protected production infrastructure verification.

NO-GO for public production launch.

The remaining production-gate work verified that the intended production Vercel
project is reachable through the approved protected-access path, that the
production Supabase schema and RLS can be backed up and restored into an
isolated PostgreSQL target, and that production temporary smoke-test identities
were cleaned up.

Public launch is still blocked because the production database intentionally has
no student-facing seed content, the live deployed assessment attempt cannot run
without approved production content, and the private production owner/alert
record still appears incomplete in the checked private file.

## Scope

Completed:

- Checked the repository state before documentation changes.
- Confirmed work is on a non-`main` branch.
- Verified production Supabase backup metadata without printing credentials.
- Created a logical production PostgreSQL backup.
- Restored that backup into an isolated local PostgreSQL target.
- Verified restored table, RLS, policy, role, permission, and transaction
  function counts.
- Ran restored RLS behavior checks for student visibility, hidden answers,
  review records, content versions, own attempts, cross-student denial, and
  reviewer student-data isolation.
- Confirmed the intended production Vercel project has the expected production
  runtime variable names.
- Confirmed protected production routes return 200 through the approved Vercel
  bypass header path.
- Attempted a live deployed sign-up/dashboard smoke test with disposable
  production identity cleanup.
- Removed scoped temporary backup, restore, and Vercel environment artifacts
  from `/tmp`.

Not completed:

- No production content seed was added.
- No live production assessment attempt was completed.
- No provider alert acknowledgement was proven from Vercel or Supabase.
- No production protection was disabled.
- No migration, schema, application feature, curriculum content, or engineering
  equation was changed.

## Production Backup And Restore Evidence

| Gate                         | Result                                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| Production project marker    | `vhjjfapkxytmaakbleee` confirmed before database operations           |
| Staging marker exclusion     | `lgjujyaclrpaopdabyzg` rejected before database operations            |
| Supabase backup metadata     | WAL-G enabled; PITR disabled; no physical backup list returned by CLI |
| Logical backup               | Created with `pg_dump` to a scoped local temporary directory          |
| Logical backup size          | 278,397 bytes                                                         |
| Backup start                 | 2026-08-20T20:55:00.594Z                                              |
| Backup end                   | 2026-08-20T20:55:39.806Z                                              |
| Restore target               | Isolated local PostgreSQL cluster                                     |
| Restore start                | 2026-08-20T20:57:02.359Z                                              |
| Restore end                  | 2026-08-20T20:57:12.361Z                                              |
| Restore verification         | Passed                                                                |
| Temporary data-bearing files | Removed after verification                                            |

## Restored Database Verification

| Check                                  | Result |
| -------------------------------------- | -----: |
| Migration records                      |      8 |
| Public tables                          |     36 |
| RLS-enabled public tables              |     36 |
| Policies                               |     80 |
| Roles                                  |      5 |
| Permissions                            |     11 |
| Hardened answer-choice policy present  | Passed |
| Old answer-choice policy absent        | Passed |
| Assessment completion function present | Passed |
| Simulation completion function present | Passed |

## Restored RLS Behavior

| Behavior                                                    | Result |
| ----------------------------------------------------------- | ------ |
| Approved published lesson visible to student                | Passed |
| Draft lesson hidden from student                            | Passed |
| Hidden assessment answers hidden from student               | Passed |
| Content versions hidden from student                        | Passed |
| Review records hidden from student                          | Passed |
| Student can read own attempt                                | Passed |
| Student B cannot read Student A attempt                     | Passed |
| Engineering reviewer cannot read student attempt by default | Passed |
| Engineering reviewer can read review record                 | Passed |

Local-only grants were applied to the isolated restore target so restricted-role
RLS checks could be executed against the restored database. These grants were
not applied to production.

## Production Vercel Evidence

| Check                             | Result                                       |
| --------------------------------- | -------------------------------------------- |
| Intended Vercel project           | `industrial-learn`                           |
| Canonical production URL          | `https://industrial-learn-kolobe.vercel.app` |
| Deployment protection             | Kept enabled                                 |
| Approved bypass method            | Header-only protected-access path            |
| `/auth/sign-up`                   | 200                                          |
| `/auth/sign-in`                   | 200                                          |
| `/dashboard`                      | 200                                          |
| `/api/health/live`                | 200                                          |
| `/api/health/ready`               | 200                                          |
| Production runtime variable names | Seven expected names present                 |

The checked production Vercel variable names were:

- `APP_BASE_URL`
- `INDUSTRIAL_LEARN_AUTH_MODE`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_SERVICE_ROLE_KEY`

Secret values were not printed or stored.

## Live Deployed Smoke Result

| Smoke check                                        | Result                             |
| -------------------------------------------------- | ---------------------------------- |
| Disposable production account cleanup before smoke | Passed                             |
| Protected sign-up route reachable                  | Passed                             |
| Sign-up/dashboard smoke                            | Blocked by deployed app auth error |
| Production auth user created                       | No                                 |
| Production profile created                         | No                                 |
| Production profile role created                    | No                                 |
| Disposable production account cleanup after smoke  | Passed                             |
| Remaining disposable `prod-smoke-*` users          | None found                         |

The production database currently contains no modules, lessons, approved
lessons, assessments, simulations, profiles, or profile-role rows. Because of
that, a live deployed production assessment attempt cannot be completed without
adding approved production content and a production student identity. No content
was added during this gate.

## Private Owner And Alert Evidence

| Check                                  | Result                      |
| -------------------------------------- | --------------------------- |
| Private owner record path exists       | Passed                      |
| Required owner fields completed        | Failed by placeholder check |
| Critical/high alert keywords present   | Passed                      |
| Provider alert route acknowledged live | Not proven                  |
| Provider alert destination tested      | Not proven                  |

The checked private record path was
`docs/deployment/production-owner-record.private.md`. The file is ignored by
Git and was not printed. The completion check found 0 of 22 required operational
ownership/alert fields complete because the checked values still matched
placeholder-style wording.

## Temporary Artifact Cleanup

Removed after verification:

- Scoped production logical backup directory under `/tmp`.
- Scoped local PostgreSQL restore target under `/tmp`.
- Scoped Vercel environment pull placeholder file under `/tmp`.
- Scoped temporary path marker files under `/tmp`.

## Local Quality Gates

| Command                       | Result                                                                     |
| ----------------------------- | -------------------------------------------------------------------------- |
| `npm run scan:secrets`        | Passed                                                                     |
| `npm run format:check`        | Passed                                                                     |
| `npm run typecheck`           | Passed                                                                     |
| `npm run lint`                | Passed                                                                     |
| `npm run validate:content`    | Passed: 1 file, 7 tests                                                    |
| `npm run validate:migrations` | Passed: 1 file, 13 tests                                                   |
| `npm run test:unit`           | Passed: 25 files passed, 1 skipped; 175 tests passed, 4 skipped            |
| `npm run build`               | Passed                                                                     |
| Initial `npm run test:smoke`  | Environment failure: sandbox blocked local server bind to `127.0.0.1:3000` |
| Final `npm run test:smoke`    | Passed: 5 tests                                                            |
| `npm run test:e2e`            | Passed: 69 tests                                                           |

The E2E suite includes one intentional simulated dashboard database failure
test. The server log emitted the expected simulated error while the test itself
passed and verified the safe user-facing error state.

## Remaining Production Gates

| Gate                                        | Verdict     | Required next action                                                    |
| ------------------------------------------- | ----------- | ----------------------------------------------------------------------- |
| Production schema and RLS restore proof     | PASS        | Keep evidence with release record                                       |
| Production health routes through protection | PASS        | Add to monitoring evidence                                              |
| Production Vercel protection decision       | PASS        | Keep protection enabled until public launch decision                    |
| Live production auth/dashboard smoke        | CONDITIONAL | Resolve deployed sign-up/auth error and rerun disposable smoke          |
| Live production assessment attempt          | BLOCKED     | Add approved production seed content through the approved process first |
| Private owner record                        | BLOCKED     | Replace placeholder values in the ignored private file                  |
| Alert routing acknowledgement               | BLOCKED     | Configure/test provider alert route to private named owners             |
| Public production launch                    | NO-GO       | Complete all blocked gates first                                        |

## Recommended Next Prompt

Act as a senior production release engineer and application-security engineer.
Resolve the production deployed auth smoke blocker without changing product
features or curriculum content, then rerun a disposable production
sign-up/dashboard smoke test through the protected Vercel deployment. Verify
that no synthetic users remain after cleanup, confirm the private owner record is
complete without exposing values, and update the production launch decision
register with a final go/no-go verdict.
