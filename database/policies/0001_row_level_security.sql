-- Industrial Learn row-level security policies.
-- Apply after database/migrations/0001_initial_schema.sql.

create policy profiles_self_select on public.profiles
  for select using (id = auth.uid() or public.lecturer_has_student(id) or public.is_admin());
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy roles_admin_all on public.roles
  for all using (public.is_admin()) with check (public.is_admin());
create policy roles_authenticated_read on public.roles
  for select to authenticated using (true);

create policy permissions_admin_all on public.permissions
  for all using (public.is_admin()) with check (public.is_admin());
create policy permissions_authenticated_read on public.permissions
  for select to authenticated using (true);

create policy role_permissions_admin_all on public.role_permissions
  for all using (public.is_admin()) with check (public.is_admin());
create policy role_permissions_authenticated_read on public.role_permissions
  for select to authenticated using (true);

create policy profile_roles_admin_all on public.profile_roles
  for all using (public.is_admin()) with check (public.is_admin());
create policy profile_roles_self_read on public.profile_roles
  for select using (profile_id = auth.uid() or public.is_admin());

create policy schools_read_public_catalogue on public.schools
  for select to authenticated using (true);
create policy schools_content_staff_write on public.schools
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy disciplines_read_public_catalogue on public.disciplines
  for select to authenticated using (true);
create policy disciplines_content_staff_write on public.disciplines
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy programmes_read_catalogue on public.programmes
  for select to authenticated using (
    publication_status = 'published' or public.is_content_staff() or public.has_role('lecturer')
  );
create policy programmes_content_staff_write on public.programmes
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy academic_years_read_catalogue on public.academic_years
  for select to authenticated using (true);
create policy academic_years_content_staff_write on public.academic_years
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy semesters_read_catalogue on public.semesters
  for select to authenticated using (true);
create policy semesters_content_staff_write on public.semesters
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy modules_read_approved_or_authorized on public.modules
  for select to authenticated using (
    (publication_status = 'published' and technical_review_status = 'Approved for student use')
    or public.student_has_module(id)
    or public.lecturer_has_module(id)
    or public.is_content_staff()
  );
create policy modules_content_staff_write on public.modules
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy units_read_approved_or_authorized on public.units
  for select to authenticated using (
    exists (
      select 1 from public.modules m
      where m.id = units.module_id
        and (
          (m.publication_status = 'published' and m.technical_review_status = 'Approved for student use')
          or public.student_has_module(m.id)
          or public.lecturer_has_module(m.id)
          or public.is_content_staff()
        )
    )
  );
create policy units_content_staff_write on public.units
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy lessons_read_approved_or_authorized on public.lessons
  for select to authenticated using (
    exists (
      select 1
      from public.units u
      join public.modules m on m.id = u.module_id
      where u.id = lessons.unit_id
        and (
          (lessons.publication_status = 'published' and lessons.technical_review_status = 'Approved for student use')
          or public.student_has_module(m.id)
          or public.lecturer_has_module(m.id)
          or public.is_content_staff()
        )
    )
  );
create policy lessons_content_staff_write on public.lessons
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy lesson_prerequisites_read_accessible_lessons on public.lesson_prerequisites
  for select to authenticated using (
    exists (
      select 1
      from public.lessons l
      join public.units u on u.id = l.unit_id
      join public.modules m on m.id = u.module_id
      where l.id = lesson_prerequisites.lesson_id
        and (
          public.student_has_module(m.id)
          or public.lecturer_has_module(m.id)
          or public.is_content_staff()
        )
    )
  );
create policy lesson_prerequisites_content_staff_write on public.lesson_prerequisites
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy learning_outcomes_read_accessible_content on public.learning_outcomes
  for select to authenticated using (
    public.is_content_staff()
    or (module_id is not null and (public.student_has_module(module_id) or public.lecturer_has_module(module_id)))
    or exists (
      select 1
      from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = learning_outcomes.lesson_id
        and (public.student_has_module(u.module_id) or public.lecturer_has_module(u.module_id))
    )
  );
create policy learning_outcomes_content_staff_write on public.learning_outcomes
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy cohorts_students_and_lecturers_read on public.cohorts
  for select using (
    public.student_is_in_cohort(id) or public.lecturer_has_cohort(id) or public.is_admin()
  );
create policy cohorts_admin_write on public.cohorts
  for all using (public.is_admin()) with check (public.is_admin());

create policy cohort_modules_students_and_lecturers_read on public.cohort_modules
  for select using (
    public.student_is_in_cohort(cohort_id) or public.lecturer_has_cohort(cohort_id) or public.is_admin()
  );
create policy cohort_modules_admin_write on public.cohort_modules
  for all using (public.is_admin()) with check (public.is_admin());

create policy cohort_lecturers_lecturer_self_and_admin_read on public.cohort_lecturers
  for select using (lecturer_profile_id = auth.uid() or public.is_admin());
create policy cohort_lecturers_admin_write on public.cohort_lecturers
  for all using (public.is_admin()) with check (public.is_admin());

create policy enrolments_student_self_or_lecturer_read on public.enrolments
  for select using (
    student_profile_id = auth.uid() or public.lecturer_has_cohort(cohort_id) or public.is_admin()
  );
create policy enrolments_admin_write on public.enrolments
  for all using (public.is_admin()) with check (public.is_admin());

create policy lesson_progress_student_self_read_write on public.lesson_progress
  for all using (student_profile_id = auth.uid()) with check (student_profile_id = auth.uid());
