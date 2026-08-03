-- Restrict student-visible technical content to published and approved records.
-- Additive corrective migration after Prompt 33a draft-content visibility finding.
-- Does not edit historical migrations or weaken content-staff write/review policies.

create or replace function public.is_student_visible_content(
  content_publication_status public.publication_status,
  content_technical_review_status public.content_status
)
returns boolean
language sql
stable
set search_path = public
as $$
  select content_publication_status = 'published'
    and content_technical_review_status = 'Approved for student use';
$$;

drop policy if exists programmes_read_catalogue on public.programmes;
create policy programmes_read_catalogue on public.programmes
  for select to authenticated using (
    publication_status = 'published'
    or public.is_content_staff()
    or public.has_role('lecturer')
  );

drop policy if exists modules_read_approved_or_authorized on public.modules;
create policy modules_read_approved_or_authorized on public.modules
  for select to authenticated using (
    public.is_student_visible_content(publication_status, technical_review_status)
    or public.is_content_staff()
    or (public.has_role('lecturer') and public.lecturer_has_module(id))
  );

drop policy if exists units_read_approved_or_authorized on public.units;
create policy units_read_approved_or_authorized on public.units
  for select to authenticated using (
    public.is_content_staff()
    or exists (
      select 1
      from public.modules m
      where m.id = units.module_id
        and (
          public.is_student_visible_content(m.publication_status, m.technical_review_status)
          or (public.has_role('lecturer') and public.lecturer_has_module(m.id))
        )
    )
  );

drop policy if exists lessons_read_approved_or_authorized on public.lessons;
create policy lessons_read_approved_or_authorized on public.lessons
  for select to authenticated using (
    public.is_content_staff()
    or exists (
      select 1
      from public.units u
      join public.modules m on m.id = u.module_id
      where u.id = lessons.unit_id
        and (
          (
            public.is_student_visible_content(lessons.publication_status, lessons.technical_review_status)
            and public.is_student_visible_content(m.publication_status, m.technical_review_status)
          )
          or (public.has_role('lecturer') and public.lecturer_has_module(m.id))
        )
    )
  );

drop policy if exists lesson_prerequisites_read_accessible_lessons on public.lesson_prerequisites;
create policy lesson_prerequisites_read_accessible_lessons on public.lesson_prerequisites
  for select to authenticated using (
    public.is_content_staff()
    or exists (
      select 1
      from public.lessons l
      join public.units u on u.id = l.unit_id
      join public.modules m on m.id = u.module_id
      join public.lessons prerequisite on prerequisite.id = lesson_prerequisites.prerequisite_lesson_id
      join public.units prerequisite_unit on prerequisite_unit.id = prerequisite.unit_id
      join public.modules prerequisite_module on prerequisite_module.id = prerequisite_unit.module_id
      where l.id = lesson_prerequisites.lesson_id
        and (
          (
            public.is_student_visible_content(l.publication_status, l.technical_review_status)
            and public.is_student_visible_content(m.publication_status, m.technical_review_status)
            and public.is_student_visible_content(prerequisite.publication_status, prerequisite.technical_review_status)
            and public.is_student_visible_content(prerequisite_module.publication_status, prerequisite_module.technical_review_status)
          )
          or (
            public.has_role('lecturer')
            and public.lecturer_has_module(m.id)
            and public.lecturer_has_module(prerequisite_module.id)
          )
        )
    )
  );

drop policy if exists learning_outcomes_read_accessible_content on public.learning_outcomes;
create policy learning_outcomes_read_accessible_content on public.learning_outcomes
  for select to authenticated using (
    public.is_content_staff()
    or (
      module_id is not null
      and exists (
        select 1
        from public.modules m
        where m.id = learning_outcomes.module_id
          and (
            public.is_student_visible_content(m.publication_status, m.technical_review_status)
            or (public.has_role('lecturer') and public.lecturer_has_module(m.id))
          )
      )
    )
    or exists (
      select 1
      from public.lessons l
      join public.units u on u.id = l.unit_id
      join public.modules m on m.id = u.module_id
      where l.id = learning_outcomes.lesson_id
        and (
          (
            public.is_student_visible_content(l.publication_status, l.technical_review_status)
            and public.is_student_visible_content(m.publication_status, m.technical_review_status)
          )
          or (public.has_role('lecturer') and public.lecturer_has_module(m.id))
        )
    )
  );

