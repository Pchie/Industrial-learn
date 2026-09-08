# Industrial Learn

Industrial Learn is a professional engineering education platform for Core Engineering and Future Engineering.

This repository currently contains:

- Product, architecture, and curriculum documentation.
- A shared Next.js App Router interface, authenticated workspaces, and a student dashboard.
- Reviewed lesson delivery, server-scored assessments, protected simulation tooling, and Supabase persistence.
- Modular TypeScript packages for engineering calculations, simulations, content governance, and database access.
- Vitest and Playwright test configuration.

## Development

Install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Run checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:unit
npm run build
npm run test:e2e
```

Run the CI-ready check sequence:

```bash
npm run ci
```

The browser suite builds and starts a fresh local fixture server on port 3100, then
stops it after the run. Keep that port free. Existing servers are not reused by default
because they can retain test attempts and role assignments from earlier runs.
`PLAYWRIGHT_REUSE_SERVER=true` is an explicit local debugging option, not a clean release
verification. It is ignored in CI. Run full browser verification without competing
browser scans or builds on the same machine.

The live staging publication regression is separate from local fixture tests:

```bash
STAGING_ENV_FILE=.env.staging.local node scripts/verify-staging-publication.mjs
```

It requires authorized staging credentials and the existing `psql` operator tool. It
rejects production targets and rolls back every synthetic fixture. Never commit that
environment file or pass private values on the command line.

## Environment

Copy `.env.example` to `.env.local` and provide Supabase values when a Supabase project is available.

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may be exposed to browser code. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to the browser.

## Current Scope

Only independently reviewed and published material is available to students. The current
staging path is Basic Fluid Pressure with its assessment; review-required simulations
remain inaccessible to ordinary students. The fictional reference dashboard is local/test-only.

Use feature branches and pull requests into `development`, then verify protected staging.
`main` remains production-controlled and requires a separate release decision. See the
[environment strategy](docs/deployment/environment-strategy.md) and the
[live staging verification report](docs/audits/dashboard-live-staging-release-verification.md).
