# Prompt 46C Staging Auth And Reviewer Onboarding Audit

Date: 2026-09-01

## Executive Summary

The staging signup error was traced to Vercel branch scoping, not application redirect logic.
All auth variables were restricted to `Preview (development)`, while the observed deployment
was a feature-branch Preview. The application therefore selected its fail-closed provider and
returned `configuration_error`.

The repository now contains safe configuration diagnostics and a first-class, audited,
exact-version reviewer assignment boundary. Migration 0016 is applied to the staging database,
its privileges and RLS boundaries have been verified, and all local quality gates pass.
Privileged staging secrets were not copied to a feature Preview because that would broaden
credential exposure. The application changes still require review and merge to `development`
before the final live signup and reviewer onboarding journey can run on stable staging.

## Exact Root Cause

| Item                      | Verdict                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------- |
| File                      | `apps/web/src/features/auth/supabase-provider.ts`                                   |
| Function                  | `createSupabaseAuthProvider`, then `unavailableProvider.signUp`                     |
| Failing condition         | Missing Supabase URL or public anonymous key                                        |
| Deployment classification | Vercel Preview                                                                      |
| Configuration defect      | Required variables existed only for `Preview (development)`, not the feature branch |
| `next` parameter          | Valid internal path; not causal and not permission-bearing                          |

Evidence ID: IL-46C-VERCEL-001, read-only Vercel inspection on 2026-08-31.

## Changes

- Added safe server-side configuration diagnostics that record names and environment state,
  never values.
- Added unit coverage for valid Supabase signup, missing configuration, and Student-only
  profile provisioning.
- Added migration `0016_secure_review_assignments.sql`.
- Added owner/admin assignment controls with user search, role management, exact-version
  assignment, cancellation, and audit history.
- Changed Reviewer Workspace data to assignment-filtered records.
- Added direct-route assignment enforcement and clear unassigned-reviewer guidance.
- Added local integration and browser tests for the full controlled workflow.
- Did not change lesson content, equations, publication status, or production configuration.

## Security Verification

| Control                             | Result                                              |
| ----------------------------------- | --------------------------------------------------- |
| Signup default role                 | Student only in provider implementation and tests   |
| Self-assigned reviewer role         | Blocked by existing manager RPC                     |
| Self-assigned review                | Blocked by new manager RPC                          |
| Direct assignment writes            | Not granted to authenticated users                  |
| Cross-reviewer assignment reads     | Blocked by RLS                                      |
| Unassigned direct review URL        | Blocked by server data filter and route guard       |
| Unassigned database review decision | Blocked by database trigger                         |
| Exact content version               | Composite foreign key and current-version RPC check |
| Role removal                        | Cancels active assignments                          |
| Decision completion                 | Completes matching assignment atomically            |
| Student-private data                | No new reviewer path introduced                     |
| Basic Fluid Pressure publication    | Remains draft; no publication action added          |

## Environment Findings

The required names are documented in
`docs/auth/staging-signup-troubleshooting.md`. Values were neither printed nor committed.
The safe staging strategy remains the Vercel `development` branch Preview at:

`https://industrial-learn-staging-git-development-kolobe.vercel.app`

The feature-branch deployment is not the controlled staging identity and should not receive
broad staging service credentials.

The stable sign-in route rendered successfully and an intentionally invalid credential attempt
returned `invalid_credentials`, proving that its Supabase auth configuration is available. A
browser console refusal for `vercel.live/_next-live/feedback/feedback.js`, together with a Vercel
access `401`, belongs to Vercel's optional Preview Feedback toolbar. It is not an Industrial Learn
or Supabase authentication failure. The CSP remains strict by design.

## Live Staging Database Verification

Migration `0016_secure_review_assignments.sql` was applied to staging project
`lgjujyaclrpaopdabyzg` in one transaction and recorded in the migration ledger. A rollback-only
privilege and RLS verification proved:

- an authorised Platform Owner can create an exact-version assignment;
- a manager cannot assign a review to themselves;
- the assigned reviewer can read their own assignment;
- another authenticated profile cannot read it;
- assignment changes create the expected audit event;
- authenticated users have `SELECT` but no direct `INSERT`, `UPDATE`, or `DELETE` privilege;
- anonymous users cannot read assignments or execute the management function;
- authenticated users may execute the management function, whose manager check remains active.

No synthetic verification assignment was retained after the transaction rolled back.

## Test Record

Final verification results:

| Gate                        | Result                                       |
| --------------------------- | -------------------------------------------- |
| Secret scan                 | PASS                                         |
| Formatting                  | PASS                                         |
| Type checking               | PASS                                         |
| Linting                     | PASS                                         |
| Content validation          | PASS, 29 validations                         |
| Migration validation        | PASS, 19 validations                         |
| Focused auth/database tests | PASS, 39 tests                               |
| Full unit tests             | PASS, 367 passed and 5 intentionally skipped |
| Production build            | PASS, 38 routes generated                    |
| Accessibility browser tests | PASS, 42 tests                               |
| Smoke browser tests         | PASS, 5 tests                                |
| Complete end-to-end tests   | PASS, 106 tests                              |
| Live migration/RLS checks   | PASS                                         |

The only recurring test-runner warning is that `NO_COLOR` is ignored when `FORCE_COLOR` is set.
It has no effect on application behaviour or test results.

## Verdicts

| Area                                 | Current verdict                                                  |
| ------------------------------------ | ---------------------------------------------------------------- |
| Staging signup configuration         | PASS on current stable staging runtime                           |
| Normal user registration             | PENDING controlled synthetic live signup                         |
| Reviewer role assignment             | PASS locally; staging database protected by migration 0015       |
| Reviewer assignment                  | PASS locally and at staging database boundary via migration 0016 |
| Basic Fluid Pressure reviewer access | PENDING application merge and named exact-version assignment     |

## Exact Next Human Action

Review and merge the Prompt 46B and Prompt 46C pull requests into `development` in dependency
order. Confirm the stable staging alias redeploys with the existing `Preview (development)`
variables. Then create a synthetic Student account, assign Engineering Reviewer, assign Basic
Fluid Pressure version `0.4.0` / revision `4`, and verify the item appears under Reviewer,
Assigned to me.

Do not publish Basic Fluid Pressure during this verification.
