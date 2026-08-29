-- Keep private assessment explanations on the trusted server boundary.
-- RLS can restrict rows but cannot hide individual columns from an otherwise
-- selectable question row, so replace the default table-wide read grant with a
-- safe column allow-list for authenticated clients.

revoke select on table public.questions from anon, authenticated;

grant select (
  id,
  assessment_id,
  question_type,
  prompt,
  points,
  display_order,
  source_id,
  created_at,
  updated_at
) on table public.questions to authenticated;
