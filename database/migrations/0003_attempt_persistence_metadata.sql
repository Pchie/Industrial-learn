-- Attempt persistence metadata for authenticated assessment and simulation attempts.
-- Additive migration; does not modify historical migrations.

alter table public.assessment_attempts
  add column if not exists content_version integer not null default 1 check (content_version > 0),
  add column if not exists attempt_number integer not null default 1 check (attempt_number > 0),
  add column if not exists idempotency_key text,
  add column if not exists competency_awards jsonb not null default '{}'::jsonb,
  add column if not exists scoring_summary jsonb not null default '{}'::jsonb,
  add column if not exists abandoned_at timestamptz;

create unique index if not exists assessment_attempts_student_assessment_attempt_number_unique
  on public.assessment_attempts (student_profile_id, assessment_id, attempt_number);

create unique index if not exists assessment_attempts_student_assessment_idempotency_unique
  on public.assessment_attempts (student_profile_id, assessment_id, idempotency_key)
  where idempotency_key is not null;

alter table public.simulation_attempts
  add column if not exists simulation_version integer not null default 1 check (simulation_version > 0),
  add column if not exists lesson_id uuid references public.lessons(id) on delete set null,
  add column if not exists mode text not null default 'learn',
  add column if not exists idempotency_key text,
  add column if not exists fault_introduced text,
  add column if not exists measurements_taken jsonb not null default '[]'::jsonb,
  add column if not exists diagnosis_submitted jsonb not null default '{}'::jsonb,
  add column if not exists score numeric(8,2),
  add column if not exists competency_awards jsonb not null default '{}'::jsonb,
  add column if not exists output_summary jsonb not null default '{}'::jsonb;

create unique index if not exists simulation_attempts_student_simulation_idempotency_unique
  on public.simulation_attempts (student_profile_id, simulation_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists simulation_attempts_lesson_id_idx
  on public.simulation_attempts (lesson_id);
