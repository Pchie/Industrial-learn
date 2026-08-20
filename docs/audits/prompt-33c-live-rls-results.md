# Prompt 33c Live RLS Results

Date: 2026-08-10

## Executive Verdict

Live staging RLS remediation: PASS.

Prompt 34 readiness: GO for the draft/unapproved-content RLS remediation boundary.

The live Supabase staging project `lgjujyaclrpaopdabyzg` has the corrective Prompt 33b
RLS behavior required for Prompt 33c. Students cannot read draft or unapproved technical
content, hidden assessment answers remain protected, content versions and review records
remain hidden from students, authors cannot directly self-approve/publish their own
content, and engineering reviewers do not receive private student-attempt access by
default.

## Connectivity And Project Evidence

Supabase CLI access was available on the local machine.

`supabase projects list` confirmed:

| Field   | Evidence                                   |
| ------- | ------------------------------------------ |
| Project | `Industrial Learn`                         |
| Ref     | `lgjujyaclrpaopdabyzg`                     |
| Region  | `eu-west-1`                                |
| Status  | `ACTIVE_HEALTHY`                           |
| Linked  | `true`                                     |
| Engine  | PostgreSQL `17`, database version `17.6.1` |

`STAGING_ENV_FILE=.env.staging.local npm run validate:staging-env` passed without
printing secret values.

## Migration State

`supabase migration list --linked` returned an empty tracked migration list.

The live database also does not expose a `supabase_migrations.schema_migrations` relation
to the SQL query path used in this verification. This means the corrective SQL appears to
have been applied manually rather than through Supabase migration tracking.

This is not treated as an RLS failure because the live catalog and behavioral checks below
confirm that the expected function and policies are present and enforced. It remains an
operational traceability risk to reconcile before production.

## Live Catalog Evidence

Catalog checks were run with `supabase db query --linked`.

| Check                                                 | Result |
| ----------------------------------------------------- | ------ |
| `public.is_student_visible_content` exists            | `1`    |
| Replacement content visibility policies exist         | `9`    |
| `answer_choices_content_staff_read` exists            | `1`    |
| `content_governance_items_author_update_draft` exists | `1`    |

The nine replacement content visibility policies were present for:

- `modules`
- `units`
- `lessons`
- `lesson_prerequisites`
- `learning_outcomes`
- `assessments`
- `questions`
- `simulations`
- `projects`

Policy definition inspection confirmed:

- Student content visibility depends on published and approved status through
  `is_student_visible_content(...)`.
- `answer_choices` is readable only by `is_content_staff()`.
- Author updates to `content_governance_items` are restricted to draft/internal
  publication states and non-approved workflow states.

## Live RLS Behavior Tests

The live RLS behavior test used a single database transaction with synthetic content rows
and simulated authenticated JWT claims. The transaction was rolled back after the result
set was produced, so no test curriculum/content rows were left in staging.

All 17 checks passed:

| Check                                                        | Result | Evidence                                                                      |
| ------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------- |
| Actor fixtures available                                     | PASS   | Student, content-author, and engineering-reviewer profile roles were present. |
| Service role can see synthetic fixtures                      | PASS   | Trusted context could see the temporary fixture before RLS simulation.        |
| Approved published lesson visible to student                 | PASS   | `visible=1`                                                                   |
| Draft lessons hidden from student                            | PASS   | `visible=0`                                                                   |
| Published but unapproved lessons hidden from student         | PASS   | `visible=0`                                                                   |
| Draft and unapproved modules hidden from student             | PASS   | `visible=0`                                                                   |
| Approved published assessment visible to student             | PASS   | `visible=1`                                                                   |
| Draft and unapproved assessments hidden from student         | PASS   | `visible=0`                                                                   |
| Hidden assessment answers unavailable to student             | PASS   | `visible=0`                                                                   |
| Approved published simulation visible to student             | PASS   | `visible=1`                                                                   |
| Draft and unapproved simulations hidden from student         | PASS   | `visible=0`                                                                   |
| Approved published project visible to student                | PASS   | `visible=1`                                                                   |
| Draft and unapproved projects hidden from student            | PASS   | `visible=0`                                                                   |
| Content versions unreadable by student                       | PASS   | `visible=0`                                                                   |
| Review records unreadable by student                         | PASS   | `visible=0`                                                                   |
| Engineering reviewer cannot read student attempts by default | PASS   | `visible=0`                                                                   |
| Content author cannot self-approve or publish own content    | PASS   | Update rejected by live database policy.                                      |

## Rollback And Cleanup Evidence

After the rolled-back verification transaction, a cleanup query confirmed zero temporary
`prompt-33c-*` rows remained in:

- `lessons`
- `modules`
- `assessments`
- `simulations`
- `projects`
- `content_governance_items`

## Prompt 33c Requirements Verdict

| Requirement                                                                           | Verdict                                                                            |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Applied migration state                                                               | PASS with traceability caveat: policies are live, but migration tracking is empty. |
| Draft lessons hidden from students                                                    | PASS                                                                               |
| Unapproved published-looking content hidden from students                             | PASS                                                                               |
| Approved published content visible to students                                        | PASS                                                                               |
| Hidden assessment answers protected before completion                                 | PASS                                                                               |
| Content versions not readable by students                                             | PASS                                                                               |
| Review records not readable by students                                               | PASS                                                                               |
| Content authors cannot self-approve                                                   | PASS                                                                               |
| Engineering reviewers do not automatically receive student-data access                | PASS                                                                               |
| Admin/service-role access remains available only through trusted server-side contexts | PASS                                                                               |

## Remaining Risks

- Supabase migration tracking is empty for this project, so the live database cannot prove
  migration application by version history alone. The live schema/policy catalog and RLS
  behavior prove the remediation is present, but the migration tracking gap should be
  reconciled before production.
- This verification covers staging RLS behavior for Prompt 33c. It does not certify
  production branch protection, backup policy, observability, or production release
  readiness.

## Final Verdict

Live staging RLS verdict: PASS.

Prompt 34 readiness: GO.
