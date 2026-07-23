# Industrial Learn Incident Response

## Purpose

This document defines first-response handling for production or staging incidents without exposing sensitive student, assessment, or credential data.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-SEC-001: `docs/architecture/security-boundaries.md`
- IL-AUTH-001: `docs/architecture/authentication-implementation.md`

## Severity Levels

| Severity | Examples                                                                                   | Response                                                  |
| -------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Critical | Cross-student data exposure, leaked service-role key, broken authentication boundary       | Immediate rollback or containment, security owner engaged |
| High     | Assessment answers exposed early, production migration failure, persistent login failures  | Release halt, incident owner assigned                     |
| Medium   | Route errors affecting a module, degraded dashboard, non-critical accessibility regression | Triage and patch planning                                 |
| Low      | Cosmetic issue, isolated non-sensitive log warning                                         | Backlog or maintenance fix                                |

## Monitoring Signals

Monitor:

- Application errors.
- Server errors.
- Authentication failures.
- Authorisation denials and unusual access-denied spikes.
- Database failures.
- Slow routes.
- Failed background operations.
- Deployment failures.
- Assessment and simulation persistence failures.

Do not log:

- Passwords.
- Session tokens.
- Reset links.
- Private student answers.
- Full sensitive project submissions.
- Secret values.

## Initial Response

1. Confirm the incident and affected environment.
2. Assign an incident owner.
3. Preserve logs without copying secrets or private answers.
4. Contain the issue through rollback, access restriction, or release halt.
5. Determine whether student data, assessment integrity, or content safety was affected.
6. Communicate status to release and security owners.
7. Record timeline and corrective actions.

## Health Checks

Safe health checks may confirm:

- Web application route response.
- Database connectivity without exposing schema internals.
- Authentication configuration presence.
- Required environment variable presence by name only.

Health checks must not reveal hostnames, credentials, service-role values, database errors, or private data.

## Post-Incident Review

Record:

- Date and environment.
- Trigger and detection method.
- User impact.
- Data exposure assessment.
- Root cause.
- Corrective action.
- Preventive test or monitoring addition.
- Owner and due date.
