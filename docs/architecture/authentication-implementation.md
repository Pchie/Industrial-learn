# Authentication Implementation

## Purpose

Industrial Learn now resolves private user identity from a trusted server session. Private routes must not accept student IDs, profile IDs, roles, or user IDs from query parameters, browser storage, hidden form fields, or request bodies without server verification.

## Provider

The implemented provider is Supabase authentication, matching the selected architecture. Browser-safe code may use only public anonymous Supabase credentials. Server code resolves sessions and profiles and may use server-only Supabase configuration for trusted profile provisioning.

For local automated tests, `INDUSTRIAL_LEARN_AUTH_MODE=local` plus `INDUSTRIAL_LEARN_E2E=true` dynamically loads a test-local auth provider. This mode is intended for Playwright only and is not a production or general development fallback. The provider is blocked when `NEXT_PUBLIC_APP_ENV` is `staging` or `production`, when E2E mode is not explicitly enabled, or when `APP_BASE_URL` is not an approved local test host.

## Session Model

Session cookies:

- `il_session`: HTTP-only access/session token.
- `il_refresh`: HTTP-only refresh token where the provider supplies one.
- `il_recovery`: separate HTTP-only password-recovery authority, capped at ten minutes
  and at the provider token's remaining lifetime. It is never used to resolve an
  application session.

Cookie controls:

- HTTP-only.
- SameSite Lax.
- Secure in production.
- Path scoped to `/`.

The browser never receives service-role keys, administrative credentials, reset tokens from logs, or hidden role claims.

## Server Resolution Flow

```text
Request
-> read HTTP-only session cookie
-> validate provider session
-> resolve authenticated auth user ID
-> resolve application profile
-> resolve database-backed roles
-> derive authorised capabilities
-> render protected route or deny
```

Reusable server methods live in `apps/web/src/features/auth/server.ts`:

- `resolveAuthenticatedSession()`
- `requireAuthenticatedUser()`
- `requireRole()`
- `requireAnyRole()`
- `requireStudentProfile()`
- `requireContentReviewer()`
- `requireAdministrator()`
- `requireCapability()`
- `requirePlatformManager()`
- `requirePlatformOwner()`

## Profile Creation

New accounts receive one application profile through an idempotent provider operation. The default role is `student`.

Provisioning happens only after the server validates `/auth/v1/user` and a confirmed
email address. A signup response alone does not authorize a profile insert. Profile
lookup/role-assignment failures are not reported as successful provisioning, and a
disabled profile cannot be reactivated by this path.

Profile rules:

- User IDs are supplied by the authenticated provider, not browser input.
- Duplicate profile creation returns the existing profile where the auth user already owns it.
- Email collision with a different auth user is rejected.
- New users cannot assign lecturer, reviewer, author, or administrator roles.
- Profile creation failures return safe errors and do not log secrets.

## Implemented Routes

- `/auth/sign-up`
- `/auth/sign-in`
- `/auth/sign-out`
- `/auth/verify`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/error`

Protected routes:

- `/dashboard`
- `/my-learning`
- `/projects`
- `/assessments`
- `/simulations/history`
- `/author`
- `/review`
- `/admin`
- `/workspace`
- `/account/access`
- `/lecturer`
- `/owner`
- `/admin/users`
- `/preview/lessons/[lessonSlug]?version=[version]`

Only approved, published curriculum and lessons remain public. Exact-version draft preview
requires an authenticated `content:preview` capability.

## Dashboard Identity Change

The dashboard no longer accepts `searchParams.studentId`. It calls `requireStudentProfile()` and builds the view model from the authenticated server profile.

## Known Boundaries

- Supabase-backed role resolution expects the existing `profiles`, `roles`, and `profile_roles` tables.
- Platform Owner access is a database role, never a browser claim. It provides workspace
  inspection and management but not independent engineering-review approval.
- In staging and production, Supabase credentials must be configured. The test-local provider is not statically imported by the server auth module and is blocked by environment validation outside approved local E2E hosts.
- Student progress is now read through the authenticated data-access layer. See
  `docs/architecture/data-access-layer.md`; a missing profile never selects demo data.
- No automatic refresh-token renewal is implemented. Expired access sessions require
  a fresh sign-in; the refresh cookie lifetime is not an uninterrupted-session promise.

## Confirmation And Password Recovery

See [the staging mail runbook](../operations/staging-account-lifecycle.md) for deployment
ordering, exact templates, live evidence and the external delivery gate.

`GET /auth/verify?token_hash=...&type=email|recovery` renders an explicit confirmation
button without consuming the one-time link. A same-origin server action exchanges the
hash with Supabase. Email confirmation returns to sign-in; recovery clears ordinary
session cookies and creates only `il_recovery`. The password action ignores URL/form
tokens and ordinary login cookies, uses the recovery authority on the server, and clears
all cookies after a successful password change. Logout also clears recovery authority.
Passwords retain their exact whitespace. Unsupported link types and used/expired hashes
fail closed. Auth routes use private/no-store, no-referrer and noindex headers.

Password-reset requests remain enumeration-safe. Provider transport failures generate
redacted operational events without email addresses, passwords or link hashes. Auth and
profile HTTP requests use bounded timeouts and no-store. Existing server-action origin
validation remains in force. A Supabase logout revokes refresh sessions; already issued
access JWTs may remain valid until their provider expiry, so this is not an immediate
all-device revocation guarantee.
