# Logging And Redaction Policy

Date: 2026-08-10

## Policy

Industrial Learn logs must support reliability and security investigation without
collecting sensitive student data or protected engineering content.

## Allowed Fields

Operational logs may include:

- Environment name
- Application version
- Commit hash
- Route pattern
- Operation name
- Result
- Error category
- Timestamp
- Correlation ID
- Safe hashed user identifier when required for abuse or ownership debugging
- Counts and boolean flags that do not reveal answer or submission content

## Excluded Fields

Logs and external monitoring payloads must not include:

- Passwords
- Access tokens
- Refresh tokens
- Authorization headers
- Cookies
- Reset links or reset tokens
- Supabase service-role keys
- Assessment answer contents
- Hidden correct answers
- Private explanations before completion
- Project submission bodies
- Private source document bodies
- Sensitive profile fields
- Full request or response bodies
- Database connection strings
- Database table names in public health responses
- Stack traces in user-visible responses

## Redaction Behaviour

The application redacts keys containing sensitive fragments such as password,
token, cookie, answer, correct, hidden, body, source, submitted, private, secret,
service, reset, authorization, and credential.

Strings that look like bearer tokens, JWTs, password/reset references, or service
role values are replaced with `[Redacted]`.

## User Identification

Logs may use a short SHA-256 hash of a profile ID or email only when it helps
identify repeated authentication failures or ownership-specific operational
failures. Raw email addresses must not be logged.

## Review Requirement

Any new event category or provider integration must be reviewed for data
minimisation before use in staging. Production monitoring requires a separate
release approval.