create policy lesson_progress_lecturer_read on public.lesson_progress
  for select using (public.lecturer_has_student(student_profile_id) or public.is_admin());

create policy assessments_read_approved_or_authorized on public.assessments
  for select to authenticated using (
    public.is_content_staff()
    or (module_id is not null and (public.student_has_module(module_id) or public.lecturer_has_module(module_id)))
    or exists (
      select 1
      from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = assessments.lesson_id
        and (public.student_has_module(u.module_id) or public.lecturer_has_module(u.module_id))
    )
  );
create policy assessments_content_staff_write on public.assessments
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy questions_read_accessible_assessment on public.questions
  for select to authenticated using (
    public.is_content_staff()
    or exists (
      select 1
      from public.assessments a
      left join public.lessons l on l.id = a.lesson_id
      left join public.units u on u.id = l.unit_id
      where a.id = questions.assessment_id
        and (
          (a.module_id is not null and (public.student_has_module(a.module_id) or public.lecturer_has_module(a.module_id)))
          or (u.module_id is not null and (public.student_has_module(u.module_id) or public.lecturer_has_module(u.module_id)))
        )
    )
  );
create policy questions_content_staff_write on public.questions
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy answer_choices_read_accessible_question on public.answer_choices
  for select to authenticated using (
    public.is_content_staff()
    or exists (
      select 1
      from public.questions q
      join public.assessments a on a.id = q.assessment_id
      left join public.lessons l on l.id = a.lesson_id
      left join public.units u on u.id = l.unit_id
      where q.id = answer_choices.question_id
        and (
          (a.module_id is not null and (public.student_has_module(a.module_id) or public.lecturer_has_module(a.module_id)))
          or (u.module_id is not null and (public.student_has_module(u.module_id) or public.lecturer_has_module(u.module_id)))
        )
    )
  );
create policy answer_choices_content_staff_write on public.answer_choices
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy assessment_attempts_student_self_read_write on public.assessment_attempts
  for all using (student_profile_id = auth.uid()) with check (student_profile_id = auth.uid());
create policy assessment_attempts_lecturer_read on public.assessment_attempts
  for select using (public.lecturer_has_student(student_profile_id) or public.is_admin());

create policy simulations_read_approved_or_authorized on public.simulations
  for select to authenticated using (
    public.is_content_staff()
    or (module_id is not null and (public.student_has_module(module_id) or public.lecturer_has_module(module_id)))
    or exists (
      select 1
      from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = simulations.lesson_id
        and (public.student_has_module(u.module_id) or public.lecturer_has_module(u.module_id))
    )
  );
create policy simulations_content_staff_write on public.simulations
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy simulation_attempts_student_self_read_write on public.simulation_attempts
  for all using (student_profile_id = auth.uid()) with check (student_profile_id = auth.uid());
create policy simulation_attempts_lecturer_read on public.simulation_attempts
  for select using (public.lecturer_has_student(student_profile_id) or public.is_admin());

create policy projects_read_approved_or_authorized on public.projects
  for select to authenticated using (
    public.is_content_staff()
    or public.student_has_module(module_id)
    or public.lecturer_has_module(module_id)
    or (publication_status = 'published' and technical_review_status = 'Approved for student use')
  );
create policy projects_content_staff_write on public.projects
  for all using (public.is_content_staff()) with check (public.is_content_staff());

create policy project_submissions_student_self_read_write on public.project_submissions
  for all using (student_profile_id = auth.uid()) with check (student_profile_id = auth.uid());
create policy project_submissions_lecturer_read_update on public.project_submissions
  for select using (public.lecturer_has_student(student_profile_id) or public.is_admin());
create policy project_submissions_lecturer_update on public.project_submissions
  for update using (public.lecturer_has_student(student_profile_id) or public.is_admin());

create policy source_documents_read_reviewed_or_staff on public.source_documents
  for select to authenticated using (
    approval_status in ('Source checked', 'Approved for student use')
    or owner_profile_id = auth.uid()
    or public.is_content_staff()
  );
create policy source_documents_author_or_admin_write on public.source_documents
  for all using (public.has_role('content_author') or public.is_admin()) with check (public.has_role('content_author') or public.is_admin());

create policy knowledge_files_read_reviewed_or_staff on public.knowledge_files
  for select to authenticated using (
    (publication_status = 'published' and technical_review_status = 'Approved for student use')
    or owner_profile_id = auth.uid()
    or public.is_content_staff()
  );
create policy knowledge_files_author_or_admin_write on public.knowledge_files
  for all using (public.has_role('content_author') or public.is_admin()) with check (public.has_role('content_author') or public.is_admin());

create policy content_versions_content_staff_read on public.content_versions
  for select using (public.is_content_staff());
create policy content_versions_author_or_admin_insert on public.content_versions
  for insert with check (public.has_role('content_author') or public.is_admin());
create policy content_versions_admin_update_delete on public.content_versions
  for all using (public.is_admin()) with check (public.is_admin());

create policy review_records_content_staff_read on public.review_records
  for select using (public.is_content_staff());
create policy review_records_reviewer_insert on public.review_records
  for insert with check (
    reviewer_profile_id = auth.uid()
    and (public.has_role('engineering_reviewer') or public.is_admin())
  );
create policy review_records_admin_update_delete on public.review_records
  for all using (public.is_admin()) with check (public.is_admin());

create policy audit_events_admin_read on public.audit_events
  for select using (public.is_admin());
create policy audit_events_actor_insert on public.audit_events
  for insert with check (actor_profile_id = auth.uid() or public.is_admin());
