-- Restrict direct author writes from self-approving or publishing governance records.
-- Additive corrective migration after Prompt 33b governance negative-test review.

drop policy if exists content_governance_items_author_update_draft on public.content_governance_items;
create policy content_governance_items_author_update_draft on public.content_governance_items
  for update using (
    author_profile_id = auth.uid()
    and publication_status <> 'published'
    and (public.has_role('content_author') or public.has_role('lecturer'))
  )
  with check (
    author_profile_id = auth.uid()
    and publication_status in ('draft', 'internal')
    and workflow_status in (
      'Draft',
      'Source required',
      'Source checked',
      'Equation checked',
      'Simulation checked',
      'Engineering review required',
      'Revision required'
    )
    and archived_at is null
    and (public.has_role('content_author') or public.has_role('lecturer'))
  );

drop policy if exists content_versions_author_or_admin_insert on public.content_versions;
create policy content_versions_author_or_admin_insert on public.content_versions
  for insert with check (
    public.is_admin()
    or (
      public.has_role('content_author')
      and publication_status in ('draft', 'internal')
      and review_status <> 'Approved for student use'
      and archived_at is null
    )
  );
