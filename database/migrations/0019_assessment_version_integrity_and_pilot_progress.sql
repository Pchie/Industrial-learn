-- Exact-version assessment publication and pilot progress persistence.
-- This migration defines fail-closed controls. It does not publish an assessment.

alter table public.assessments
  add column if not exists content_id text,
  add column if not exists lesson_content_id text,
  add column if not exists lesson_slug text,
  add column if not exists lesson_content_version text,
  add column if not exists module_slug text,
  add column if not exists artifact_sha256 text,
  add column if not exists governance_item_id uuid references public.content_governance_items(id) on delete restrict,
  add column if not exists review_record_id uuid references public.review_records(id) on delete restrict,
  add column if not exists published_version integer check (published_version > 0),
  add column if not exists publication_authorization_id text,
  add column if not exists answer_protection_status text not null default 'not_verified',
  add column if not exists unresolved_review_blockers boolean not null default true,
  add column if not exists source_ids text[] not null default array[]::text[],
  add column if not exists equation_ids text[] not null default array[]::text[],
  add column if not exists learning_outcome_ids text[] not null default array[]::text[],
  add column if not exists published_at timestamptz;

alter table public.assessments
  drop constraint if exists assessments_check;

alter table public.assessments
  drop constraint if exists assessments_parent_reference_check,
  drop constraint if exists assessments_artifact_sha256_check,
  drop constraint if exists assessments_managed_publication_check;

alter table public.assessments
  add constraint assessments_parent_reference_check check (
    (lesson_id is not null)::integer
      + (module_id is not null)::integer
      + (lesson_content_id is not null)::integer = 1
  ),
  add constraint assessments_artifact_sha256_check check (
    artifact_sha256 is null or artifact_sha256 ~ '^[0-9a-f]{64}$'
  ),
  add constraint assessments_managed_publication_check check (
    content_id is null
    or publication_status <> 'published'
    or (
      technical_review_status = 'Approved for student use'
      and published_version = version
      and artifact_sha256 is not null
      and nullif(btrim(lesson_slug), '') is not null
      and nullif(btrim(module_slug), '') is not null
      and governance_item_id is not null
      and review_record_id is not null
      and nullif(btrim(publication_authorization_id), '') is not null
      and answer_protection_status = 'server_only'
      and unresolved_review_blockers = false
      and published_at is not null
    )
  );

create unique index if not exists assessments_content_id_unique
  on public.assessments (content_id)
  where content_id is not null;

create unique index if not exists assessments_external_lesson_slug_unique
  on public.assessments (lesson_content_id, slug)
  where lesson_content_id is not null;

create unique index if not exists assessments_governance_item_unique
  on public.assessments (governance_item_id)
  where governance_item_id is not null;

alter table public.lesson_progress
  alter column lesson_id drop not null,
  add column if not exists lesson_content_id text,
  add column if not exists lesson_slug text,
  add column if not exists module_slug text,
  add column if not exists source_assessment_id uuid references public.assessments(id) on delete set null;

alter table public.lesson_progress
  drop constraint if exists lesson_progress_lesson_reference_check;

alter table public.lesson_progress
  add constraint lesson_progress_lesson_reference_check check (
    (lesson_id is not null)::integer + (lesson_content_id is not null)::integer = 1
  );

create unique index if not exists lesson_progress_external_lesson_student_unique
  on public.lesson_progress (lesson_content_id, student_profile_id)
  where lesson_content_id is not null;

create index if not exists lesson_progress_lesson_content_id_idx
  on public.lesson_progress (lesson_content_id)
  where lesson_content_id is not null;

drop policy if exists lesson_progress_student_self_read_write on public.lesson_progress;
drop policy if exists lesson_progress_student_self_select on public.lesson_progress;
create policy lesson_progress_student_self_select on public.lesson_progress
  for select to authenticated using (student_profile_id = auth.uid());

revoke insert, update, delete on table public.lesson_progress from anon, authenticated;
grant select on table public.lesson_progress to authenticated;

