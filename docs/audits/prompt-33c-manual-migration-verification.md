# Prompt 33c Manual Migration Verification

Date: 2026-08-10

## Executive Verdict

Repository RLS remediation: PASS.

Live staging RLS remediation: BLOCKED in this Codex environment.

Prompt 34 readiness: NO-GO until live staging RLS verification is performed against the
manually migrated Supabase project.

## Scope

This report verifies repository evidence for the corrective draft/unapproved-content RLS
remediation. It does not claim that the operator-applied Supabase staging migration is
live-correct, because staging credentials and synthetic test tokens are unavailable in
this Codex process.

## Migration State

Corrective migration files exist:

- `database/migrations/0005_restrict_unapproved_content_visibility.sql`
- `database/migrations/0006_restrict_author_self_approval.sql`

Migration ordering is valid:

1. `0001_initial_schema.sql`
2. `0002_dashboard_student_preferences.sql`
3. `0003_attempt_persistence_metadata.sql`
4. `0004_content_governance_persistence.sql`
5. `0005_restrict_unapproved_content_visibility.sql`
6. `0006_restrict_author_self_approval.sql`
7. `0007_atomic_assessment_completion.sql`

`0007` belongs to later Prompt 36 assessment-transaction work and is not part of the
draft-content RLS remediation.

## File Evidence

SHA-256 evidence:

| File                                                                  | SHA-256                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `database/migrations/0005_restrict_unapproved_content_visibility.sql` | `957269adf54de0e0d017c4ccf918ec23143865abb46f82a216e37cf06bcc9fe5` |
| `database/migrations/0006_restrict_author_self_approval.sql`          | `bf40a593ac5a2fdefe72655b300121f0032367cf7b7e69b521c0d513d7087136` |
| `database/policies/0005_staging_rls_hardening.sql`                    | `0c718f6510a078d56fd57873fc473c7c5abb7c94741539d6081a10537727f0c3` |

Historical migration files `0001` through `0006` show no current working-tree
modification. The working tree does contain an untracked `0007` migration from Prompt 36,
which should be reviewed and committed separately.

## Repository Policy Evidence

`0005_restrict_unapproved_content_visibility.sql` defines
`public.is_student_visible_content(publication_status, content_status)` and replaces the
content read policies for:

- `modules`
- `units`
- `lessons`
- `lesson_prerequisites`
- `learning_outcomes`
- `assessments`
- `questions`
- `simulations`
- `projects`

The replacement policy shape requires published and approved content before student
visibility. It removes the Prompt 33a bypass where enrolment alone allowed a student to
read draft lesson content in an enrolled module.

`0006_restrict_author_self_approval.sql` replaces author write policies so direct author
updates cannot set approved or published governance/version state outside the controlled
workflow.

## Cross-Content Repository Verification

Repository checks confirm the intended protection model for:

- Lessons: student-visible only when lesson and parent module are published and approved.
- Assessments: student-visible only when the assessment and parent lesson/module or module
  are published and approved.
- Simulation definitions: same published and approved policy shape as assessments.
- Projects: published and approved content only.
- Content versions: content-staff read policy; no student read policy.
- Review records: content-staff read policy; no student read policy.
- Audit events: admin read and actor insert policy only.
- Hidden assessment answers: `answer_choices_content_staff_read` remains the replacement
  read policy.

## Repository Test Result

`npm run validate:migrations` passed with 12 schema tests, including the policy checks for
`public.is_student_visible_content`, the replacement read policies, direct student attempt
write restrictions, and author self-approval prevention.

## Quality Gate Results

| Command                       | Result | Evidence                                                                    |
| ----------------------------- | ------ | --------------------------------------------------------------------------- |
| `npm run scan:secrets`        | PASS   | Secret scan passed with no obvious committed secret values found.           |
| `npm run format:check`        | PASS   | Prettier check passed after formatting the three Prompt 33c reports.        |
| `npm run typecheck`           | PASS   | TypeScript checks passed across the workspace.                              |
| `npm run lint`                | PASS   | Linting completed successfully.                                             |
| `npm run validate:content`    | PASS   | Content validation passed with 7 tests.                                     |
| `npm run validate:migrations` | PASS   | Migration validation passed with 12 tests.                                  |
| `npm run test:unit`           | PASS   | Unit tests passed: 18 files passed, 1 skipped; 156 tests passed, 4 skipped. |
| `npm run build`               | PASS   | Next.js production build completed successfully.                            |
| `npm run test:smoke`          | PASS   | Playwright smoke suite passed: 5 tests.                                     |
| `npm run test:e2e`            | PASS   | Full Playwright suite passed: 64 tests.                                     |

## Repository Verdict

PASS.

The repository contains the corrective RLS migration and validation coverage expected for
the Prompt 33a draft/unapproved-content visibility defect.

## Live Verification Status

BLOCKED.

Live verification was not performed because this Codex environment does not have the
required Supabase staging variables or synthetic test tokens loaded.
