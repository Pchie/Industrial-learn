-- 53E-F01: deleted_at is authoritative account suspension, including existing JWTs.
-- No account records, scores, roles, approvals or historical migrations are changed.
create or replace function public.is_active_profile()
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and deleted_at is null);
$$;
revoke all on function public.is_active_profile() from public, anon;
grant execute on function public.is_active_profile() to authenticated, service_role;

create or replace function public.has_role(role_name public.app_role)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select public.is_active_profile() and exists (
    select 1 from public.profile_roles pr join public.roles r on r.id = pr.role_id
    where pr.profile_id = auth.uid() and r.role_key = role_name
  );
$$;

-- Ordinary users may edit presentation fields only. Status/identity changes use
-- the existing audited manager RPC; provisioning remains server-only.
revoke insert, update, delete on public.profiles from public, anon, authenticated;
grant update (display_name, preferred_name, institution_name) on public.profiles to authenticated;
drop policy profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid() and public.is_active_profile())
  with check (id = auth.uid() and public.is_active_profile());

-- Intersect every existing table policy with current authoritative status. Keep
-- own profile SELECT available so authentication can report disabled_account.
-- New tables must also receive this guard (covered by database regressions).
do $$
declare t text;
begin
  foreach t in array array[
    'roles','permissions','role_permissions','profile_roles','schools','disciplines',
    'programmes','academic_years','semesters','modules','units','lessons',
    'lesson_prerequisites','learning_outcomes','cohorts','cohort_modules','cohort_lecturers',
    'enrolments','lesson_progress','assessments','questions','answer_choices','assessment_attempts',
    'simulations','simulation_attempts','projects','project_submissions','source_documents',
    'knowledge_files','content_versions','review_records','audit_events','saved_lessons',
    'dashboard_recommendation_dismissals','content_governance_items','review_assignments'
  ] loop
    execute format('create policy active_account_required on public.%I as restrictive for all to authenticated using (public.is_active_profile()) with check (public.is_active_profile())', t);
  end loop;
end $$;

