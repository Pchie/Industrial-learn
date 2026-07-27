# Dependency Risk Register

Review date: 2026-07-27

## Summary

The production dependency audit initially reported high-severity advisories in the Next.js runtime dependency tree. The remediation used a targeted Next.js patch update and scoped npm overrides for vulnerable Next.js transitive dependencies.

No `npm audit fix --force` or broad dependency update was used.

## Remediation Summary

| Package                | Dependency type                        | Original version | Final version | Decision                                                                    |
| ---------------------- | -------------------------------------- | ---------------: | ------------: | --------------------------------------------------------------------------- |
| `next`                 | Direct runtime dependency              |          16.2.10 |       16.2.12 | Patch to the smallest available patched Next.js release.                    |
| `postcss` under `next` | Transitive runtime/build dependency    |           8.4.31 |        8.5.18 | Scoped npm override because Next.js 16.2.12 still declares PostCSS 8.4.31.  |
| `sharp` under `next`   | Transitive optional runtime dependency |           0.34.5 |        0.35.0 | Scoped npm override because Next.js 16.2.12 still declares Sharp `^0.34.5`. |

## Advisory Register

| Advisory            | Package   | Severity | Vulnerable range    | Patched version used | Exposure assessment                                                                                                                                             | Decision                        | Evidence                                                                                       | Remaining risk                                                                   |
| ------------------- | --------- | -------- | ------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| GHSA-6gpp-xcg3-4w24 | `next`    | High     | `>=16.0.0 <16.2.11` | 16.2.12              | App Router is used. No middleware/proxy file or single-locale config was found, so the exact bypass precondition is not currently configured.                   | Patched before staging.         | `npm audit --omit=dev --json`; `apps/web/next.config.ts`; `rg` check for middleware/proxy.     | Keep Next.js patch releases under review.                                        |
| GHSA-m99w-x7hq-7vfj | `next`    | High     | `>=16.0.0 <16.2.11` | 16.2.12              | Server Actions are used in authentication and student dashboard features. Runtime reachable.                                                                    | Patched before staging.         | `apps/web/src/features/auth/actions.ts`; `apps/web/src/features/student-dashboard/actions.ts`. | Continue server-action input validation and rate-limit review before production. |
| GHSA-89xv-2m56-2m9x | `next`    | High     | `>=16.0.0 <16.2.11` | 16.2.12              | Server Actions are used. No custom standalone server was found in the inspected app, reducing but not removing architectural relevance.                         | Patched before staging.         | `npm audit --omit=dev --json`; `rg` Server Action inspection.                                  | Reassess if a custom Next.js server is introduced.                               |
| GHSA-p9j2-gv94-2wf4 | `next`    | High     | `>=16.0.0 <16.2.11` | 16.2.12              | No custom `rewrites` configuration was found. Exposure not currently configured, but package was vulnerable.                                                    | Patched before staging.         | `apps/web/next.config.ts` has no rewrites.                                                     | Reassess if rewrites are added.                                                  |
| GHSA-68g3-v927-f742 | `next`    | Moderate | `>=16.0.0 <16.2.11` | 16.2.12              | App Router runtime present. Public-route exposure depends on request-body handling in Next internals.                                                           | Patched with Next.js update.    | `npm audit --omit=dev --json`.                                                                 | Monitor future Next.js cache advisories.                                         |
| GHSA-4633-3j49-mh5q | `next`    | Moderate | `>=16.0.0 <16.2.11` | 16.2.12              | No Edge runtime declaration was found. Server Actions exist, so future Edge usage would matter.                                                                 | Patched with Next.js update.    | `rg` check for `runtime = "edge"`.                                                             | Reassess before enabling Edge runtime.                                           |
| GHSA-4c39-4ccg-62r3 | `next`    | Moderate | `>=16.0.0 <16.2.11` | 16.2.12              | No Edge runtime declaration was found.                                                                                                                          | Patched with Next.js update.    | `rg` check for Edge runtime.                                                                   | Reassess before enabling Edge runtime.                                           |
| GHSA-q8wf-6r8g-63ch | `next`    | Moderate | `>=16.0.0 <16.2.11` | 16.2.12              | No `next/image` usage or remote image patterns were found. Next image optimization remains available by framework default.                                      | Patched with Next.js update.    | `rg` check for `next/image`, `<Image`, and `remotePatterns`.                                   | Reassess when image upload or remote image features are added.                   |
| GHSA-955p-x3mx-jcvp | `next`    | Moderate | `>=16.0.0 <16.2.11` | 16.2.12              | Server Actions are used. Hidden server function endpoint disclosure would be runtime relevant.                                                                  | Patched with Next.js update.    | `rg` Server Action inspection.                                                                 | Keep assessment-answer endpoints server-controlled.                              |
| GHSA-qx2v-qp2m-jg93 | `postcss` | Moderate | `<8.5.10`           | 8.5.18               | Build-time and server-side CSS processing dependency. No user-supplied CSS pipeline was found, but the vulnerable transitive package was installed.             | Scoped override.                | `npm ls next postcss sharp --all`.                                                             | Remove override once Next.js declares a patched PostCSS version.                 |
| GHSA-6g55-p6wh-862q | `postcss` | High     | `<=8.5.11`          | 8.5.18               | Build-time and server-side source-map handling risk. No imported untrusted CSS source-map pipeline was found.                                                   | Scoped override before staging. | `npm audit --omit=dev --json`; package tree inspection.                                        | Keep source-map handling server-only.                                            |
| GHSA-r28c-9q8g-f849 | `postcss` | High     | `<=8.5.17`          | 8.5.18               | Build-time and server-side source-map handling risk.                                                                                                            | Scoped override before staging. | `npm audit --omit=dev --json`; package tree inspection.                                        | Remove override after upstream dependency catches up.                            |
| GHSA-f88m-g3jw-g9cj | `sharp`   | High     | `<0.35.0`           | 0.35.0               | Optional Next.js image optimization dependency. No app-level image optimization use was found, but framework runtime could load it if image features are added. | Scoped override before staging. | `npm audit --omit=dev --json`; `npm view sharp@0.35.0`.                                        | Reassess image handling before accepting uploads or remote images.               |

## Compatibility Notes

- Repository Node requirement is `>=22.0.0`; Next.js 16.2.12 and Sharp 0.35.0 require Node `>=20.9.0`.
- React 19.2.7 remains compatible with Next.js 16.2.12 peer requirements.
- No Supabase package changes were made.
- No Playwright or Vitest package changes were made.
- No application features, engineering content, database schemas, or migrations were changed.

## Temporary Mitigations

The patched dependency graph is preferred over temporary risk acceptance. Until the overrides can be removed, the repository should avoid adding untrusted CSS processing, custom rewrites using attacker-controlled destinations, remote image optimization, or Edge Server Actions without a fresh security review.
