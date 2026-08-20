# Prompt 33a Post-Migration Gate

Date: 2026-08-03

## Executive Verdict

CONDITIONAL GO FOR PROMPT 34

The staging database foundation is sufficiently complete for Prompt 34 Vercel
staging deployment work, provided Prompt 34 does not claim production readiness
or full browser workflow completion. Private student data, lecturer cohort
access, reviewer separation, answer-choice hiding, and attempt-table protection
were verified against the live Supabase staging database.

One critical content-governance RLS issue was found: enrolled students can read
a draft lesson in an enrolled module. This must be corrected before production
readiness and should be addressed early in staging hardening.

No production database was contacted.

## Migration Verification

| File                                                          | Verification Status                                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `database/migrations/0001_initial_schema.sql`                 | Applied by object verification; expected base tables, functions, RLS state, constraints, and indexes are present.  |
| `database/migrations/0002_dashboard_student_preferences.sql`  | Applied by object verification; `saved_lessons` and `dashboard_recommendation_dismissals` exist with RLS enabled.  |
| `database/migrations/0003_attempt_persistence_metadata.sql`   | Applied by object verification; assessment and simulation metadata columns and idempotency indexes exist.          |
| `database/migrations/0004_content_governance_persistence.sql` | Applied by object verification; governance table, version metadata, review metadata, indexes, and RLS are present. |
| `database/policies/0001_row_level_security.sql`               | Applied with later corrective hardening.                                                                           |
| `database/policies/0002_dashboard_student_preferences.sql`    | Applied; student preference ownership policies are active.                                                         |
| `database/policies/0004_content_governance_persistence.sql`   | Applied; content staff governance read/write boundaries are active.                                                |
| `database/policies/0005_staging_rls_hardening.sql`            | Applied; old broad answer-choice and attempt policies are absent, hardened replacement policies are present.       |
| `database/seed/0001_roles_permissions.sql`                    | Applied; all 5 required roles are present.                                                                         |

Migration order is documented in
`docs/deployment/staging-migration-record.md`. No skipped expected migration was
detected by live object drift checks. Current Git history shows the database
migration, policy, and seed files have not been changed after the staging RLS
hardening commit in this branch history.

## Drift Summary

| Check                                               | Result                                  |
| --------------------------------------------------- | --------------------------------------- |
| Expected tables missing                             | None.                                   |
| Expected RLS tables disabled                        | None.                                   |
| Missing attempt metadata columns                    | None.                                   |
| Missing attempt idempotency indexes                 | None.                                   |
| Policy count                                        | 80 public policies.                     |
| Old broad answer-choice policy                      | Absent.                                 |
| Hardened answer-choice policy                       | Present.                                |
| Old broad assessment/simulation attempt policies    | Absent.                                 |
| Hardened assessment/simulation self-select policies | Present.                                |
| `PUBLIC` table grants                               | None.                                   |
| Insecure security-definer function owners           | None found in inspected public helpers. |
| Required roles                                      | 5 found.                                |

Supabase `anon` and `authenticated` roles have table grants as expected for
Supabase REST access. RLS is therefore the enforcement boundary, and direct live
REST checks were used to prove the important access decisions.

## RLS Verification Summary

Detailed evidence is in
`docs/audits/prompt-33a-rls-evidence.json`.

| Area                                                                                           | Result                                         |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Student A own profile, progress, attempts, submissions, saved lessons, and preferences         | Passed.                                        |
| Student A access to Student B private records                                                  | Denied or empty in every tested private table. |
| Lecturer authorised cohort access                                                              | Passed for associated Student A records.       |
| Lecturer unrelated cohort access                                                               | Denied or empty for Student B records.         |
| Content author draft governance access                                                         | Passed.                                        |
| Content author access to private student attempts                                              | Denied or empty.                               |
| Engineering reviewer reviewable content access                                                 | Passed.                                        |
| Engineering reviewer access to private student attempts                                        | Denied or empty by default.                    |
| Anonymous access to attempts, submissions, review records, audit events, and governance drafts | Denied or empty.                               |
| Student answer-choice correctness access                                                       | Denied or empty.                               |
| Content staff answer-choice review access                                                      | Passed.                                        |
| Student direct assessment/simulation attempt insert                                            | Denied.                                        |
| Student direct assessment/simulation score patch                                               | Did not alter stored server-scored values.     |