create or replace function public.is_current_published_assessment(p_assessment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.assessments a
    join public.content_governance_items assessment_item
      on assessment_item.id = a.governance_item_id
    join public.content_versions assessment_version
      on assessment_version.governance_item_id = assessment_item.id
      and assessment_version.version = assessment_item.published_version
    join public.review_records approval
      on approval.id = a.review_record_id
      and approval.governance_item_id = assessment_item.id
      and approval.content_version = assessment_item.published_version
    join public.review_assignments assignment
      on assignment.governance_item_id = assessment_item.id
      and assignment.content_version = assessment_item.published_version
      and assignment.reviewer_profile_id = approval.reviewer_profile_id
      and assignment.review_type = 'engineering_approval'
      and assignment.status = 'completed'
    join public.content_governance_items lesson_item
      on lesson_item.entity_type in ('theory_lesson', 'calculation_lesson', 'simulation_lesson')
      and lesson_item.workflow_status = 'Published'
      and lesson_item.publication_status = 'published'
      and lesson_item.current_version = lesson_item.published_version
    join public.content_versions lesson_version
      on lesson_version.governance_item_id = lesson_item.id
      and lesson_version.version = lesson_item.published_version
      and lesson_version.review_status = 'Approved for student use'
      and lesson_version.publication_status = 'published'
      and lesson_version.snapshot ->> 'id' = a.lesson_content_id
      and lesson_version.snapshot ->> 'version' = a.lesson_content_version
    where a.id = p_assessment_id
      and a.content_id is not null
      and a.technical_review_status = 'Approved for student use'
      and a.publication_status = 'published'
      and a.version = a.published_version
      and a.answer_protection_status = 'server_only'
      and a.unresolved_review_blockers = false
      and a.published_at is not null
      and assessment_item.entity_type = 'assessment'
      and assessment_item.entity_id = a.id
      and assessment_item.current_version = a.version
      and assessment_item.published_version = a.version
      and assessment_item.workflow_status = 'Published'
      and assessment_item.publication_status = 'published'
      and assessment_version.review_status = 'Approved for student use'
      and assessment_version.publication_status = 'published'
      and assessment_version.snapshot ->> 'id' = a.content_id
      and assessment_version.snapshot ->> 'slug' = a.slug
      and assessment_version.snapshot ->> 'version' = a.version::text
      and assessment_version.snapshot ->> 'artifactSha256' = a.artifact_sha256
      and assessment_version.snapshot ->> 'relatedLessonId' = a.lesson_content_id
      and assessment_version.snapshot ->> 'relatedLessonSlug' = a.lesson_slug
      and assessment_version.snapshot ->> 'relatedLessonVersion' = a.lesson_content_version
      and assessment_version.snapshot ->> 'moduleSlug' = a.module_slug
      and assessment_version.snapshot ->> 'answerProtectionStatus' = 'server_only'
      and assessment_version.snapshot -> 'sourceIds' = to_jsonb(a.source_ids)
      and assessment_version.snapshot -> 'equationIds' = to_jsonb(a.equation_ids)
      and assessment_version.snapshot -> 'learningOutcomeIds' = to_jsonb(a.learning_outcome_ids)
      and cardinality(a.source_ids) > 0
      and cardinality(a.equation_ids) > 0
      and cardinality(a.learning_outcome_ids) > 0
      and approval.decision = 'approved'
      and approval.review_status = 'Approved for student use'
      and approval.review_type = 'engineering_approval'
      and approval.reviewer_profile_id <> assessment_item.author_profile_id
      and (approval.evidence_checked ->> 'source_review_complete') = 'true'
      and (approval.evidence_checked ->> 'equation_review_complete') = 'true'
      and (approval.evidence_checked ->> 'educational_review_complete') = 'true'
      and (approval.evidence_checked ->> 'accessibility_review_complete') = 'true'
      and (approval.evidence_checked ->> 'safety_limitations_review_complete') = 'true'
      and approval.source_ids_checked @> a.source_ids
      and a.source_ids @> approval.source_ids_checked
      and approval.equation_ids_checked @> a.equation_ids
      and a.equation_ids @> approval.equation_ids_checked
      and not exists (
        select 1
        from public.review_records later_review
        where later_review.governance_item_id = assessment_item.id
          and later_review.content_version = assessment_item.current_version
          and later_review.reviewed_at > approval.reviewed_at
          and later_review.decision in ('changes_requested', 'rejected')
      )
  );
$$;

revoke all on function public.is_current_published_assessment(uuid) from public, anon;
grant execute on function public.is_current_published_assessment(uuid)
  to authenticated, service_role;

drop policy if exists assessments_read_approved_or_authorized on public.assessments;
create policy assessments_read_approved_or_authorized on public.assessments
  for select to authenticated using (
    public.is_content_staff()
    or public.is_current_published_assessment(id)
    or (
      public.has_role('lecturer')
      and (
        (module_id is not null and public.lecturer_has_module(module_id))
        or exists (
          select 1
          from public.lessons l
          join public.units u on u.id = l.unit_id
          where l.id = assessments.lesson_id
            and public.lecturer_has_module(u.module_id)
        )
      )
    )
  );

