# Staging Emergency Containment

Verified 2026-09-08. This is a staging-only runbook, not a production control.

## Control

Vercel project: `industrial-learn-staging`
(`prj_7TCK2A9Wg1VC3Lnjqf0TDEBEnwCp`). Firewall rule:
**Industrial Learn staging emergency hold**,
ID `rule_industrial_learn_staging_emergency_hold_EZktmg`.

The rule is prepared, valid and **inactive** in normal operation. It denies all
application paths, including assets and server actions, except `/api/health/` probes.
Project-level scope includes both the development alias and immutable deployment URLs.
Vercel authentication remains enabled. This does not weaken the production project.

## Stop

1. Confirm the project name and ID above. Do not operate on `industrial-learn` production.
2. In the staging project's Firewall, find this exact custom rule, enable it, save/apply
   the change and note the UTC incident time. Through the API, update only this rule ID
   with `rules.update`; preserve unrelated rules.
3. Allow propagation, then repeatedly verify HTTP 403 with Vercel's `deny` mitigation
   for the direct lesson, `/learn/pilot`, `/simulations`, assessment GET and POST, and
   asset paths on every URL distributed to the cohort. Do not declare containment from
   one edge response. The rehearsal exposed a short propagation interval.
4. Stop invitations/activity and notify participants through the agreed private channel.
   Keep health/log access for the named operator. Preserve attempt data and redacted
   incident evidence; do not manually edit scores.
5. This is an application-delivery hold, not deletion or database withdrawal. For an
   engineering defect, the content owner must separately withdraw affected versions
   through the authorized governance/release process and re-review corrections. For a
   credential or direct Supabase exposure, use the security incident process as well.

No network control can recall already downloaded/printed material. Tell students to
stop using the affected version. The rule does not block direct Supabase endpoints.

## Reopen

Select an exact reviewed release, verify compatibility with migrations through `0022`
(held `0010` excluded), recheck publication and private-data boundaries, and obtain the
owner/facilitator's explicit reopening decision. Disable only this emergency rule, apply,
and verify lesson access and readiness after propagation. Keep it available for the next
incident. Do not blindly roll back to a release predating the governance fix.

## Rehearsal Evidence

- Enabled `2026-09-08T19:17:28Z`; disabled `19:17:43Z`; verification ended `19:17:52Z`.
- Stable development alias and immutable `industrial-learn-staging-4huad9c1n-kolobe.vercel.app`
  both denied lesson/catalogue/simulation/assessment/asset requests; assessment POST denied.
- Readiness remained 200. Normal lesson access returned after disabling the rule.
- Assessment and simulation attempt counts and row digests were unchanged.
- An initial immediate check saw mixed 200/403 responses during rule propagation. The
  repeated rehearsal waited for propagation and verified sustained blocking. This delay
  is recorded, not hidden.
- Current safe release during rehearsal: `da1078cc6724cf27d8b8c699debbf51817ccd188`.
- The operator and backup still need named, verified access before a student session.

References: [Vercel Firewall API](https://vercel.com/docs/vercel-firewall/firewall-api),
[custom rules](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules),
[update configuration](https://vercel.com/docs/rest-api/security/update-firewall-configuration).
Vercel's project pause control is documented for Production deployments; this Preview
rehearsal deliberately verifies an applicable project firewall control instead.
