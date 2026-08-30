-- Register the review-gated Bernoulli Flow Lab for future authenticated persistence.
-- The record remains internal until an approved review record and publication decision exist.
-- The parent is the structured lesson when present, otherwise the existing fluid-mechanics module.

with parent_content as (
  select
    lesson.id as lesson_id,
    null::uuid as module_id,
    1 as priority
  from public.lessons lesson
  where lesson.slug = 'bernoulli-flow-lab'

  union all

  select
    null::uuid as lesson_id,
    module.id as module_id,
    2 as priority
  from public.modules module
  where module.slug = 'fluid-mechanics-foundations'
), selected_parent as (
  select lesson_id, module_id
  from parent_content
  order by priority
  limit 1
)
insert into public.simulations (
  id,
  lesson_id,
  module_id,
  slug,
  title,
  description,
  state_coverage_required,
  technical_review_status,
  publication_status,
  version
)
select
  '10000000-0000-4000-8000-000000003917'::uuid,
  selected_parent.lesson_id,
  selected_parent.module_id,
  'bernoulli-flow-lab',
  'Bernoulli Flow Lab',
  'Review-gated horizontal ideal-flow simulation for continuity, Bernoulli pressure, and head comparisons.',
  array['normal-state', 'boundary-state', 'fault-state'],
  'Engineering review required'::public.content_status,
  'internal'::public.publication_status,
  1
from selected_parent
where not exists (
  select 1
  from public.simulations existing
  where existing.slug = 'bernoulli-flow-lab'
);
