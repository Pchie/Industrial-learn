-- RLS hardening for staging database verification.
-- Apply after database/policies/0001_row_level_security.sql and later policy files.
-- This file is additive/corrective and does not rewrite historical policies.

drop policy if exists answer_choices_read_accessible_question on public.answer_choices;

create policy answer_choices_content_staff_read on public.answer_choices
  for select to authenticated using (public.is_content_staff());

drop policy if exists assessment_attempts_student_self_read_write on public.assessment_attempts;

create policy assessment_attempts_student_self_select on public.assessment_attempts
  for select using (student_profile_id = auth.uid());

create policy assessment_attempts_student_self_insert_draft on public.assessment_attempts
  for insert with check (
    false
  );

drop policy if exists simulation_attempts_student_self_read_write on public.simulation_attempts;

create policy simulation_attempts_student_self_select on public.simulation_attempts
  for select using (student_profile_id = auth.uid());

create policy simulation_attempts_student_self_insert_draft on public.simulation_attempts
  for insert with check (
    false
  );
