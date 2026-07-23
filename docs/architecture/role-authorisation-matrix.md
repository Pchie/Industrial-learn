# Role Authorisation Matrix

## Roles

- Student
- Lecturer
- Content author
- Engineering reviewer
- Administrator

Roles are resolved from trusted application profile and role records after the server validates the authentication session.

## Protected Feature Access

| Feature or route       | Student | Lecturer | Content author | Engineering reviewer | Administrator |
| ---------------------- | ------- | -------- | -------------- | -------------------- | ------------- |
| `/dashboard`           | Yes     | No       | No             | No                   | No            |
| `/my-learning`         | Yes     | Yes      | Yes            | Yes                  | Yes           |
| `/projects`            | Yes     | Yes      | Yes            | Yes                  | Yes           |
| `/assessments`         | Yes     | Yes      | Yes            | Yes                  | Yes           |
| `/simulations/history` | Yes     | Yes      | Yes            | Yes                  | Yes           |
| `/author`              | No      | No       | Yes            | No                   | Yes           |
| `/review`              | No      | No       | No             | Yes                  | Yes           |
| `/admin`               | No      | No       | No             | No                   | Yes           |

## Permission Rules

- Student dashboard access requires `student`.
- General authenticated routes require a valid session but still must apply record ownership once persistence is connected.
- Author routes require `content_author` or `administrator`.
- Review routes require `engineering_reviewer` or `administrator`.
- Admin routes require `administrator`.

## Denial Behaviour

- Missing or expired sessions redirect to `/auth/sign-in`.
- Authenticated users without the required role are redirected to `/auth/error`.
- Denial messages are safe and do not reveal private records or role-assignment internals.
