-- The rollback matrix found that an unassigned lecturer could still use a
-- legacy published-label path. Keep the exception strictly course-scoped.
drop policy if exists lessons_require_review_evidence on public.lessons;
create policy lessons_require_review_evidence on public.lessons
  as restrictive for select to authenticated using (
    public.is_content_staff()
    or (
      public.has_role('lecturer')
      and exists (
        select 1 from public.units u
        where u.id = lessons.unit_id
          and public.lecturer_has_module(u.module_id)
      )
    )
    or public.has_current_engineering_publication('lessons', id, version, slug)
  );

drop policy if exists simulations_require_review_evidence on public.simulations;
create policy simulations_require_review_evidence on public.simulations
  as restrictive for select to authenticated using (
    public.is_content_staff()
    or (
      public.has_role('lecturer')
      and (
        (module_id is not null and public.lecturer_has_module(module_id))
        or exists (
          select 1 from public.lessons l
          join public.units u on u.id = l.unit_id
          where l.id = simulations.lesson_id
            and public.lecturer_has_module(u.module_id)
        )
      )
    )
    or public.has_current_engineering_publication('simulations', id, version, slug)
  );
