# Industrial Learn Security Boundaries

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-PRD-001: `docs/product/product-requirements.md`
- IL-MVP-001: `docs/product/mvp-scope.md`

## Security Objectives

Industrial Learn must protect student data, reviewed engineering content, source references, reviewer actions, credentials, and platform integrity. Security controls must support the product rule that all user data has an ownership and access-control policy. Sources: IL-AGENTS-001, IL-PRD-001.

## Trust Boundaries

| Boundary                           | Trusted Side                | Untrusted Or Less-Trusted Side | Control                                        |
| ---------------------------------- | --------------------------- | ------------------------------ | ---------------------------------------------- |
| Browser to API                     | Server application          | Browser input                  | Validate input and authorise every request     |
| API to database                    | Database access layer       | Feature module requests        | Use scoped queries and transactions            |
| API to object storage              | Server-issued access        | Direct object URLs             | Short-lived access and ownership checks        |
| Author content to approved content | Review workflow             | Draft content                  | Review records and status gates                |
| AI service to knowledge base       | Approved retrieval layer    | Free-form prompts              | Source-filtered retrieval and citation policy  |
| Analytics to dashboards            | Aggregated authorised views | Raw event stream               | Minimise personal data and enforce role access |

## Authentication Boundary

Authentication identifies the user and session. It does not by itself grant access to course, cohort, progress, review, or file data.

Required controls:

- Session validation on protected routes.
- Server-side role checks.
- Account recovery and password or identity-provider policies before launch.
- Clear separation between authentication and domain authorisation.

## Authorisation Boundary

Authorisation is enforced on the server for every protected resource.

Ownership rules:

- Student progress and submissions are owned by the student and visible only to authorised users.
- Lecturer access is scoped to authorised cohorts and assignments.
- Author access is scoped to assigned content areas.
- Reviewer access is scoped to review queues or assigned review areas.
- Administrator access is audited and limited by least privilege.

## Browser Boundary

The browser may hold:

- Public assets.
- User interface state.
- Non-secret session indicators.
- Student-entered activity inputs.
- Approved content returned through authorised APIs.

The browser must not hold:

- Service credentials.
- Database connection strings.
- Object storage service keys.
- Privileged API tokens.
- Hidden answer keys where avoidable.
- Unauthorised draft or review content.

Source: IL-AGENTS-001.

## Database Boundary

PostgreSQL is the source of record for operational data. All schema changes must use version-controlled migrations. Source: IL-AGENTS-001.

Database access rules:

- Feature modules call database access functions, not raw SQL from UI code.
- Queries must include tenant, cohort, ownership, or role constraints where relevant.
- Sensitive write operations must be audited.
- Review status transitions must be transactional.
- Approved content status must require an existing review record.

## File Storage Boundary

Object storage is not a public file server.

File access rules:

- Store file metadata and ownership in PostgreSQL.
- Authorise file access before upload or download.
- Use short-lived upload and download mechanisms.
- Separate public assets from private submissions and reviewer files.
- Scan or validate uploaded file types according to launch policy.

## Content Review Boundary

Draft content is not student-approved content.

Controls:

- Content status must be explicit.
- Important technical statements require approved source IDs.
- Equation and simulation checks must be reviewable.
- Approved for student use requires a review record.
- Review actions must record reviewer identity, timestamp, outcome, and notes.

Sources: IL-AGENTS-001, IL-PRD-001.

## Engineering Calculation Boundary

Calculation functions are trusted only when they are pure, reviewed, and tested.

Controls:

- UI components do not contain formulas.
- Calculations use SI units internally.
- New calculations require automated tests.
- Calculation functions validate input ranges and assumptions.
- Calculation outputs include enough metadata for teaching feedback.

Source: IL-AGENTS-001.

## Simulation Boundary

Simulation UI is separate from simulation logic and calculation functions.

Controls:

- Simulation definitions declare valid ranges, fault states, and assumptions.
- Simulation logic owns state transitions.
- Calculation library owns formulas.
- Normal-state, boundary-state, and fault-state behaviour must be tested.
- Simulation content must include limitations where safety could be misunderstood.

Sources: IL-AGENTS-001, IL-PRD-001.

## AI Boundary

The future AI mentor is a restricted service, not an engineering authority.

Controls:

- Retrieve only approved or policy-authorised content.
- Include approved source IDs for important technical statements.
- Route calculations to tested calculation functions.
- Do not approve content.
- Do not grade high-stakes submissions.
- Do not invent standards, clauses, ratings, or manufacturer data.

Sources: IL-AGENTS-001, IL-MVP-001.

## Logging Boundary

Logs are operational records, not a secondary student-data store.

Controls:

- Do not log secrets.
- Avoid unnecessary personal data.
- Include request correlation IDs.
- Audit content approval and administrative actions.
- Retain logs according to privacy and institutional policy.
