-- Disposable synthetic fixtures only. Runner MUST use BEGIN / ROLLBACK.
DO $$
DECLARE a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); author_id uuid:=gen_random_uuid(); reviewer_id uuid:=gen_random_uuid(); entity_id uuid:=gen_random_uuid(); item_id uuid:=gen_random_uuid(); slug text:='synthetic-bookmark-'||gen_random_uuid()::text; bookmark_id uuid; linked_module uuid:=gen_random_uuid(); linked_unit uuid:=gen_random_uuid(); n integer; denied boolean; saved boolean;
BEGIN
  INSERT INTO auth.users(id,email) VALUES(a,a||'@example.test'),(b,b||'@example.test'),(author_id,author_id||'@example.test'),(reviewer_id,reviewer_id||'@example.test');
  INSERT INTO profiles(id,email,display_name) SELECT id,email,'Rollback-only bookmark fixture' FROM auth.users WHERE id IN(a,b,author_id,reviewer_id);
  INSERT INTO profile_roles(profile_id,role_id) SELECT x.id,r.id FROM (VALUES(a,'student'),(b,'student'),(author_id,'content_author'),(reviewer_id,'engineering_reviewer')) x(id,role_key) JOIN roles r ON r.role_key::text=x.role_key;
  INSERT INTO content_governance_items(id,entity_table,entity_id,entity_type,slug,title,author_profile_id,current_version,published_version,workflow_status,publication_status)
    VALUES(item_id,'lessons',entity_id,'calculation_lesson',slug,'Synthetic evidence only',author_id,4,4,'Published','published');
  INSERT INTO content_versions(governance_item_id,entity_table,entity_id,version,snapshot,change_summary,source_ids,review_status,publication_status,published_at)
    VALUES(item_id,'lessons',entity_id,4,jsonb_build_object('id','LES-SYNTHETIC-ONLY','slug',slug,'version','0.4.0'),'Rollback-only fixture',array['TEST-ONLY'],'Approved for student use','published',now());
  INSERT INTO review_assignments(governance_item_id,content_version,reviewer_profile_id,assigned_by_profile_id,review_type,status,reason)
    VALUES(item_id,4,reviewer_id,author_id,'engineering_approval','assigned','Rollback-only fixture');
  INSERT INTO review_records(entity_table,entity_id,governance_item_id,content_version,reviewer_profile_id,reviewer_role,review_type,decision,review_status,notes,evidence_checked,source_ids_checked,safety_review_outcome)
    VALUES('lessons',entity_id,item_id,4,reviewer_id,'engineering_reviewer','engineering_approval','approved','Approved for student use','Synthetic rollback-only decision, not technical approval',
    '{"source_review_complete":true,"equation_review_complete":true,"educational_review_complete":true,"accessibility_review_complete":true,"safety_limitations_review_complete":true}',array['TEST-ONLY'],'not_applicable');
  PERFORM set_config('request.jwt.claims',json_build_object('sub',a,'role','authenticated')::text,true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM resolve_saved_lesson(a,slug,'LES-SYNTHETIC-ONLY','0.4.0');
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-RESOLVE',n=1,'Exact existing governance identity resolves without a phantom relational lesson.');
  SET LOCAL ROLE authenticated;
  SELECT set_saved_lesson(a,slug,'LES-SYNTHETIC-ONLY','0.4.0',true) INTO saved;
  PERFORM set_saved_lesson(a,slug,'LES-SYNTHETIC-ONLY','0.4.0',true);
  SELECT count(*) INTO n FROM saved_lessons WHERE governance_item_id=item_id AND student_profile_id=a;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-SAVE-DUPLICATE',saved AND n=1,'Two ordinary saves confirm one stable canonical row.');
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM list_saved_lessons() WHERE lesson_slug=slug;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-RELOAD',n=1,'Independent ordinary RPC read confirms persistence.');
  SET LOCAL ROLE authenticated;
  SELECT set_saved_lesson(a,slug,'','',false) INTO saved;
  SELECT count(*) INTO n FROM saved_lessons WHERE governance_item_id=item_id;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-SLUG-REMOVE',NOT saved AND n=0,'Owner removes by stable slug.');
  SET LOCAL ROLE authenticated;
  PERFORM set_saved_lesson(a,slug,'LES-SYNTHETIC-ONLY','0.4.0',true);
  SELECT id INTO bookmark_id FROM saved_lessons WHERE governance_item_id=item_id AND student_profile_id=a;
  RESET ROLE;
  SET LOCAL ROLE authenticated; denied:=false;
  BEGIN PERFORM set_saved_lesson(a,slug,'LES-SYNTHETIC-ONLY','0.5.0',true); EXCEPTION WHEN no_data_found THEN denied:=true; END;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-WRONG-VERSION',denied,'Similar slug with an unverified version cannot save.');
  PERFORM set_config('request.jwt.claims',json_build_object('sub',b,'role','authenticated')::text,true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM saved_lessons WHERE student_profile_id=a;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-CROSS-READ',n=0,'B sees none of A after the positive A save.');
  SET LOCAL ROLE authenticated; UPDATE saved_lessons SET saved_at=now() WHERE student_profile_id=a; GET DIAGNOSTICS n=ROW_COUNT;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-CROSS-UPDATE',n=0,'B cannot update A.');
  SET LOCAL ROLE authenticated; DELETE FROM saved_lessons WHERE student_profile_id=a; GET DIAGNOSTICS n=ROW_COUNT;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-CROSS-DELETE',n=0,'B cannot delete A.');
  SET LOCAL ROLE authenticated; denied:=false;
  BEGIN PERFORM set_saved_lesson(a,slug,'LES-SYNTHETIC-ONLY','0.4.0',false); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-SPOOFED-OWNER',denied,'RPC rejects a forged owner before mutation.');
  SET LOCAL ROLE authenticated;
  SELECT remove_saved_lesson(b,bookmark_id) INTO saved;
  RESET ROLE; SELECT count(*) INTO n FROM saved_lessons WHERE id=bookmark_id;
  PERFORM pg_temp.check_audit('CANONICAL-ID-CROSS-REMOVE',NOT saved AND n=1,'B cannot remove the existing A bookmark by its identifier.');
  SET LOCAL ROLE authenticated;
  INSERT INTO saved_lessons(student_profile_id,governance_item_id) VALUES(b,item_id);
  SELECT count(*) INTO n FROM saved_lessons WHERE student_profile_id=b AND governance_item_id=item_id;
  DELETE FROM saved_lessons WHERE student_profile_id=b AND governance_item_id=item_id;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-DIRECT-INSERT-POSITIVE',n=1,'B can directly insert its own eligible target before withdrawal; the fixture is then removed to avoid a uniqueness conflict.');

  -- Link the same governance identity to an isolated relational lesson. Neither
  -- its own nor its parent publication gate may be bypassed by the governance path.
  INSERT INTO modules(id,semester_id,slug,title,description,difficulty,academic_level,estimated_duration_minutes,technical_review_status,publication_status)
    SELECT linked_module,semester.id,'synthetic-bookmark-module-'||linked_module::text,'Synthetic module','Rollback only','foundation','test',10,'Approved for student use','published' FROM semesters semester LIMIT 1;
  INSERT INTO units(id,module_id,slug,title,description) VALUES(linked_unit,linked_module,slug,'Synthetic unit','Rollback only');
  INSERT INTO lessons(id,unit_id,slug,title,description,difficulty,academic_level,estimated_duration_minutes,technical_review_status,publication_status,version)
    VALUES(entity_id,linked_unit,slug,'Synthetic linked lesson','Rollback only','foundation','test',10,'Approved for student use','published',4);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM lessons WHERE id=entity_id;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-LINKED-RLS-POSITIVE',n=1,'The linked lesson is visible through ordinary RLS before withdrawal.');
  SET LOCAL ROLE anon;
  SELECT count(*) INTO n FROM resolve_published_lesson(slug,'LES-SYNTHETIC-ONLY','0.4.0');
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-LINKED-REOPEN-POSITIVE',n=1,'Matching published linked lesson and module can reopen.');
  UPDATE modules SET publication_status='archived' WHERE id=linked_module;
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM lessons WHERE id=entity_id;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-PARENT-RLS-DENIAL',n=0,'Ordinary lesson RLS denies the existing lesson after its parent is withdrawn.');
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM resolve_saved_lesson(b,slug,'LES-SYNTHETIC-ONLY','0.4.0');
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-PARENT-RESOLVE-DENIAL',n=0,'Governance bookmark resolution also enforces parent withdrawal.');
  SET LOCAL ROLE anon;
  SELECT count(*) INTO n FROM resolve_published_lesson(slug,'LES-SYNTHETIC-ONLY','0.4.0');
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-PARENT-REOPEN-DENIAL',n=0,'Public reopening cannot bypass the linked parent gate.');
  SET LOCAL ROLE authenticated; denied:=false;
  BEGIN INSERT INTO saved_lessons(student_profile_id,governance_item_id) VALUES(b,item_id); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  DELETE FROM saved_lessons WHERE student_profile_id=b AND governance_item_id=item_id;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-PARENT-DIRECT-INSERT-DENIAL',denied,'An owner-correct direct insert cannot bypass parent withdrawal.');
  SET LOCAL ROLE authenticated; denied:=false;
  BEGIN PERFORM set_saved_lesson(b,slug,'LES-SYNTHETIC-ONLY','0.4.0',true); EXCEPTION WHEN no_data_found OR insufficient_privilege THEN denied:=true; END;
  DELETE FROM saved_lessons WHERE student_profile_id=b AND governance_item_id=item_id;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-PARENT-SAVE-DENIAL',denied,'An owner-correct save RPC cannot bypass parent withdrawal.');
  PERFORM set_config('request.jwt.claims',json_build_object('sub',a,'role','authenticated')::text,true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM list_saved_lessons() WHERE lesson_slug=slug;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-PARENT-LIST-DENIAL',n=0,'The existing A bookmark withholds its slug after parent withdrawal.');
  UPDATE modules SET publication_status='published' WHERE id=linked_module;
  UPDATE lessons SET publication_status='archived' WHERE id=entity_id;
  SET LOCAL ROLE anon;
  SELECT count(*) INTO n FROM resolve_published_lesson(slug,'LES-SYNTHETIC-ONLY','0.4.0');
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-LINKED-WITHDRAWN-DENIAL',n=0,'A withdrawn linked lesson cannot reopen through stale governance publication.');
  UPDATE lessons SET publication_status='published',version=5 WHERE id=entity_id;
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM resolve_saved_lesson(a,slug,'LES-SYNTHETIC-ONLY','0.4.0');
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-LINKED-VERSION-DENIAL',n=0,'A changed relational version cannot use an older governance version.');
  UPDATE lessons SET version=4,technical_review_status='Source required' WHERE id=entity_id;
  SET LOCAL ROLE anon;
  SELECT count(*) INTO n FROM resolve_published_lesson(slug,'LES-SYNTHETIC-ONLY','0.4.0');
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-LINKED-REVIEW-DENIAL',n=0,'A linked lesson requiring source review cannot reopen.');
  UPDATE lessons SET technical_review_status='Approved for student use' WHERE id=entity_id;
  SET LOCAL ROLE anon;
  SELECT count(*) INTO n FROM resolve_published_lesson(slug,'LES-SYNTHETIC-ONLY','0.4.0');
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-LINKED-RESTORE-POSITIVE',n=1,'Restored exact lesson/module eligibility reopens without changing the governance evidence.');
  UPDATE content_governance_items SET publication_status='archived',workflow_status='Archived',archived_at=now() WHERE id=item_id;
  PERFORM set_config('request.jwt.claims',json_build_object('sub',a,'role','authenticated')::text,true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM resolve_saved_lesson(a,slug,'LES-SYNTHETIC-ONLY','0.4.0');
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-WITHDRAWN-RESOLVE',n=0,'Withdrawn metadata is not delivered.');
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM list_saved_lessons() WHERE lesson_slug=slug;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-WITHDRAWN-LIST',n=0,'Withdrawn content is absent from saved delivery.');
  PERFORM set_config('request.jwt.claims',json_build_object('sub',b,'role','authenticated')::text,true);
  SET LOCAL ROLE authenticated; denied:=false;
  BEGIN INSERT INTO saved_lessons(student_profile_id,governance_item_id) VALUES(b,item_id); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-DIRECT-WITHDRAWN-INSERT',denied,'B cannot directly insert its own withdrawn target after its eligible positive control.');
  PERFORM set_config('request.jwt.claims',json_build_object('sub',a,'role','authenticated')::text,true);
  SET LOCAL ROLE authenticated;
  SELECT remove_saved_lesson(a,bookmark_id) INTO saved;
  SELECT count(*) INTO n FROM saved_lessons WHERE governance_item_id=item_id;
  RESET ROLE; PERFORM pg_temp.check_audit('CANONICAL-WITHDRAWN-REMOVE',saved AND n=0,'Owner can delete by the private list identifier without current eligibility or metadata.');
END $$;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM audit_checks WHERE verdict <> 'PASS') THEN RAISE EXCEPTION 'Canonical bookmark regressions failed'; END IF; END $$;
SELECT jsonb_agg(audit_checks) FROM audit_checks;
