# Current Staging Recovery Evidence

Rehearsal date: 2026-09-08. **PASS for PostgreSQL backup/restore scope; operational
recovery remains conditional.** Production was neither read nor changed by this rehearsal.

## Recovery Point

- Source: dedicated Supabase staging `lgjujyaclrpaopdabyzg`, PostgreSQL 17.6.
- Application baseline: `da1078cc6724cf27d8b8c699debbf51817ccd188`.
- Dump window: `2026-09-08T19:11:19.901Z` to `19:12:41.099Z`.
- Format: PostgreSQL custom archive, 553,491 bytes before encryption.
- Included: `public`, `auth`, `storage`, `supabase_migrations`; 69 tables.
- Applied ledger: 21 migrations through `0022`; `0010` remains intentionally held.
- Retained encryption: AES-256-GCM, random 256-bit key and 96-bit nonce, staging project
  reference as authenticated additional data. The key is stored separately in macOS
  Keychain, not in the archive, repository or report.
- Encrypted archive SHA-256:
  `3cf503a09eb91a4fb90cc4cca93edf3f831ff2ca4c4c7446458a0b73d47c3b4f`.
- Owner-only local custody under ignored `.private-operations/recovery-2026-09-08/`.
  The private manifest records the archive and Keychain lookup details are in the
  local operator toolkit. No plaintext dump was retained on disk.

The dump is a consistent snapshot at its start, not a promise to recover writes made
later in the dump window. Source row counts/digests were also stable across that window.

## Restore Verification

A new disposable PostgreSQL 17 cluster was created under a mode-0700 temporary directory.
It listened only on its private Unix socket, with no TCP listener. Restore preserved
object owners, grants, policies and application data. No active database was overwritten.

| Check                                                                  | Result                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Encrypted archive decrypts to the original dump                        | PASS                                                                            |
| All 69 table row counts and canonical UTC row digests match            | PASS                                                                            |
| All 21 applied migration ledger rows match                             | PASS                                                                            |
| Public tables with RLS                                                 | 37 of 37                                                                        |
| Public policies / functions / constraints                              | 91 / 32 / 204, matching source                                                  |
| Trusted assessment/simulation completion RPC privileges                | Exact match                                                                     |
| Two students read their own records and not each other's               | PASS across progress, assessment, simulation, enrolment and project submissions |
| Hidden answers, content versions and review records denied to students | PASS                                                                            |
| Reviewer and author receive no automatic student-attempt access        | PASS                                                                            |
| Anonymous private-attempt and hidden-answer access denied              | PASS                                                                            |
| Exact review evidence, draft/old-version/self-review denial            | PASS using rollback-only publication fixtures                                   |
| Lecturer course scope and owner content oversight                      | PASS using the same regression fixture                                          |
| Disposable restore stopped and removed                                 | PASS                                                                            |
| Encrypted recovery point and separate key retained                     | PASS                                                                            |

Final successful restore setup/load: 16.314 seconds; that final verification pass took
26.162 seconds. These are measured local rehearsal timings, **not an approved RTO** and
not the elapsed time to recover a complete Supabase service. The first comparison used
the local timezone and falsely differed on timestamp serialization; matching UTC resolved
it. A later read-test harness needed an explicit `app_role` enum cast. Neither correction
changed backup data, database policies or production.

## Recovery Instructions

The private local toolkit contains the exact rehearsal script and read/rollback assertions.
Its envelope is `ILBAK001` (8 bytes), nonce (12), GCM tag (16), then ciphertext. The key is
the hexadecimal value in Keychain service `Industrial Learn staging backup`, account
`recovery-2026-09-08`. Do not display it or place it in shell arguments, chat or reports.

For a real recovery, use the [restore runbook](restore-rehearsal-runbook.md): restore to
an isolated trusted target first, recreate required platform roles/extensions, preserve
owners/ACLs, restore the custom archive in a single transaction, and run both data and
RLS checks before redirecting any application. The local rehearsal harness compares
against active staging and cleans up its disposable target; it is not an automatic
disaster-recovery or production-restore command.

## Remaining Decisions

- Owner-approved backup retention, recovery point (RPO), recovery time (RTO), custodian
  and backup custodian are not yet recorded. Proposed values are in the ignored private
  pilot record; proposals are not approvals.
- An owner-approved off-device encrypted destination and independently retrievable key
  custody remain required. A backup and Keychain on one laptop do not cover laptop loss.
- This is plain PostgreSQL verification, not a full managed Supabase Auth/PostgREST service
  restoration. Auth provider settings, SMTP credentials, redirect settings, Vercel runtime
  secrets, domains and protection configuration require their separate recovery inventory.
- Storage has zero objects/buckets and Vault has zero secrets. Future uploaded objects
  require an object backup; a SQL dump of storage metadata is not an object backup.
- No scheduled backup job, retention deletion, new external destination or paid service
  was created. Do not delete the only retained archive/key before custody is agreed.

References: [PostgreSQL dump consistency](https://www.postgresql.org/docs/17/backup-dump.html),
[restore behavior and trust boundary](https://www.postgresql.org/docs/17/app-pgrestore.html).
