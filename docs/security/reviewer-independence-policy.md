# Reviewer Independence Policy

## Separation of Authority

Industrial Learn separates access authority from independent review authority.

- Platform Owner may inspect review queues, versions, sources, equations, assessments,
  visual experiences, and audit records.
- Engineering Reviewer and Administrator roles may record review decisions through the
  trusted review function.
- Platform Owner alone cannot record an engineering decision.
- An authorised reviewer whose profile is the accountable author cannot approve the same
  exact content version.

## Exact-Version Gate

Approval requires the current governance revision, the structured content version label,
required evidence attestations, safety outcome, reviewer notes, and an explicit exact-version
attestation. The server reloads the governance record before submission. The database
function repeats the version, role, evidence, and authorship checks and records an audit
event atomically.

Approval does not publish content. Publication remains a separate gated action and Basic
Fluid Pressure remains draft until that later action is explicitly authorised.

## Protected Preview

`/preview/lessons/[lessonSlug]?version=[version]` requires `content:preview`, rejects missing
or mismatched versions, carries `noindex`, and displays `PREVIEW — NOT PUBLISHED`. It does
not add content to public lesson discovery or expose pre-submission assessment answers.
