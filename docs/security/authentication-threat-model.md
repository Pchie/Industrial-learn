# Authentication Threat Model

## Assets Protected

- Student profiles.
- Student progress and assessment attempts.
- Project submissions.
- Simulation history.
- Content authoring access.
- Engineering review access.
- Administrative access.
- Authentication cookies and reset flows.
- Supabase service-role key and private environment variables.

## Trust Boundaries

| Boundary                  | Trusted side                             | Untrusted side                           | Control                                                |
| ------------------------- | ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| Browser to server         | Server route/action                      | Form fields, query params, local storage | Validate server-side and ignore client identity claims |
| Server to auth provider   | Supabase or explicit local test provider | Network/auth errors                      | Safe error mapping and no token logging                |
| Server to database        | Authenticated server client              | Browser-provided roles or IDs            | Resolve profile and roles from trusted records         |
| Protected route rendering | Server session resolver                  | Client redirect state                    | Server-side `require*` checks                          |

## Main Threats And Controls

| Threat                           | Control                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session fixation                 | Session cookies are set only after provider sign-in/sign-up and rotated by provider/local session creation.                                       |
| Open redirects                   | Redirect targets pass through `safeInternalRedirect()`. External origins, protocol-relative URLs, backslashes, and newline payloads are rejected. |
| User enumeration                 | Password-reset requests always return the same safe success state.                                                                                |
| Client-side privilege escalation | Roles are resolved from provider/database records, not query params, local storage, or editable client claims.                                    |
| Cross-user profile access        | Dashboard ignores `studentId` query params and resolves the student profile from the server session.                                              |
| Service-role exposure            | Service-role key is never used in browser code and is referenced only as a server-side environment value.                                         |
| Unsafe auth errors               | Public messages are mapped to safe states.                                                                                                        |
| Auth data in logs                | Implementation does not log passwords, tokens, reset links, cookies, or secret keys.                                                              |
| Assessment or reviewer bypass    | Reviewer/admin routes require trusted server-side role checks.                                                                                    |

## Local Test Auth Boundary

`INDUSTRIAL_LEARN_AUTH_MODE=local` with `INDUSTRIAL_LEARN_E2E=true` dynamically loads test accounts for Playwright. It must not be enabled in production.

The local provider exists to test secure flow mechanics without production credentials. It does not replace Supabase for deployed environments.

## Remaining Security Work

- Add live Supabase integration tests once a dedicated test Supabase project exists.
- Add account lockout and rate limiting at the auth provider or edge layer.
- Add audit events for administrative and review access once persistence is wired.
- Add central logging with secret redaction before production.
