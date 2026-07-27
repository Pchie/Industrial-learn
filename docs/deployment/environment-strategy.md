# Industrial Learn Environment Strategy

## Purpose

Industrial Learn uses separated development, staging, and production environments so student data, reviewed content, authentication, and database policy verification are not mixed across release stages.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-ARCH-DEPLOY-001: `docs/architecture/deployment-architecture.md`
- IL-TECH-001: `docs/architecture/technology-decisions.md`
- IL-DB-001: `docs/architecture/database-design.md`
- IL-AUTH-001: `docs/architecture/authentication-implementation.md`

## Branch Strategy

| Branch type                   | Purpose                             | Deployment behaviour                        | Protection requirements                                                         |
| ----------------------------- | ----------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| `main`                        | Production-controlled releases only | Manual production deployment after approval | No direct commits, pull requests required, CI required, named approver required |
| `development`                 | Integrated pre-release work         | Staging deployment candidate                | CI required before merge, migration validation required                         |
| `codex/*` or feature branches | Isolated task work                  | No automatic deployment                     | Pull request into `development`                                                 |

Recommended flow:

```text
feature branch -> pull request -> automated checks -> development -> staging verification -> approved main pull request -> manual production deployment
```

No work should be committed directly to `main`.

## Environment Separation

| Environment | Data                                 | Auth                                                            | Database                                         | Logging                            | Intended users                                          |
| ----------- | ------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------- | ------------------------------------------------------- |
| Development | Synthetic local data only            | Local Playwright auth for tests or development Supabase project | Local PostgreSQL or development Supabase project | Developer-focused logs             | Developers                                              |
| Staging     | Synthetic or approved test data only | Dedicated staging Supabase project                              | Dedicated staging PostgreSQL database            | Production-like, privacy-safe logs | Developers, reviewers, release approvers                |
| Production  | Real student and content-review data | Production Supabase project                                     | Production PostgreSQL database                   | Restricted production monitoring   | Students, lecturers, authors, reviewers, administrators |

Production student data must never be copied into development or staging.

## Environment Variables

| Variable                        | Boundary                  | Development                                                  | Staging                           | Production                     |
| ------------------------------- | ------------------------- | ------------------------------------------------------------ | --------------------------------- | ------------------------------ |
| `NODE_ENV`                      | Runtime                   | `development` or `test`                                      | `production`                      | `production`                   |
| `NEXT_PUBLIC_SUPABASE_URL`      | Browser-safe public value | Development project URL                                      | Staging project URL               | Production project URL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe public value | Development anon key                                         | Staging anon key                  | Production anon key            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only secret        | Optional local server operations                             | Restricted server runtime only    | Restricted server runtime only |
| `INDUSTRIAL_LEARN_AUTH_MODE`    | Server runtime control    | `local` only for Playwright with `INDUSTRIAL_LEARN_E2E=true` | Must not be `local`               | Must not be `local`            |
| `INDUSTRIAL_LEARN_E2E`          | Test runtime control      | `true` only for E2E                                          | unset except controlled smoke run | unset                          |

Public variables may appear in browser bundles. Server-only variables must not be logged, documented with real values, copied into screenshots, or exposed to preview deployments unless that deployment requires trusted server behaviour.

## Secrets Policy

- Store real values only in the selected hosting provider secret manager or local untracked `.env.local`.
- Keep `.env.example` empty and safe for version control.
- Rotate any secret that appears in Git, build logs, reports, screenshots, or issue trackers.
- Do not grant service-role keys to pull-request preview deployments by default.
- CI runs `npm run scan:secrets` as a repository-level safety net. It is not a replacement for provider-side secret controls.

## Release Readiness Matrix

| Capability                         | Development            | Staging                                  | Production gate                               |
| ---------------------------------- | ---------------------- | ---------------------------------------- | --------------------------------------------- |
| Formatting, type checking, linting | Required               | Required                                 | Required                                      |
| Unit and integration tests         | Required               | Required                                 | Required                                      |
| Content/source validation          | Required               | Required                                 | Required                                      |
| Migration validation               | Required               | Required                                 | Required                                      |
| Accessibility checks               | Recommended locally    | Required                                 | Required with no critical unresolved findings |
| Smoke tests                        | Recommended locally    | Required                                 | Required evidence from staging                |
| Database migration execution       | Local only             | Required before staging app verification | Manual, backed up, approved                   |
| Backups                            | Optional local exports | Restore rehearsal required               | Backup confirmation required                  |
| Monitoring                         | Developer logs         | Production-like channels                 | Active production monitoring                  |

## Current Provider Status

The architecture proposes a managed MVP deployment, but this repository currently has no accepted hosting-provider configuration and no existing deployment files. Production provider selection remains governed by the existing ADR process.
