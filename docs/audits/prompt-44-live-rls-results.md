# Prompt 44 Live RLS Results

Date: 2026-08-29
Target: Supabase staging project `lgjujyaclrpaopdabyzg`

## Verdict

**Live RLS: PASS**

All 36 public application tables have RLS enabled. The live database contains 80 policies,
no `PUBLIC` table grants, and all five required roles. The final rollback-only behavior
matrix passed 55 of 55 checks and retained no test fixtures.

## Sensitive Policy Inventory

| Table                                 | Live policies                                                            |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `profiles`                            | self select/update; administrator all                                    |
| `enrolments`                          | student self or authorised lecturer read; administrator write            |
| `lesson_progress`                     | student self read/write; authorised lecturer read                        |
| `assessment_attempts`                 | student self select; direct insert denied; authorised lecturer read      |
| `simulation_attempts`                 | student self select; direct insert denied; authorised lecturer read      |
| `project_submissions`                 | student self read/write; authorised lecturer read/update                 |
| `saved_lessons`                       | student self read/write; administrator all                               |
| `dashboard_recommendation_dismissals` | student self read/write; administrator all                               |
| `content_versions`                    | content-staff read; restricted author/admin insert; admin update/delete  |
| `review_records`                      | content-staff read; reviewer insert; admin update/delete                 |
| `audit_events`                        | actor insert; administrator read                                         |
| `answer_choices`                      | content-staff read/write only                                            |
| `questions`                           | approved/authorised row policy plus safe authenticated column allow-list |

## Complete Table Inventory

| Tables                                                                     | Policy count and purpose                                                     |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `academic_years`, `disciplines`, `programmes`, `schools`, `semesters`      | Two each: controlled catalogue read and content-staff write                  |
| `modules`, `units`, `lessons`, `lesson_prerequisites`, `learning_outcomes` | Two each: approved/authorised read and content-staff write                   |
| `assessments`, `questions`, `simulations`, `projects`                      | Two each: approved/authorised read and content-staff write                   |
| `source_documents`, `knowledge_files`                                      | Two each: reviewed/staff read and author/admin write                         |
| `roles`, `permissions`, `role_permissions`                                 | Two each: authenticated read and admin management                            |
| `profile_roles`                                                            | Two: self read and admin management                                          |
| `cohorts`, `cohort_modules`, `cohort_lecturers`                            | Two each: associated-party read and admin management                         |
| `content_governance_items`                                                 | Four: content-staff read, author insert, draft-only author update, admin all |
| Remaining private/governance tables                                        | Listed in the sensitive inventory above                                      |

## Publication Matrix

| Synthetic state             | Student result |
| --------------------------- | -------------- |
| Draft                       | Hidden         |
| Source required             | Hidden         |
| Engineering review required | Hidden         |
| Approved but unpublished    | Hidden         |
| Published but unapproved    | Hidden         |
| Published and approved      | Visible        |
| Archived                    | Hidden         |

The same negative/positive rule passed for simulations. Permanent staging data now has
zero simulations that combine `published` with a non-approved technical review status.

## Student Ownership

Student A could read only their own profile, progress, assessment attempts, simulation
attempts, project submissions, saved lessons, and recommendation preferences. Every
equivalent Student B query returned no row.

Verdict: **PASS**.

## Lecturer And Reviewer Separation

- The authorised lecturer could read the enrolled student's attempts.
- The same lecturer could not read an unrelated student's attempt.
- The unrelated lecturer could not read Student A's attempt.
- The content author and engineering reviewer could not read student assessment or
  simulation attempts.
- The reviewer could read synthetic technical review evidence.
- The administrator retained policy-authorised access.

Verdict: **PASS**.

## Assessment Security

- Answer choices containing correctness and feedback remained hidden.
- Migration `0011` denies authenticated `questions.explanation` reads while preserving safe
  question-prompt columns.
- Students cannot update score, competency awards, or content version.
- The completion function is executable by `service_role`, not `anon` or `authenticated`.
- Completion, progress, score, competency, and audit persistence are atomic.
- Duplicate idempotency keys return the original completion without a second audit event.
- Invalid score conversion rolls the transaction back and leaves the attempt in progress.

Verdict: **PASS**.

## Simulation Attempt Security

- Students cannot update score, competency awards, or simulation version.
- The completion function is service-role-only.
- Completion, progress, score, competency, and audit persistence are atomic.
- Duplicate completion is idempotent and does not duplicate audit evidence.
- An untouched/reset control attempt remains in progress with no completion timestamp.

Verdict: **PASS**.

## Cleanup

The live matrix ran inside one transaction and ended with `ROLLBACK`. Follow-up counts
confirmed zero Prompt 44 auth users, lessons, simulations, and governance fixtures.

## Boundary Note

This PASS certifies live Supabase RLS and trusted transaction behavior. It does not certify
the current Vercel staging bundle: that deployment still exposes one source-incomplete
lesson route and must be replaced by an exact reviewed `development` commit.