drop policy if exists assessments_read_approved_or_authorized on public.assessments;
create policy assessments_read_approved_or_authorized on public.assessments
  for select to authenticated using (
    public.is_content_staff()
    or (
      module_id is not null
      and exists (
        select 1
        from public.modules m
        where m.id = assessments.module_id
          and (
            (
              public.is_student_visible_content(assessments.publication_status, assessments.technical_review_status)
              and public.is_student_visible_content(m.publication_status, m.technical_review_status)
            )
            or (public.has_role('lecturer') and public.lecturer_has_module(m.id))
          )
      )
    )
    or exists (
      select 1
      from public.lessons l
      join public.units u on u.id = l.unit_id
      join public.modules m on m.id = u.module_id
      where l.id = assessments.lesson_id
        and (
          (
            public.is_student_visible_content(assessments.publication_status, assessments.technical_review_status)
            and public.is_student_visible_content(l.publication_status, l.technical_review_status)
            and public.is_student_visible_content(m.publication_status, m.technical_review_status)
          )
          or (public.has_role('lecturer') and public.lecturer_has_module(m.id))
        )
    )
  );

drop policy if exists questions_read_accessible_assessment on public.questions;
create policy questions_read_accessible_assessment on public.questions
  for select to authenticated using (
    public.is_content_staff()
    or exists (
      select 1
      from public.assessments a
      left join public.modules module_parent on module_parent.id = a.module_id
      left join public.lessons l on l.id = a.lesson_id
      left join public.units u on u.id = l.unit_id
      left join public.modules lesson_module on lesson_module.id = u.module_id
      where a.id = questions.assessment_id
        and (
          (
            public.is_student_visible_content(a.publication_status, a.technical_review_status)
            and (
              (
                module_parent.id is not null
                and public.is_student_visible_content(module_parent.publication_status, module_parent.technical_review_status)
              )
              or (
                l.id is not null
                and public.is_student_visible_content(l.publication_status, l.technical_review_status)
                and public.is_student_visible_content(lesson_module.publication_status, lesson_module.technical_review_status)
              )
            )
          )
          or (
            public.has_role('lecturer')
            and (
              (module_parent.id is not null and public.lecturer_has_module(module_parent.id))
              or (lesson_module.id is not null and public.lecturer_has_module(lesson_module.id))
            )
          )
        )
    )
  );

drop policy if exists simulations_read_approved_or_authorized on public.simulations;
create policy simulations_read_approved_or_authorized on public.simulations
  for select to authenticated using (
    public.is_content_staff()
    or (
      module_id is not null
      and exists (
        select 1
        from public.modules m
        where m.id = simulations.module_id
          and (
            (
              public.is_student_visible_content(simulations.publication_status, simulations.technical_review_status)
              and public.is_student_visible_content(m.publication_status, m.technical_review_status)
            )
            or (public.has_role('lecturer') and public.lecturer_has_module(m.id))
          )
      )
    )
    or exists (
      select 1
      from public.lessons l
      join public.units u on u.id = l.unit_id
      join public.modules m on m.id = u.module_id
      where l.id = simulations.lesson_id
        and (
          (
            public.is_student_visible_content(simulations.publication_status, simulations.technical_review_status)
            and public.is_student_visible_content(l.publication_status, l.technical_review_status)
            and public.is_student_visible_content(m.publication_status, m.technical_review_status)
          )
          or (public.has_role('lecturer') and public.lecturer_has_module(m.id))
        )
    )
  );

drop policy if exists projects_read_approved_or_authorized on public.projects;
create policy projects_read_approved_or_authorized on public.projects
  for select to authenticated using (
    public.is_content_staff()
    or exists (
      select 1
      from public.modules m
      where m.id = projects.module_id
        and (
          (
            public.is_student_visible_content(projects.publication_status, projects.technical_review_status)
            and public.is_student_visible_content(m.publication_status, m.technical_review_status)
          )
          or (public.has_role('lecturer') and public.lecturer_has_module(m.id))
        )
    )
  );