drop policy if exists questions_read_accessible_assessment on public.questions;
create policy questions_read_accessible_assessment on public.questions
  for select to authenticated using (
    public.is_content_staff()
    or public.is_platform_owner()
    or (
      public.has_role('lecturer')
      and exists (
      select 1
      from public.assessments a
      left join public.modules module_parent on module_parent.id = a.module_id
      left join public.lessons l on l.id = a.lesson_id
      left join public.units u on u.id = l.unit_id
      where a.id = questions.assessment_id
        and (
          (module_parent.id is not null and public.lecturer_has_module(module_parent.id))
          or (u.module_id is not null and public.lecturer_has_module(u.module_id))
        )
      )
    )
  );

drop policy if exists answer_choices_read_accessible_question on public.answer_choices;
drop policy if exists answer_choices_content_staff_read on public.answer_choices;
create policy answer_choices_content_staff_read on public.answer_choices
  for select to authenticated using (
    public.is_content_staff()
    or public.is_platform_owner()
    or (
      public.has_role('lecturer')
      and exists (
        select 1
        from public.questions q
        join public.assessments a on a.id = q.assessment_id
        left join public.modules module_parent on module_parent.id = a.module_id
        left join public.lessons l on l.id = a.lesson_id
        left join public.units u on u.id = l.unit_id
        where q.id = answer_choices.question_id
          and (
            (module_parent.id is not null and public.lecturer_has_module(module_parent.id))
            or (u.module_id is not null and public.lecturer_has_module(u.module_id))
          )
      )
    )
  );

drop policy if exists assessment_attempts_student_self_read_write on public.assessment_attempts;
drop policy if exists assessment_attempts_student_self_insert_draft on public.assessment_attempts;
drop policy if exists assessment_attempts_student_self_select on public.assessment_attempts;
create policy assessment_attempts_student_self_select on public.assessment_attempts
  for select to authenticated using (student_profile_id = auth.uid());

revoke insert, update, delete on table public.assessment_attempts from anon, authenticated;
grant select on table public.assessment_attempts to authenticated;

create or replace function public.record_pilot_lesson_activity_progress(
  p_student_profile_id uuid,
  p_lesson_content_id text,
  p_lesson_slug text,
  p_lesson_version text,
  p_module_slug text,
  p_recorded_at timestamptz
)
returns setof public.lesson_progress
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_progress public.lesson_progress%rowtype;
begin
  if p_student_profile_id is null
    or nullif(btrim(p_lesson_content_id), '') is null
    or nullif(btrim(p_lesson_slug), '') is null
    or nullif(btrim(p_lesson_version), '') is null
    or p_recorded_at is null
  then
    raise exception 'Complete lesson activity metadata is required.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = p_student_profile_id
      and r.role_key = 'student'
  ) then
    raise exception 'A student profile is required.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.content_governance_items item
    join public.content_versions version
      on version.governance_item_id = item.id
      and version.version = item.published_version
    where item.entity_type in ('theory_lesson', 'calculation_lesson', 'simulation_lesson')
      and item.slug = p_lesson_slug
      and item.workflow_status = 'Published'
      and item.publication_status = 'published'
      and item.current_version = item.published_version
      and version.review_status = 'Approved for student use'
      and version.publication_status = 'published'
      and version.snapshot ->> 'id' = p_lesson_content_id
      and version.snapshot ->> 'slug' = p_lesson_slug
      and version.snapshot ->> 'version' = p_lesson_version
  ) then
    raise exception 'The exact published lesson version was not found.' using errcode = '23514';
  end if;

  insert into public.lesson_progress (
    lesson_id,
    lesson_content_id,
    lesson_slug,
    module_slug,
    student_profile_id,
    status,
    percent_complete,
    started_at,
    last_activity_at
  ) values (
    null,
    p_lesson_content_id,
    p_lesson_slug,
    nullif(btrim(p_module_slug), ''),
    p_student_profile_id,
    'in_progress',
    50,
    p_recorded_at,
    p_recorded_at
  )
  on conflict (lesson_content_id, student_profile_id)
    where lesson_content_id is not null
  do update set
    lesson_slug = excluded.lesson_slug,
    module_slug = excluded.module_slug,
    status = case
      when public.lesson_progress.status = 'graded' then public.lesson_progress.status
      else 'in_progress'::public.attempt_status
    end,
    percent_complete = greatest(public.lesson_progress.percent_complete, 50),
    started_at = coalesce(public.lesson_progress.started_at, excluded.started_at),
    last_activity_at = excluded.last_activity_at,
    updated_at = excluded.last_activity_at
  returning * into v_progress;

  if not exists (
    select 1
    from public.audit_events ae
    where ae.action = 'lesson_activity_completed'
      and ae.entity_table = 'lesson_progress'
      and ae.entity_id = v_progress.id
      and ae.actor_profile_id = p_student_profile_id
  ) then
    insert into public.audit_events (
      actor_profile_id,
      action,
      entity_table,
      entity_id,
      severity,
      metadata,
      occurred_at
    ) values (
      p_student_profile_id,
      'lesson_activity_completed',
      'lesson_progress',
      v_progress.id,
      'info',
      jsonb_build_object(
        'lessonContentId', p_lesson_content_id,
        'lessonSlug', p_lesson_slug,
        'lessonVersion', p_lesson_version,
        'progressPercent', 50
      ),
      p_recorded_at
    );
  end if;

  return next v_progress;
