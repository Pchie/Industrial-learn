-- Row-level security policies for student dashboard preference tables.
-- Apply after database/migrations/0002_dashboard_student_preferences.sql.

create policy saved_lessons_student_self_read_write on public.saved_lessons
  for all using (student_profile_id = auth.uid())
  with check (student_profile_id = auth.uid());

create policy saved_lessons_admin_all on public.saved_lessons
  for all using (public.is_admin())
  with check (public.is_admin());

create policy dashboard_recommendation_dismissals_student_self_read_write on public.dashboard_recommendation_dismissals
  for all using (student_profile_id = auth.uid())
  with check (student_profile_id = auth.uid());

create policy dashboard_recommendation_dismissals_admin_all on public.dashboard_recommendation_dismissals
  for all using (public.is_admin())
  with check (public.is_admin());
