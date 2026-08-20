# Draft Content Visibility Policy

Date: 2026-08-03

## Purpose

Industrial Learn must not expose draft, unapproved, unpublished, archived, or
internal technical content to students or unauthenticated users.

Source IDs: IL-AGENTS-001, IL-DB-001, IL-DAL-001, IL-AUTH-001.

## Current Schema Fields

The current PostgreSQL schema uses these fields for student-visible content
eligibility:

| Content area        | Tables                                                                           | Status fields                                                |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Programme catalogue | `programmes`                                                                     | `publication_status`                                         |
| Course structure    | `modules`                                                                        | `publication_status`, `technical_review_status`              |
| Lessons             | `lessons`                                                                        | `publication_status`, `technical_review_status`, `version`   |
| Assessments         | `assessments`                                                                    | `publication_status`, `technical_review_status`, `version`   |
| Simulations         | `simulations`                                                                    | `publication_status`, `technical_review_status`, `version`   |
| Projects            | `projects`                                                                       | `publication_status`, `technical_review_status`, `version`   |
| Knowledge files     | `knowledge_files`                                                                | `publication_status`, `technical_review_status`, `version`   |
| Governance records  | `content_governance_items`, `content_versions`, `review_records`, `audit_events` | workflow, publication, review, archive, and version metadata |

The current schema does not yet include publication start/end window columns for
the core content tables. Enrolment withdrawal is supported through
`enrolments.withdrawn_at`. Governance archive metadata is supported through
`content_governance_items.archived_at` and `content_versions.archived_at`.

## Student-Visible Rule

For core technical content with both status fields, students may read a record
only when:

```text
publication_status = 'published'
AND technical_review_status = 'Approved for student use'
```

The corrective migration implements this as:

```sql
public.is_student_visible_content(publication_status, content_status)
```

Student enrolment may scope access to learning records, but it must not bypass
publication or technical-review approval for content definitions.

## Restricted Evidence

Students must not read:

- `answer_choices.is_correct`
- answer-choice feedback before allowed review
- reviewer comments
- internal review evidence
- unpublished content versions
- audit events
- draft governance records

Content authors and engineering reviewers may access required governance and
evidence records through controlled role policies. Reviewers do not receive
private student-data access by default.

## Corrective Migrations

- `database/migrations/0005_restrict_unapproved_content_visibility.sql`
- `database/migrations/0006_restrict_author_self_approval.sql`

These migrations replace unsafe read policies and restrict direct author writes
that could otherwise self-approve or publish governance records outside the
application workflow.

## Remaining Schema Limitations

- Publication start/end windows are not modeled yet.
- Core content tables do not have `published_version` pointers. Historical
  version browsing is therefore controlled through governance/version tables,
  which remain content-staff-only.
- Rollback support exists in governance metadata, but student-facing core
  content delivery still depends on application routing and content adapters.
