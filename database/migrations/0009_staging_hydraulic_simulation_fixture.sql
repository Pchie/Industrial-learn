-- Staging fixture for the browser-based hydraulic cylinder simulation journey.
-- This migration is intentionally idempotent and only creates the application-facing
-- slug when the existing staging hydraulic simulation fixture is already present.
-- It does not approve the pilot as engineering-reviewed content.

insert into public.simulations (
  id,
  lesson_id,
  slug,
  title,
  description,
  state_coverage_required,
  technical_review_status,
  publication_status,
  version
)
select
  '10000000-0000-4000-8000-000000003616'::uuid,
  existing.lesson_id,
  'hydraulic-cylinder-force',
  'Hydraulic Cylinder Force',
  'Hydraulic cylinder force training simulation. Source-gated pilot for browser journey verification.',
  array['normal-state', 'boundary-state', 'fault-state'],
  'Source required'::public.content_status,
  'published'::public.publication_status,
  1
from public.simulations existing
where existing.slug = 'staging-hydraulic-cylinder'
  and existing.lesson_id is not null
  and not exists (
    select 1
    from public.simulations duplicate
    where duplicate.slug = 'hydraulic-cylinder-force'
  );
