# Supabase Staging Security

## Environment Boundaries

| Environment | Authentication                              | Data                                     | Secrets                           |
| ----------- | ------------------------------------------- | ---------------------------------------- | --------------------------------- |
| Development | Local E2E auth or development Supabase only | Synthetic local data                     | Local untracked `.env.local` only |
| Staging     | Dedicated Supabase staging project          | Synthetic or approved test data only     | Approved secret manager only      |
| Production  | Not configured by this task                 | Real production data only after approval | Production secret manager only    |

Staging must never share a Supabase project with local development, automated tests, personal experiments, or future production.

## Test Auth Guard

`INDUSTRIAL_LEARN_AUTH_MODE=local` is blocked when:

- `NEXT_PUBLIC_APP_ENV=staging`
- `NEXT_PUBLIC_APP_ENV=production`
- `INDUSTRIAL_LEARN_E2E` is not `true`
- `APP_BASE_URL` is missing or not an approved local test host

Approved local test hosts are:

- `localhost`
- `127.0.0.1`
- `[::1]`

## Secret Handling

- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- `SUPABASE_DB_URL` is server-only.
- Browser code may receive only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_ENV`.
- The anon key is public but must remain constrained by row-level security.
- Real staging values must not appear in `.env.example`, `.env.staging.example`, source files, GitHub Actions, screenshots, reports, or fixtures.

## Authentication Controls

For staging:

- Use email and password authentication.
- Require email confirmation.
- Configure the staging site URL and redirect URLs explicitly.
- Keep local development redirect URLs separate from staging redirect URLs.
- Do not enable anonymous sign-in.
- Do not enable social identity providers without a future product decision.
- Configure password reset to return only to approved application routes.
- Enable refresh token rotation where available.
- Use bounded session expiry.
- Review rate limits and enable bot protection where available.

## Profile And Role Controls

- `profiles.id` must match `auth.uid()`.
- A new account receives the `student` role by default.
- Elevated roles are not accepted from browser-submitted data.
- `profile_roles` is writable only by administrators or trusted server-side operations.
- Reviewers do not automatically receive access to private student progress, attempts, or submissions.

## Logging And Privacy

Staging logs must not intentionally contain:

- passwords
- access tokens
- refresh tokens
- reset links
- service-role keys
- assessment answers
- sensitive project submission contents

Staging log access should be limited to release engineers, application-security reviewers, and approved maintainers. Use the minimum practical retention period that still supports staging release verification.

## Storage Decision

Supabase Storage is deferred for staging at this point. Future storage may be needed for student project submissions, engineering diagrams, approved source documents, reviewer evidence, and profile images.

Before enabling storage, define:

- private bucket names
- file type limits
- maximum file size
- ownership policies
- malware scanning strategy
- download permissions
- retention policy

Do not create public buckets for private student submissions.
