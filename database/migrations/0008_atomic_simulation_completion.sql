-- Atomic simulation attempt completion.
-- The trusted server calculates simulation scores and competency awards, then calls
-- this service-role-only function to persist the attempt, lesson progress, and audit
-- evidence as one PostgreSQL statement.

create or replace function public.complete_simulation_attempt_transaction(
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
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_attempt public.simulation_attempts%rowtype;
  duplicate_attempt public.simulation_attempts%rowtype;
  completed_attempt public.simulation_attempts%rowtype;
begin
  if p_student_profile_id is null or p_attempt_id is null then
    raise exception 'student profile and attempt identifiers are required'
      using errcode = '22023';
  end if;

  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'idempotency key is required'
      using errcode = '22023';
  end if;

  if p_status not in ('submitted', 'graded') then
    raise exception 'completed simulation status must be submitted or graded'
      using errcode = '22023';
  end if;

  select *
    into existing_attempt
    from public.simulation_attempts
    where id = p_attempt_id
      and student_profile_id = p_student_profile_id
    for update;

  if not found then
    raise exception 'simulation attempt was not found'
      using errcode = 'P0002';
  end if;

  select *
    into duplicate_attempt
    from public.simulation_attempts
    where student_profile_id = p_student_profile_id
      and simulation_id = existing_attempt.simulation_id
      and idempotency_key = p_idempotency_key
      and status in ('submitted', 'graded')
    order by completed_at desc nulls last
    limit 1;

  if found then
    return next duplicate_attempt;
    return;
  end if;

  if existing_attempt.status in ('submitted', 'graded') then
    raise exception 'simulation attempt has already been completed'
      using errcode = '23505';
  end if;

  update public.simulation_attempts
    set
      status = p_status,
      scenario_state = coalesce(p_output_summary ->> 'scenarioState', existing_attempt.scenario_state),
      input_state = coalesce(p_input_state, '{}'::jsonb),
      output_state = coalesce(p_output_summary, '{}'::jsonb),
      output_summary = coalesce(p_output_summary, '{}'::jsonb),
      diagnostic_response = coalesce(p_diagnosis_submitted, '{}'::jsonb),
      diagnosis_submitted = coalesce(p_diagnosis_submitted, '{}'::jsonb),
      fault_introduced = p_fault_introduced,
      measurements_taken = coalesce(p_measurements_taken, '[]'::jsonb),
      score = p_score,
      competency_awards = coalesce(p_competency_awards, '{}'::jsonb),
      idempotency_key = p_idempotency_key,
      completed_at = p_completed_at
    where id = existing_attempt.id
      and student_profile_id = p_student_profile_id
      and status = 'in_progress'
    returning *
    into completed_attempt;

  if not found then
    raise exception 'simulation attempt could not be completed'
      using errcode = '40001';
  end if;

  if completed_attempt.lesson_id is not null then
    insert into public.lesson_progress (
      lesson_id,
      student_profile_id,
      status,
      percent_complete,
      completed_at,
      last_activity_at
    )
    values (
      completed_attempt.lesson_id,
      p_student_profile_id,
      p_status,
      case when p_status in ('submitted', 'graded') then 100 else 0 end,
      p_completed_at,
      p_completed_at
    )
    on conflict (lesson_id, student_profile_id) do update
      set
        status = excluded.status,
        percent_complete = greatest(public.lesson_progress.percent_complete, excluded.percent_complete),
        completed_at = coalesce(public.lesson_progress.completed_at, excluded.completed_at),
        last_activity_at = excluded.last_activity_at;
  end if;

  insert into public.audit_events (
    actor_profile_id,
    action,
    entity_table,
    entity_id,
    severity,
    metadata,
    occurred_at
  )
  values (
    p_student_profile_id,
    'simulation_attempt_completed',
    'simulation_attempts',
    completed_attempt.id,
    'info',
    coalesce(p_audit_metadata, '{}'::jsonb),
    p_completed_at
  );

  return next completed_attempt;
end;
$$;

revoke all on function public.complete_simulation_attempt_transaction(
  uuid,
  uuid,
  timestamptz,
  jsonb,
  jsonb,
  text,
  jsonb,
  jsonb,
  numeric,
  jsonb,
  text,
  public.attempt_status,
  jsonb
) from public;
revoke all on function public.complete_simulation_attempt_transaction(
  uuid,
  uuid,
  timestamptz,
  jsonb,
  jsonb,
  text,
  jsonb,
  jsonb,
  numeric,
  jsonb,
  text,
  public.attempt_status,
  jsonb
) from anon;
revoke all on function public.complete_simulation_attempt_transaction(
  uuid,
  uuid,
  timestamptz,
  jsonb,
  jsonb,
  text,
  jsonb,
  jsonb,
  numeric,
  jsonb,
  text,
  public.attempt_status,
  jsonb
) from authenticated;
grant execute on function public.complete_simulation_attempt_transaction(
  uuid,
  uuid,
  timestamptz,
  jsonb,
  jsonb,
  text,
  jsonb,
  jsonb,
  numeric,
  jsonb,
  text,
  public.attempt_status,
  jsonb
) to service_role;
