-- Industrial Learn initial PostgreSQL schema.
-- This migration is PostgreSQL and Supabase compatible.

create extension if not exists pgcrypto;

create type public.app_role as enum (
  'student',
  'lecturer',
  'content_author',
  'engineering_reviewer',
  'administrator'
);

create type public.content_status as enum (
  'Draft',
  'Source required',
  'Source checked',
  'Equation checked',
  'Simulation checked',
  'Engineering review required',
  'Approved for student use'
);

create type public.publication_status as enum (
  'draft',
  'internal',
  'scheduled',
  'published',
  'archived'
);

create type public.attempt_status as enum (
  'not_started',
  'in_progress',
  'submitted',
  'graded',
  'abandoned'
);

create type public.question_type as enum (
  'single_choice',
  'multiple_choice',
  'numeric',
  'short_answer',
  'diagnostic'
);

create type public.review_decision as enum (
  'approved',
  'changes_requested',
  'rejected'
);

create type public.audit_severity as enum (
  'info',
  'warning',
  'security',
  'critical'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null unique,
  preferred_name text,
  institution_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  role_key public.app_role not null unique,
  name text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  name text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table public.profile_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, role_id)
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.disciplines (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  slug text not null,
  title text not null,
  description text not null,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, slug)
);

create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  discipline_id uuid not null references public.disciplines(id) on delete restrict,
  slug text not null,
  title text not null,
  description text not null,
  publication_status public.publication_status not null default 'draft',
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discipline_id, slug)
);

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  year_number integer not null check (year_number > 0),
  title text not null,
  description text not null default '',
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (programme_id, year_number)
);

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  semester_number integer not null check (semester_number > 0),
  title text not null,
  description text not null default '',
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academic_year_id, semester_number)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  difficulty text not null,
  academic_level text not null,
  estimated_duration_minutes integer not null check (estimated_duration_minutes > 0),
  technical_review_status public.content_status not null default 'Draft',
  publication_status public.publication_status not null default 'draft',
  version integer not null default 1 check (version > 0),
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (semester_id, slug)
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  display_order integer not null default 0,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  difficulty text not null,
  academic_level text not null,
  estimated_duration_minutes integer not null check (estimated_duration_minutes > 0),
  technical_review_status public.content_status not null default 'Draft',
  publication_status public.publication_status not null default 'draft',
  version integer not null default 1 check (version > 0),
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, slug)
);

create table public.lesson_prerequisites (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  prerequisite_lesson_id uuid not null references public.lessons(id) on delete restrict,
  is_required boolean not null default true,
  rationale text not null,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (lesson_id <> prerequisite_lesson_id),
  unique (lesson_id, prerequisite_lesson_id)
);

create table public.learning_outcomes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  outcome_text text not null,
  display_order integer not null default 0,
  source_id text,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((lesson_id is not null)::integer + (module_id is not null)::integer = 1)
);

create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete restrict,
  slug text not null,
  title text not null,
  starts_on date,
  ends_on date,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (programme_id, slug)
);

create table public.cohort_modules (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, module_id)
);

create table public.cohort_lecturers (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  lecturer_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, lecturer_profile_id)
);

create table public.enrolments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, student_profile_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.attempt_status not null default 'not_started',
  percent_complete numeric(5,2) not null default 0 check (percent_complete >= 0 and percent_complete <= 100),
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, student_profile_id)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  technical_review_status public.content_status not null default 'Draft',
  publication_status public.publication_status not null default 'draft',
  version integer not null default 1 check (version > 0),
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((lesson_id is not null)::integer + (module_id is not null)::integer = 1)
);

create unique index assessments_lesson_slug_unique on public.assessments (lesson_id, slug) where lesson_id is not null;
create unique index assessments_module_slug_unique on public.assessments (module_id, slug) where module_id is not null;

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_type public.question_type not null,
  prompt text not null,
  explanation text,
  points numeric(8,2) not null default 1 check (points >= 0),
  display_order integer not null default 0,
  source_id text,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.answer_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  choice_text text not null,
  is_correct boolean not null default false,
  feedback text,
  display_order integer not null default 0,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.attempt_status not null default 'in_progress',
  score numeric(8,2),
  max_score numeric(8,2),
  submitted_answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.simulations (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  state_coverage_required text[] not null default array['normal-state', 'boundary-state', 'fault-state'],
  technical_review_status public.content_status not null default 'Draft',
  publication_status public.publication_status not null default 'draft',
  version integer not null default 1 check (version > 0),
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((lesson_id is not null)::integer + (module_id is not null)::integer = 1)
);

create unique index simulations_lesson_slug_unique on public.simulations (lesson_id, slug) where lesson_id is not null;
create unique index simulations_module_slug_unique on public.simulations (module_id, slug) where module_id is not null;

