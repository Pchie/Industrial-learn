# Static Lesson Review-Record Gate

## Security Objective

Static lesson metadata cannot create student visibility by changing publication and
review status fields alone. Public delivery requires version-matched review evidence and
separate administrator publication authorization.

## Enforcement Boundaries

Build-time validation reads every JSON record under `content/reviews/`. A lesson marked
`Approved for student use` or `published` fails validation unless its exact ID, version,
and author identity have the required passing records.

Runtime delivery derives publication authority from the server-side static review-record
registry. UI code cannot supply a free-form current or published version to make a lesson
visible. The existing central publication policy still requires:

- `published` publication status.
- `Approved for student use` review status.
- Approved source evidence.
- The current version to equal the reviewed published version.

## Required Records

Every static lesson requires source, educational-structure, safety, independent
engineering-approval, and administrator-publication records. Equation review is required
when equation IDs are present. Simulation review is required when simulation IDs are
present.

Review records must identify the content author and named reviewer. Technical approvals
from the author are rejected. Only an administrator record can satisfy publication
authorization, and that authorization does not replace engineering approval.

## Failure Behaviour

Missing authorship, malformed records, stale-version records, self-review, incomplete
evidence coverage, unauthorised roles, and missing required review types all fail closed.
Draft and internal content remains available only through existing authorised internal
paths.

## Operational Rule

Review records are immutable evidence for one content version. Any content change requires
a version increment and fresh review. Publication changes must use a reviewed feature
branch and pull request; they must not be committed directly to `main`.
