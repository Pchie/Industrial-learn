# Student Pilot RC1 Evidence

Date: 2026-08-30

Release identifier: `student-pilot-rc1`

## Reproducibility

| Evidence          | Result                                                              |
| ----------------- | ------------------------------------------------------------------- |
| Release payload   | `78aee56e522c8c300364704c2e6edeb730ce61a8` on `development`         |
| Release branch    | `release/student-pilot-rc1`, pushed to `origin`                     |
| Integration       | PR `#24`, approved and squash-merged to `development`               |
| Post-merge CI     | Run `33304055692`, PASS                                             |
| Dependency audit  | Zero vulnerabilities across production and development dependencies |
| Production branch | `main` unchanged                                                    |

## Local Quality Evidence

| Command                       | Result                            |
| ----------------------------- | --------------------------------- |
| `npm run scan:secrets`        | PASS                              |
| `npm run format:check`        | PASS                              |
| `npm run typecheck`           | PASS                              |
| `npm run lint`                | PASS                              |
| `npm run validate:content`    | PASS, 19 tests                    |
| `npm run validate:migrations` | PASS, 16 tests                    |
| `npm run test:unit`           | PASS, 324 passed and 5 skipped    |
| `npm run build`               | PASS, 33 application routes/pages |
| `npm run test:a11y`           | PASS, 36 tests                    |
| `npm run test:smoke`          | PASS, 5 tests                     |
| `npm run test:e2e`            | PASS, 94 tests                    |
| `npm audit --json`            | PASS, 0 findings                  |

The first local accessibility start was denied permission to bind the test port. The
unchanged suite passed after the permitted local-server retry. The existing Playwright
`NO_COLOR`/`FORCE_COLOR` message is informational.

## Remote CI And Protection

- PR `#24` repository verification: PASS.
- Post-merge `development` repository verification: PASS in 2 minutes 35 seconds.
- The active `development` ruleset blocks deletion and force pushes and requires the
  current `Verify repository` status check.
- The active `main` ruleset blocks deletion and force pushes, requires linear history,
  requires `Verify repository`, requires pull requests, and requires one approval with
  review-thread resolution.
- Neither ruleset has a bypass actor.

## Exact Deployment Evidence

| Item                          | Result                                     |
| ----------------------------- | ------------------------------------------ |
| Vercel project                | `kolobe/industrial-learn-staging`          |
| Deployment ID                 | `dpl_EmYmZtB4dnWLV36jR2RfE28s7z6k`         |
| Target                        | Preview / protected staging                |
| Status                        | Ready                                      |
| Deployment commit             | `78aee56e522c8c300364704c2e6edeb730ce61a8` |
| Runtime environment           | `staging`                                  |
| Configuration check           | `ok`                                       |
| Authentication provider check | `ok`                                       |
| Database check                | `ok`                                       |
| Readiness correlation         | `14d8663a-8860-4ce4-ad66-c2c61621b2b9`     |

GitHub records successful Vercel statuses for both staging and the general preview on the
exact commit. No production deployment was triggered.

## Live Route Matrix

| Live check                              | Result                                               |
| --------------------------------------- | ---------------------------------------------------- |
| Homepage and curriculum                 | PASS                                                 |
| Draft/source-required lesson direct URL | Hidden with generic not-found response               |
| Visible approved published lesson       | BLOCKED: none exists                                 |
| Simulation catalogue                    | Honest empty reviewed-content state                  |
| Unapproved simulation direct URL        | Hidden with generic not-found response               |
| Student A dashboard                     | Own data only; honest new-student state              |
| Student B dashboard                     | Own data only; honest new-student state              |
| Student query-parameter impersonation   | Denied; server identity remained Student A           |
| Content author workspace                | Allowed for author                                   |
| Content author review/student routes    | Denied                                               |
| Engineering review workspace            | Allowed for reviewer                                 |
| Reviewer author/student routes          | Denied                                               |
| Hidden assessment evidence              | Not exposed                                          |
| Sign-out and protected-route redirect   | PASS                                                 |
| Password-reset request                  | Accepted without account disclosure or rate limiting |
| Browser runtime errors                  | None observed                                        |

## Staging Database Evidence

- Exact staging reference `lgjujyaclrpaopdabyzg` was verified before every privileged
  query; the known production reference was excluded.
- Live ledger: `0001`-`0009`, `0011`, `0012`.
- Migration `0010` is intentionally held because no canonical Bernoulli database parent
  exists and its content is not approved.
- Four temporary Prompt 45 users were used for the authenticated matrix.
- Cleanup deleted all four users.
- Follow-up counts: zero matching `auth.users` and zero matching `public.profiles`.
- No real student data or production service was used.

## Evidence Boundary

This evidence establishes a reproducible, protected staging candidate and fail-closed
content delivery. It does not create an engineering review record or authorise a lesson
for student publication.
