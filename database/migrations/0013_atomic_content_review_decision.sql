-- Record a reviewer decision against one exact governed content version.
-- Reviewers cannot directly insert review records after this migration; the
-- security-definer function enforces role, author separation, version, and evidence.

drop policy if exists review_records_reviewer_insert on public.review_records;
revoke insert, update, delete on table public.review_records from anon, authenticated;

create or replace function public.record_content_review_decision(
  p_governance_item_id uuid,
  p_governance_version integer,
  p_content_version_label text,
  p_decision public.review_decision,
  p_notes text,
  p_evidence_checked jsonb,
  p_source_ids_checked text[],
  p_equation_ids_checked text[],
  p_safety_review_outcome text
)
returns public.review_records
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reviewer_id uuid := auth.uid();
  v_item public.content_governance_items%rowtype;
  v_version public.content_versions%rowtype;
  v_existing public.review_records%rowtype;
  v_record public.review_records%rowtype;
  v_reviewer_role public.app_role;
  v_is_approval boolean := p_decision = 'approved';
begin
  if v_reviewer_id is null then
    raise exception 'Authenticated reviewer identity is required.' using errcode = '42501';
  end if;

  if not (public.has_role('engineering_reviewer') or public.is_admin()) then
    raise exception 'Engineering reviewer or administrator role is required.' using errcode = '42501';
  end if;

  if nullif(btrim(p_notes), '') is null then
    raise exception 'A review comment or attestation is required.' using errcode = '22023';
  end if;

  select *
  into v_item
  from public.content_governance_items
  where id = p_governance_item_id
  for update;

  if not found then
    raise exception 'Governance item was not found.' using errcode = 'P0002';
  end if;

  if v_item.workflow_status <> 'Engineering review required' then
    raise exception 'Content is not currently awaiting engineering review.' using errcode = '23514';
  end if;

  if v_item.publication_status = 'published' then
    raise exception 'Published content cannot be reviewed in place.' using errcode = '23514';
  end if;

  if p_governance_version <> v_item.current_version then
    raise exception 'The submitted governance version is not current.' using errcode = '23514';
  end if;

  select *
  into v_version
  from public.content_versions
  where governance_item_id = v_item.id
    and version = v_item.current_version;

  if not found then
    raise exception 'The current governed content version was not found.' using errcode = 'P0002';
  end if;

  if coalesce(v_version.snapshot ->> 'version', '') <> p_content_version_label then
    raise exception 'The submitted content version label does not match the reviewed snapshot.' using errcode = '23514';
  end if;

  if v_is_approval and v_item.author_profile_id = v_reviewer_id then
    raise exception 'Authors cannot approve their own technical content.' using errcode = '42501';
  end if;

  if v_is_approval then
    if (p_evidence_checked ->> 'source_review_complete') is distinct from 'true'
      or (p_evidence_checked ->> 'equation_review_complete') is distinct from 'true'
      or (p_evidence_checked ->> 'safety_limitations_review_complete') is distinct from 'true'
      or (p_evidence_checked ->> 'educational_review_complete') is distinct from 'true'
      or (p_evidence_checked ->> 'accessibility_review_complete') is distinct from 'true'
    then
      raise exception 'Every required review attestation must be checked before approval.' using errcode = '23514';
    end if;

    if cardinality(coalesce(p_source_ids_checked, array[]::text[])) = 0 then
      raise exception 'Approved review requires checked source IDs.' using errcode = '23514';
    end if;

    if v_item.entity_type = 'calculation_lesson'
      and cardinality(coalesce(p_equation_ids_checked, array[]::text[])) = 0
    then
      raise exception 'Approved calculation lesson review requires checked equation IDs.' using errcode = '23514';
    end if;

    if p_safety_review_outcome not in ('passed', 'not_applicable') then
      raise exception 'Safety and limitations review must be passed or marked not applicable.' using errcode = '23514';
    end if;

    select *
    into v_existing
    from public.review_records
    where governance_item_id = v_item.id
      and content_version = v_item.current_version
      and reviewer_profile_id = v_reviewer_id
      and review_type = 'engineering_approval'
      and decision = 'approved'
    order by reviewed_at desc
    limit 1;

    if found then
      return v_existing;
    end if;
  end if;

  v_reviewer_role := case
    when public.is_admin() then 'administrator'::public.app_role
    else 'engineering_reviewer'::public.app_role
  end;

  insert into public.review_records (
    entity_table,
    entity_id,
    reviewer_profile_id,
    decision,
    review_status,
    notes,
    source_check_passed,
    equation_check_passed,
    simulation_check_passed,
    reviewed_at,
    created_by_profile_id,
    updated_by_profile_id,
    governance_item_id,
    content_version,
    reviewer_role,
    review_type,
    evidence_checked,
    source_ids_checked,
    equation_ids_checked,
    simulation_test_ids_checked,
    safety_review_outcome
  ) values (
    v_item.entity_table,
    v_item.entity_id,
    v_reviewer_id,
    p_decision,
    case when v_is_approval
      then 'Approved for student use'::public.content_status
      else 'Engineering review required'::public.content_status
    end,
    btrim(p_notes),
    v_is_approval,
    v_is_approval and cardinality(coalesce(p_equation_ids_checked, array[]::text[])) > 0,
    false,
    now(),
    v_reviewer_id,
    v_reviewer_id,
    v_item.id,
    v_item.current_version,
    v_reviewer_role,
    'engineering_approval',
    coalesce(p_evidence_checked, '{}'::jsonb) || jsonb_build_object(
      'content_version_label', p_content_version_label
    ),
    coalesce(p_source_ids_checked, array[]::text[]),
    coalesce(p_equation_ids_checked, array[]::text[]),
    array[]::text[],
    p_safety_review_outcome
  )
  returning * into v_record;

  update public.content_governance_items
  set
    workflow_status = case
      when v_is_approval then 'Approved for student use'::public.content_workflow_status
      else 'Revision required'::public.content_workflow_status
    end,
    updated_by_profile_id = v_reviewer_id,
    updated_at = now()
  where id = v_item.id;

  insert into public.audit_events (
    actor_profile_id,
    action,
    entity_table,
    entity_id,
    severity,
    metadata
  ) values (
    v_reviewer_id,
    'content.review.' || p_decision::text,
    v_item.entity_table,
    v_item.entity_id,
    'info',
    jsonb_build_object(
      'governanceItemId', v_item.id,
      'governanceVersion', v_item.current_version,
      'contentVersion', p_content_version_label,
      'reviewType', 'engineering_approval'
    )
  );

  return v_record;
end;
$$;

revoke all on function public.record_content_review_decision(
  uuid,
  integer,
  text,
  public.review_decision,
  text,
  jsonb,
  text[],
  text[],
  text
) from public, anon;

grant execute on function public.record_content_review_decision(
  uuid,
  integer,
  text,
  public.review_decision,
  text,
  jsonb,
  text[],
  text[],
  text
) to authenticated, service_role;