-- Trusted persistence must recheck the subject inside the transaction, including
-- retries which return an existing result. Lock against concurrent suspension.
create schema if not exists industrial_learn_private;
revoke all on schema industrial_learn_private from public, anon, authenticated, service_role;
create function industrial_learn_private.require_active_student(p_profile_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  perform 1 from public.profiles where id = p_profile_id and deleted_at is null for share;
  if not found then raise exception 'Active account is required.' using errcode = '42501'; end if;
end;
$$;
revoke all on function industrial_learn_private.require_active_student(uuid) from public, anon, authenticated, service_role;

create function industrial_learn_private.enforce_active_student_write()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  perform industrial_learn_private.require_active_student(new.student_profile_id);
  return new;
end;
$$;
revoke all on function industrial_learn_private.enforce_active_student_write() from public, anon, authenticated, service_role;
create trigger active_student_write before insert or update on public.assessment_attempts
for each row execute function industrial_learn_private.enforce_active_student_write();
create trigger active_student_write before insert or update on public.simulation_attempts
for each row execute function industrial_learn_private.enforce_active_student_write();
create trigger active_student_write before insert or update on public.lesson_progress
for each row execute function industrial_learn_private.enforce_active_student_write();

-- Preserve existing transaction semantics and exact callable contract.
alter function public.record_pilot_lesson_activity_progress(uuid, text, text, text, text, timestamptz) set schema industrial_learn_private;
revoke all on function industrial_learn_private.record_pilot_lesson_activity_progress(uuid, text, text, text, text, timestamptz) from public, anon, authenticated, service_role;
create function public.record_pilot_lesson_activity_progress(
  p_student_profile_id uuid,
  p_lesson_content_id text,
  p_lesson_slug text,
  p_lesson_version text,
  p_module_slug text,
  p_recorded_at timestamptz
)
returns setof public.lesson_progress
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  perform industrial_learn_private.require_active_student(p_student_profile_id);
  return query select * from industrial_learn_private.record_pilot_lesson_activity_progress(p_student_profile_id, p_lesson_content_id, p_lesson_slug, p_lesson_version, p_module_slug, p_recorded_at);
end;
$$;
revoke all on function public.record_pilot_lesson_activity_progress(uuid, text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.record_pilot_lesson_activity_progress(uuid, text, text, text, text, timestamptz) to service_role;

-- Preserve existing transaction semantics and exact callable contract.
alter function public.start_assessment_attempt_transaction(uuid, uuid, integer, timestamptz) set schema industrial_learn_private;
revoke all on function industrial_learn_private.start_assessment_attempt_transaction(uuid, uuid, integer, timestamptz) from public, anon, authenticated, service_role;
create function public.start_assessment_attempt_transaction(
  p_student_profile_id uuid,
  p_assessment_id uuid,
  p_content_version integer,
  p_started_at timestamptz
)
returns setof public.assessment_attempts
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  perform industrial_learn_private.require_active_student(p_student_profile_id);
  return query select * from industrial_learn_private.start_assessment_attempt_transaction(p_student_profile_id, p_assessment_id, p_content_version, p_started_at);
end;
$$;
revoke all on function public.start_assessment_attempt_transaction(uuid, uuid, integer, timestamptz) from public, anon, authenticated;
grant execute on function public.start_assessment_attempt_transaction(uuid, uuid, integer, timestamptz) to service_role;

-- Preserve existing transaction semantics and exact callable contract.
alter function public.complete_assessment_attempt_transaction(uuid, uuid, jsonb, jsonb, jsonb, text, timestamptz, jsonb) set schema industrial_learn_private;
revoke all on function industrial_learn_private.complete_assessment_attempt_transaction(uuid, uuid, jsonb, jsonb, jsonb, text, timestamptz, jsonb) from public, anon, authenticated, service_role;
create function public.complete_assessment_attempt_transaction(
  p_student_profile_id uuid,
  p_attempt_id uuid,
  p_answers jsonb,
  p_scoring_summary jsonb,
  p_competency_awards jsonb,
  p_idempotency_key text,
  p_submitted_at timestamptz,
  p_audit_metadata jsonb default '{}'::jsonb
)
returns setof public.assessment_attempts
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  perform industrial_learn_private.require_active_student(p_student_profile_id);
  return query select * from industrial_learn_private.complete_assessment_attempt_transaction(p_student_profile_id, p_attempt_id, p_answers, p_scoring_summary, p_competency_awards, p_idempotency_key, p_submitted_at, p_audit_metadata);
end;
$$;
revoke all on function public.complete_assessment_attempt_transaction(uuid, uuid, jsonb, jsonb, jsonb, text, timestamptz, jsonb) from public, anon, authenticated;
grant execute on function public.complete_assessment_attempt_transaction(uuid, uuid, jsonb, jsonb, jsonb, text, timestamptz, jsonb) to service_role;

-- Preserve existing transaction semantics and exact callable contract.
alter function public.complete_simulation_attempt_transaction(uuid, uuid, timestamptz, jsonb, jsonb, text, jsonb, jsonb, numeric, jsonb, text, public.attempt_status, jsonb) set schema industrial_learn_private;
revoke all on function industrial_learn_private.complete_simulation_attempt_transaction(uuid, uuid, timestamptz, jsonb, jsonb, text, jsonb, jsonb, numeric, jsonb, text, public.attempt_status, jsonb) from public, anon, authenticated, service_role;
create function public.complete_simulation_attempt_transaction(
  p_student_profile_id uuid,
  p_attempt_id uuid,
  p_completed_at timestamptz,
  p_input_state jsonb,
  p_output_summary jsonb,
  p_fault_introduced text,
  p_measurements_taken jsonb,
  p_diagnosis_submitted jsonb,
  p_score numeric,
  p_competency_awards jsonb,
  p_idempotency_key text,
  p_status public.attempt_status default 'submitted',
  p_audit_metadata jsonb default '{}'::jsonb
)
returns setof public.simulation_attempts
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  perform industrial_learn_private.require_active_student(p_student_profile_id);
  return query select * from industrial_learn_private.complete_simulation_attempt_transaction(p_student_profile_id, p_attempt_id, p_completed_at, p_input_state, p_output_summary, p_fault_introduced, p_measurements_taken, p_diagnosis_submitted, p_score, p_competency_awards, p_idempotency_key, p_status, p_audit_metadata);
end;
$$;
revoke all on function public.complete_simulation_attempt_transaction(uuid, uuid, timestamptz, jsonb, jsonb, text, jsonb, jsonb, numeric, jsonb, text, public.attempt_status, jsonb) from public, anon, authenticated;
grant execute on function public.complete_simulation_attempt_transaction(uuid, uuid, timestamptz, jsonb, jsonb, text, jsonb, jsonb, numeric, jsonb, text, public.attempt_status, jsonb) to service_role;

create or replace function public.lecturer_has_cohort(cohort_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_active_profile() and (public.is_admin()
    or exists (
      select 1
      from public.cohort_lecturers cl
      where cl.cohort_id = cohort_uuid
        and cl.lecturer_profile_id = auth.uid()
    ));
$$;

create or replace function public.student_is_in_cohort(cohort_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_active_profile() and (exists (
    select 1
    from public.enrolments e
    where e.cohort_id = cohort_uuid
      and e.student_profile_id = auth.uid()
      and e.withdrawn_at is null
  ));
$$;

create or replace function public.lecturer_has_student(student_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_active_profile() and (public.is_admin()
    or exists (
      select 1
      from public.enrolments e
      join public.cohort_lecturers cl on cl.cohort_id = e.cohort_id
      where e.student_profile_id = student_uuid
        and e.withdrawn_at is null
        and cl.lecturer_profile_id = auth.uid()
    ));
$$;

create or replace function public.lecturer_has_module(module_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_active_profile() and (public.is_admin()
    or exists (
      select 1
      from public.cohort_modules cm
      join public.cohort_lecturers cl on cl.cohort_id = cm.cohort_id
      where cm.module_id = module_uuid
        and cl.lecturer_profile_id = auth.uid()
    ));
$$;

create or replace function public.student_has_module(module_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_active_profile() and (exists (
    select 1
    from public.cohort_modules cm
    join public.enrolments e on e.cohort_id = cm.cohort_id
    where cm.module_id = module_uuid
      and e.student_profile_id = auth.uid()
      and e.withdrawn_at is null
  ));
$$;
