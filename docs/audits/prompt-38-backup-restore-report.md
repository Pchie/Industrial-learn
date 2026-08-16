# Prompt 38 Backup Restore Report

Date completed: 2026-08-16

## Executive Verdict

CONDITIONAL PASS.

Industrial Learn staging PostgreSQL backup and restore were rehearsed in an
isolated local restore target. Schema, data, RLS-after-restore, and controlled
database-level application compatibility checks passed.

Production was not touched.

The remaining caveat is that this rehearsal used a plain temporary PostgreSQL
restore target, not a full temporary Supabase project. Supabase-managed project
configuration, provider auth settings, REST gateway behavior, and future storage
objects still require a separate recovery strategy.

## Scope

Prompt 38 required a controlled backup and restore rehearsal for the Industrial
Learn staging environment after Prompt 37 monitoring readiness.

Completed:

- Confirmed clean repository state before rehearsal.
- Confirmed staging environment validation without printing secret values.
- Confirmed controlled synthetic staging dataset existed.
- Created a staging PostgreSQL backup.
- Restored into an isolated local PostgreSQL target.
- Verified schema, functions, triggers, constraints, indexes, policies, RLS, and
  data counts.
- Verified restored relationships for progress, attempts, review records,
  content governance, and audit events.
- Reran critical RLS checks after restore.
- Ran controlled database-level app compatibility checks.
- Measured backup and restore timing.
- Removed temporary restore database, backup files, logs, and encryption
  passphrase.

Not completed in this rehearsal:

- Full temporary Supabase REST/Auth project compatibility.
- Supabase dashboard/provider configuration recovery.
- Storage object restore, because staging currently has zero storage buckets and
  zero storage objects.

## Backup Method

| Item                        | Value                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------- |
| Source environment          | Dedicated Supabase staging                                                             |
| Project ref                 | `lgjujyaclrpaopdabyzg`                                                                 |
| PostgreSQL version          | 17.6                                                                                   |
| Application commit          | `da7983b73fee5a5d17c5dd781380ef70dd6c5bff`                                             |
| Backup command family       | `pg_dump` custom format                                                                |
| Schemas included            | `auth`, `public`, `storage`                                                            |
| Backup start                | 2026-08-16T10:11:08Z                                                                   |
| Backup end                  | 2026-08-16T10:11:53Z                                                                   |
| Plaintext working dump size | 421,669 bytes                                                                          |
| Encrypted copy size         | 421,696 bytes                                                                          |
| Encryption                  | AES-256-CBC with PBKDF2 during rehearsal                                               |
| Retention                   | Data-bearing files removed after verification; non-sensitive evidence retained in docs |

## Restore Target

| Item                       | Value                                        |
| -------------------------- | -------------------------------------------- |
| Target type                | Isolated local PostgreSQL database           |
| Target location            | Temporary local cluster under `/private/tmp` |
| Target database            | `industrial_learn_restore`                   |
| Target PostgreSQL version  | 17.11                                        |
| Restore command family     | `pg_restore`                                 |
| Successful restore start   | 2026-08-16T10:13:07Z                         |
| Successful restore end     | 2026-08-16T10:13:08Z                         |
| Production touched         | No                                           |
| Active staging overwritten | No                                           |

## Dependency Note

Only `libpq` client tooling was available locally. A local PostgreSQL 17 server
package was installed through Homebrew so the backup could be restored into an
isolated database. This was tooling-only and did not add an application
dependency, package dependency, or repository dependency.

Homebrew also installed or updated required system formulae for that server
tooling. No production, staging, or application dependency file was changed.

## Data Verified

| Data area                 | Staging | Restored | Result |
| ------------------------- | ------: | -------: | ------ |
| Public tables             |      36 |       36 | Passed |
| Public policies           |      80 |       80 | Passed |
| RLS-enabled public tables |      36 |       36 | Passed |
| Public functions          |      13 |       13 | Passed |
| Public triggers           |      36 |       36 | Passed |
| Public constraints        |     484 |      484 | Passed |
| Public indexes            |     119 |      119 | Passed |
| Roles                     |       5 |        5 | Passed |
| Permissions               |      11 |       11 | Passed |
| Profile roles             |      12 |       12 | Passed |
| Profiles                  |      12 |       12 | Passed |
| Enrolments                |       5 |        5 | Passed |
| Lesson progress           |       6 |        6 | Passed |
| Assessment attempts       |       6 |        6 | Passed |
| Simulation attempts       |       6 |        6 | Passed |
| Content versions          |       6 |        6 | Passed |
| Review records            |       3 |        3 | Passed |
| Audit events              |       5 |        5 | Passed |
| Storage buckets           |       0 |        0 | Passed |
| Storage objects           |       0 |        0 | Passed |

