# Prompt 33b Draft Content Test Results

Date: 2026-08-03

## Live Staging Results

| Check group                                                         | Result |
| ------------------------------------------------------------------- | ------ |
| Draft content hidden from student                                   | Passed |
| Source required content hidden from student                         | Passed |
| Source checked but unapproved content hidden from student           | Passed |
| Equation checked but unapproved content hidden from student         | Passed |
| Simulation checked but unapproved content hidden from student       | Passed |
| Engineering review required content hidden from student             | Passed |
| Approved but unpublished content hidden from student                | Passed |
| Published and approved content visible to student                   | Passed |
| Revision required content hidden from student                       | Passed |
| Archived content hidden from student                                | Passed |
| Published but unapproved content hidden from student                | Passed |
| UUID guessing cannot expose a draft lesson                          | Passed |
| Slug guessing cannot expose a draft lesson                          | Passed |
| Student cannot read content versions                                | Passed |
| Student cannot read reviewer comments                               | Passed |
| Student cannot read audit events                                    | Passed |
| Student cannot read hidden answer choices                           | Passed |
| Reviewer can read governance evidence                               | Passed |
| Reviewer cannot read student attempts by default                    | Passed |
| Author can read own draft governance record                         | Passed |
| Author cannot self-approve governance record directly               | Passed |
| Author cannot insert an approved/published content version directly | Passed |
| Lecturer cannot self-grant reviewer role                            | Passed |

Summary: 78 checks passed, 0 failed.

## Cross-Content Coverage

The state matrix was tested against:

- `lessons`
- `assessments`
- `simulations`
- `projects`
- `knowledge_files`

Additional negative checks covered:

- `content_versions`
- `review_records`
- `audit_events`
- `answer_choices`
- `profile_roles`
- `content_governance_items`

## Application Smoke

Public and authenticated staging route checks passed after the RLS change:

- Public shell
- Curriculum browsing
- Pilot lesson
- Sign-in page
- Student assessment overview
- Student simulation history
- Author workspace
- Reviewer workspace

No raw PostgreSQL, Supabase, or RLS policy error was shown in these checks.
