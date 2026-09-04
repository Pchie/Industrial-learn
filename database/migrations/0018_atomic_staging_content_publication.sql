-- Publish one exact approved content version to protected staging.
-- The row lock makes retries idempotent and keeps the version, governance item,
-- and append-only audit event in one transaction.

create or replace function public.publish_approved_content_version_to_staging(
  p_governance_item_id uuid,
  p_governance_version integer,
  p_content_version_label text,
  p_approval_record_id uuid,
  p_source_ids text[],
  p_equation_ids text[],
  p_release_candidate text,
  p_git_commit text,
  p_artifact_sha256 text,
  p_environment text
)
returns table (
  governance_item_id uuid,
  published_version integer,
  content_version_label text,
  publication_status text,
  workflow_status text,
  published_at timestamptz,
  approval_record_id uuid,
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
  v_audit public.audit_events%rowtype;
  v_published_at timestamptz;
  v_previous_workflow_status text;
  v_previous_publication_status text;
begin
  if v_actor_id is null or not public.is_platform_manager() then
    raise exception 'Platform management access is required.' using errcode = '42501';
  end if;

  if p_environment is distinct from 'staging' then
    raise exception 'This publication function is restricted to staging.' using errcode = '42501';
  end if;

  if p_governance_version is null or p_governance_version < 1 then
    raise exception 'A positive governance version is required.' using errcode = '22023';
  end if;

  if nullif(btrim(p_content_version_label), '') is null then
    raise exception 'A content version label is required.' using errcode = '22023';
  end if;

  if nullif(btrim(p_release_candidate), '') is null
    or p_release_candidate !~ '^[a-z0-9][a-z0-9._-]{2,99}$'
  then
    raise exception 'A valid release-candidate identifier is required.' using errcode = '22023';
  end if;

  if p_git_commit is null or p_git_commit !~ '^[0-9a-f]{40}$' then
    raise exception 'A full lowercase Git commit hash is required.' using errcode = '22023';
  end if;

  if p_artifact_sha256 is null or p_artifact_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'A lowercase SHA-256 artifact hash is required.' using errcode = '22023';
  end if;

  select *
  into v_item
  from public.content_governance_items cgi
  where cgi.id = p_governance_item_id
  for update;

  if not found then
    raise exception 'Governance item was not found.' using errcode = 'P0002';
  end if;

  if v_item.archived_at is not null or v_item.workflow_status = 'Archived'
    or v_item.publication_status = 'archived'
  then
    raise exception 'Archived content cannot be published.' using errcode = '23514';
  end if;

  if v_item.current_version <> p_governance_version then
    raise exception 'Only the current governed content version may be published.' using errcode = '23514';
  end if;

  select *
  into v_version
  from public.content_versions cv
  where cv.governance_item_id = v_item.id
    and cv.version = p_governance_version
  for update;

  if not found then
    raise exception 'The exact governed content version was not found.' using errcode = 'P0002';
  end if;

  if v_version.archived_at is not null then
    raise exception 'An archived content version cannot be published.' using errcode = '23514';
  end if;

  if coalesce(v_version.snapshot ->> 'version', '') <> p_content_version_label then
    raise exception 'The content version label does not match the reviewed snapshot.' using errcode = '23514';
  end if;

  select *
  into v_approval
  from public.review_records rr
  where rr.id = p_approval_record_id
    and rr.governance_item_id = v_item.id
    and rr.content_version = p_governance_version
    and rr.review_type = 'engineering_approval'
    and rr.decision = 'approved'
    and rr.review_status = 'Approved for student use';

  if not found then
    raise exception 'The exact approved engineering review record was not found.' using errcode = '23514';
  end if;

  if v_approval.reviewer_profile_id = v_item.author_profile_id then
    raise exception 'The approving reviewer must differ from the content author.' using errcode = '42501';
  end if;

  if (v_approval.evidence_checked ->> 'source_review_complete') is distinct from 'true'
    or (v_approval.evidence_checked ->> 'equation_review_complete') is distinct from 'true'
    or (v_approval.evidence_checked ->> 'safety_limitations_review_complete') is distinct from 'true'
    or (v_approval.evidence_checked ->> 'educational_review_complete') is distinct from 'true'
    or (v_approval.evidence_checked ->> 'accessibility_review_complete') is distinct from 'true'
  then
    raise exception 'Every required approval attestation must be complete.' using errcode = '23514';
  end if;

  if v_approval.safety_review_outcome not in ('passed', 'not_applicable') then
    raise exception 'Safety and limitations review must pass before publication.' using errcode = '23514';
  end if;

  if not (
    coalesce(v_version.source_ids, array[]::text[]) @> coalesce(p_source_ids, array[]::text[])
    and coalesce(p_source_ids, array[]::text[]) @> coalesce(v_version.source_ids, array[]::text[])
    and coalesce(v_approval.source_ids_checked, array[]::text[]) @> coalesce(p_source_ids, array[]::text[])
    and coalesce(p_source_ids, array[]::text[]) @> coalesce(v_approval.source_ids_checked, array[]::text[])
  ) then
    raise exception 'The requested source set does not match the reviewed version.' using errcode = '23514';
  end if;

  if cardinality(coalesce(p_source_ids, array[]::text[])) = 0 then
    raise exception 'Published content requires a reviewed source set.' using errcode = '23514';
  end if;

  if exists (
    select source_id
    from unnest(p_source_ids) as source_values(source_id)
    group by source_id
    having count(*) > 1
  ) then
    raise exception 'The publication source set cannot contain duplicates.' using errcode = '22023';
  end if;

  if not (
    coalesce(v_approval.equation_ids_checked, array[]::text[]) @> coalesce(p_equation_ids, array[]::text[])
    and coalesce(p_equation_ids, array[]::text[]) @> coalesce(v_approval.equation_ids_checked, array[]::text[])
  ) then
    raise exception 'The requested equation set does not match the reviewed version.' using errcode = '23514';
  end if;

  if v_item.entity_type = 'calculation_lesson'
    and cardinality(coalesce(p_equation_ids, array[]::text[])) = 0
  then
    raise exception 'A calculation lesson requires a reviewed equation set.' using errcode = '23514';
  end if;

  if exists (
    select equation_id
    from unnest(p_equation_ids) as equation_values(equation_id)
    group by equation_id
    having count(*) > 1
  ) then
    raise exception 'The publication equation set cannot contain duplicates.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.review_assignments ra
    where ra.governance_item_id = v_item.id
      and ra.content_version = p_governance_version
      and ra.reviewer_profile_id = v_approval.reviewer_profile_id
      and ra.review_type = 'engineering_approval'
      and ra.status = 'completed'
  ) then
    raise exception 'The exact-version engineering review assignment is not complete.' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.review_records later_review
    where later_review.governance_item_id = v_item.id
      and later_review.content_version = p_governance_version
      and later_review.reviewed_at > v_approval.reviewed_at
      and later_review.decision in ('changes_requested', 'rejected')
  ) then
    raise exception 'A later unresolved review finding blocks publication.' using errcode = '23514';
  end if;

  select ae.*
  into v_audit
  from public.audit_events ae
  where ae.action = 'content.published'
    and ae.entity_table = v_item.entity_table
    and ae.entity_id = v_item.entity_id
    and ae.metadata ->> 'governanceItemId' = v_item.id::text
    and ae.metadata ->> 'governanceVersion' = p_governance_version::text
  order by ae.occurred_at desc
  limit 1;

  if v_item.publication_status = 'published' then
    if v_item.workflow_status = 'Published'
      and v_item.published_version = p_governance_version
      and v_version.publication_status = 'published'
      and v_version.review_status = 'Approved for student use'
      and v_audit.id is not null
      and v_audit.metadata ->> 'approvalRecordId' = p_approval_record_id::text
      and v_audit.metadata ->> 'contentVersion' = p_content_version_label
      and v_audit.metadata ->> 'releaseCandidate' = p_release_candidate
      and v_audit.metadata ->> 'gitCommit' = p_git_commit
      and v_audit.metadata ->> 'artifactSha256' = p_artifact_sha256
      and v_audit.metadata ->> 'environment' = p_environment
    then
      return query select
        v_item.id,
        v_item.published_version,
        p_content_version_label,
        v_item.publication_status::text,
        v_item.workflow_status::text,
        v_version.published_at,
        p_approval_record_id,
        v_audit.id,
        true;
      return;
    end if;

    raise exception 'Content is already published under different release evidence.' using errcode = '23514';
  end if;

  if v_item.workflow_status <> 'Approved for student use' then
    raise exception 'Content must be approved for student use before publication.' using errcode = '23514';
  end if;

  v_previous_workflow_status := v_item.workflow_status::text;
  v_previous_publication_status := v_item.publication_status::text;
  v_published_at := clock_timestamp();

  update public.content_versions cv
  set
    review_status = 'Approved for student use',
    publication_status = 'published',
    published_at = v_published_at,
    updated_by_profile_id = v_actor_id,
    updated_at = v_published_at
  where cv.governance_item_id = v_item.id
    and cv.version = p_governance_version;

  update public.content_governance_items cgi
  set
    workflow_status = 'Published',
    publication_status = 'published',
    published_version = p_governance_version,
    updated_by_profile_id = v_actor_id,
    updated_at = v_published_at
  where cgi.id = v_item.id
  returning * into v_item;

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
    'content.published',
    v_item.entity_table,
    v_item.entity_id,
    'info',
    jsonb_build_object(
      'governanceItemId', v_item.id,
      'governanceVersion', p_governance_version,
      'contentVersion', p_content_version_label,
      'previousWorkflowStatus', v_previous_workflow_status,
      'previousPublicationStatus', v_previous_publication_status,
      'newWorkflowStatus', 'Published',
      'newPublicationStatus', 'published',
      'approvalRecordId', p_approval_record_id,
      'releaseCandidate', p_release_candidate,
      'gitCommit', p_git_commit,
      'artifactSha256', p_artifact_sha256,
      'sourceIds', to_jsonb(p_source_ids),
      'equationIds', to_jsonb(p_equation_ids),
      'environment', p_environment
    ),
    v_published_at
  )
  returning * into v_audit;

  return query select
    v_item.id,
    v_item.published_version,
    p_content_version_label,
    v_item.publication_status::text,
    v_item.workflow_status::text,
    v_published_at,
    p_approval_record_id,
    v_audit.id,
    false;
end;
$$;

revoke all on function public.publish_approved_content_version_to_staging(
  uuid,
  integer,
  text,
  uuid,
  text[],
  text[],
  text,
  text,
  text,
  text
) from public, anon;

grant execute on function public.publish_approved_content_version_to_staging(
  uuid,
  integer,
  text,
  uuid,
  text[],
  text[],
  text,
  text,
  text,
  text
) to authenticated, service_role;
