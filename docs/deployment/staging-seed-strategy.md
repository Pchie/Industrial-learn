# Staging Seed Strategy

## Purpose

Staging seed data supports authentication, RLS, ownership, role, assessment, simulation, and governance verification without using real student data.

## Rules

- Use synthetic test records only.
- Do not place passwords in Git.
- Do not run staging seed scripts automatically in production.
- Keep seed operations idempotent where possible.
- Keep staging users clearly labelled as non-production.
- Remove staging users and records when a staging reset is required.

## Suggested Staging Accounts

| Role                 | Email pattern                    | Purpose                                |
| -------------------- | -------------------------------- | -------------------------------------- |
| Student A            | `staging.student.a@example.test` | Normal student verification            |
| Student B            | `staging.student.b@example.test` | Cross-student ownership denial         |
| Lecturer             | `staging.lecturer@example.test`  | Authorised cohort access               |
| Content author       | `staging.author@example.test`    | Draft authoring workflow               |
| Engineering reviewer | `staging.reviewer@example.test`  | Review queue and approval checks       |
| Administrator        | `staging.admin@example.test`     | Controlled administrative verification |

Passwords must be generated and stored only in the approved staging secret manager.

## Seed Process

1. Apply migrations and policies to the dedicated staging database.
2. Apply `database/seed/0001_roles_permissions.sql`.
3. Create authorised Supabase Auth users in the staging project.
4. Supply the auth user IDs to `database/seed/0002_staging_synthetic_profiles.template.sql` at execution time.
5. Verify each seeded profile has only the intended role.
6. Verify Student A cannot access Student B private records.
7. Verify reviewers cannot access student private data unless they also have an explicitly authorised role.

Before running staging seeds, validate the staging environment from a secure, untracked env file:

```bash
STAGING_ENV_FILE=/secure/path/to/staging.env npm run validate:staging-env
```

## Removal Strategy

To reset staging synthetic users:

1. Disable the staging app if verification is in progress.
2. Delete dependent private records for the synthetic profiles.
3. Delete profile role rows for the synthetic profiles.
4. Delete synthetic profile rows.
5. Delete the corresponding Supabase Auth users.
6. Re-run the seed process with fresh authorised accounts.

Do not delete production or development records from the staging reset process.
