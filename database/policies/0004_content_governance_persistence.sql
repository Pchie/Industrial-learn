-- Row-level security for content governance records.
-- Students do not receive draft or governance access.

create policy content_governance_items_content_staff_read on public.content_governance_items
  for select using (public.is_content_staff() or public.is_admin());

create policy content_governance_items_author_insert on public.content_governance_items
  for insert with check (
    author_profile_id = auth.uid()
    and (public.has_role('content_author') or public.has_role('lecturer') or public.is_admin())
  );

create policy content_governance_items_author_update_draft on public.content_governance_items
  for update using (
    author_profile_id = auth.uid()
    and publication_status <> 'published'
    and (public.has_role('content_author') or public.has_role('lecturer'))
  )
  with check (
    author_profile_id = auth.uid()
    and publication_status <> 'published'
    and (public.has_role('content_author') or public.has_role('lecturer'))
  );

create policy content_governance_items_admin_all on public.content_governance_items
  for all using (public.is_admin())
  with check (public.is_admin());
