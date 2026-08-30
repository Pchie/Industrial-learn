# Static Technical Review Records

Store one immutable JSON record per lesson review and content version in this directory.
Every record must validate against
`content/schemas/technical-review-record.schema.json`.

A lesson cannot be labelled `Approved for student use` or published unless the exact
version has all required review records, including a named independent engineering
approval and a separate administrator publication authorization. Updating a lesson
creates a new version and invalidates publication authority until that version is
reviewed. Authors cannot approve their own work through this static-content path.

After review records are created, register their static imports in
`apps/web/src/features/publication/review-records.ts`. Validation and runtime delivery are
separate gates; status changes or unregistered review files cannot publish a lesson.

No approval records exist yet. The current lessons remain draft or internal pending
independent human review.
