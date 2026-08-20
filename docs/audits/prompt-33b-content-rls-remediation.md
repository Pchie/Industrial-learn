# Prompt 33b Content RLS Remediation

Date: 2026-08-03

## Executive Verdict

GO FOR PROMPT 34

The Prompt 33a draft-content visibility issue has been remediated in the
dedicated Supabase staging database. Students can no longer read draft,
unapproved, unpublished, revision-required, archived, or published-but-unapproved
technical content through enrolment-backed content policies.

No production database was contacted.

## Verified Gap

Prompt 33a proved that the synthetic Student A account could read a draft lesson
in an enrolled module. The exposed table was `lessons`, and the unsafe policy
was `lessons_read_approved_or_authorized`.

The exposure was a `SELECT` issue. Direct insert/update/delete of content was
not granted to students. Subsequent review found the same approval-bypass shape
in related content read policies for modules, units, lesson prerequisites,
learning outcomes, assessments, questions, simulations, and projects.

Prompt 33a also confirmed that hidden answer choices, review records, audit
events, and content versions were not student-readable. Prompt 33b retested
those boundaries after remediation.

## Data Model Findings

| Concept                   | Current implementation                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Publication status        | `publication_status` on content tables and governance/version tables                                                                       |
| Engineering review status | `technical_review_status` on core content tables; `review_status` on content versions                                                      |
| Current published version | `content_governance_items.published_version` for governance history                                                                        |
| Content version records   | `content_versions` with `governance_item_id`, `previous_version`, `review_status`, `publication_status`, `published_at`, and `archived_at` |
| Review records            | `review_records` with reviewer, decision, evidence, source, equation, simulation, and safety metadata                                      |
| Archive metadata          | `content_governance_items.archived_at`, `content_versions.archived_at`, and `publication_status = 'archived'`                              |
| Withdrawal metadata       | Enrolments use `withdrawn_at`; core content tables do not currently have a separate withdrawn flag                                         |
| Publication windows       | Not currently modeled                                                                                                                      |

## Migrations Created

- `database/migrations/0005_restrict_unapproved_content_visibility.sql`
- `database/migrations/0006_restrict_author_self_approval.sql`

Migration `0005` adds a reusable eligibility helper and replaces unsafe content
read policies. Migration `0006` prevents direct author self-approval or
approved/published content-version insertion outside controlled services.

## Staging Application Result

Both migrations were applied successfully to Supabase staging project
`lgjujyaclrpaopdabyzg`.

Live checks passed:

- Prompt 33b draft-content checks: 78 passed, 0 failed.
- Migration validation: 11 tests passed.
- Application smoke against Vercel staging routes passed.

## Assessment Answer Protection

`answer_choices` remains content-staff-only for reads. Student checks against
`answer_choices(id, is_correct, feedback)` returned no rows. Published
assessment definitions remained visible only where the assessment and parent
content were published and approved.

## Current Version And History

Students cannot read `content_versions`, so unpublished draft versions,
superseded history, internal change summaries, rollback evidence, and private
review history remain hidden. Reviewers/content staff retain access to required
governance evidence.

Historical assessment attempts may continue to store content-version metadata on
attempt rows for traceability without granting students unrestricted historical
version browsing.

## Quality Gates

| Command                            | Result                        |
| ---------------------------------- | ----------------------------- |
| `npm run validate:migrations`      | Passed; 11 tests passed.      |
| Live staging migration application | Passed for `0005` and `0006`. |
| Live Prompt 33b RLS checks         | Passed; 78 checks passed.     |
| Vercel staging application smoke   | Passed.                       |

Additional full repository quality gates were run after documentation was
updated and are recorded in the final task summary.

## Remaining Limitations

- Publication start/end windows are not supported by the current schema.
- Core content tables do not yet model separate withdrawn flags.
- Production has not been touched and requires its own approved change window.
- Synthetic Prompt 33b records are staging-only.