end;
$$;

revoke all on function public.record_pilot_lesson_activity_progress(
  uuid,
  text,
  text,
  text,
  text,
  timestamptz
) from public, anon, authenticated;
grant execute on function public.record_pilot_lesson_activity_progress(
  uuid,
  text,
  text,
  text,
  text,
  timestamptz
) to service_role;

create or replace function public.start_assessment_attempt_transaction(
  p_student_profile_id uuid,
  p_assessment_id uuid,
  p_content_version integer,
  p_started_at timestamptz
)
returns setof public.assessment_attempts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempt public.assessment_attempts%rowtype;
  v_attempt_number integer;
begin
  if p_student_profile_id is null
    or p_assessment_id is null
    or p_content_version is null
    or p_started_at is null
  then
    raise exception 'Complete attempt metadata is required.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = p_student_profile_id
      and r.role_key = 'student'
  ) then
    raise exception 'A student profile is required.' using errcode = '42501';
  end if;

  if not public.is_current_published_assessment(p_assessment_id) then
    raise exception 'The assessment is not the current approved published version.' using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.assessments a
    where a.id = p_assessment_id
      and a.version = p_content_version
      and a.published_version = p_content_version
  ) then
    raise exception 'The requested assessment version is not current.' using errcode = '23514';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_student_profile_id::text || ':' || p_assessment_id::text, 0)
  );

  select *
  into v_attempt
  from public.assessment_attempts aa
  where aa.student_profile_id = p_student_profile_id
    and aa.assessment_id = p_assessment_id
    and aa.content_version = p_content_version
    and aa.status = 'in_progress'
  order by aa.attempt_number desc
  limit 1
  for update;

  if found then
    return next v_attempt;
    return;
  end if;

  select coalesce(max(aa.attempt_number), 0) + 1
  into v_attempt_number
  from public.assessment_attempts aa
  where aa.student_profile_id = p_student_profile_id
    and aa.assessment_id = p_assessment_id;

  insert into public.assessment_attempts (
    assessment_id,
    student_profile_id,
    content_version,
    attempt_number,
    status,
    submitted_answers,
    competency_awards,
    scoring_summary,
    started_at
  ) values (
    p_assessment_id,
    p_student_profile_id,
    p_content_version,
    v_attempt_number,
    'in_progress',
    '[]'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    p_started_at
  )
  returning * into v_attempt;

  insert into public.audit_events (
    actor_profile_id,
    action,
    entity_table,
    entity_id,
    severity,
    metadata,
    occurred_at
  ) values (
    p_student_profile_id,
    'assessment_attempt_started',
    'assessment_attempts',
    v_attempt.id,
    'info',
    jsonb_build_object(
      'assessmentId', p_assessment_id,
      'contentVersion', p_content_version,
      'attemptNumber', v_attempt_number
    ),
    p_started_at
  );

  return next v_attempt;
end;
$$;

revoke all on function public.start_assessment_attempt_transaction(
  uuid,
  uuid,
  integer,
  timestamptz
) from public, anon, authenticated;
grant execute on function public.start_assessment_attempt_transaction(
  uuid,
  uuid,
  integer,
  timestamptz
) to service_role;

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
set search_path = public, pg_temp
as $$
declare
  v_existing_attempt public.assessment_attempts%rowtype;
  v_duplicate_attempt public.assessment_attempts%rowtype;
  v_completed_attempt public.assessment_attempts%rowtype;
  v_assessment public.assessments%rowtype;
