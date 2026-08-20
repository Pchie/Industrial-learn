# Staging Content RLS Correction

Date: 2026-08-03

## Target

| Item               | Value                      |
| ------------------ | -------------------------- |
| Environment        | Dedicated Supabase staging |
| Project reference  | `lgjujyaclrpaopdabyzg`     |
| Production touched | No                         |

## Applied Migrations

| Migration                                                             | Result                           |
| --------------------------------------------------------------------- | -------------------------------- |
| `database/migrations/0005_restrict_unapproved_content_visibility.sql` | Applied successfully to staging. |
| `database/migrations/0006_restrict_author_self_approval.sql`          | Applied successfully to staging. |

## Policies Changed

Migration `0005` replaced read policies for:

- `programmes`
- `modules`
- `units`
- `lessons`
- `lesson_prerequisites`
- `learning_outcomes`
- `assessments`
- `questions`
- `simulations`
- `projects`

Migration `0006` replaced direct author write policies for:

- `content_governance_items`
- `content_versions`

Existing content-staff write policies, review-record policies, audit policies,
student private-record policies, and answer-choice hardening policies were not
weakened.

## Helper Function

`public.is_student_visible_content(public.publication_status, public.content_status)`
returns true only for records that are both:

- `publication_status = 'published'`
- `technical_review_status = 'Approved for student use'`

The helper is not `SECURITY DEFINER` and does not use client-controlled
metadata.

## Verification

Live staging checks passed:

- 78 of 78 draft-content and cross-content RLS checks passed.
- Draft, source-required, source-checked, equation-checked,
  simulation-checked, engineering-review-required, approved-but-unpublished,
  revision-required, archived, and published-but-unapproved records were hidden
  from the synthetic student user.
- Published and approved lesson, assessment, simulation, project, and knowledge
  file records remained visible to the synthetic student user.
- Hidden answer choices remained hidden.
- Content versions, review comments, and audit events remained hidden from the
  student user.
- Author direct self-approval and approved-version insertion were denied or left
  stored state unchanged.
- Reviewer governance/evidence access remained functional.
- Reviewer access to private student attempts remained denied.

## Application Smoke

Vercel staging smoke checks passed after the policy change:

- `/`
- `/learn`
- `/lessons/basic-fluid-pressure`
- `/auth/sign-in`
- authenticated `/assessments`
- authenticated `/simulations/history`
- authenticated `/author`
- authenticated `/review`

No raw database policy error was displayed in the checked pages.

## Rollback Or Forward-Fix Plan

Prefer forward-fix migration if additional content visibility edge cases are
found. Do not edit historical migrations that have been applied to staging.

If an emergency rollback is required in staging, create a new migration that
restores the previous policies from Git history, then rerun Prompt 33b content
visibility checks before continuing.
