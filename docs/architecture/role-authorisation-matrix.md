# Role Authorisation Matrix

## Roles

- Student
- Lecturer
- Content author
- Engineering reviewer
- Administrator
- Platform Owner

Roles are resolved from trusted application profile and role records after the server validates the authentication session.

## Protected Feature Access

| Feature or route       | Student | Lecturer | Content author | Engineering reviewer | Administrator | Platform Owner |
| ---------------------- | ------- | -------- | -------------- | -------------------- | ------------- | -------------- |
| `/dashboard`           | Yes     | Yes      | Yes            | Yes                  | No            | Yes            |
| `/my-learning`         | Yes     | Yes      | Yes            | Yes                  | Yes           | Yes            |
| `/projects`            | Yes     | Yes      | Yes            | Yes                  | Yes           | Yes            |
| `/assessments`         | Yes     | Yes      | Yes            | Yes                  | Yes           | Yes            |
| `/simulations/history` | Yes     | Yes      | Yes            | Yes                  | Yes           | Yes            |
| `/author`              | No      | No       | Yes            | No                   | Yes           | Yes            |
| `/review`              | No      | No       | No             | Yes                  | Yes           | Yes, inspect   |
| `/lecturer`            | No      | Yes      | No             | No                   | No            | Yes            |
| `/admin`               | No      | No       | No             | No                   | Yes           | Yes            |
| `/owner`               | No      | No       | No             | No                   | No            | Yes            |

## Permission Rules

- Workspace routes use server-resolved capabilities derived from database roles.
- Student workspace access requires `workspace:student`.
- General authenticated routes require a valid session but still must apply record ownership once persistence is connected.
- Author routes require `content_author` or `administrator`.
- Review-package access requires `workspace:review`; recording a decision separately
  requires `content:review:approve`.
- Platform Owner deliberately lacks `content:review:approve`.
- Admin routes require `platform:manage`; `/owner` requires `platform_owner`.

## Denial Behaviour

- Missing or expired sessions redirect to `/auth/sign-in`.
- Authenticated users without the required role are redirected to `/auth/error`.
- Denial messages are safe and do not reveal private records or role-assignment internals.
