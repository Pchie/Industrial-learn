# Industrial Learn Student Pilot RC1

Date: 2026-08-30

Release identifier: `student-pilot-rc1`

Release type: protected staging candidate, not production

## Release Identity

| Item                         | Value                                                                |
| ---------------------------- | -------------------------------------------------------------------- |
| Application payload commit   | `78aee56e522c8c300364704c2e6edeb730ce61a8`                           |
| Integration branch           | `development`                                                        |
| Integration pull request     | `#24`                                                                |
| Remote CI run                | `33304055692`                                                        |
| Protected staging deployment | `dpl_EmYmZtB4dnWLV36jR2RfE28s7z6k`                                   |
| Protected staging URL        | `https://industrial-learn-staging-e4ufm8vv2-kolobe.vercel.app`       |
| Stable staging alias         | `https://industrial-learn-staging-git-development-kolobe.vercel.app` |
| Supabase staging project     | `lgjujyaclrpaopdabyzg`                                               |

The Git tag `student-pilot-rc1` is the canonical release identifier for the
application payload commit above. The release does not alter `main` or any production
deployment.

## Included Work

- Visual-first lesson architecture and reusable visual simulation foundation.
- Hydraulic cylinder, Bernoulli, and thermodynamic-boundary reference implementations,
  all delivered through fail-closed publication controls.
- Registry-driven Simulation Lab and shared publication visibility policy.
- Lesson, assessment, and simulation route enforcement for draft, unpublished, or
  unapproved material.
- Live Supabase RLS corrections for student ownership, hidden assessment evidence,
  reviewer separation, and service-role-only completion functions.
- Next.js `16.3.3` and compatible patched transitive dependency graph.
- GitHub Actions Node 24-compatible action runtimes.

## Release Verdict

| Gate                         | Verdict                                     |
| ---------------------------- | ------------------------------------------- |
| Release candidate integrity  | **CONDITIONAL PASS**                        |
| Protected staging deployment | **PASS**                                    |
| Controlled student pilot     | **NO-GO pending approved published lesson** |
| Production release           | **Not assessed by this release**            |

The condition is content governance, not a known software or infrastructure failure.
The public application correctly shows no lesson or simulation where no approved
publication record exists.

## Migration State

Supabase staging records migrations `0001` through `0009`, `0011`, and `0012` as
applied. Migration `0010_bernoulli_flow_simulation_registration.sql` is committed and
validated but deliberately unapplied. Its canonical database lesson/module parent does
not yet exist, and the Bernoulli material remains `Engineering review required`.
Recording a no-op application would create future migration drift.

No database migration required by the currently public release surface is pending.

## Known Limitations

1. No structured lesson currently has both an approved review record and published
   status, so the required positive public-lesson smoke case cannot yet pass.
2. No simulation is approved for public student use; the Simulation Lab therefore shows
   an honest reviewed-content empty state.
3. Password-reset request acceptance was verified without account disclosure, but email
   delivery cannot be proven without a controlled mailbox.
4. Reviewer assignment is role-based; assignment-level reviewer scoping is not yet a
   first-class persisted relation.

## Next Gate

An independent engineering reviewer must select one source-complete lesson, complete the
required equation and safety review, create the named review record, and authorise its
publication. The approved lesson must then be deployed and rerun through anonymous,
authenticated, and RLS publication checks before controlled pilot readiness can change.
