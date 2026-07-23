-- Industrial Learn initial seed data.
-- This file seeds role and permission metadata only. It does not create users.

insert into public.roles (role_key, name, description)
values
  ('student', 'Student', 'Learns through assigned and approved Industrial Learn content.'),
  ('lecturer', 'Lecturer', 'Assigns reviewed content and views authorised cohort progress.'),
  ('content_author', 'Content author', 'Creates draft educational content and submits it for review.'),
  ('engineering_reviewer', 'Engineering reviewer', 'Reviews technical content, source references, equations, and simulations.'),
  ('administrator', 'Administrator', 'Manages platform users, roles, cohorts, and operational policy.')
on conflict (role_key) do update
set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.permissions (permission_key, name, description)
values
  ('profile:self:read', 'Read own profile', 'Allows a user to read their own profile.'),
  ('profile:self:update', 'Update own profile', 'Allows a user to update their own non-privileged profile fields.'),
  ('content:approved:read', 'Read approved content', 'Allows access to approved student-use content.'),
  ('progress:self:write', 'Write own progress', 'Allows students to create and update their own progress records.'),
  ('progress:cohort:read', 'Read cohort progress', 'Allows lecturers to read progress for authorised cohorts.'),
  ('cohort:manage', 'Manage cohorts', 'Allows administrators to manage cohorts, enrolments, and lecturer assignments.'),
  ('content:draft:write', 'Write draft content', 'Allows content authors to create and edit draft content.'),
  ('content:review:read', 'Read review content', 'Allows reviewers and authors to read content in review workflows.'),
  ('content:review:write', 'Write review records', 'Allows engineering reviewers to create review records.'),
  ('roles:manage', 'Manage roles', 'Allows administrators to manage roles and role assignments.'),
  ('audit:read', 'Read audit events', 'Allows administrators to read audit events.')
on conflict (permission_key) do update
set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'profile:self:read',
  'profile:self:update',
  'content:approved:read',
  'progress:self:write'
)
where r.role_key = 'student'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'profile:self:read',
  'profile:self:update',
  'content:approved:read',
  'progress:cohort:read'
)
where r.role_key = 'lecturer'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'profile:self:read',
  'profile:self:update',
  'content:approved:read',
  'content:draft:write',
  'content:review:read'
)
where r.role_key = 'content_author'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'profile:self:read',
  'profile:self:update',
  'content:review:read',
  'content:review:write'
)
where r.role_key = 'engineering_reviewer'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'profile:self:read',
  'profile:self:update',
  'content:approved:read',
  'progress:cohort:read',
  'cohort:manage',
  'content:draft:write',
  'content:review:read',
  'content:review:write',
  'roles:manage',
  'audit:read'
)
where r.role_key = 'administrator'
on conflict (role_id, permission_id) do nothing;

insert into public.schools (slug, title, description)
values
  ('core-engineering', 'Core Engineering', 'Foundational engineering theory, calculations, simulations, assessments, and projects.'),
  ('future-engineering', 'Future Engineering', 'Emerging engineering technologies connected to core engineering foundations.')
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  updated_at = now();
