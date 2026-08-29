# Prompt 40 Test Results

Date: 2026-08-27
Mode: non-destructive/read-only
Local runtime: Node `v24.17.0`, npm `11.13.0`, Vitest `4.1.10`, Playwright `1.61.1`

## Summary

All local static and application suites passed after a prebuilt server was reused for
Playwright. Current live staging database/RLS checks failed because the Supabase staging
project is inactive. Dependency audits reported unresolved high and moderate findings.

## Local Quality Commands

| Command                       | Result              | Evidence                                                                                                                |
| ----------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npm run scan:secrets`        | **PASS**            | No tracked secret finding; completed in about 1.4 s.                                                                    |
| `npm run format:check`        | **PASS**            | Repository-owned files passed Prettier; about 32.1 s.                                                                   |
| `npm run typecheck`           | **PASS**            | All workspace type checks passed; about 113.7 s.                                                                        |
| `npm run lint`                | **PASS**            | ESLint passed; about 79.8 s.                                                                                            |
| `npm run validate:content`    | **PASS**            | 19 content validation tests passed.                                                                                     |
| `npm run validate:migrations` | **PASS**            | 14 migration/schema validation tests passed.                                                                            |
| `npm run test:unit`           | **PASS WITH SKIPS** | 32 files passed, 1 file skipped; 276 tests passed and 4 skipped. The skipped tests are live staging integration tests.  |
| `npm run build`               | **PASS**            | Next production build passed and generated 54 routes. Build duration was approximately 125 s on the first measured run. |
| `git diff --check`            | **PASS**            | No whitespace error was reported.                                                                                       |

## Browser And Accessibility Commands

| Command                                                   | Result                | Evidence                                                                                                                          |
| --------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:a11y` (direct)                              | **FAIL BEFORE TESTS** | Playwright attempted to build/start its server and exceeded the configured 120 s startup timeout. No accessibility assertion ran. |
| `npm run test:a11y` (prebuilt server on `127.0.0.1:3100`) | **PASS**              | 36/36 tests passed in about 2.8 minutes.                                                                                          |
| `npm run test:smoke` (same server)                        | **PASS**              | 5/5 tests passed.                                                                                                                 |
| `npm run test:e2e` (same server)                          | **PASS**              | 103/103 tests passed in about 6.4 minutes.                                                                                        |

The prebuilt-server rerun did not change product code or configuration. It isolated the
web-server startup timeout from the assertions. The server was stopped after testing.

Automated coverage includes representative authentication, dashboard, assessment,
lesson, simulation, design-system, keyboard, focus, reduced-motion, responsive, and
colour-independent status behavior. It does not constitute manual screen-reader or
other assistive-technology verification.

## Integration Tests

There is no separate generic `test:integration` package script. Repository integration
coverage is included in Vitest and Playwright. Supabase-dependent integration tests are
opt-in and skipped by the normal unit command.

The current live command was run explicitly:

```text
set -a; source .env.staging.local; RUN_STAGING_DB_INTEGRATION=true \
  npx vitest run packages/database/src/staging-database.integration.test.ts
```

Result: **FAIL, 4/4 checks**.

- Required synthetic token/profile fixtures were not available to the test process.
- Direct requests to `lgjujyaclrpaopdabyzg.supabase.co` failed with `ENOTFOUND`.
- No current live RLS assertion passed.

The ignored staging environment file passed `npm run validate:staging-env` key-presence
validation. No values were printed.

## Live Staging Journey Results

| Journey                                  | Result                   | Evidence                                                                                                               |
| ---------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Vercel deployment identity               | **PASS**                 | Preview deployment is Ready at commit `e094d98`; stable alias is protected.                                            |
| Unauthenticated deployment protection    | **PASS**                 | Stable alias returned Vercel SSO `302`, no-store, HSTS, frame denial, and noindex.                                     |
| Public lesson delivery                   | **FAIL**                 | `/lessons/basic-fluid-pressure` rendered a complete lesson labelled `draft` and `Source required`.                     |
| Protected route redirects                | **PASS**                 | Signed-out dashboard, assessment, and simulation routes redirected to sign-in with internal `next` targets.            |
| Registration and email verification      | **BLOCKED**              | Supabase staging is inactive.                                                                                          |
| Sign-in/sign-out/reset/refresh/expiry    | **BLOCKED**              | Supabase staging is inactive; refresh is also absent from implementation.                                              |
| Live RLS matrix                          | **FAIL/BLOCKED**         | Project DNS and database login were unavailable.                                                                       |
| Live dashboard data                      | **BLOCKED**              | Authenticated staging data path unavailable.                                                                           |
| Live assessment start/save/resume/submit | **BLOCKED**              | Authenticated staging data path unavailable.                                                                           |
| Live simulation start/complete/history   | **BLOCKED**              | Authenticated staging data path unavailable.                                                                           |
| Monitoring event                         | **PASS WITH LIMITATION** | Deliberate invalid sign-in emitted a redacted staging/release-tagged auth event; external alert routing is not proven. |

Historical Prompt 33c and Prompt 36 live tests are retained as historical evidence only.
They are not counted as current PASS results.

## Migration State

| Command                                | Result                                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `supabase projects list --output json` | Staging `lgjujyaclrpaopdabyzg`: **INACTIVE**. Production project: separate and **ACTIVE_HEALTHY**. |
| `supabase migration list --linked`     | **FAIL**: staging login role timed out.                                                            |

Repository migration validation passed for migrations 0001-0010 in the worktree.
Migration 0010 is untracked and is not part of deployed commit `e094d98`, which contains
0001-0009.

## Dependency Audit

| Command                                            | Result                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| `npm audit --omit=dev --json`                      | **FAIL**: 0 critical, 1 high, 2 moderate.                                   |
| `npm audit --json`                                 | **FAIL**: 0 critical, 2 high, 2 moderate.                                   |
| `npm ls next postcss nanoid brace-expansion --all` | Next `16.2.12`, PostCSS `8.5.18`, nanoid `3.3.16`, brace-expansion `5.0.7`. |

Outstanding advisories:

- `nanoid`: GHSA-2v37-7h3g-55p8 / CVE-2026-67213, high; patched in `3.3.18`.
- `postcss`: GHSA-fxqj-rqcc-2cmp / CVE-2026-69153, moderate; patched in `8.5.23`.
- `brace-expansion`: GHSA-mh99-v99m-4gvg and GHSA-rgw5-rvv9-x895, high;
  patch floor `5.0.9` for both.
- `next`: audit reports the transitive PostCSS advisory and proposes a compatible
  `16.3.3` update.

No package was updated and no audit result was suppressed.

## GitHub CI

GitHub Actions run `33006302019` passed at
`e094d985f2be55f3ac96bcb23750863ed4a05d7f`. The workflow installs from the lockfile
and gates secret scanning, formatting, types, lint, content, migrations, unit/integration
tests, production build, accessibility, smoke, and critical dependency audit.

The workflow does not run `npm run test:e2e`; the current dirty Prompt 39 worktree has no
remote CI run.

## Final Test Verdict

**LOCAL QUALITY PASS WITH LIVE STAGING FAILURE.**

Local correctness evidence supports continued feature-branch development. It does not
support a student pilot, production release, or AI Mentor implementation while the live
staging database and current release gates remain unresolved.
