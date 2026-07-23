# Industrial Learn CI Pipeline

## Purpose

The CI pipeline verifies repository quality and release readiness without deploying to production.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-ARCH-DEPLOY-001: `docs/architecture/deployment-architecture.md`
- IL-ACCESS-001: `docs/audits/prompt-27-accessibility-report.md`

## Workflow File

CI is defined in `.github/workflows/ci.yml`.

Triggers:

- Pull requests targeting `development`.
- Pull requests targeting `production`.
- Pushes to `development`.

Production deployment is intentionally not part of this workflow.

## Blocking Checks

| Check                                   | Command                            |
| --------------------------------------- | ---------------------------------- |
| Dependency installation using lock file | `npm ci`                           |
| Secret scan                             | `npm run scan:secrets`             |
| Formatting                              | `npm run format:check`             |
| Type checking                           | `npm run typecheck`                |
| Linting                                 | `npm run lint`                     |
| Content and source-reference validation | `npm run validate:content`         |
| Database migration validation           | `npm run validate:migrations`      |
| Unit and integration tests              | `npm run test:unit`                |
| Production build                        | `npm run build`                    |
| Accessibility tests                     | `npm run test:a11y`                |
| Staging smoke tests                     | `npm run test:smoke`               |
| Critical dependency vulnerability gate  | `npm audit --audit-level=critical` |

## Informational Checks

| Check                           | Command                            | Policy                                                                                   |
| ------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| Dependency vulnerability report | `npm audit --audit-level=moderate` | Reported without automatic suppression; release owner must triage moderate/high findings |

## Migration Validation

Migration validation currently uses the existing database schema tests. It verifies version-controlled migration and policy structure but does not apply production migrations.

Production migration execution is a separate manual release step.

## Secret Scanning

`scripts/secret-scan.mjs` scans repository-owned source and documentation files for common committed-secret patterns while allowing empty `.env.example` placeholders.

This scan must fail for obvious real values, but it does not replace:

- Hosting-provider secret controls.
- Pull-request review.
- Emergency secret rotation.
- Provider audit logs.

## E2E Boundary

The Playwright configuration uses `INDUSTRIAL_LEARN_AUTH_MODE=local` and `INDUSTRIAL_LEARN_E2E=true` for automated browser checks. These values are test-only and must not be enabled in staging or production runtime configuration.

## Required Branch Protection

For `development`:

- Require CI before merge.
- Require pull requests for feature branches.
- Prevent force pushes.

For `production`:

- Require pull requests from `development` or a release branch.
- Require CI before merge.
- Require at least one named release approver.
- Require staging smoke evidence.
- Prevent direct commits and force pushes.