## Attempt Persistence Review

`assessment_responses` and standalone competency-record tables are not part of
the current schema. This is understood drift from the requested domain language,
not an unapplied migration. Current persistence stores submitted answers,
scoring summaries, and competency awards on attempt rows.

Migration `0003_attempt_persistence_metadata.sql` added all expected attempt
metadata fields. Because RLS is row-level, the new fields are covered by the
attempt table policies. Prompt 33 hardening removed the broad direct student
write policies and replaced them with student self-select plus direct insert
denial. Live checks confirmed direct student inserts are forbidden and attempted
student score/competency patches did not change stored values.

## Content Governance Review

| Requirement                             | Result                                                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Draft visibility for governance records | Passed for content author; anonymous and student users did not receive governance draft records.                                       |
| Published-content governance visibility | Reviewer/content staff access passed.                                                                                                  |
| Content version ownership/history       | Reviewer could read retained versions; historical version records remain present.                                                      |
| Reviewer decisions                      | Review record fixture was readable by reviewer/content staff.                                                                          |
| Self-approval prevention                | Implemented in `packages/database/src/content-governance.ts` and covered by service tests; not enforced as a database-only constraint. |
| Audit-event protection                  | Anonymous reads denied; trusted transaction could write audit evidence.                                                                |
| Rollback metadata                       | Required schema fields are present.                                                                                                    |

### Critical Finding

An enrolled student could read a draft lesson in the same enrolled module. The
policy branch `public.student_has_module(m.id)` in
`lessons_read_approved_or_authorized` bypasses the lesson publication/review
check for enrolled students.

Required corrective migration:

- Replace lesson read policy logic so normal student access requires
  `lessons.publication_status = 'published'` and
  `lessons.technical_review_status = 'Approved for student use'`.
- Review related `modules`, `units`, `assessments`, `questions`, `simulations`,
  and `projects` policies for the same publication/review bypass pattern.
- If internal preview access is required, model it explicitly with a separate
  preview/assignment policy rather than treating general enrolment as draft
  authorisation.

This issue is blocking for production readiness but not blocking for Prompt 34
as a staging deployment exercise, as long as it is carried as a known corrective
database task.

## Service And Error Handling Review

Focused service tests passed for:

- data-access ownership and safe public error mapping
- attempt persistence scoring, duplicate submission, transactions, rollback, and
  competency/audit operations
- content governance workflow, self-approval prevention, publication gates,
  rollback, audit, and safe error mapping
- Supabase auth provider session resolution
- student dashboard data calculations

Live trusted database transactions verified that staging can support assessment
completion, simulation completion, review-record creation, and audit-event
creation in one transaction. An intentional transaction failure left no partial
audit row.

Raw PostgreSQL credentials and Supabase tokens were not printed. Direct REST
errors may include PostgREST response bodies, but application services translate
database and validation failures to safe public errors before user-facing
handling.

## Prompt 34 Readiness Gate

Verdict: CONDITIONAL GO FOR PROMPT 34.

Prompt 34 can proceed as a staging deployment task because:

- migrations and policies are applied
- schema drift is understood
- cross-student private access is denied
- lecturer access is cohort-scoped
- reviewer separation from student private data is verified
- answer-choice correctness is hidden from students
- attempt tables are protected from direct student creation and trusted scoring
  mutation
- database transaction behavior was verified

Prompt 34 must not claim:

- production readiness
- complete assessment or simulation browser flows
- complete content-governance hardening
- draft content publication safety until the corrective RLS migration is applied

## Remaining Work

1. Create a new corrective RLS migration for draft/unapproved content visibility.
2. Repeat live Prompt 33a draft-content checks after that migration.
3. Add a regression test for publication/review status enforcement in content
   read policies.
4. Keep synthetic Prompt 33a records staging-only.
