# Staging Signup Troubleshooting

Date: 2026-08-31

## Scope

This guide covers the Industrial Learn staging Supabase signup path. It does not apply to
production and does not grant elevated application roles.

## Evidence IDs

- IL-46C-AUTH-001: `apps/web/src/features/auth/supabase-provider.ts`
- IL-46C-AUTH-002: `apps/web/src/features/auth/actions.ts`
- IL-46C-ENV-001: `packages/env/src/index.ts`
- IL-46C-VERCEL-001: read-only Vercel environment inspection on 2026-08-31
- IL-46C-DEPLOY-001: `docs/deployment/vercel-staging-setup.md`

## Confirmed Root Cause

The failing deployment was Vercel **Preview**, not Production or Development. Every
configured staging variable was restricted to `Preview (development)`. The feature-branch
deployment therefore received none of those variables. `createSupabaseAuthProvider` in
IL-46C-AUTH-001 detects the missing Supabase URL or public anonymous key and returns the
fail-closed provider. Its `signUp` method returns `configuration_error`.

This is an environment-scope failure, not a `next` parameter failure and not a Supabase
permission bypass.

## Required Variable Names

The deployed staging runtime requires these names:

- `NEXT_PUBLIC_APP_ENV`
- `APP_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_URL`
- `INDUSTRIAL_LEARN_AUTH_MODE`
- `INDUSTRIAL_LEARN_E2E`

Vercel supplies `NODE_ENV=production` for the deployed Next.js runtime. The Supabase URL
and anonymous key are public configuration. The service-role key and database URL are
server-only secrets and must never use a `NEXT_PUBLIC_` name. Evidence: IL-46C-ENV-001.

## Safe Diagnostics

When signup or sign-in returns `configuration_error`, IL-46C-AUTH-002 now records:

- the safe error code;
- application environment;
- auth mode;
- Vercel environment classification;
- missing variable names.

No variable value, credential, email address, password, access token, or service key is
recorded. The browser continues to receive only the safe public message.

## Stable Staging Strategy

Use the `development` branch Preview as the staging environment:

`https://industrial-learn-staging-git-development-kolobe.vercel.app`

Keep staging secrets scoped to `Preview (development)`. Do not copy privileged staging
secrets broadly to every feature-branch Preview. Merge reviewed changes through a pull
request, allow Vercel to redeploy the stable alias, and test there. Evidence:
IL-46C-DEPLOY-001.

## Supabase Authentication URLs

For staging project `lgjujyaclrpaopdabyzg`, configure:

| Setting                      | Exact staging value                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| Site URL                     | `https://industrial-learn-staging-git-development-kolobe.vercel.app`                     |
| Signup verification redirect | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/verify`         |
| Invitation/sign-in redirect  | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/sign-in`        |
| Password reset redirect      | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/reset-password` |

Add the three route URLs above to the redirect allowlist. A broad Vercel wildcard is not
required for the controlled staging pilot and would increase redirect exposure.

## Vercel Preview Feedback Console Messages

Vercel may inject its optional Preview Feedback toolbar into Preview deployments. Industrial
Learn's Content Security Policy intentionally does not allow scripts from `vercel.live`, so a
browser console may report that `_next-live/feedback/feedback.js` was refused. The toolbar may
also request a Vercel access endpoint that returns `401` when the visitor has no Vercel session.

These messages do not come from the Industrial Learn reviewer route or Supabase. Confirm the
application path separately: the sign-in form must render, retain the internal `next` path, and
return a provider response rather than `configuration_error`. Do not weaken the application CSP
or grant Vercel project access merely to silence this optional toolbar.

## Operator Recovery

1. In Vercel, open `kolobe/industrial-learn-staging` and select Settings, then Environment Variables.
2. Confirm every required name is present for Preview with Git branch `development`.
3. Confirm `NEXT_PUBLIC_APP_ENV` represents staging, auth mode represents Supabase, E2E mode is disabled, and `APP_BASE_URL` is the stable staging URL.
4. Do not reveal or copy secret values into tickets, chat, source control, or feature previews.
5. In Supabase Authentication URL Configuration, enter the exact URLs above.
6. Merge the reviewed application pull request into `development`.
7. Confirm a new Vercel Preview deployment updates the stable staging alias.
8. Open `/auth/sign-up`, register a synthetic account, and follow the verification message.
9. Confirm the resulting application profile has only Student access.
10. Continue with `docs/guides/reviewer-onboarding.md`.

## Failure Interpretation

- `configuration_error`: required provider configuration is unavailable; inspect safe server diagnostics.
- `missing_profile` or `profile_creation_failed`: Supabase Auth may have created the user, but trusted profile provisioning failed.
- `invalid_credentials`: the provider rejected the submitted credentials or signup request without disclosing sensitive detail.
- A successful-looking repeated signup does not replace an existing account password or guarantee
  another confirmation email. Check the Auth service log for `user_repeated_signup`, then use the
  original password or the controlled password-recovery flow.
- Supabase's built-in SMTP service is unsuitable for an independent external reviewer. Configure a
  dedicated staging SMTP provider before relying on confirmation or recovery delivery outside the
  Supabase organisation team. Do not disable email confirmation as a workaround.
- access denied after `next=/review/...`: signup succeeded as Student, and reviewer authorization correctly remained absent.