## RLS Results

Corrected RLS-after-restore checks passed:

- Student A can read own profile.
- Student A cannot read Student B profile.
- Student A can read own lesson progress.
- Student A cannot read Student B lesson progress.
- Hidden assessment answers remain protected.
- Draft and unapproved lessons remain hidden from students.
- Engineering reviewer has no automatic student-attempt access.
- Content author has no automatic student-attempt access.
- Lecturer cohort scope remains enforced.
- Unauthenticated assessment-attempt access is limited.
- Unauthenticated hidden-answer access is limited.

An earlier RLS harness attempt used `SET LOCAL ROLE` outside a transaction and
produced invalid failures. The corrected harness used `SET ROLE`,
`row_security = on`, and synthetic JWT claims captured before switching roles.

## Application Compatibility

Controlled database-level compatibility checks passed:

- Approved test identity resolves from restored `auth.users` to restored
  `profiles`.
- Dashboard enrolment, progress, assessment, and simulation reads work against
  restored data.
- Assessment review can read a restored graded attempt.
- Simulation history can read restored submitted or graded attempts.
- Reviewer can read restored content versions.
- Public approved lessons remain accessible.
- Health-style database reachability passed.

Full Next.js-to-Supabase REST/Auth compatibility against the restore target was
not run because the isolated target was a plain PostgreSQL cluster, not a full
temporary Supabase project.

## RPO And RTO

| Metric                           | Result                                                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Recovery point achieved          | Backup captured staging through 2026-08-16T10:11:53Z                                                                               |
| Recovery time achieved           | Final successful restore command completed in about 1 second                                                                       |
| Practical rehearsal elapsed time | Longer than restore time because local target setup, failed restore-target setup attempts, verification, and cleanup were included |

The documented staging requirement is a restore rehearsal before first
production release. This rehearsal satisfies the PostgreSQL restore proof, with
Supabase-managed configuration still outstanding.

## Failures Encountered

| Failure                                                                        | Resolution                                                                          |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Local machine had no PostgreSQL server binary                                  | Installed PostgreSQL 17 server tooling through Homebrew for isolated restore target |
| First restore failed because the default local `public` schema already existed | Recreated the local database and dropped `public` before restore                    |
| Second restore failed because Supabase platform role `postgres` was missing    | Added Supabase-compatible local roles before restore                                |
| Third restore needed `supabase_admin` for default privileges                   | Added additional Supabase platform roles before restore                             |
| First RLS harness run used invalid `SET LOCAL ROLE` outside transaction        | Reran with corrected restricted-role harness                                        |
| First compatibility query assumed lowercase `completed` status                 | Reran using restored enum values `graded` and `submitted`                           |

## Remaining Recovery Risks

- Supabase project settings, Auth dashboard configuration, email provider
  settings, redirect URLs, rate limits, and provider-level logs are not fully
  recovered by a PostgreSQL dump.
- A full temporary Supabase project restore should be rehearsed before treating
  Auth/REST/project configuration recovery as proven.
- Storage object restore remains untested because staging currently has no
  buckets or objects.
- Supabase migration tracking has previously been empty for staging; production
  must not repeat that traceability gap.
- Content-version rows are linked to governance items, but their `entity_id`
  values do not match lesson IDs in either staging or the restore. This is an
  existing staging data/model caveat, not restore corruption.

## Cleanup

Completed:

- Temporary restore PostgreSQL cluster stopped.
- Temporary restore target removed.
- Plaintext dump removed.
- Encrypted local dump removed.
- Temporary encryption passphrase removed.
- Temporary restore logs removed.
- Production remained untouched.
- Active staging was not overwritten.

## Prompt 39 Readiness

Prompt 39 may proceed for PostgreSQL backup/restore readiness with caveats.

Before production launch, run a separate Supabase-managed recovery rehearsal or
explicitly document provider configuration recovery for Auth, REST, and storage.

Follow-up evidence is recorded in
`docs/audits/supabase-managed-recovery-rehearsal-report.md`. That rehearsal
verified direct Supabase Auth, REST/RLS, and temporary private Storage behavior,
but still requires a protected Vercel browser-session check with an approved
deployment-protection bypass.
