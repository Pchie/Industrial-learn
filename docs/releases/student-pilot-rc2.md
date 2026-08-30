# Industrial Learn Student Pilot RC2

Date: 2026-08-30

Release identifier: `student-pilot-rc2`

Release type: protected staging candidate, not production

## Release Identity

| Item                       | Value                                                          |
| -------------------------- | -------------------------------------------------------------- |
| Application payload commit | `343f14f92f60bbc20a57dec1bb4d8266513fdd2c`                     |
| Source branch              | `development`                                                  |
| Release evidence branch    | `release/student-pilot-rc2`                                    |
| Remote CI run              | `33310980671`                                                  |
| Vercel deployment record   | GitHub deployment `6166509559`                                 |
| Vercel staging deployment  | `DgGdoxfu7tGiNnUEVysWdFyVNgZ8`                                 |
| Exact staging URL          | `https://industrial-learn-staging-aeeanzji7-kolobe.vercel.app` |
| Supabase staging project   | `lgjujyaclrpaopdabyzg`                                         |

The annotated Git tag `student-pilot-rc2` identifies the application payload commit. The
release does not alter `main`, the production Supabase project, or a production Vercel
deployment.

## Changes Since RC1

- Static lessons now require a matching, approved, versioned technical review record in
  addition to the existing publication, source, and review-status gates.
- The academic source-quality policy now distinguishes source levels, evidence roles,
  rights status, citation completeness, and conflict handling.
- The Basic Fluid Pressure pilot moved to content version `0.3.0` with stronger academic
  evidence, while remaining `Engineering review required` and unpublished.

No engineering equation, database migration, production setting, or content approval was
changed for RC2.

## Release Verdict

| Gate                         | Verdict                                     |
| ---------------------------- | ------------------------------------------- |
| Release candidate integrity  | **CONDITIONAL PASS**                        |
| Protected staging deployment | **PASS**                                    |
| Controlled student pilot     | **NO-GO pending approved published lesson** |
| Production release           | **Not assessed**                            |

The condition is an intentional content-governance gate. No lesson has an approved review
record, so the application correctly publishes none.

## Migration State

Staging records migrations `0001` through `0009`, `0011`, and `0012` as applied.
Migration `0010_bernoulli_flow_simulation_registration.sql` remains deliberately
unapplied because its canonical database parent is absent and the material is not approved
for student use. No database change was introduced or applied by RC2.

## Known Limitations

1. No lesson has both an approved review record and published status, so a positive
   published-lesson smoke case cannot pass.
2. No simulation is approved for public student use; the Simulation Lab therefore shows
   an honest empty state.
3. The exact deployment is protected by Vercel SSO. Its readiness endpoint could not be
   called by unauthenticated command-line automation, although current authenticated
   student, author, and reviewer journeys passed in the protected browser session.
4. Reviewer assignment remains role-based rather than assignment-scoped.

## Next Gate

An independent engineering reviewer must complete the review packet for one
source-complete lesson. Publication may proceed only after the named, version-matched
review record exists and the lesson is reverified through anonymous, authenticated, and
RLS publication tests.
