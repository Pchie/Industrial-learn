-- Industrial Learn staging synthetic profile seed template.
-- Use only against the dedicated Supabase staging project.
-- This template expects authorised staging auth users to exist first.
-- Do not commit passwords or real user data.

\set student_a_auth_user_id '<student-a-auth-user-id>'
\set student_b_auth_user_id '<student-b-auth-user-id>'
\set lecturer_auth_user_id '<lecturer-auth-user-id>'
\set author_auth_user_id '<content-author-auth-user-id>'
\set reviewer_auth_user_id '<engineering-reviewer-auth-user-id>'
\set administrator_auth_user_id '<administrator-auth-user-id>'

insert into public.profiles (id, display_name, email)
values
  (:'student_a_auth_user_id', 'Staging Student A', 'staging.student.a@example.test'),
  (:'student_b_auth_user_id', 'Staging Student B', 'staging.student.b@example.test'),
  (:'lecturer_auth_user_id', 'Staging Lecturer', 'staging.lecturer@example.test'),
  (:'author_auth_user_id', 'Staging Content Author', 'staging.author@example.test'),
  (:'reviewer_auth_user_id', 'Staging Engineering Reviewer', 'staging.reviewer@example.test'),
  (:'administrator_auth_user_id', 'Staging Administrator', 'staging.admin@example.test')
on conflict (id) do update
set
  display_name = excluded.display_name,
  email = excluded.email,
  updated_at = now();

insert into public.profile_roles (profile_id, role_id)
select seed.profile_id, roles.id
from (
  values
    (:'student_a_auth_user_id'::uuid, 'student'::public.app_role),
    (:'student_b_auth_user_id'::uuid, 'student'::public.app_role),
    (:'lecturer_auth_user_id'::uuid, 'lecturer'::public.app_role),
    (:'author_auth_user_id'::uuid, 'content_author'::public.app_role),
    (:'reviewer_auth_user_id'::uuid, 'engineering_reviewer'::public.app_role),
    (:'administrator_auth_user_id'::uuid, 'administrator'::public.app_role)
) as seed(profile_id, role_key)
join public.roles on roles.role_key = seed.role_key
on conflict (profile_id, role_id) do nothing;
