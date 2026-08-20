# Protected Vercel Session Recovery Report

Date completed: 2026-08-16

## Executive Verdict

PASS.

Industrial Learn staging was verified through the protected Vercel deployment
using the existing Vercel automation bypass path. A temporary synthetic Supabase
student signed in through the deployed `/auth/sign-in` page, reached their own
server-resolved dashboard, signed out, and was redirected away from the private
dashboard after sign-out.

Production was not touched.

## Scope

This report closes the browser-session caveat recorded in
`docs/audits/supabase-managed-recovery-rehearsal-report.md`.

Verified:

- Vercel staging deployment protection remained enabled.
- Existing automation bypass was available.
- Bypass secret value was not printed.
- Temporary synthetic Supabase Auth user was created.
- Matching profile and `student` role were created.
- Browser sign-in through the protected staging URL worked.
- Dashboard resolved the authenticated user's own profile.
- New-student empty state appeared honestly for the temporary user.
- Sign-out cleared the session.
- `/dashboard` redirected to `/auth/sign-in` after sign-out.
- Temporary Supabase Auth user was deleted.
- Cleanup verification found zero temporary protected-session users.

Not changed:

- No application feature code.
- No database schema or migration.
- No curriculum content.
- No production environment.

## Staging Target

| Item                  | Value                                                                |
| --------------------- | -------------------------------------------------------------------- |
| Vercel project        | `kolobe/industrial-learn-staging`                                    |
| Staging URL           | `https://industrial-learn-staging-git-development-kolobe.vercel.app` |
| Supabase project      | `lgjujyaclrpaopdabyzg`                                               |
| Branch                | `development`                                                        |
| Deployment protection | Enabled                                                              |

## Bypass Method

The check used Vercel Protection Bypass for Automation, following Vercel's
documented browser-testing approach:

- `x-vercel-protection-bypass`
- `x-vercel-set-bypass-cookie`

The bypass secret was read by the authenticated Vercel CLI and injected into
Playwright request headers inside the verification process. The secret was not
printed, written to the repository, or added to a local tracked file.

Reference:

- `https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation`

## Verification Results

| Check                                                     | Result |
| --------------------------------------------------------- | ------ |
| Vercel automation bypass available                        | Passed |
| Secret printed                                            | No     |
| Temporary student Auth user created                       | Passed |
| Temporary student profile created                         | Passed |
| Temporary student assigned only `student` role            | Passed |
| Protected sign-in form rendered                           | Passed |
| Browser sign-in redirected to `/dashboard`                | Passed |
| Dashboard heading matched temporary profile               | Passed |
| New-student empty state shown                             | Passed |
| Sign-out redirected to `/auth/sign-in`                    | Passed |
| `/dashboard` after sign-out redirected to `/auth/sign-in` | Passed |
| Temporary user cleanup                                    | Passed |
| Post-cleanup temporary protected-session users            | 0      |
| HTTP errors during final browser run                      | 0      |

## Browser Diagnostics

The final browser run reported no HTTP errors.

Observed non-blocking diagnostics:

- Vercel live feedback script was blocked by the application's Content Security
  Policy.
- Several browser requests were aborted during intentional navigation changes.

These diagnostics did not prevent sign-in, dashboard ownership verification,
sign-out, or private-route redirect verification.

## Security Notes

- The temporary user's email used the `example.test` domain.
- The temporary password was generated for this one check and was not printed.
- Supabase access tokens, refresh tokens, anon key, service-role key, Vercel
  bypass secret, and database URLs were not printed.
- Cleanup deleted the temporary Supabase Auth user, which cascades the matching
  profile and role assignment through the existing schema.
- No Vercel protection settings were disabled or changed.

## Commands Executed

Representative command groups:

- Git working-tree preflight.
- Vercel project protection read-only inspection.
- Protected Vercel browser-session verification with Playwright.
- Temporary Supabase Auth/profile/role creation and cleanup.
- Cleanup verification for temporary protected-session users.

## Remaining Risks

- Vercel CLI protection status output includes bypass identifiers in JSON. Treat
  protection output as sensitive operational evidence and do not paste it into
  tickets, documentation, or chat.
- The current CSP blocks Vercel live feedback script loading. This is acceptable
  for staging verification, but should remain known if Vercel feedback tooling
  is expected to work inside the app frame.
- Production still requires its own dedicated Supabase project, production
  Vercel environment, backup policy, and recovery rehearsal.

## Recommended Next Step

Proceed to the next production-readiness prompt only after confirming the
production owner fields and production environment decisions are filled in the
production launch decision register.
