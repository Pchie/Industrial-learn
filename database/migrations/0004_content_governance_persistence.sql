-- Content governance persistence metadata.
-- Additive migration for review workflow, publication gates, rollback, and archive.

create type public.content_entity_type as enum (
  'theory_lesson',
  'calculation_lesson',
  'simulation_lesson',
  'assessment',
  'engineering_project',
  'professional_development'
);

create type public.content_workflow_status as enum (
  'Draft',
  'Source required',
  'Source checked',
  'Equation checked',
  'Simulation checked',
  'Engineering review required',
  'Approved for student use',
  'Published',
  'Revision required',
  'Archived'
);

create table public.content_governance_items (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null,
  entity_id uuid not null,
  entity_type public.content_entity_type not null,
  slug text not null,
  title text not null,
  author_profile_id uuid not null references public.profiles(id) on delete restrict,
  current_version integer not null default 1 check (current_version > 0),
  published_version integer check (published_version > 0),
  workflow_status public.content_workflow_status not null default 'Draft',
  publication_status public.publication_status not null default 'draft',
  rollback_reason text,
  archived_at timestamptz,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  updated_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_table, entity_id),
  unique (entity_type, slug)
);

alter table public.content_versions
  add column if not exists governance_item_id uuid references public.content_governance_items(id) on delete cascade,
  add column if not exists previous_version integer check (previous_version > 0),
  add column if not exists source_ids text[] not null default array[]::text[],
  add column if not exists review_status public.content_status not null default 'Draft',
  add column if not exists publication_status public.publication_status not null default 'draft',
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz;

alter table public.review_records
  add column if not exists governance_item_id uuid references public.content_governance_items(id) on delete cascade,
  add column if not exists content_version integer check (content_version > 0),
  add column if not exists reviewer_role public.app_role,
  add column if not exists review_type text,
  add column if not exists evidence_checked jsonb not null default '{}'::jsonb,
  add column if not exists source_ids_checked text[] not null default array[]::text[],
  add column if not exists equation_ids_checked text[] not null default array[]::text[],
  add column if not exists simulation_test_ids_checked text[] not null default array[]::text[],
  add column if not exists safety_review_outcome text;

create index content_governance_items_author_profile_id_idx
  on public.content_governance_items (author_profile_id);

create index content_governance_items_publication_status_idx
  on public.content_governance_items (publication_status);

create index content_versions_governance_item_id_idx
  on public.content_versions (governance_item_id);

create index review_records_governance_item_id_idx
  on public.review_records (governance_item_id);

alter table public.content_governance_items enable row level security;

create trigger content_governance_items_set_updated_at
  before update on public.content_governance_items
  for each row execute function public.set_updated_at();