begin
  if p_student_profile_id is null or p_attempt_id is null then
    raise exception 'Student profile and attempt identifiers are required.' using errcode = '22023';
  end if;

  if nullif(btrim(p_idempotency_key), '') is null then
    raise exception 'Idempotency key is required.' using errcode = '22023';
  end if;

  select *
  into v_existing_attempt
  from public.assessment_attempts aa
  where aa.id = p_attempt_id
    and aa.student_profile_id = p_student_profile_id
  for update;

  if not found then
    raise exception 'Assessment attempt was not found.' using errcode = 'P0002';
  end if;

  select *
  into v_duplicate_attempt
  from public.assessment_attempts aa
  where aa.student_profile_id = p_student_profile_id
    and aa.assessment_id = v_existing_attempt.assessment_id
    and aa.idempotency_key = p_idempotency_key
    and aa.status in ('submitted', 'graded')
  order by aa.submitted_at desc nulls last
  limit 1;

  if found then
    return next v_duplicate_attempt;
    return;
  end if;

  if v_existing_attempt.status in ('submitted', 'graded') then
    raise exception 'Assessment attempt has already been completed.' using errcode = '23505';
  end if;

  select *
  into v_assessment
  from public.assessments a
  where a.id = v_existing_attempt.assessment_id
  for share;

  if not found
    or not public.is_current_published_assessment(v_existing_attempt.assessment_id)
    or v_existing_attempt.content_version <> v_assessment.version
    or v_assessment.published_version <> v_assessment.version
  then
    raise exception 'Assessment publication or version integrity check failed.' using errcode = '23514';
  end if;

  update public.assessment_attempts aa
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
  where aa.id = v_existing_attempt.id
    and aa.student_profile_id = p_student_profile_id
    and aa.status = 'in_progress'
  returning * into v_completed_attempt;

  if not found then
    raise exception 'Assessment attempt could not be completed.' using errcode = '40001';
  end if;

  if v_assessment.lesson_content_id is not null then
    insert into public.lesson_progress (
      lesson_id,
      lesson_content_id,
      lesson_slug,
      module_slug,
      source_assessment_id,
      student_profile_id,
      status,
      percent_complete,
      started_at,
      completed_at,
      last_activity_at
    ) values (
      null,
      v_assessment.lesson_content_id,
      v_assessment.lesson_slug,
      v_assessment.module_slug,
      v_assessment.id,
      p_student_profile_id,
      'graded',
      100,
      v_existing_attempt.started_at,
      p_submitted_at,
      p_submitted_at
    )
    on conflict (lesson_content_id, student_profile_id)
      where lesson_content_id is not null
    do update set
      source_assessment_id = excluded.source_assessment_id,
      status = 'graded',
      percent_complete = 100,
      started_at = coalesce(public.lesson_progress.started_at, excluded.started_at),
      completed_at = excluded.completed_at,
      last_activity_at = excluded.last_activity_at,
      updated_at = excluded.last_activity_at;
  elsif v_assessment.lesson_id is not null then
    insert into public.lesson_progress (
      lesson_id,
      student_profile_id,
      status,
      percent_complete,
      started_at,
      completed_at,
      last_activity_at,
      source_assessment_id
    ) values (
      v_assessment.lesson_id,
      p_student_profile_id,
      'graded',
      100,
      v_existing_attempt.started_at,
      p_submitted_at,
      p_submitted_at,
      v_assessment.id
    )
    on conflict (lesson_id, student_profile_id) do update set
      source_assessment_id = excluded.source_assessment_id,
      status = excluded.status,
      percent_complete = excluded.percent_complete,
      started_at = coalesce(public.lesson_progress.started_at, excluded.started_at),
      completed_at = excluded.completed_at,
      last_activity_at = excluded.last_activity_at,
      updated_at = excluded.last_activity_at;
  end if;

  insert into public.audit_events (
    actor_profile_id,
    action,
    entity_table,
    entity_id,
    severity,
    metadata,
    occurred_at
  ) values (
    p_student_profile_id,
    'assessment_attempt_completed',
    'assessment_attempts',
    v_completed_attempt.id,
    'info',
    coalesce(p_audit_metadata, '{}'::jsonb) || jsonb_build_object(
      'assessmentId', v_assessment.id,
      'contentVersion', v_existing_attempt.content_version,
      'lessonContentId', v_assessment.lesson_content_id
    ),
    p_submitted_at
  );

  return next v_completed_attempt;
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
) from public, anon, authenticated;
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

