-- Add an evidence gate to the existing parent/course-scoped SELECT policies.
-- Historical fixtures and review history remain intact; labels alone grant no access.
create or replace function public.has_current_engineering_publication(
  p_entity_table text,
  p_entity_id uuid,
  p_version integer,
  p_slug text
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p_entity_table in ('lessons', 'simulations') and exists (
    select 1
    from public.content_governance_items item
    join public.content_versions version
      on version.governance_item_id = item.id
      and version.entity_table = item.entity_table
      and version.entity_id = item.entity_id
      and version.version = item.current_version
    join public.review_records approval
      on approval.governance_item_id = item.id
      and approval.entity_table = item.entity_table
      and approval.entity_id = item.entity_id
      and approval.content_version = version.version
    join public.review_assignments assignment
      on assignment.governance_item_id = item.id
      and assignment.content_version = version.version
      and assignment.reviewer_profile_id = approval.reviewer_profile_id
      and assignment.review_type = 'engineering_approval'
      and assignment.status = 'completed'
    where item.entity_table = p_entity_table
      and item.entity_id = p_entity_id
      and item.slug = p_slug
      and item.current_version = p_version
      and item.published_version = p_version
      and item.workflow_status = 'Published'
      and item.publication_status = 'published'
      and item.archived_at is null
      and version.review_status = 'Approved for student use'
      and version.publication_status = 'published'
      and version.published_at is not null
      and version.archived_at is null
      and version.snapshot ->> 'slug' = p_slug
      and cardinality(version.source_ids) > 0
      and approval.review_type = 'engineering_approval'
      and approval.decision = 'approved'
      and approval.review_status = 'Approved for student use'
      and approval.reviewed_at is not null
      and approval.reviewer_role in ('engineering_reviewer', 'administrator')
      and approval.reviewer_profile_id <> item.author_profile_id
      and approval.safety_review_outcome in ('passed', 'not_applicable')
      and approval.source_ids_checked @> version.source_ids
      and version.source_ids @> approval.source_ids_checked
      and approval.evidence_checked ->> 'source_review_complete' = 'true'
      and approval.evidence_checked ->> 'equation_review_complete' = 'true'
      and approval.evidence_checked ->> 'educational_review_complete' = 'true'
      and approval.evidence_checked ->> 'accessibility_review_complete' = 'true'
      and approval.evidence_checked ->> 'safety_limitations_review_complete' = 'true'
      and (
        p_entity_table <> 'simulations'
        or (
          approval.evidence_checked ->> 'simulation_review_complete' = 'true'
          and cardinality(approval.simulation_test_ids_checked) > 0
        )
      )
      and not exists (
        select 1 from public.review_records later_review
        where later_review.governance_item_id = item.id
          and later_review.content_version = version.version
          and later_review.reviewed_at >= approval.reviewed_at
          and later_review.decision in ('changes_requested', 'rejected')
      )
  );
$$;

revoke all on function public.has_current_engineering_publication(text, uuid, integer, text)
  from public, anon;
grant execute on function public.has_current_engineering_publication(text, uuid, integer, text)
  to authenticated, service_role;

-- RESTRICTIVE means these predicates intersect with, never replace, existing
-- permissive policies. Lecturer access still requires the original course scope.
drop policy if exists lessons_require_review_evidence on public.lessons;
create policy lessons_require_review_evidence on public.lessons
  as restrictive for select to authenticated using (
    public.is_content_staff()
    or public.has_role('lecturer')
    or public.has_current_engineering_publication('lessons', id, version, slug)
  );

drop policy if exists simulations_require_review_evidence on public.simulations;
create policy simulations_require_review_evidence on public.simulations
  as restrictive for select to authenticated using (
    public.is_content_staff()
    or public.has_role('lecturer')
    or public.has_current_engineering_publication('simulations', id, version, slug)
  );
