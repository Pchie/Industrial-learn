# Student Pilot RC2 Evidence

Date: 2026-08-30

Release identifier: `student-pilot-rc2`

## Reproducibility

| Evidence                | Result                                                                |
| ----------------------- | --------------------------------------------------------------------- |
| Application payload     | `343f14f92f60bbc20a57dec1bb4d8266513fdd2c`                            |
| Integration branch      | `development`, exact match with `origin/development` before branching |
| Release evidence branch | `release/student-pilot-rc2`                                           |
| GitHub CI               | Run `33310980671`, PASS on the payload commit                         |
| Vercel staging status   | SUCCESS on the payload commit                                         |
| Dependency audit        | Zero vulnerabilities across 247 dependencies                          |
| Production branch       | Unchanged                                                             |

## Local Quality Evidence

| Command                       | Result                         |
| ----------------------------- | ------------------------------ |
| `npm run scan:secrets`        | PASS                           |
| `npm run format:check`        | PASS                           |
| `npm run typecheck`           | PASS across all workspaces     |
| `npm run lint`                | PASS                           |
| `npm run validate:content`    | PASS, 29 tests                 |
| `npm run validate:migrations` | PASS, 16 tests                 |
| `npm run test:unit`           | PASS, 340 passed and 5 skipped |
| `npm run build`               | PASS, 33 routes/pages          |
| `npm run test:a11y`           | PASS, 36 tests                 |
| `npm run test:smoke`          | PASS, 5 tests                  |
| `npm run test:e2e`            | PASS, 94 tests                 |
| `npm audit --json`            | PASS, zero findings            |

The first accessibility attempt could not bind the local test port under filesystem
sandboxing. The unchanged suite passed after receiving local-server permission. The
existing `NO_COLOR` and `FORCE_COLOR` warning is informational.

## GitHub And Branch Safety

- The `development` ruleset is active, blocks deletion and force pushes, and requires the
  strict `Verify repository` status check.
- The `main` ruleset is active, blocks deletion and force pushes, requires linear history,
  requires `Verify repository`, requires pull requests, requires one approval, and
  requires review-thread resolution.
- Neither ruleset has a bypass actor.
- The GitHub branch-protection REST endpoint returns no legacy protection object; the
  active repository rulesets are the authoritative evidence.

## Exact Deployment Evidence

| Item                     | Result                                                         |
| ------------------------ | -------------------------------------------------------------- |
| Vercel project           | `kolobe/industrial-learn-staging`                              |
| Vercel deployment        | `DgGdoxfu7tGiNnUEVysWdFyVNgZ8`                                 |
| GitHub deployment record | `6166509559`                                                   |
| Environment              | `Preview - industrial-learn-staging`, protected staging        |
| Deployment status        | SUCCESS                                                        |
| Deployment commit        | `343f14f92f60bbc20a57dec1bb4d8266513fdd2c`                     |
| Exact URL                | `https://industrial-learn-staging-aeeanzji7-kolobe.vercel.app` |
| Production deployment    | Not triggered                                                  |

The ignored local staging environment passed validation without printing values. The
confirmed Supabase reference is `lgjujyaclrpaopdabyzg`; the known production reference was
explicitly excluded.

## Deployed Public Route Matrix

| Check                                | Result                                       |
| ------------------------------------ | -------------------------------------------- |
| Homepage                             | PASS                                         |
| Curriculum catalogue                 | PASS                                         |
| Sign-in route                        | PASS                                         |
| Draft Basic Fluid Pressure URL       | Hidden with generic not-found response       |
| Review-required hydraulic lesson URL | Hidden with generic not-found response       |
| Simulation catalogue                 | PASS, honest zero-approved-simulations state |
| Unapproved hydraulic simulation URL  | Hidden with generic not-found response       |
| Visible approved published lesson    | BLOCKED: no approved review record exists    |

## Live Staging Database Evidence

- Migration ledger: `0001`-`0009`, `0011`, and `0012`.
- RLS enabled: 36 of 36 public application tables.
- Policies: 80.
- `PUBLIC` table grants: zero.
- Unapproved simulations stored as `published`: zero.
- Assessment and simulation completion functions are PostgreSQL-owned,
  `security definer`, denied to `anon` and `authenticated`, and executable by
  `service_role`.
- The repository live RLS integration suite passed 5 of 5 checks with two temporary
  staging-only students.
- Cleanup passed: zero matching temporary auth users and zero matching profiles.

The live integration covered anonymous private-table denial, own-profile visibility,
cross-student profile denial, hidden answer choices, and private question-explanation
denial. The larger Prompt 44 matrix remains the evidence for lecturer, author, reviewer,
atomic completion, and rollback behavior because those database contracts did not change
after RC1.

## Evidence Boundary

This evidence certifies the current application payload, protected staging deployment,
local and remote quality, public fail-closed delivery, and focused live RLS behavior. It
does not create an engineering approval, make a lesson public, or authorise a controlled
student pilot.
