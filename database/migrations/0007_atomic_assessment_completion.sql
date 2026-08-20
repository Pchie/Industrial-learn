-- Atomic assessment attempt completion.
-- The browser submits answers to trusted server code, which scores the attempt and
-- calls this function with server-calculated values. The function executes attempt
-- completion, lesson progress, and audit persistence as one PostgreSQL statement.

create or replace function public.complete_assessment_attempt_transaction(
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
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_attempt public.assessment_attempts%rowtype;
  duplicate_attempt public.assessment_attempts%rowtype;
  completed_attempt public.assessment_attempts%rowtype;
  related_lesson_id uuid;
begin
  if p_student_profile_id is null or p_attempt_id is null then
    raise exception 'student profile and attempt identifiers are required'
      using errcode = '22023';
  end if;

  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'idempotency key is required'
      using errcode = '22023';
  end if;

  select *
    into existing_attempt
    from public.assessment_attempts
    where id = p_attempt_id
      and student_profile_id = p_student_profile_id
    for update;

  if not found then
    raise exception 'assessment attempt was not found'
      using errcode = 'P0002';
  end if;

  select *
    into duplicate_attempt
    from public.assessment_attempts
    where student_profile_id = p_student_profile_id
      and assessment_id = existing_attempt.assessment_id
      and idempotency_key = p_idempotency_key
      and status in ('submitted', 'graded')
    order by submitted_at desc nulls last
    limit 1;

  if found then
    return next duplicate_attempt;
    return;
  end if;

  if existing_attempt.status in ('submitted', 'graded') then
    raise exception 'assessment attempt has already been completed'
      using errcode = '23505';
  end if;

  update public.assessment_attempts
    set
      submitted_answers = coalesce(p_answers, '[]'::jsonb),
      scoring_summary = coalesce(p_scoring_summary, '{}'::jsonb),
      competency_awards = coalesce(p_competency_awards, '{}'::jsonb),
      idempotency_key = p_idempotency_key,
      status = 'graded',
      score = nullif(p_scoring_summary ->> 'earnedPoints', '')::numeric,
      max_score = nullif(p_scoring_summary ->> 'maxPoints', '')::numeric,
      submitted_at = p_submitted_at,
      graded_at = p_submitted_at
    where id = existing_attempt.id
      and student_profile_id = p_student_profile_id
      and status = 'in_progress'
    returning *
    into completed_attempt;

  if not found then
    raise exception 'assessment attempt could not be completed'
      using errcode = '40001';
  end if;

  select lesson_id
    into related_lesson_id
    from public.assessments
    where id = completed_attempt.assessment_id;

  if related_lesson_id is not null then
    insert into public.lesson_progress (
      lesson_id,
      student_profile_id,
      status,
      percent_complete,
      completed_at,
      last_activity_at
    )
    values (
      related_lesson_id,
      p_student_profile_id,
      'graded',
      100,
      p_submitted_at,
      p_submitted_at
    )
    on conflict (lesson_id, student_profile_id) do update
      set
        status = excluded.status,
        percent_complete = excluded.percent_complete,
        completed_at = excluded.completed_at,
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
    'assessment_attempt_completed',
    'assessment_attempts',
    completed_attempt.id,
    'info',
    coalesce(p_audit_metadata, '{}'::jsonb),
    p_submitted_at
  );

  return next completed_attempt;
end;
$$;

revoke all on function public.complete_assessment_attempt_transaction(
  uuid,
  uuid,
  jsonb,
  jsonb,
  jsonb,
  text,
  timestamptz,
  jsonb
) from public;
revoke all on function public.complete_assessment_attempt_transaction(
  uuid,
  uuid,
  jsonb,
  jsonb,
  jsonb,
  text,
  timestamptz,
  jsonb
) from anon;
revoke all on function public.complete_assessment_attempt_transaction(
  uuid,
  uuid,
  jsonb,
  jsonb,
  jsonb,
  text,
  timestamptz,
  jsonb
) from authenticated;
grant execute on function public.complete_assessment_attempt_transaction(
  uuid,
  uuid,
  jsonb,
  jsonb,
  jsonb,
  text,
  timestamptz,
  jsonb
) to service_role;

