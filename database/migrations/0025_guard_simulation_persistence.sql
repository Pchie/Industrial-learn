-- 53E-F06: privileged runtime access intersects exact review evidence and parent
-- publication. This migration does not make any simulation student-eligible.
create function public.resolve_published_simulation(p_slug text,p_version integer)
returns setof public.simulations language sql stable security definer
set search_path = public, pg_temp
as $$
  select s.* from public.simulations s
  left join public.lessons l on l.id=s.lesson_id
  left join public.units u on u.id=l.unit_id
  join public.modules m on m.id=coalesce(s.module_id,u.module_id)
  where s.slug=p_slug and s.version=p_version
    and s.publication_status='published' and s.technical_review_status='Approved for student use'
    and m.publication_status='published' and m.technical_review_status='Approved for student use'
    and public.has_current_engineering_publication('simulations',s.id,s.version,s.slug)
    and (s.lesson_id is null or (l.publication_status='published' and l.technical_review_status='Approved for student use'
      and public.has_current_engineering_publication('lessons',l.id,l.version,l.slug)));
$$;
revoke all on function public.resolve_published_simulation(text,integer) from public,anon,authenticated;
grant execute on function public.resolve_published_simulation(text,integer) to service_role;

create function industrial_learn_private.require_published_simulation(p_simulation_id uuid,p_version integer)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
declare s public.simulations%rowtype;
begin
  select * into s from public.simulations where id=p_simulation_id for share;
  if not found or not exists(select 1 from public.resolve_published_simulation(s.slug,p_version) r where r.id=p_simulation_id) then
    raise exception 'Exact published simulation is required.' using errcode='42501';
  end if;
end;
$$;
revoke all on function industrial_learn_private.require_published_simulation(uuid,integer) from public,anon,authenticated,service_role;
create function industrial_learn_private.enforce_simulation_publication_write()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  perform industrial_learn_private.require_published_simulation(new.simulation_id,new.simulation_version);
  return new;
end;
$$;
revoke all on function industrial_learn_private.enforce_simulation_publication_write() from public,anon,authenticated,service_role;
create trigger exact_simulation_publication before insert or update on public.simulation_attempts
for each row execute function industrial_learn_private.enforce_simulation_publication_write();

create or replace function public.complete_simulation_attempt_transaction(
  p_student_profile_id uuid,
  p_attempt_id uuid,
  p_completed_at timestamptz,
  p_input_state jsonb,
  p_output_summary jsonb,
  p_fault_introduced text,
  p_measurements_taken jsonb,
  p_diagnosis_submitted jsonb,
  p_score numeric,
  p_competency_awards jsonb,
  p_idempotency_key text,
  p_status public.attempt_status default 'submitted',
  p_audit_metadata jsonb default '{}'::jsonb
)
returns setof public.simulation_attempts
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  perform industrial_learn_private.require_active_student(p_student_profile_id);
  perform industrial_learn_private.require_published_simulation(simulation_id,simulation_version)
    from public.simulation_attempts where id=p_attempt_id and student_profile_id=p_student_profile_id;
  return query select * from industrial_learn_private.complete_simulation_attempt_transaction(p_student_profile_id, p_attempt_id, p_completed_at, p_input_state, p_output_summary, p_fault_introduced, p_measurements_taken, p_diagnosis_submitted, p_score, p_competency_awards, p_idempotency_key, p_status, p_audit_metadata);
end;
$$;
revoke all on function public.complete_simulation_attempt_transaction(uuid, uuid, timestamptz, jsonb, jsonb, text, jsonb, jsonb, numeric, jsonb, text, public.attempt_status, jsonb) from public, anon, authenticated;
grant execute on function public.complete_simulation_attempt_transaction(uuid, uuid, timestamptz, jsonb, jsonb, text, jsonb, jsonb, numeric, jsonb, text, public.attempt_status, jsonb) to service_role;
