# Industrial Learn Staging Checklist

## Purpose

Staging verifies a production-like release candidate using non-production data before any production approval.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-AUTH-001: `docs/architecture/authentication-implementation.md`
- IL-DB-001: `docs/architecture/database-design.md`
- IL-DATA-001: `docs/architecture/data-access-layer.md`

## Required Before Deployment

- CI passed on the release candidate.
- Staging environment variables configured with staging-only values.
- Staging database and authentication project are separate from production.
- No production student data is present in staging.
- Database migrations validated locally and in CI.
- Migration plan reviewed for additive changes.
- Seed data reviewed and confirmed safe for staging only.

## Staging Verification

| Area                    | Verification                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Homepage                | Public shell renders without server errors                                            |
| Sign-in                 | Synthetic staging student can authenticate                                            |
| Protected dashboard     | Unauthenticated access redirects; authenticated student sees only own data            |
| Student data ownership  | Query-string or route manipulation cannot reveal another student                      |
| Curriculum browsing     | `/learn`, school, programme, module, pathway, and year routes render                  |
| Lesson rendering        | Published student lesson route renders review status and source references            |
| Assessment attempt area | Authenticated route is protected; persistence smoke is run where assessment UI exists |
| Simulation attempt area | Authenticated route is protected; persistence smoke is run where simulation UI exists |
| Reviewer access         | Reviewer can open review workspace; student cannot                                    |
| Draft protection        | Student cannot access author/review tools or unpublished content                      |
| Published content       | Only approved/published content is visible to students                                |
| Sign-out                | Session cookie clears and protected routes redirect                                   |
| Mobile                  | Representative routes pass mobile viewport checks                                     |
| Accessibility           | Automated accessibility spec passes with no critical findings                         |
| Error handling          | Safe user-facing errors; no database internals or secrets are shown                   |
| RLS policies            | Staging database policy checks confirm student and reviewer boundaries                |

## Smoke Command

```bash
npm run test:smoke
```

Current smoke tests cover the routes available in the repository. Full assessment and simulation completion smoke checks must be expanded when production UI for those workflows exists.

## Staging Approval Evidence

Record:

- Commit SHA.
- CI run URL.
- Migration validation result.
- Staging deployment URL.
- Smoke test result.
- Accessibility result.
- Known exceptions.
- Named staging verifier.
- Date and time.
