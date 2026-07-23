# Industrial Learn

Industrial Learn is a professional engineering education platform foundation for Core Engineering and Future Engineering.

This repository currently contains:

- Product, architecture, and curriculum documentation.
- A Next.js App Router application shell.
- Modular TypeScript packages for environment validation, database integration boundaries, and shared platform constants.
- Vitest and Playwright test configuration.

## Development

Install dependencies:

```bash
npm install
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
```

Run the CI-ready check sequence:

```bash
npm run ci
```

## Environment

Copy `.env.example` to `.env.local` and provide Supabase values when a Supabase project is available.

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may be exposed to browser code. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to the browser.

## Current Scope

The application foundation intentionally does not include lessons, simulations, authentication, database migrations, or production data flows yet.
