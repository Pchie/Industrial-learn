# Industrial Learn Development Rules

Industrial Learn is a professional engineering education platform containing:

- Core Engineering
- Future Engineering
- Interactive simulations
- Assessments
- Student progress
- Engineering projects
- A reviewed technical knowledge system

These rules are permanent development instructions for this repository.

## Non-Negotiable Rules

1. Do not make unrelated changes.
2. Inspect existing files before editing.
3. Explain the proposed implementation before major architectural changes.
4. Do not delete working functionality without explicit approval.
5. Do not install a dependency without documenting why it is required.
6. Do not place engineering formulas directly inside UI components.
7. Engineering calculations must be implemented as pure tested functions.
8. All calculations must use consistent SI units internally.
9. Every important technical statement must reference an approved source ID.
10. Never invent standards, clauses, equipment ratings, or manufacturer data.
11. All database changes must use version-controlled migrations.
12. Never expose secrets or service credentials to the browser.
13. All user data must have an ownership and access-control policy.
14. All interactive components must support keyboard use.
15. Do not communicate meaning through colour alone.
16. All new features must work on mobile, tablet, and desktop.
17. All new calculations require automated tests.
18. All new simulations require normal-state, boundary, and fault-state tests.
19. Every task must include a change summary and known limitations.
20. Never commit directly to the production branch.

## Required Workflow

For every task:

1. Inspect.
2. Summarise the current implementation.
3. Propose a plan.
4. Identify files to be changed.
5. Implement only the approved scope.
6. Run type checking.
7. Run linting.
8. Run relevant tests.
9. Report results.
10. Identify remaining work.

## Architectural Rules

Keep these concerns separate:

- User interface
- Business logic
- Engineering calculations
- Simulation state
- Content
- Assessments
- Database access
- Authentication
- AI retrieval
- Source references

## Engineering Calculation Rules

- Engineering formulas must not live directly inside UI components.
- Engineering calculations must be pure functions.
- Engineering calculations must be covered by automated tests.
- Engineering calculations must use consistent SI units internally.
- New simulations must include tests for normal state, boundary state, and fault state.

## Technical Knowledge And Sources

- Every important technical statement must reference an approved source ID.
- Do not invent standards, clauses, equipment ratings, or manufacturer data.
- Do not label content as approved unless a review record exists.

## Content Status

All engineering content must use one of these statuses:

- Draft
- Source required
- Source checked
- Equation checked
- Simulation checked
- Engineering review required
- Approved for student use

Do not label content approved unless a review record exists.

## Security And Data

- Never expose secrets or service credentials to the browser.
- All user data must have an ownership and access-control policy.
- All database changes must use version-controlled migrations.

## Accessibility And Device Support

- All interactive components must support keyboard use.
- Do not communicate meaning through colour alone.
- All new features must work on mobile, tablet, and desktop.
