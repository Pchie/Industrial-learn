# Workspace Navigation Model

## Purpose

Industrial Learn exposes authenticated work as five clear workspaces rather than relying
on users to remember operational URLs.

| Workspace           | Route                | Main purpose                                                        |
| ------------------- | -------------------- | ------------------------------------------------------------------- |
| Student Learning    | `/dashboard`         | Learning, assessments, simulations, projects, and personal progress |
| Content Authoring   | `/author`            | Drafts, evidence, versions, and review submission                   |
| Engineering Review  | `/review`            | Exact-version evidence inspection and qualified decisions           |
| Lecturer            | `/lecturer`          | Authorised teaching, module, assessment, and cohort entry points    |
| Platform Management | `/owner` or `/admin` | Users, roles, governance, publication records, and operations       |

`/workspace` is the post-authentication portal. It renders only destinations allowed by
server-resolved capabilities. Direct routes repeat the same server checks, so changing a
workspace in the interface never grants permission.

## Navigation

The primary navigation is Home, Learn, Simulations, Projects, Profile, and Workspace.
Core Engineering and Future Engineering remain inside Learn. The Workspace switcher shows
the active workspace, primary role, and authorised workspace destinations.

On narrow screens the same destinations wrap into a compact navigation row. Individual
roles are kept inside the Workspace control rather than occupying permanent navigation
positions.

## Owner Perspective

The Platform Owner may open Student, Author, Reviewer, Lecturer, and Owner workspaces.
Owner "View workspace as" links add a visible perspective banner. This changes only the
interface and never impersonates another account or loads another student's private data.

## Session Refresh

Roles are loaded from `profile_roles` during every trusted session resolution. A changed
role is therefore visible on the next navigation or refresh; no browser role flag or token
claim is authoritative.
