-- Staging-only governance fixture for the Basic Fluid Pressure human review.
-- It binds the static lesson version to the existing synthetic content author.
-- It never approves or publishes the lesson and is safe to rerun.

do $$
declare
  v_author_id uuid;
  v_item_id uuid;
  v_entity_id uuid := '94f5c2b9-a0b9-43f5-8b6b-4a3a67fc4f01'::uuid;
begin
  select id into v_author_id
  from public.profiles
  where email = 'staging.author@example.test';

  if v_author_id is null then
    raise exception 'Staging content-author profile is required before seeding the review item.';
  end if;

  insert into public.content_governance_items (
    entity_table,
    entity_id,
    entity_type,
    slug,
    title,
    author_profile_id,
    current_version,
    workflow_status,
    publication_status,
    created_by_profile_id,
    updated_by_profile_id
  ) values (
    'lessons',
    v_entity_id,
    'calculation_lesson',
    'basic-fluid-pressure',
    'Basic Fluid Pressure',
    v_author_id,
    4,
    'Engineering review required',
    'draft',
    v_author_id,
    v_author_id
  )
  on conflict (entity_type, slug) do update
  set
    title = excluded.title,
    author_profile_id = excluded.author_profile_id,
    current_version = excluded.current_version,
    workflow_status = 'Engineering review required',
    publication_status = 'draft',
    updated_by_profile_id = excluded.updated_by_profile_id,
    updated_at = now()
  returning id into v_item_id;

  insert into public.content_versions (
    entity_table,
    entity_id,
    version,
    snapshot,
    change_summary,
    created_by_profile_id,
    updated_by_profile_id,
    governance_item_id,
    previous_version,
    source_ids,
    review_status,
    publication_status
  ) values (
    'lessons',
    v_entity_id,
    4,
    jsonb_build_object(
      'id', 'LES-FLUID-PRESSURE-001',
      'slug', 'basic-fluid-pressure',
      'version', '0.4.0',
      'artifact', 'content/lessons/fluid-pressure/basic-fluid-pressure.json',
      'reviewStatus', 'Engineering review required',
      'publicationStatus', 'draft'
    ),
    'Prompt 46A source, scope, assessment, visual-learning, and accessibility remediation.',
    v_author_id,
    v_author_id,
    v_item_id,
    3,
    array[
      'SRC-OPENSTAX-COLLEGE-PHYSICS-2012',
      'SRC-PSU-CIMBALA-PRESSURE-BASICS'
    ],
    'Engineering review required',
    'draft'
  )
  on conflict (entity_table, entity_id, version) do update
  set
    snapshot = excluded.snapshot,
    change_summary = excluded.change_summary,
    governance_item_id = excluded.governance_item_id,
    source_ids = excluded.source_ids,
    review_status = excluded.review_status,
    publication_status = excluded.publication_status,
    updated_by_profile_id = excluded.updated_by_profile_id,
    updated_at = now();
end;
$$;
