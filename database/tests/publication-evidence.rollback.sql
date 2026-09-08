-- Staging regression fixture. The runner MUST wrap this file in BEGIN / ROLLBACK.
-- All identities, content and approvals below are synthetic and never committed.
create function pg_temp.check_publication(condition boolean, label text)
returns void language plpgsql as $$
begin
  if condition is distinct from true then
    raise exception 'Publication regression failed: %', label;
  end if;
end;
$$;

do $$
declare
  student_id uuid := gen_random_uuid();
  author_id uuid := gen_random_uuid();
  reviewer_id uuid := gen_random_uuid();
  item_id uuid;
  entity_id uuid;
  approval_id uuid;
  parent_id uuid;
  target_table text;
  target_slug text;
  mutation text;
  visible_count integer;
  cohort_id uuid := gen_random_uuid();
  staff_id uuid;
begin
  insert into auth.users (id, email) values
    (student_id, student_id::text || '@example.test'),
    (author_id, author_id::text || '@example.test'),
    (reviewer_id, reviewer_id::text || '@example.test');
  insert into public.profiles (id, email, display_name)
    select id, email, 'Rollback-only security fixture'
    from auth.users where id in (student_id, author_id, reviewer_id);
  insert into public.profile_roles (profile_id, role_id)
    select student_id, id from public.roles where role_key = 'student';
  insert into public.profile_roles (profile_id, role_id)
    select author_id, id from public.roles where role_key = 'content_author';
  insert into public.profile_roles (profile_id, role_id)
    select reviewer_id, id from public.roles where role_key = 'engineering_reviewer';

  foreach target_table in array array['lessons', 'simulations'] loop
    entity_id := gen_random_uuid();
    item_id := gen_random_uuid();
    approval_id := gen_random_uuid();
    target_slug := 'rollback-only-' || entity_id::text;
    if target_table = 'lessons' then
      select l.unit_id into parent_id from public.lessons l
        where l.slug = 'staging-fluid-pressure';
      perform pg_temp.check_publication(parent_id is not null, 'staging lesson parent exists');
      insert into public.lessons (id, unit_id, slug, title, description, difficulty, academic_level, estimated_duration_minutes, technical_review_status, publication_status)
        values (entity_id, parent_id, target_slug, 'Rollback-only fixture', 'Not engineering content', 'test', 'test', 1, 'Approved for student use', 'published');
    else
      select s.module_id into parent_id from public.simulations s
        where s.slug = 'staging-hydraulic-cylinder';
      if parent_id is null then
        select u.module_id into parent_id from public.lessons l join public.units u on u.id = l.unit_id
          where l.slug = 'staging-fluid-pressure';
      end if;
      perform pg_temp.check_publication(parent_id is not null, 'staging simulation parent exists');
      insert into public.simulations (id, module_id, slug, title, description, technical_review_status, publication_status)
        values (entity_id, parent_id, target_slug, 'Rollback-only fixture', 'Not engineering content', 'Approved for student use', 'published');
    end if;
    perform pg_temp.check_publication(not public.has_current_engineering_publication(target_table, entity_id, 1, target_slug), 'labels without evidence denied');
    insert into public.content_governance_items (id, entity_table, entity_id, entity_type, slug, title, author_profile_id, current_version, published_version, workflow_status, publication_status)
      values (item_id, target_table, entity_id, 'simulation_lesson', target_slug, 'Rollback-only fixture', author_id, 1, 1, 'Published', 'published');
    insert into public.content_versions (governance_item_id, entity_table, entity_id, version, snapshot, change_summary, source_ids, review_status, publication_status, published_at)
      values (item_id, target_table, entity_id, 1, jsonb_build_object('slug', target_slug), 'Rollback-only test; never retained', array['TEST-ROLLBACK-ONLY'], 'Approved for student use', 'published', now());
    insert into public.review_assignments (governance_item_id, content_version, reviewer_profile_id, assigned_by_profile_id, review_type, status, reason)
      values (item_id, 1, reviewer_id, author_id, 'engineering_approval', 'assigned', 'Rollback-only regression fixture');
    insert into public.review_records (id, entity_table, entity_id, governance_item_id, content_version, reviewer_profile_id, reviewer_role, review_type, decision, review_status, notes, evidence_checked, source_ids_checked, simulation_test_ids_checked, safety_review_outcome)
      values (approval_id, target_table, entity_id, item_id, 1, reviewer_id, 'engineering_reviewer', 'engineering_approval', 'approved', 'Approved for student use', 'Synthetic rollback-only approval, not technical evidence',
        '{"source_review_complete":true,"equation_review_complete":true,"educational_review_complete":true,"accessibility_review_complete":true,"safety_limitations_review_complete":true,"simulation_review_complete":true}',
        array['TEST-ROLLBACK-ONLY'], array['TEST-NORMAL','TEST-BOUNDARY','TEST-FAULT'], 'passed');
    perform pg_temp.check_publication(public.has_current_engineering_publication(target_table, entity_id, 1, target_slug), 'complete exact-version evidence accepted');
    perform pg_temp.check_publication(not public.has_current_engineering_publication(target_table, entity_id, 2, target_slug), 'old version denied');
    perform pg_temp.check_publication(not public.has_current_engineering_publication(target_table, entity_id, 1, 'wrong-slug'), 'wrong identity denied');

    perform set_config('request.jwt.claims', jsonb_build_object('sub', student_id, 'role', 'authenticated')::text, true);
    set local role authenticated;
    execute format('select count(*) from public.%I where id = $1', target_table) into visible_count using entity_id;
    reset role;
    perform pg_temp.check_publication(visible_count = 1, 'student can read positive fixture through RLS');

    foreach mutation in array array['draft','archived','self-review','missing-source','incomplete-review','missing-assignment','later-rejection'] loop
      begin
        if mutation = 'draft' then
          update public.content_versions set publication_status = 'draft' where governance_item_id = item_id;
        elsif mutation = 'archived' then
          update public.content_governance_items set archived_at = now() where id = item_id;
        elsif mutation = 'self-review' then
          update public.content_governance_items set author_profile_id = reviewer_id where id = item_id;
        elsif mutation = 'missing-source' then
          update public.content_versions set source_ids = array[]::text[] where governance_item_id = item_id;
        elsif mutation = 'incomplete-review' then
          update public.review_records set evidence_checked = '{}'::jsonb where id = approval_id;
        elsif mutation = 'missing-assignment' then
          update public.review_assignments set status = 'cancelled' where governance_item_id = item_id;
        else
          insert into public.review_records (entity_table, entity_id, governance_item_id, content_version, reviewer_profile_id, decision, review_status, notes, reviewed_at)
            values (target_table, entity_id, item_id, 1, reviewer_id, 'rejected', 'Engineering review required', 'Rollback-only rejection', now() + interval '1 second');
        end if;
        perform pg_temp.check_publication(not public.has_current_engineering_publication(target_table, entity_id, 1, target_slug), mutation);
        set local role authenticated;
        execute format('select count(*) from public.%I where id = $1', target_table) into visible_count using entity_id;
        reset role;
        perform pg_temp.check_publication(visible_count = 0, 'RLS ' || mutation);
        raise exception using errcode = 'ZX001', message = 'Roll back this successful test mutation';
      exception when sqlstate 'ZX001' then null;
      end;
    end loop;
    if target_table = 'simulations' then
      update public.review_records set simulation_test_ids_checked = array[]::text[] where id = approval_id;
      perform pg_temp.check_publication(not public.has_current_engineering_publication(target_table, entity_id, 1, target_slug), 'simulation tests required');
    end if;
  end loop;

  set local role authenticated;
  select count(*) into visible_count from public.lessons where slug in ('prompt-33a-published-lesson','prompt-33b-lesson-published_approved','staging-fluid-pressure');
  perform pg_temp.check_publication(visible_count = 0, 'legacy lessons hidden');
  select count(*) into visible_count from public.simulations where slug in ('prompt-33a-simulation','prompt-33b-simulation-published_approved','staging-hydraulic-cylinder');
  perform pg_temp.check_publication(visible_count = 0, 'legacy simulations hidden');
  reset role;

  insert into public.profile_roles (profile_id, role_id)
    select student_id, id from public.roles where role_key = 'lecturer';
  set local role authenticated;
  select count(*) into visible_count from public.lessons where slug = 'staging-fluid-pressure';
  perform pg_temp.check_publication(visible_count = 0, 'unassigned lecturer cannot bypass lesson evidence');
  select count(*) into visible_count from public.simulations where slug = 'staging-hydraulic-cylinder';
  perform pg_temp.check_publication(visible_count = 0, 'unassigned lecturer cannot bypass simulation evidence');
  reset role;

  select u.module_id into parent_id from public.lessons l join public.units u on u.id = l.unit_id
    where l.slug = 'staging-fluid-pressure';
  insert into public.cohorts (id, programme_id, slug, title)
    select cohort_id, id, 'rollback-only-' || cohort_id::text, 'Rollback-only cohort'
    from public.programmes order by id limit 1;
  insert into public.cohort_modules (cohort_id, module_id) values (cohort_id, parent_id);
  insert into public.cohort_lecturers (cohort_id, lecturer_profile_id) values (cohort_id, student_id);
  set local role authenticated;
  select count(*) into visible_count from public.lessons where slug = 'staging-fluid-pressure';
  perform pg_temp.check_publication(visible_count = 1, 'assigned lecturer retains course-scoped content access');
  reset role;

  insert into public.lesson_progress (lesson_id, student_profile_id)
    select id, student_id from public.lessons where slug = 'staging-fluid-pressure';
  foreach staff_id in array array[author_id, reviewer_id] loop
    perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_id, 'role', 'authenticated')::text, true);
    set local role authenticated;
    select count(*) into visible_count from public.lessons where slug = 'staging-fluid-pressure';
    perform pg_temp.check_publication(visible_count = 1, 'content staff retain technical content access');
    select count(*) into visible_count from public.lesson_progress where student_profile_id = student_id;
    perform pg_temp.check_publication(visible_count = 0, 'content staff have no automatic student-progress access');
    reset role;
  end loop;
end;
$$;
select 'PASS: exact review evidence, positive RLS, 14 mutation denials, old versions, sources, self-review, simulation evidence, six legacy fixtures, lecturer scope and staff/student separation';
