-- Disposable synthetic fixtures only. Runner MUST use BEGIN / ROLLBACK.
DO $$
DECLARE actor uuid:=gen_random_uuid(); author_id uuid:=gen_random_uuid(); reviewer_id uuid:=gen_random_uuid(); entity_id uuid:=gen_random_uuid(); item_id uuid:=gen_random_uuid(); attempt_id uuid; v_slug text:='synthetic-simulation-'||gen_random_uuid()::text; module_id uuid; n integer; denied boolean;
BEGIN
  INSERT INTO auth.users(id,email) VALUES(actor,actor||'@example.test'),(author_id,author_id||'@example.test'),(reviewer_id,reviewer_id||'@example.test');
  INSERT INTO profiles(id,email,display_name) SELECT id,email,'Rollback-only simulation fixture' FROM auth.users WHERE id IN(actor,author_id,reviewer_id);
  INSERT INTO profile_roles(profile_id,role_id) SELECT x.id,r.id FROM (VALUES(actor,'student'),(author_id,'content_author'),(reviewer_id,'engineering_reviewer')) x(id,role_key) JOIN roles r ON r.role_key::text=x.role_key;
  SELECT id INTO module_id FROM modules WHERE slug='fluid-mechanics-foundations' LIMIT 1;
  INSERT INTO simulations(id,module_id,slug,title,description,technical_review_status,publication_status)
    VALUES(entity_id,module_id,v_slug,'Synthetic fixture','Not engineering content','Approved for student use','published');
  INSERT INTO content_governance_items(id,entity_table,entity_id,entity_type,slug,title,author_profile_id,current_version,published_version,workflow_status,publication_status)
    VALUES(item_id,'simulations',entity_id,'simulation_lesson',v_slug,'Synthetic evidence only',author_id,1,1,'Published','published');
  INSERT INTO content_versions(governance_item_id,entity_table,entity_id,version,snapshot,change_summary,source_ids,review_status,publication_status,published_at)
    VALUES(item_id,'simulations',entity_id,1,jsonb_build_object('slug',v_slug),'Rollback-only fixture',array['TEST-ONLY'],'Approved for student use','published',now());
  INSERT INTO review_assignments(governance_item_id,content_version,reviewer_profile_id,assigned_by_profile_id,review_type,status,reason)
    VALUES(item_id,1,reviewer_id,author_id,'engineering_approval','assigned','Rollback-only fixture');
  INSERT INTO review_records(entity_table,entity_id,governance_item_id,content_version,reviewer_profile_id,reviewer_role,review_type,decision,review_status,notes,evidence_checked,source_ids_checked,simulation_test_ids_checked,safety_review_outcome)
    VALUES('simulations',entity_id,item_id,1,reviewer_id,'engineering_reviewer','engineering_approval','approved','Approved for student use','Synthetic rollback-only decision, not technical approval',
    '{"source_review_complete":true,"equation_review_complete":true,"educational_review_complete":true,"accessibility_review_complete":true,"safety_limitations_review_complete":true,"simulation_review_complete":true}',array['TEST-ONLY'],array['TEST-NORMAL','TEST-BOUNDARY','TEST-FAULT'],'not_applicable');
  SET LOCAL ROLE service_role;
  SELECT count(*) INTO n FROM resolve_published_simulation(v_slug,1);
  RESET ROLE; PERFORM pg_temp.check_audit('SIM-PRIVILEGED-EXACT-POSITIVE',n=1,'Exact independent evidence and published parent resolve.');
  SET LOCAL ROLE service_role;
  SELECT count(*) INTO n FROM resolve_published_simulation(v_slug,2);
  RESET ROLE; PERFORM pg_temp.check_audit('SIM-PRIVILEGED-VERSION-DENIAL',n=0,'Different runtime version is denied.');
  SET LOCAL ROLE service_role;
  INSERT INTO simulation_attempts(simulation_id,student_profile_id,scenario_state,simulation_version) VALUES(entity_id,actor,'normal-state',1) RETURNING id INTO attempt_id;
  RESET ROLE; PERFORM pg_temp.check_audit('SIM-START-POSITIVE',attempt_id is not null,'Active synthetic student can start an exact eligible version.');
  UPDATE content_governance_items SET publication_status='archived',workflow_status='Archived',archived_at=now() WHERE id=item_id;
  SET LOCAL ROLE service_role; denied:=false;
  BEGIN PERFORM complete_simulation_attempt_transaction(actor,attempt_id,now(),'{}','{}',null,'[]','{}',0,'{}','synthetic-completion','graded','{}'); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  RESET ROLE; PERFORM pg_temp.check_audit('SIM-WITHDRAWN-COMPLETE-DENIAL',denied,'Mid-attempt withdrawal blocks the trusted completion transaction.');
  SELECT count(*) INTO n FROM simulation_attempts WHERE id=attempt_id AND status='in_progress' AND completed_at IS NULL;
  PERFORM pg_temp.check_audit('SIM-WITHDRAWN-NO-PARTIAL-WRITES',n=1,'Rejected completion leaves the original attempt untouched.');
  UPDATE content_governance_items SET publication_status='published',workflow_status='Published',archived_at=null WHERE id=item_id;
  SET LOCAL ROLE service_role;
  PERFORM complete_simulation_attempt_transaction(actor,attempt_id,now(),'{}','{}',null,'[]','{}',0,'{}','synthetic-completion','graded','{}');
  RESET ROLE; SELECT count(*) INTO n FROM simulation_attempts WHERE id=attempt_id AND status='graded';
  PERFORM pg_temp.check_audit('SIM-COMPLETE-POSITIVE',n=1,'Original transaction still completes eligible synthetic work.');
  UPDATE content_governance_items SET publication_status='archived',workflow_status='Archived',archived_at=now() WHERE id=item_id;
  SET LOCAL ROLE service_role; denied:=false;
  BEGIN PERFORM complete_simulation_attempt_transaction(actor,attempt_id,now(),'{}','{}',null,'[]','{}',0,'{}','synthetic-completion','graded','{}'); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  RESET ROLE; PERFORM pg_temp.check_audit('SIM-WITHDRAWN-RETRY-DENIAL',denied,'An idempotent retry cannot bypass the current publication guard.');
END $$;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM audit_checks WHERE verdict <> 'PASS') THEN RAISE EXCEPTION 'Simulation security regressions failed'; END IF; END $$;
SELECT jsonb_agg(audit_checks) FROM audit_checks;
