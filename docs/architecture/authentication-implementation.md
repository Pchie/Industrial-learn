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
- Real student progress persistence remains a later task; the dashboard now shows authenticated empty states rather than query-selected seeded progress.
