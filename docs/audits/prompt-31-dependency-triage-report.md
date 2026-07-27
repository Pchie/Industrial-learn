# Prompt 31 Dependency Triage Report

Review date: 2026-07-27

## Executive Verdict

CONDITIONAL PASS

The previously reported production high-severity dependency advisories were assessed and remediated with a targeted Next.js patch update plus scoped transitive overrides for PostCSS and Sharp. The production dependency audit now reports zero vulnerabilities.

The pass is conditional because the remediation relies on npm overrides for transitive packages that Next.js 16.2.12 still declares at older ranges. These overrides should be reviewed and removed once Next.js publishes compatible patched transitive ranges.

## Original State

- Branch: `development`
- Working tree before this task: clean
- Direct affected dependency: `next@16.2.10`
- Affected transitive dependencies: `postcss@8.4.31`, `sharp@0.34.5`
- Initial production audit result: 3 high vulnerabilities reported through the production dependency tree

## Audit Command

```bash
npm audit --omit=dev --json
```

The command audits production dependencies and avoids uploading repository source contents. No authentication tokens or registry credentials were printed.

## Advisories Found

| Advisory            | Package   | Severity | Classification                                       | Reachability                                                     | Decision   |
| ------------------- | --------- | -------- | ---------------------------------------------------- | ---------------------------------------------------------------- | ---------- |
| GHSA-6gpp-xcg3-4w24 | `next`    | High     | Direct runtime dependency                            | App Router present; no middleware/proxy configuration found      | Patched    |
| GHSA-m99w-x7hq-7vfj | `next`    | High     | Direct runtime dependency                            | Server Actions present                                           | Patched    |
| GHSA-89xv-2m56-2m9x | `next`    | High     | Direct runtime dependency                            | Server Actions present; no custom Next server found              | Patched    |
| GHSA-p9j2-gv94-2wf4 | `next`    | High     | Direct runtime dependency                            | No custom rewrites found                                         | Patched    |
| GHSA-68g3-v927-f742 | `next`    | Moderate | Direct runtime dependency                            | App Router present                                               | Patched    |
| GHSA-4633-3j49-mh5q | `next`    | Moderate | Direct runtime dependency                            | No Edge runtime found                                            | Patched    |
| GHSA-4c39-4ccg-62r3 | `next`    | Moderate | Direct runtime dependency                            | No Edge runtime found                                            | Patched    |
| GHSA-q8wf-6r8g-63ch | `next`    | Moderate | Direct runtime dependency                            | No `next/image` usage found                                      | Patched    |
| GHSA-955p-x3mx-jcvp | `next`    | Moderate | Direct runtime dependency                            | Server Actions present                                           | Patched    |
| GHSA-qx2v-qp2m-jg93 | `postcss` | Moderate | Transitive build/runtime dependency under Next.js    | No untrusted CSS pipeline found                                  | Overridden |
| GHSA-6g55-p6wh-862q | `postcss` | High     | Transitive build/runtime dependency under Next.js    | Source-map handling risk, no untrusted source-map pipeline found | Overridden |
| GHSA-r28c-9q8g-f849 | `postcss` | High     | Transitive build/runtime dependency under Next.js    | Source-map handling risk                                         | Overridden |
| GHSA-f88m-g3jw-g9cj | `sharp`   | High     | Transitive optional runtime dependency under Next.js | No image optimization usage found, but runtime package present   | Overridden |

## Exposure Assessment

- Public-route exposure: possible for framework-level Next.js runtime advisories; reduced where specific app configuration is absent.
- Authenticated-route exposure: relevant because authenticated Server Actions exist.
- Server-only exposure: relevant for Server Actions, PostCSS processing, and Sharp image optimization.
- Client-side exposure: no direct client-side package execution was identified for PostCSS or Sharp.
- Required before staging: Next.js high advisories, PostCSS high advisories, Sharp high advisory.
- Required before production: all advisories in this report.
- Accepted temporary risk: none for known production high advisories after remediation.

## Compatibility Review

- Next.js 16.2.12 requires Node `>=20.9.0`; the repository requires Node `>=22.0.0`.
- Next.js 16.2.12 supports React 19 via its peer dependency range.
- PostCSS 8.5.18 supports Node `^10 || ^12 || >=14`.
- Sharp 0.35.0 requires Node `>=20.9.0`.
- No Supabase, Playwright, Vitest, engineering-core, assessment-core, or simulation-engine dependency changes were made.

## Implementation

- Changed `next` from `latest` to `16.2.12`.
- Added scoped npm overrides:
  - `next > postcss` to `8.5.18`
  - `next > sharp` to `0.35.0`
- Regenerated `package-lock.json` with `npm install`.
- Documented the overrides in `docs/architecture/dependency-rationale.md`.
- Created `docs/security/dependency-risk-register.md`.

## Commands Executed

```bash
npm view next@16.2.12 version engines dependencies.postcss optionalDependencies.sharp peerDependencies.react peerDependencies.react-dom --json
rg -n "use server|rewrites|middleware|proxy|runtime =|next/image|remotePatterns|images|server action|Server Action" apps/web docs/architecture docs/audits
npm view postcss@8.5.18 version engines dist.tarball --json
npm view sharp@0.35.0 version engines dependencies optionalDependencies dist.tarball --json
npm install
npm audit --omit=dev --json
npm ls next postcss sharp --all
```

Quality-gate results are recorded below after final verification.

## Quality Gate Results

| Command                       | Result                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `npm install`                 | Passed; lock file and installed dependency tree updated from the targeted manifest changes. |
| `npm audit --omit=dev --json` | Passed; 0 production vulnerabilities reported.                                              |
| `npm run scan:secrets`        | Passed; no obvious committed secret values found.                                           |
| `npm run format:check`        | Passed; all matched files use Prettier style.                                               |
| `npm run typecheck`           | Passed across all configured workspaces.                                                    |
| `npm run lint`                | Passed.                                                                                     |
| `npm run validate:content`    | Passed; 1 test file and 7 tests passed.                                                     |
| `npm run validate:migrations` | Passed; 1 test file and 6 tests passed.                                                     |
| `npm run test:unit`           | Passed; 16 test files and 139 tests passed.                                                 |
| `npm run build`               | Passed on Next.js 16.2.12.                                                                  |
| `npm run test:smoke`          | Passed; 5 Playwright smoke tests passed.                                                    |
| `npm run test:e2e`            | Passed; 57 Playwright tests passed.                                                         |

## Warnings Observed

- Playwright web-server startup printed the existing Node warning that `NO_COLOR` is ignored when `FORCE_COLOR` is set.
- The E2E dashboard failure-path test intentionally logged `Simulated dashboard database failure.` from the server while verifying safe error handling.
- A rerun after the interrupted E2E command briefly exposed a local `node_modules` extraction inconsistency in Next's compiled `nanoid` package. Running `npm install` from the lockfile repaired the generated dependency tree; the subsequent full E2E run passed.

## Remaining Risk

- Next.js still declares older PostCSS and Sharp ranges, so the repository uses npm overrides until upstream dependency declarations catch up.
- Server Actions remain an important runtime security surface. Continue validating inputs server-side and avoid revealing hidden assessment data.
- Image optimization should receive a fresh review before remote images, SVG image optimization, or student-uploaded images are enabled.

## Staging Recommendation

Proceed to staging after review and commit of this dependency triage change set. The production vulnerability audit is clean, all existing local quality gates passed, and no product features, engineering content, database schemas, or migrations were changed.
