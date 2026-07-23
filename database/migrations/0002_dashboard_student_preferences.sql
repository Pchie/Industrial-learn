-- Student dashboard preference tables.
-- Additive migration for saved lessons and deterministic recommendation dismissal.

create table public.saved_lessons (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_profile_id, lesson_id)
);

create table public.dashboard_recommendation_dismissals (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  recommendation_id text not null,
  dismissed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_profile_id, recommendation_id)
);

create index saved_lessons_student_profile_id_idx on public.saved_lessons (student_profile_id);
create index saved_lessons_lesson_id_idx on public.saved_lessons (lesson_id);
create index dashboard_recommendation_dismissals_student_profile_id_idx
  on public.dashboard_recommendation_dismissals (student_profile_id);

alter table public.saved_lessons enable row level security;
alter table public.dashboard_recommendation_dismissals enable row level security;

create trigger saved_lessons_set_updated_at
  before update on public.saved_lessons
  for each row execute function public.set_updated_at();

create trigger dashboard_recommendation_dismissals_set_updated_at
  before update on public.dashboard_recommendation_dismissals
  for each row execute function public.set_updated_at();
