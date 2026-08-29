-- Remove operational publication state from simulations that have not completed
-- technical review. Student visibility already fails closed through RLS; this
-- migration also aligns stored publication state with the governance workflow.

update public.simulations
set
  publication_status = 'internal',
  updated_at = now()
where publication_status = 'published'
  and technical_review_status <> 'Approved for student use';
