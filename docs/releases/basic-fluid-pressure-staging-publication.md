# Basic Fluid Pressure Staging Publication

Release date: 2026-09-04

Environment: protected staging only

Release candidate: `basic-fluid-pressure-staging-v0.4.0-rc1`

## Release Decision

**PUBLISHED TO PROTECTED STAGING**

This release publishes one exact approved lesson version. Approval and publication
remain separate governance decisions: the engineering reviewer approved version `0.4.0`,
and the staging Platform Owner subsequently authorized and executed its publication.

No other lesson, module, assessment, simulation, or production environment was included.

## Exact Published Artifact

| Field                                | Published value                                                    |
| ------------------------------------ | ------------------------------------------------------------------ |
| Lesson                               | Basic Fluid Pressure                                               |
| Lesson ID                            | `LES-FLUID-PRESSURE-001`                                           |
| Slug                                 | `basic-fluid-pressure`                                             |
| Content entity                       | `94f5c2b9-a0b9-43f5-8b6b-4a3a67fc4f01`                             |
| Governance item                      | `ee1c9dd7-83a1-4811-9fce-3cb517186a9f`                             |
| Reviewed and published version       | `0.4.0`                                                            |
| Reviewed artifact commit             | `bbd81abc0e1351d6280e3fc022d1138ad316ec1e`                         |
| Reviewed artifact SHA-256            | `f3746a0730b154023a1faea80719f1cfde27477aae22b164bcfe71cab3ca552a` |
| Publication implementation commit    | `9b8329a589dee3ac953d6245de51ad2c876a8bae`                         |
| Public-delivery hardening commit     | `e3804a3ae4ab6fa1b79ef1192703f5ef35814a52`                         |
| Engineering approval record          | `31510bc1-aecf-48fb-a40e-c427a86f115e`                             |
| Repository engineering approval      | `REV-BASIC-FLUID-PRESSURE-V040-ENGINEERING-APPROVAL`               |
| Repository publication authorization | `REV-BASIC-FLUID-PRESSURE-V040-PUBLICATION-AUTHORIZATION`          |
| Approval date                        | `2026-09-03T17:55:56.269Z`                                         |
| Publication timestamp                | `2026-09-04T14:28:13.657991Z`                                      |
| Publication audit event              | `ce2b68d1-6d7e-4f4d-8593-86da3d729c71`                             |
| Author alias                         | `author-basic-fluid-pressure-v040`                                 |
| Independent reviewer alias           | `independent-reviewer-basic-fluid-pressure-v040`                   |
| Publisher actor                      | Protected staging Platform Owner                                   |

The publisher's database identity and private reviewer comments remain in protected
governance records and are not copied into student-facing content or this public-safe
release record.

## Approved Evidence Set

The exact source set is:

- `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`
- `SRC-PSU-CIMBALA-PRESSURE-BASICS`

The exact equation set is:

- `EQ-FLUID-PRESSURE-001`

The lesson has no simulation dependency. Publication therefore did not authorize or
expose a simulation. Its separate formal assessment also remains unavailable until its
own governance and publication gates pass.

## Integrity Verification

The reviewed full lesson file has the recorded SHA-256 above. Before publication, an
object-level comparison against the reviewed commit confirmed that the instructional
artifact was unchanged after normalizing only the permitted top-level publication
envelope: review status, publication status, published version, approval record IDs,
author alias, and multiple-source verification metadata.

No equation, source set, worked example, safety statement, learning outcome, activity,
or technical explanation changed under the existing approval.

## Controlled Publication

Migration `0018_atomic_staging_content_publication.sql` introduced the controlled
staging publication function. The function:

- accepts only the `staging` environment;
- requires an authenticated Platform Owner or Administrator;
- locks the governed item and selected version;
- verifies the exact approval, author/reviewer separation, attestations, source and
  equation sets, accessibility evidence, and release metadata;
- updates the governed version and item atomically;
- records one audit event; and
- returns the existing publication result for an identical retry.

The durable call changed the lesson from approved/draft to approved/published. A repeated
identical request returned the same audit event with `was_already_published = true`; the
audit-event count remained one.

## Student Delivery

The protected staging deployment exposes Basic Fluid Pressure through its direct lesson
URL, Learn, Core Engineering, and deterministic lesson search. The unpublished parent
module remains hidden, so the lesson is not shown through that module route. Related
lesson links and recommendations do not surface an unpublished destination.

Student-facing delivery includes only approved citation metadata. Source file paths,
private registry fields, approval-record IDs, author identifiers, reviewer notes, and
content-version records are omitted. Draft/source-required lessons, hidden versions,
review routes, preview routes, and review-required simulations remain denied.

The visual pressure experience, live equation, synchronized inputs, and educational
challenge were verified in staging. Opening the lesson created no lesson progress,
assessment attempt, or simulation attempt.

The final hardening commit passed post-merge CI and produced two GitHub-recorded Vercel
Preview deployments. Deployment `6267354865` is the dedicated staging project and
deployment `6267366171` is the second preview project; both explicitly report
`production_environment = false`.

## Environment Isolation

Staging Supabase project: `lgjujyaclrpaopdabyzg`

Staging application:
`https://industrial-learn-staging-git-development-kolobe.vercel.app`

Production project `vhjjfapkxytmaakbleee` was checked only inside an explicit read-only
transaction. It had no migration `0018`, Basic Fluid Pressure publication record, or
Prompt 47 publication audit event. Production was not modified or deployed.

## Rollback

Application delivery can be rolled back through the reviewed Git and Vercel release
history. Database withdrawal must use a separately authorized, audited governance action;
direct row editing is not an approved rollback mechanism. A generic atomic withdrawal
function is not introduced by Prompt 47.

## Known Limitations

- The parent Fluid Mechanics module is not approved, so its route remains unavailable.
- The related formal assessment remains unavailable under its separate gate.
- No simulation is attached to or published with this lesson.
- The public lesson renderer does not yet persist authenticated progress; it correctly
  awards no progress merely for opening the page.
- Prompt 47 does not add a generic governed withdrawal service.