create table public.simulation_attempts (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.attempt_status not null default 'in_progress',
  scenario_state text not null,
  input_state jsonb not null default '{}'::jsonb,
  output_state jsonb not null default '{}'::jsonb,
  diagnostic_response jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  rubric jsonb not null default '{}'::jsonb,
  technical_review_status public.content_status not null default 'Draft',
  publication_status public.publication_status not null default 'draft',
  version integer not null default 1 check (version > 0),
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.attempt_status not null default 'in_progress',
  submission_text text not null default '',
  attachment_file_ids uuid[] not null default array[]::uuid[],
  rubric_result jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.source_documents (
  id uuid primary key default gen_random_uuid(),
  source_id text not null unique,
  title text not null,
  citation text not null,
  url text,
  document_type text not null,
  approval_status public.content_status not null default 'Source required',
  owner_profile_id uuid references public.profiles(id) on delete set null,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.knowledge_files (
  id uuid primary key default gen_random_uuid(),
  knowledge_file_id text not null unique,
  title text not null,
  description text not null,
  body text not null default '',
  source_document_id uuid references public.source_documents(id) on delete set null,
  technical_review_status public.content_status not null default 'Draft',
  publication_status public.publication_status not null default 'draft',
  version integer not null default 1 check (version > 0),
  owner_profile_id uuid references public.profiles(id) on delete set null,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null,
  entity_id uuid not null,
  version integer not null check (version > 0),
  snapshot jsonb not null,
  change_summary text not null,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_table, entity_id, version)
);

create table public.review_records (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null,
  entity_id uuid not null,
  reviewer_profile_id uuid not null references public.profiles(id) on delete restrict,
  decision public.review_decision not null,
  review_status public.content_status not null,
  notes text not null,
  source_check_passed boolean not null default false,
  equation_check_passed boolean not null default false,
  simulation_check_passed boolean not null default false,
  reviewed_at timestamptz not null default now(),
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text,
  entity_id uuid,
  severity public.audit_severity not null default 'info',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);
create index profile_roles_profile_id_idx on public.profile_roles (profile_id);
create index profile_roles_role_id_idx on public.profile_roles (role_id);
create index programmes_discipline_id_idx on public.programmes (discipline_id);
create index academic_years_programme_id_idx on public.academic_years (programme_id);
create index semesters_academic_year_id_idx on public.semesters (academic_year_id);
create index modules_semester_id_idx on public.modules (semester_id);
create index units_module_id_idx on public.units (module_id);
create index lessons_unit_id_idx on public.lessons (unit_id);
create index lesson_prerequisites_lesson_id_idx on public.lesson_prerequisites (lesson_id);
create index lesson_prerequisites_prerequisite_lesson_id_idx on public.lesson_prerequisites (prerequisite_lesson_id);
create index learning_outcomes_lesson_id_idx on public.learning_outcomes (lesson_id);
create index learning_outcomes_module_id_idx on public.learning_outcomes (module_id);
create index cohorts_programme_id_idx on public.cohorts (programme_id);
create index cohort_modules_cohort_id_idx on public.cohort_modules (cohort_id);
create index cohort_modules_module_id_idx on public.cohort_modules (module_id);
create index cohort_lecturers_lecturer_profile_id_idx on public.cohort_lecturers (lecturer_profile_id);
create index enrolments_student_profile_id_idx on public.enrolments (student_profile_id);
create index enrolments_cohort_id_idx on public.enrolments (cohort_id);
create index lesson_progress_student_profile_id_idx on public.lesson_progress (student_profile_id);
create index lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);
create index assessments_lesson_id_idx on public.assessments (lesson_id);
create index assessments_module_id_idx on public.assessments (module_id);
create index questions_assessment_id_idx on public.questions (assessment_id);
create index answer_choices_question_id_idx on public.answer_choices (question_id);
create index assessment_attempts_student_profile_id_idx on public.assessment_attempts (student_profile_id);
create index assessment_attempts_assessment_id_idx on public.assessment_attempts (assessment_id);
create index simulations_lesson_id_idx on public.simulations (lesson_id);
create index simulations_module_id_idx on public.simulations (module_id);
create index simulation_attempts_student_profile_id_idx on public.simulation_attempts (student_profile_id);
create index simulation_attempts_simulation_id_idx on public.simulation_attempts (simulation_id);
create index projects_module_id_idx on public.projects (module_id);
create index project_submissions_student_profile_id_idx on public.project_submissions (student_profile_id);
create index project_submissions_project_id_idx on public.project_submissions (project_id);
create index source_documents_owner_profile_id_idx on public.source_documents (owner_profile_id);
create index knowledge_files_owner_profile_id_idx on public.knowledge_files (owner_profile_id);
create index content_versions_entity_idx on public.content_versions (entity_table, entity_id);
create index review_records_entity_idx on public.review_records (entity_table, entity_id);
create index review_records_reviewer_profile_id_idx on public.review_records (reviewer_profile_id);
create index audit_events_actor_profile_id_idx on public.audit_events (actor_profile_id);
create index audit_events_entity_idx on public.audit_events (entity_table, entity_id);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger roles_set_updated_at before update on public.roles for each row execute function public.set_updated_at();
create trigger permissions_set_updated_at before update on public.permissions for each row execute function public.set_updated_at();
create trigger role_permissions_set_updated_at before update on public.role_permissions for each row execute function public.set_updated_at();
create trigger profile_roles_set_updated_at before update on public.profile_roles for each row execute function public.set_updated_at();
create trigger schools_set_updated_at before update on public.schools for each row execute function public.set_updated_at();
create trigger disciplines_set_updated_at before update on public.disciplines for each row execute function public.set_updated_at();
create trigger programmes_set_updated_at before update on public.programmes for each row execute function public.set_updated_at();
create trigger academic_years_set_updated_at before update on public.academic_years for each row execute function public.set_updated_at();
create trigger semesters_set_updated_at before update on public.semesters for each row execute function public.set_updated_at();
create trigger modules_set_updated_at before update on public.modules for each row execute function public.set_updated_at();
create trigger units_set_updated_at before update on public.units for each row execute function public.set_updated_at();
create trigger lessons_set_updated_at before update on public.lessons for each row execute function public.set_updated_at();
create trigger lesson_prerequisites_set_updated_at before update on public.lesson_prerequisites for each row execute function public.set_updated_at();
create trigger learning_outcomes_set_updated_at before update on public.learning_outcomes for each row execute function public.set_updated_at();
create trigger cohorts_set_updated_at before update on public.cohorts for each row execute function public.set_updated_at();
create trigger cohort_modules_set_updated_at before update on public.cohort_modules for each row execute function public.set_updated_at();
create trigger cohort_lecturers_set_updated_at before update on public.cohort_lecturers for each row execute function public.set_updated_at();
create trigger enrolments_set_updated_at before update on public.enrolments for each row execute function public.set_updated_at();
create trigger lesson_progress_set_updated_at before update on public.lesson_progress for each row execute function public.set_updated_at();
create trigger assessments_set_updated_at before update on public.assessments for each row execute function public.set_updated_at();
create trigger questions_set_updated_at before update on public.questions for each row execute function public.set_updated_at();
create trigger answer_choices_set_updated_at before update on public.answer_choices for each row execute function public.set_updated_at();
create trigger assessment_attempts_set_updated_at before update on public.assessment_attempts for each row execute function public.set_updated_at();
create trigger simulations_set_updated_at before update on public.simulations for each row execute function public.set_updated_at();
create trigger simulation_attempts_set_updated_at before update on public.simulation_attempts for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger project_submissions_set_updated_at before update on public.project_submissions for each row execute function public.set_updated_at();
create trigger source_documents_set_updated_at before update on public.source_documents for each row execute function public.set_updated_at();
create trigger knowledge_files_set_updated_at before update on public.knowledge_files for each row execute function public.set_updated_at();
create trigger content_versions_set_updated_at before update on public.content_versions for each row execute function public.set_updated_at();
create trigger review_records_set_updated_at before update on public.review_records for each row execute function public.set_updated_at();
create trigger audit_events_set_updated_at before update on public.audit_events for each row execute function public.set_updated_at();

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.has_role(role_name public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = auth.uid()
      and r.role_key = role_name
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('administrator');
$$;

create or replace function public.is_content_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('content_author') or public.has_role('engineering_reviewer') or public.has_role('administrator');
$$;

create or replace function public.lecturer_has_cohort(cohort_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.cohort_lecturers cl
      where cl.cohort_id = cohort_uuid
        and cl.lecturer_profile_id = auth.uid()
    );
$$;

create or replace function public.student_is_in_cohort(cohort_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrolments e
    where e.cohort_id = cohort_uuid
      and e.student_profile_id = auth.uid()
      and e.withdrawn_at is null
  );
$$;

create or replace function public.lecturer_has_student(student_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.enrolments e
      join public.cohort_lecturers cl on cl.cohort_id = e.cohort_id
      where e.student_profile_id = student_uuid
        and e.withdrawn_at is null
        and cl.lecturer_profile_id = auth.uid()
    );
$$;

create or replace function public.lecturer_has_module(module_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.cohort_modules cm
      join public.cohort_lecturers cl on cl.cohort_id = cm.cohort_id
      where cm.module_id = module_uuid
        and cl.lecturer_profile_id = auth.uid()
    );
$$;

create or replace function public.student_has_module(module_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cohort_modules cm
    join public.enrolments e on e.cohort_id = cm.cohort_id
    where cm.module_id = module_uuid
      and e.student_profile_id = auth.uid()
      and e.withdrawn_at is null
  );
$$;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profile_roles enable row level security;
alter table public.schools enable row level security;
alter table public.disciplines enable row level security;
alter table public.programmes enable row level security;
alter table public.academic_years enable row level security;
alter table public.semesters enable row level security;
alter table public.modules enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_prerequisites enable row level security;
alter table public.learning_outcomes enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_modules enable row level security;
alter table public.cohort_lecturers enable row level security;
alter table public.enrolments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assessments enable row level security;
alter table public.questions enable row level security;
alter table public.answer_choices enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.simulations enable row level security;
alter table public.simulation_attempts enable row level security;
alter table public.projects enable row level security;
alter table public.project_submissions enable row level security;
alter table public.source_documents enable row level security;
alter table public.knowledge_files enable row level security;
alter table public.content_versions enable row level security;
alter table public.review_records enable row level security;
alter table public.audit_events enable row level security;
