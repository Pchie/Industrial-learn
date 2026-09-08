# Staging Account Lifecycle

Updated 2026-09-08. Staging only: `lgjujyaclrpaopdabyzg` and Vercel
`industrial-learn-staging`. Do not apply these templates to production implicitly.

## Current Delivery Gate

The live Supabase SMTP page shows custom SMTP disabled. The Templates page explicitly
states that the default templates are being used and custom SMTP is required to edit
their subject/body. Consequently, **external signup/recovery delivery is not verified**.
The user authorized a private delivery-test mailbox; it is recorded only in the ignored
operator record, not here. No invitation campaign is authorized.

The live Site URL is
`https://industrial-learn-staging-git-development-kolobe.vercel.app`. Its three exact
allowed redirects are `/auth/verify`, `/auth/reset-password` and `/auth/sign-in` on that
same origin. No wildcard was observed. No redirect setting was changed in this task.

## Deployment Order

1. Deploy and verify the server confirmation/recovery handlers on the staging alias.
2. The owner supplies a mail provider and verified sender. Enter its credentials directly
   in the staging Supabase SMTP settings. Do not paste them into chat or commit them.
3. Preserve email confirmation. Do not use automatic confirmation as a delivery fix.
4. Back up existing template/configuration values privately. Install
   [signup confirmation](../deployment/auth-email-templates/confirm-signup.html) and
   [password recovery](../deployment/auth-email-templates/reset-password.html).
5. Keep the fixed `SiteURL` template destination. Disable email link tracking for these
   messages and ensure provider sender-domain verification is complete.
6. Verify actual external delivery and the entire browser journey below. A successful
   provider HTTP response or administratively generated link is not proof of receipt.

Do not roll back the callback code while these hash templates are active. Roll back
templates and application together, keeping pilot entry paused if mail is broken.

## Live Test

Use one clearly synthetic, disposable plus-address routed to the authorized mailbox.
Do not reset the owner's pre-existing account. Keep test passwords, links and session
cookies in memory or ignored owner-only files; do not retain browser traces containing
them. Delete only the exact synthetic identities created by this run after recording
redacted evidence.

- Signup sends a confirmation email; unconfirmed sign-in is rejected and no application
  profile/privileged role is provisioned from the unverified signup response.
- Opening the email link does not consume it until the explicit confirmation button.
- Confirmation succeeds once; a used, malformed or expired hash is rejected.
- Sign-in resolves one Student profile from the verified identity. Reviewer/admin routes
  remain denied. Sign-out removes the browser session.
- Recovery request is generic for both existing and unknown addresses. Confirm delivery
  in the mailbox, not merely in an API response.
- Recovery confirmation creates no ordinary application login. The protected password
  form works; the old password is rejected, the new password signs in, and link reuse
  fails. Ordinary login cookies or a form/URL token do not authorize this form.
- Expired sessions require sign-in again. No automatic refresh behavior is promised.
- Verify Secure/HttpOnly/SameSite cookies, no-referrer/no-store auth responses, and no
  credentials in rendered pages, client logs or error reports.

Local automated tests use the explicitly isolated test provider and are not SMTP proof.
Privileged generated-link tests can prove server mechanics but must be reported separately
from delivered-mail tests. A human must confirm receipt and real-device usability.

## Evidence Sources

- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates):
  token hashes, confirmation links and mail-scanner considerations.
- [Supabase Next.js guidance](https://supabase.com/nextjs): server-side token-hash exchange.
- [Supabase redirects](https://supabase.com/docs/guides/auth/redirect-urls): exact allowed destinations.
- Repository: `apps/web/src/features/auth/`, auth route tests and `tests/e2e/auth.spec.ts`.
