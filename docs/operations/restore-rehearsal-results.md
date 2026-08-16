# Staging Restore Rehearsal Results

Date run: 2026-08-16

## Status

COMPLETED WITH CAVEATS.

The Industrial Learn staging PostgreSQL schema and data were backed up from the
dedicated Supabase staging project and restored into an isolated local
PostgreSQL 17 target. Schema, data, critical RLS behavior, and controlled
database-level application compatibility checks passed.

Production was not touched.

## Rehearsal Summary

| Item                                  | Result                                                              |
| ------------------------------------- | ------------------------------------------------------------------- |
| Environment                           | Dedicated Supabase staging                                          |
| Production touched                    | No                                                                  |
| Backup created                        | Passed                                                              |
| Restore target                        | Isolated local PostgreSQL 17 temporary cluster under `/private/tmp` |
| Restore completed                     | Passed                                                              |
| Schema verified                       | Passed                                                              |
| Data verified                         | Passed                                                              |
| RLS verified after restore            | Passed after correcting the test harness                            |
| Application compatibility tested      | Passed at restored database-read layer                              |
| Temporary credentials removed         | Passed                                                              |
| Temporary restore environment removed | Passed                                                              |
| Final verdict                         | Conditional pass                                                    |

## Backup Evidence

| Evidence item             | Value                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backup timestamp          | 2026-08-16T10:11:08Z to 2026-08-16T10:11:53Z                                                                                                                                   |
| Database version          | PostgreSQL 17.6 on staging                                                                                                                                                     |
| Migration state           | Repository schema restored; Supabase migration tracking remains a known staging caveat from Prompt 33c                                                                         |
| Application commit        | `da7983b73fee5a5d17c5dd781380ef70dd6c5bff`                                                                                                                                     |
| Backup method             | `pg_dump` custom format for `auth`, `public`, and `storage` schemas                                                                                                            |
| Backup size               | 421,669 bytes plaintext working dump; 421,696 bytes encrypted copy                                                                                                             |
| Backup SHA-256            | Plaintext working dump: `71c91396476398940cdb1308d819ab83d2fee39c9580c1696b2928b48a6cda15`; encrypted copy: `d1c8379a2dd53e5a7352db54696cfbff0b6c1ad542f9335b181f8fbd3d4e60d1` |
| Encryption status         | Encrypted during rehearsal using AES-256-CBC with PBKDF2; temporary passphrase removed during cleanup                                                                          |
| Storage location category | Local temporary operator workspace under `/private/tmp`; removed after verification                                                                                            |
| Retention                 | Data-bearing dump files removed after verification; non-sensitive evidence retained in this report                                                                             |
| Operator                  | Codex acting as release/database rehearsal operator                                                                                                                            |

## Restore Evidence

| Evidence item          | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| Restore target         | Temporary local PostgreSQL database `industrial_learn_restore`       |
| Restore target version | PostgreSQL 17.11 via local Homebrew tooling                          |
| Restore start time     | 2026-08-16T10:13:07Z                                                 |
| Restore end time       | 2026-08-16T10:13:08Z                                                 |
| Restore method         | `pg_restore` into isolated local target                              |
| Cleanup decision       | Restore target, backup files, logs, and temporary passphrase removed |

## Data Verification

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

## Relationship Verification

| Relationship check                                    | Result                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Assessment attempts link to student profiles          | Passed, 6 restored attempts linked                                                             |
| Simulation attempts link to student profiles          | Passed, 6 restored attempts linked                                                             |
| Lesson progress links to student profiles             | Passed, 6 restored progress rows linked                                                        |
| Enrolments link to student profiles                   | Passed, 5 restored enrolments linked                                                           |
| Review records link to reviewer profiles              | Passed, 3 restored review records linked                                                       |
| Review records link to governance items where present | Passed                                                                                         |
| Audit events link to optional actor profiles          | Passed                                                                                         |
| Content versions link to governance items             | Passed, 6 restored versions linked                                                             |
| Content-version `entity_id` links to lessons          | Caveat: 0 matched in both staging and restore, so restore preserved the existing staging state |

## RLS After Restore

