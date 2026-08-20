# Industrial Learn Production Release Checklist

## Purpose

Production deployment requires explicit approval, release evidence, and rollback readiness. A successful build alone is not enough.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-ARCH-DEPLOY-001: `docs/architecture/deployment-architecture.md`
- IL-SEC-001: `docs/architecture/security-boundaries.md`

## Production Gate

| Gate                        | Required evidence                                                |
| --------------------------- | ---------------------------------------------------------------- |
| CI passed                   | CI run URL for the exact release commit                          |
| Migration validation passed | CI result and migration reviewer sign-off                        |
| Staging smoke tests passed  | Staging checklist result                                         |
| Accessibility gate passed   | No unresolved critical accessibility findings                    |
| Security gate passed        | No unresolved critical security findings                         |
| Dependency gate passed      | No critical `npm audit` findings; moderate/high findings triaged |
| Content gate passed         | Approved content publication state verified                      |
| Backup gate passed          | Backup completed or confirmed current before risky migration     |
| Rollback gate passed        | Rollback owner, trigger, and target version named                |
| Release notes               | User-impacting changes and known limitations documented          |
| Approver                    | Named release approver recorded                                  |

## Production Deployment Steps

1. Confirm the release commit is merged to `main` through a pull request.
2. Confirm no direct commit to `main` was made.
3. Confirm production environment variables are configured in the provider secret manager.
4. Confirm service-role credentials are server-only.
5. Confirm database backup requirements for the release.
6. Apply production migrations only after staging success and approval.
7. Deploy the application artifact for the approved commit.
8. Run production-safe health checks.
9. Monitor errors, authentication failures, and access-denied patterns.
10. Record the release outcome.

## Stop Conditions

Stop production deployment when any of the following occurs:

- CI fails.
- Staging smoke tests fail.
- Migration validation fails.
- Production backup cannot be confirmed when required.
- Critical security or accessibility findings remain unresolved.
- Required secrets are missing or appear in logs.
- RLS verification fails.
- Release approver is not named.

## Release Notes Template

```text
Release:
Commit:
Date:
Approver:
Summary:
Database migrations:
Content changes:
Known limitations:
Rollback target:
Monitoring owner:
```
