-- Staging-only exact-version review item for Basic Fluid Pressure assessment v2.
-- This seed never approves or publishes the assessment and is safe to rerun before review.

do $$
declare
  v_author_id uuid;
  v_item_id uuid;
  v_entity_id uuid := '94f5c2b9-a0b9-43f5-8b6b-4a3a67fc4f02'::uuid;
begin
  select id
  into v_author_id
  from public.profiles
  where email = 'staging.author@example.test';

  if v_author_id is null then
    raise exception 'Staging content-author profile is required before seeding the assessment review item.';
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
    'assessments',
    v_entity_id,
    'assessment',
    'basic-fluid-pressure-check',
    'Basic Fluid Pressure Check',
    v_author_id,
    2,
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
    updated_by_profile_id = excluded.updated_by_profile_id,
    updated_at = now()
  where content_governance_items.workflow_status in (
    'Draft',
    'Source required',
    'Source checked',
    'Equation checked',
    'Engineering review required',
    'Revision required'
  )
    and content_governance_items.publication_status <> 'published'
  returning id into v_item_id;

  if v_item_id is null then
    select id
    into v_item_id
    from public.content_governance_items
    where entity_type = 'assessment'
      and slug = 'basic-fluid-pressure-check';
  end if;

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
    'assessments',
    v_entity_id,
    2,
    jsonb_build_object(
      'id', 'ASM-FLUID-PRESSURE-001',
      'slug', 'basic-fluid-pressure-check',
      'version', '2',
      'title', 'Basic Fluid Pressure Check',
      'description', 'A short graded check covering pressure meaning, SI units, pressure calculation, visual comparison, and simple application reasoning.',
      'artifact', 'content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json',
      'artifactSha256', 'db6268839cdfb959e7f7e392d9879cb3518b30d8b13ee01686cdd88ec71cec88',
      'relatedLessonId', 'LES-FLUID-PRESSURE-001',
      'relatedLessonSlug', 'basic-fluid-pressure',
      'relatedLessonVersion', '0.4.0',
      'moduleSlug', 'fluid-mechanics-foundations',
      'sourceIds', jsonb_build_array(
        'SRC-OPENSTAX-COLLEGE-PHYSICS-2012',
        'SRC-PSU-CIMBALA-PRESSURE-BASICS'
      ),
      'equationIds', jsonb_build_array('EQ-FLUID-PRESSURE-001'),
      'learningOutcomeIds', jsonb_build_array('LO-FP-001', 'LO-FP-002', 'LO-FP-003'),
      'questionCount', 5,
      'maximumPoints', 6,
      'answerProtectionStatus', 'server_only',
      'reviewStatus', 'Engineering review required',
      'publicationStatus', 'draft'
    ),
    'Prompt 46A replaced the out-of-scope v1 assessment with five lesson-aligned questions for independent exact-version review.',
    v_author_id,
    v_author_id,
    v_item_id,
    1,
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
    updated_by_profile_id = excluded.updated_by_profile_id,
    updated_at = now()
  where content_versions.review_status <> 'Approved for student use'
    and content_versions.publication_status <> 'published';
end;
$$;