| Security check                                               | Result                                                            |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| Student A can read own profile                               | Passed                                                            |
| Student A cannot read Student B profile                      | Passed                                                            |
| Student A can read own lesson progress                       | Passed                                                            |
| Student A cannot read Student B lesson progress              | Passed                                                            |
| Hidden assessment answers remain protected                   | Passed                                                            |
| Draft and unapproved lessons remain hidden from students     | Passed                                                            |
| Engineering reviewer has no automatic student-attempt access | Passed                                                            |
| Content author has no automatic student-attempt access       | Passed                                                            |
| Lecturer cohort scope remains enforced                       | Passed; selected lecturer saw 3 of 6 restored assessment attempts |
| Unauthenticated assessment-attempt access is limited         | Passed                                                            |
| Unauthenticated hidden-answer access is limited              | Passed                                                            |

The first RLS attempt used `SET LOCAL ROLE` outside a transaction and produced
invalid failures because the harness retained elevated visibility. The check was
rerun with `SET ROLE`, `row_security = on`, and synthetic JWT claims captured
before switching role. The corrected RLS run passed.

## Application Compatibility

| Compatibility check                                           | Result                                                   |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| Approved test identity resolution                             | Passed; restored `auth.users` joined to restored profile |
| Dashboard enrolments read                                     | Passed                                                   |
| Dashboard lesson progress read                                | Passed                                                   |
| Dashboard assessment results read                             | Passed                                                   |
| Dashboard simulation activity read                            | Passed                                                   |
| Assessment review reads restored graded attempt               | Passed                                                   |
| Simulation history reads restored submitted or graded attempt | Passed                                                   |
| Reviewer reads restored content version                       | Passed                                                   |
| Public approved lessons remain accessible                     | Passed                                                   |
| Health-style database reachability                            | Passed                                                   |

Compatibility was tested at the restored PostgreSQL data-access layer. A full
Next.js-to-Supabase REST/Auth compatibility test was not run because the isolated
target was a plain temporary PostgreSQL cluster, not a full temporary Supabase
project with Auth, REST, and dashboard configuration.

## Recovery Metrics

| Metric                  | Value                                                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recovery point achieved | Backup captured staging through 2026-08-16T10:11:53Z                                                                                                                       |
| Recovery time achieved  | Final successful restore command completed in about 1 second; full rehearsal required additional setup and verification                                                    |
| Manual steps            | Install local PostgreSQL 17 server tooling, create local cluster, prepare Supabase roles, create backup, restore, verify, cleanup                                          |
| Failed steps            | Initial restore target setup failed on existing `public` schema; second restore failed on missing Supabase platform roles; first RLS harness used invalid `SET LOCAL ROLE` |
| Missing data            | None found in verified PostgreSQL scope                                                                                                                                    |
| Security discrepancies  | None after corrected RLS harness                                                                                                                                           |

## Failure Scenario Notes

| Scenario                                  | Recovery implication                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Accidental data deletion                  | Restore can recover PostgreSQL data to a separate target for inspection or selective recovery.                                        |
| Failed migration                          | Restore rehearsal proves schema/data can be recovered to an isolated target before choosing forward-fix or restore.                   |
| Broken RLS policy                         | RLS-after-restore tests must run before restored data is trusted.                                                                     |
| Corrupt content publication               | Content versions, governance items, review records, and audit events were restored and can support investigation.                     |
| Incorrect engineering calculation release | Application rollback remains preferred; database restore can preserve affected attempts and audit trail for investigation.            |
| Authentication configuration loss         | SQL dump restored `auth` schema records, but Supabase dashboard/provider configuration remains a separate recovery strategy.          |
| Storage object loss                       | Storage metadata restored as empty; no buckets or objects are currently in staging. Future storage use needs object backup rehearsal. |

## Cleanup

| Cleanup item                            | Result |
| --------------------------------------- | ------ |
| Active staging environment preserved    | Passed |
| Production untouched                    | Passed |
| Temporary restore target stopped        | Passed |
| Temporary restore database removed      | Passed |
| Plaintext dump removed                  | Passed |
| Encrypted dump removed                  | Passed |
| Temporary encryption passphrase removed | Passed |
| Temporary logs removed                  | Passed |

## Final Verdict

Conditional pass.

The PostgreSQL staging backup and restore rehearsal succeeded for schema, data,
RLS, and database-level application compatibility. Remaining recovery gaps are
limited to Supabase-managed project configuration and full Supabase REST/Auth
application compatibility in a temporary Supabase project.
