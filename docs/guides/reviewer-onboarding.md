# Engineering Reviewer Onboarding

Date: 2026-08-31

## Purpose

This is the controlled staging workflow for onboarding a named independent Engineering
Reviewer. Authentication, application role, and exact-version review assignment are three
separate gates.

## Evidence IDs

- IL-46C-ROLE-001: `database/migrations/0015_platform_owner_access_management.sql`
- IL-46C-ASSIGN-001: `database/migrations/0016_secure_review_assignments.sql`
- IL-46C-OWNER-001: `apps/web/src/features/platform-administration/components.tsx`
- IL-46C-REVIEW-001: `apps/web/src/features/content-governance/server-data.ts`
- IL-46C-GUARD-001: `apps/web/src/app/review/[lessonSlug]/page.tsx`

## Workflow

1. The prospective reviewer opens the stable staging `/auth/sign-up` page.
2. The person creates and verifies a normal account.
3. Industrial Learn creates a profile with Student as the only default role.
4. The Platform Owner signs in and opens Workspace, Platform Management, then Users and roles.
5. Under **Users and roles**, use **Find user by name or email**.
6. Confirm the identity and current roles. Select Engineering Reviewer, Assign role, provide an audit reason, confirm, and apply.
7. Under **Engineering review assignments**, locate Basic Fluid Pressure.
8. Confirm content version `0.4.0`, governance revision `4`, workflow state Engineering review required, and publication state draft.
9. Select the named reviewer, provide an assignment reason, attest to the exact version, and choose **Assign exact version**.
10. The reviewer signs out and signs in again so the server resolves the new role.
11. The reviewer opens Workspace, Reviewer, then **Assigned to me**.
12. The reviewer opens Basic Fluid Pressure. The direct route remains `/review/basic-fluid-pressure`.

## Expected Access States

| State                                                     | Expected result                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| New verified account                                      | Student workspace only                                                    |
| `next=/review/basic-fluid-pressure` without reviewer role | Access denied; no role change                                             |
| Reviewer role without assignment                          | Reviewer workspace with “No assigned reviews”; direct item route denied   |
| Reviewer role with active revision 4 assignment           | Basic Fluid Pressure appears under Assigned to me                         |
| Cancelled assignment                                      | Item is removed from the active reviewer queue                            |
| Reviewer role removed                                     | Active assignments are cancelled and reviewer workspace access is removed |
| Completed decision                                        | Matching exact-version assignment is marked completed atomically          |

## Review Decision Boundary

Assignment allows the reviewer to inspect the exact review package. It does not approve or
publish the lesson. A review decision is still checked against reviewer identity, author
separation, current governance revision, snapshot version label, sources, equation evidence,
safety and limitations, educational review, and accessibility review. Evidence:
IL-46C-ASSIGN-001 and the existing atomic content-review migration.

Basic Fluid Pressure must remain unpublished until a valid independent human review record
exists and a separate authorised publication action is completed.

## Removal

The Platform Owner may cancel an active assignment in the same management section with a
reason and confirmation. Removing Engineering Reviewer also cancels active assignments.
Historical assignment and audit records remain available for accountability.