create or replace function public.publish_approved_assessment_version_to_staging(
  p_governance_item_id uuid,
  p_governance_version integer,
  p_approval_record_id uuid,
  p_related_lesson_governance_item_id uuid,
  p_publication_authorization_id text,
  p_release_candidate text,
  p_git_commit text,
  p_artifact_sha256 text,
  p_environment text
)
returns table (
  assessment_id uuid,
  content_id text,
  published_version integer,
  publication_status text,
  published_at timestamptz,
  audit_event_id uuid,
  was_already_published boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_item public.content_governance_items%rowtype;
  v_version public.content_versions%rowtype;
  v_approval public.review_records%rowtype;
  v_assignment public.review_assignments%rowtype;
  v_lesson_item public.content_governance_items%rowtype;
  v_lesson_version public.content_versions%rowtype;
  v_assessment public.assessments%rowtype;
  v_audit public.audit_events%rowtype;
  v_source_ids text[];
  v_equation_ids text[];
  v_outcome_ids text[];
  v_published_at timestamptz;
begin
  if v_actor_id is null or not public.is_platform_manager() then
    raise exception 'Platform management access is required.' using errcode = '42501';
  end if;

  if p_environment is distinct from 'staging' then
    raise exception 'This assessment publication function is restricted to staging.' using errcode = '42501';
  end if;

  if p_governance_version is null or p_governance_version < 1
    or nullif(btrim(p_publication_authorization_id), '') is null
    or nullif(btrim(p_release_candidate), '') is null
    or p_release_candidate !~ '^[a-z0-9][a-z0-9._-]{2,99}$'
    or p_git_commit !~ '^[0-9a-f]{40}$'
    or p_artifact_sha256 !~ '^[0-9a-f]{64}$'
  then
    raise exception 'Valid exact-version release evidence is required.' using errcode = '22023';
  end if;

  select *
  into v_item
  from public.content_governance_items item
  where item.id = p_governance_item_id
    and item.entity_type = 'assessment'
  for update;

  if not found then
    raise exception 'Assessment governance item was not found.' using errcode = 'P0002';
  end if;

  if v_item.current_version <> p_governance_version
    or v_item.archived_at is not null
    or v_item.publication_status = 'archived'
  then
    raise exception 'Only the current non-archived assessment version may be published.' using errcode = '23514';
  end if;

  select *
  into v_version
  from public.content_versions version
  where version.governance_item_id = v_item.id
    and version.version = p_governance_version
  for update;

  if not found or v_version.archived_at is not null then
    raise exception 'The exact governed assessment version was not found.' using errcode = 'P0002';
  end if;

  if v_version.snapshot ->> 'version' <> p_governance_version::text
    or v_version.snapshot ->> 'artifactSha256' <> p_artifact_sha256
    or v_version.snapshot ->> 'answerProtectionStatus' <> 'server_only'
    or nullif(v_version.snapshot ->> 'id', '') is null
    or nullif(v_version.snapshot ->> 'slug', '') is null
    or nullif(v_version.snapshot ->> 'relatedLessonId', '') is null
    or nullif(v_version.snapshot ->> 'relatedLessonSlug', '') is null
    or nullif(v_version.snapshot ->> 'relatedLessonVersion', '') is null
    or nullif(v_version.snapshot ->> 'moduleSlug', '') is null
  then
    raise exception 'Assessment snapshot release metadata does not match.' using errcode = '23514';
  end if;

  select coalesce(array_agg(source_value order by source_value), array[]::text[])
  into v_source_ids
  from jsonb_array_elements_text(
    coalesce(v_version.snapshot -> 'sourceIds', '[]'::jsonb)
  ) as source_values(source_value);

  select coalesce(array_agg(equation_value order by equation_value), array[]::text[])
  into v_equation_ids
  from jsonb_array_elements_text(
    coalesce(v_version.snapshot -> 'equationIds', '[]'::jsonb)
  ) as equation_values(equation_value);

  select coalesce(array_agg(outcome_value order by outcome_value), array[]::text[])
  into v_outcome_ids
  from jsonb_array_elements_text(
    coalesce(v_version.snapshot -> 'learningOutcomeIds', '[]'::jsonb)
  ) as outcome_values(outcome_value);

  if cardinality(v_source_ids) = 0
    or cardinality(v_equation_ids) = 0
    or cardinality(v_outcome_ids) = 0
  then
    raise exception 'Assessment sources, equations, and outcomes are required.' using errcode = '23514';
  end if;

  if exists (
      select source_id
      from unnest(v_source_ids) as source_values(source_id)
      group by source_id
      having count(*) > 1
    )
    or exists (
      select equation_id
      from unnest(v_equation_ids) as equation_values(equation_id)
      group by equation_id
      having count(*) > 1
    )
    or exists (
      select outcome_id
      from unnest(v_outcome_ids) as outcome_values(outcome_id)
      group by outcome_id
      having count(*) > 1
    )
  then
    raise exception 'Assessment release metadata cannot contain duplicate identifiers.' using errcode = '22023';
  end if;

  if not (v_version.source_ids @> v_source_ids and v_source_ids @> v_version.source_ids) then
    raise exception 'Assessment source metadata does not match its governed version.' using errcode = '23514';
  end if;

  select *
  into v_approval
  from public.review_records approval
  where approval.id = p_approval_record_id
    and approval.governance_item_id = v_item.id
    and approval.content_version = p_governance_version
    and approval.review_type = 'engineering_approval'
    and approval.decision = 'approved'
    and approval.review_status = 'Approved for student use';

  if not found or v_approval.reviewer_profile_id = v_item.author_profile_id then
    raise exception 'An independent exact-version assessment approval is required.' using errcode = '23514';
  end if;

  if (v_approval.evidence_checked ->> 'source_review_complete') is distinct from 'true'
    or (v_approval.evidence_checked ->> 'equation_review_complete') is distinct from 'true'
    or (v_approval.evidence_checked ->> 'educational_review_complete') is distinct from 'true'
    or (v_approval.evidence_checked ->> 'accessibility_review_complete') is distinct from 'true'
    or (v_approval.evidence_checked ->> 'safety_limitations_review_complete') is distinct from 'true'
    or v_approval.safety_review_outcome not in ('passed', 'not_applicable')
    or not (v_approval.source_ids_checked @> v_source_ids and v_source_ids @> v_approval.source_ids_checked)
    or not (v_approval.equation_ids_checked @> v_equation_ids and v_equation_ids @> v_approval.equation_ids_checked)
  then
    raise exception 'Assessment approval evidence is incomplete or mismatched.' using errcode = '23514';
  end if;

  select *
  into v_assignment
  from public.review_assignments assignment
  where assignment.governance_item_id = v_item.id
    and assignment.content_version = p_governance_version
    and assignment.reviewer_profile_id = v_approval.reviewer_profile_id
    and assignment.review_type = 'engineering_approval'
    and assignment.status = 'completed';

  if not found then
    raise exception 'The assessment review assignment is not complete.' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.review_records later_review
    where later_review.governance_item_id = v_item.id
      and later_review.content_version = p_governance_version
      and later_review.reviewed_at > v_approval.reviewed_at
      and later_review.decision in ('changes_requested', 'rejected')
  ) then
    raise exception 'A later unresolved assessment review blocks publication.' using errcode = '23514';
  end if;

  select *
  into v_lesson_item
  from public.content_governance_items item
  where item.id = p_related_lesson_governance_item_id
    and item.entity_type in ('theory_lesson', 'calculation_lesson', 'simulation_lesson')
    and item.workflow_status = 'Published'
    and item.publication_status = 'published'
    and item.current_version = item.published_version;

  if not found then
    raise exception 'The related lesson is not currently published.' using errcode = '23514';
  end if;

  select *
  into v_lesson_version
  from public.content_versions version
  where version.governance_item_id = v_lesson_item.id
    and version.version = v_lesson_item.published_version
    and version.review_status = 'Approved for student use'
    and version.publication_status = 'published';

  if not found
    or v_lesson_version.snapshot ->> 'id' <> v_version.snapshot ->> 'relatedLessonId'
    or v_lesson_version.snapshot ->> 'slug' <> v_version.snapshot ->> 'relatedLessonSlug'
    or v_lesson_version.snapshot ->> 'version' <> v_version.snapshot ->> 'relatedLessonVersion'
  then
    raise exception 'The assessment does not reference the exact published lesson version.' using errcode = '23514';
  end if;

  select *
  into v_assessment
  from public.assessments assessment
  where assessment.id = v_item.entity_id;

  if v_item.publication_status = 'published' then
    select *
    into v_audit
    from public.audit_events event
    where event.action = 'assessment.published'
      and event.entity_table = 'assessments'
      and event.entity_id = v_item.entity_id
      and event.metadata ->> 'governanceVersion' = p_governance_version::text
    order by event.occurred_at desc
    limit 1;

    if v_assessment.id is not null
      and public.is_current_published_assessment(v_assessment.id)
      and v_assessment.artifact_sha256 = p_artifact_sha256
      and v_assessment.publication_authorization_id = p_publication_authorization_id
      and v_audit.id is not null
      and v_audit.metadata ->> 'releaseCandidate' = p_release_candidate
      and v_audit.metadata ->> 'gitCommit' = p_git_commit
    then
      return query select
        v_assessment.id,
        v_assessment.content_id,
        v_assessment.published_version,
        v_assessment.publication_status::text,
        v_assessment.published_at,
        v_audit.id,
        true;
      return;
    end if;

    raise exception 'Assessment is already published under different release evidence.' using errcode = '23514';
  end if;

  if v_item.workflow_status <> 'Approved for student use' then
    raise exception 'Assessment must be approved before publication.' using errcode = '23514';
  end if;

  v_published_at := clock_timestamp();

  insert into public.assessments (
    id,
    lesson_id,
    module_id,
    lesson_content_id,
    lesson_slug,
    lesson_content_version,
    module_slug,
    slug,
    content_id,
    title,
    description,
    technical_review_status,
    publication_status,
    version,
    published_version,
    artifact_sha256,
    governance_item_id,
    review_record_id,
    publication_authorization_id,
    answer_protection_status,
    unresolved_review_blockers,
    source_ids,
    equation_ids,
    learning_outcome_ids,
    published_at,
    created_by_profile_id,
    updated_by_profile_id
  ) values (
    v_item.entity_id,
    null,
    null,
    v_version.snapshot ->> 'relatedLessonId',
    v_version.snapshot ->> 'relatedLessonSlug',
    v_version.snapshot ->> 'relatedLessonVersion',
    v_version.snapshot ->> 'moduleSlug',
    v_version.snapshot ->> 'slug',
    v_version.snapshot ->> 'id',
    v_item.title,
    coalesce(v_version.snapshot ->> 'description', 'Reviewed assessment'),
    'Approved for student use',
    'published',
    p_governance_version,
    p_governance_version,
    p_artifact_sha256,
    v_item.id,
    v_approval.id,
    p_publication_authorization_id,
    'server_only',
    false,
    v_source_ids,
    v_equation_ids,
    v_outcome_ids,
    v_published_at,
    v_actor_id,
    v_actor_id
  );

  update public.content_versions version
  set
    review_status = 'Approved for student use',
    publication_status = 'published',
    published_at = v_published_at,
    updated_by_profile_id = v_actor_id,
    updated_at = v_published_at
  where version.governance_item_id = v_item.id
    and version.version = p_governance_version;

  update public.content_governance_items item
  set
    workflow_status = 'Published',
    publication_status = 'published',
    published_version = p_governance_version,
    updated_by_profile_id = v_actor_id,
    updated_at = v_published_at
  where item.id = v_item.id;

  insert into public.audit_events (
    actor_profile_id,
    action,
    entity_table,
    entity_id,
    severity,
    metadata,
    occurred_at
  ) values (
    v_actor_id,
    'assessment.published',
    'assessments',
    v_item.entity_id,
    'info',
    jsonb_build_object(
      'governanceItemId', v_item.id,
      'governanceVersion', p_governance_version,
      'contentId', v_version.snapshot ->> 'id',
      'relatedLessonId', v_version.snapshot ->> 'relatedLessonId',
      'relatedLessonSlug', v_version.snapshot ->> 'relatedLessonSlug',
      'relatedLessonVersion', v_version.snapshot ->> 'relatedLessonVersion',
      'approvalRecordId', v_approval.id,
      'publicationAuthorizationId', p_publication_authorization_id,
      'artifactSha256', p_artifact_sha256,
      'releaseCandidate', p_release_candidate,
      'gitCommit', p_git_commit,
      'environment', p_environment
    ),
    v_published_at
  )
  returning * into v_audit;

  select *
  into v_assessment
  from public.assessments assessment
  where assessment.id = v_item.entity_id;

  if not public.is_current_published_assessment(v_assessment.id) then
    raise exception 'Published assessment failed its final integrity gate.' using errcode = '23514';
  end if;

  return query select
    v_assessment.id,
    v_assessment.content_id,
    v_assessment.published_version,
    v_assessment.publication_status::text,
    v_assessment.published_at,
    v_audit.id,
    false;
end;
$$;

revoke all on function public.publish_approved_assessment_version_to_staging(
  uuid,
  integer,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text
) from public, anon;
grant execute on function public.publish_approved_assessment_version_to_staging(
  uuid,
  integer,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text
) to authenticated, service_role;
