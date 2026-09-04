import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migrationSql = readSqlDirectory("database/migrations");
const bernoulliRegistrationSql = readFileSync(
  join(root, "database/migrations/0010_bernoulli_flow_simulation_registration.sql"),
  "utf8"
);
const profileRoleConflictFixSql = readFileSync(
  join(root, "database/migrations/0017_fix_profile_role_conflict_target.sql"),
  "utf8"
);
const assessmentIntegritySql = readFileSync(
  join(
    root,
    "database/migrations/0019_assessment_version_integrity_and_pilot_progress.sql"
  ),
  "utf8"
);
const assessmentReviewSeedSql = readFileSync(
  join(
    root,
    "database/seed/0007_basic_fluid_pressure_assessment_review_item.staging.sql"
  ),
  "utf8"
);
const policySql = readSqlDirectory("database/policies");
const effectivePolicySql = `${policySql}\n${migrationSql}`;
const seedSql = readFileSync(
  join(root, "database/seed/0001_roles_permissions.sql"),
  "utf8"
);

const requiredTables = [
  "profiles",
  "roles",
  "permissions",
  "role_permissions",
  "profile_roles",
  "schools",
  "disciplines",
  "programmes",
  "academic_years",
  "semesters",
  "modules",
  "units",
  "lessons",
  "lesson_prerequisites",
  "learning_outcomes",
  "cohorts",
  "cohort_modules",
  "cohort_lecturers",
  "enrolments",
  "lesson_progress",
  "assessments",
  "questions",
  "answer_choices",
  "assessment_attempts",
  "simulations",
  "simulation_attempts",
  "projects",
  "project_submissions",
  "source_documents",
  "knowledge_files",
  "content_versions",
  "review_records",
  "review_assignments",
  "audit_events",
  "content_governance_items",
  "saved_lessons",
  "dashboard_recommendation_dismissals"
] as const;

const studentPrivateTables = [
  "lesson_progress",
  "assessment_attempts",
  "simulation_attempts",
  "project_submissions"
] as const;

function tableDefinition(table: string) {
  const match = migrationSql.match(
    new RegExp(`create table public\\.${table} \\([\\s\\S]*?\\n\\);`, "i")
  );

  return match?.[0] ?? "";
}

function readSqlDirectory(directory: string) {
  return readdirSync(join(root, directory))
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => readFileSync(join(root, directory, file), "utf8"))
    .join("\n");
}

function policiesForTable(table: string) {
  return Array.from(
    effectivePolicySql.matchAll(
      new RegExp(`^create policy .* on public\\.${table}\\n[\\s\\S]*?;`, "gim")
    )
  ).map((match) => match[0]);
}

function latestPolicyForTable(table: string, policyName: string) {
  const policies = policiesForTable(table).filter((policy) =>
    policy.includes(`create policy ${policyName} on public.${table}`)
  );

  return policies.at(-1) ?? "";
}

describe("database schema", () => {
  it("creates every required application table", () => {
    for (const table of requiredTables) {
      expect(migrationSql).toContain(`create table public.${table}`);
    }
  });

  it("defines primary keys and created/updated timestamps for every table", () => {
    for (const table of requiredTables) {
      const definition = tableDefinition(table);

      expect(definition, `${table} definition`).toContain("primary key");
      expect(definition, `${table} created_at`).toContain(
        "created_at timestamptz not null default now()"
      );
      expect(definition, `${table} updated_at`).toContain(
        "updated_at timestamptz not null default now()"
      );
      expect(migrationSql, `${table} updated_at trigger`).toContain(
        `create trigger ${table}_set_updated_at`
      );
    }
  });

  it("enables row-level security and defines policies for every table", () => {
    for (const table of requiredTables) {
      expect(migrationSql).toContain(
        `alter table public.${table} enable row level security`
      );
      expect(policiesForTable(table).length, `${table} policies`).toBeGreaterThan(0);
    }
  });

  it("scopes private student data to student ownership or authorised lecturers", () => {
    for (const table of studentPrivateTables) {
      const policies = policiesForTable(table).join("\n");

      expect(policies).toContain("student_profile_id = auth.uid()");
      expect(policies).toContain("public.lecturer_has_student(student_profile_id)");
      expect(policies).not.toContain("public.is_content_staff()");
      expect(policies).not.toContain("engineering_reviewer");
    }
  });

  it("does not expose answer correctness through student-readable answer choice policies", () => {
    const policies = policiesForTable("answer_choices").join("\n");

    expect(policySql).toContain(
      "drop policy if exists answer_choices_read_accessible_question"
    );
    expect(policies).toContain("answer_choices_content_staff_read");
    expect(policies).toContain("public.is_content_staff()");
  });

  it("keeps private question explanations off the direct authenticated boundary", () => {
    const safeQuestionGrant = migrationSql.match(
      /grant select \([\s\S]*?\) on table public\.questions to authenticated;/i
    )?.[0];

    expect(migrationSql).toContain(
      "revoke select on table public.questions from anon, authenticated;"
    );
    expect(safeQuestionGrant).toBeDefined();
    expect(safeQuestionGrant).toContain("prompt");
    expect(safeQuestionGrant).not.toContain("explanation");
  });

  it("restricts student-visible technical content to published and approved records", () => {
    expect(migrationSql).toContain(
      "create or replace function public.is_student_visible_content"
    );
    expect(migrationSql).toContain("content_publication_status = 'published'");
    expect(migrationSql).toContain(
      "content_technical_review_status = 'Approved for student use'"
    );

    for (const [table, policy] of [
      ["modules", "modules_read_approved_or_authorized"],
      ["units", "units_read_approved_or_authorized"],
      ["lessons", "lessons_read_approved_or_authorized"],
      ["lesson_prerequisites", "lesson_prerequisites_read_accessible_lessons"],
      ["learning_outcomes", "learning_outcomes_read_accessible_content"],
      ["simulations", "simulations_read_approved_or_authorized"],
      ["projects", "projects_read_approved_or_authorized"]
    ] as const) {
      const replacement = latestPolicyForTable(table, policy);

      expect(migrationSql).toContain(
        `drop policy if exists ${policy} on public.${table}`
      );
      expect(replacement, `${table}.${policy}`).toContain(
        "public.is_student_visible_content"
      );
      expect(replacement, `${table}.${policy}`).toContain("public.is_content_staff()");
    }

    const assessmentsPolicy = latestPolicyForTable(
      "assessments",
      "assessments_read_approved_or_authorized"
    );
    expect(assessmentsPolicy).toContain("public.is_current_published_assessment(id)");

    const questionsPolicy = latestPolicyForTable(
      "questions",
      "questions_read_accessible_assessment"
    );
    expect(questionsPolicy).not.toContain("public.is_student_visible_content");
    expect(questionsPolicy).not.toContain("public.is_current_published_assessment");
    expect(questionsPolicy).toContain("public.has_role('lecturer')");
  });

  it("prevents enrolment helpers from bypassing content approval in replacement policies", () => {
    const lessonsPolicy = latestPolicyForTable(
      "lessons",
      "lessons_read_approved_or_authorized"
    );
    const assessmentsPolicy = latestPolicyForTable(
      "assessments",
      "assessments_read_approved_or_authorized"
    );
    const simulationsPolicy = latestPolicyForTable(
      "simulations",
      "simulations_read_approved_or_authorized"
    );
    const projectsPolicy = latestPolicyForTable(
      "projects",
      "projects_read_approved_or_authorized"
    );

    for (const policy of [lessonsPolicy, simulationsPolicy, projectsPolicy]) {
      expect(policy).not.toContain("public.student_has_module");
      expect(policy).toContain("public.is_student_visible_content");
    }

    expect(assessmentsPolicy).not.toContain("public.student_has_module");
    expect(assessmentsPolicy).toContain("public.is_current_published_assessment");
  });

  it("prevents direct author policies from self-approving or publishing governance records", () => {
    const governanceUpdatePolicy = latestPolicyForTable(
      "content_governance_items",
      "content_governance_items_author_update_draft"
    );
    const contentVersionInsertPolicy = latestPolicyForTable(
      "content_versions",
      "content_versions_author_or_admin_insert"
    );

    expect(migrationSql).toContain(
      "drop policy if exists content_governance_items_author_update_draft"
    );
    expect(governanceUpdatePolicy).toContain("workflow_status in (");
    expect(governanceUpdatePolicy).not.toContain("'Approved for student use'");
    expect(governanceUpdatePolicy).not.toContain("'Published'");
    expect(governanceUpdatePolicy).toContain("archived_at is null");

    expect(migrationSql).toContain(
      "drop policy if exists content_versions_author_or_admin_insert"
    );
    expect(contentVersionInsertPolicy).toContain("public.is_admin()");
    expect(contentVersionInsertPolicy).toContain(
      "review_status <> 'Approved for student use'"
    );
    expect(contentVersionInsertPolicy).toContain(
      "publication_status in ('draft', 'internal')"
    );
  });

  it("keeps server-calculated attempt fields out of direct student write policies", () => {
    for (const table of ["assessment_attempts", "simulation_attempts"] as const) {
      const policies = policiesForTable(table).join("\n");

      expect(policySql).toContain(
        `drop policy if exists ${table}_student_self_read_write`
      );
      expect(policies).toContain(`${table}_student_self_select`);
      expect(policies).toContain("for insert with check (\n    false\n  )");
    }
  });

  it("registers the Bernoulli pilot idempotently without claiming approval", () => {
    expect(bernoulliRegistrationSql).toContain("'bernoulli-flow-lab'");
    expect(bernoulliRegistrationSql).toContain(
      "'Engineering review required'::public.content_status"
    );
    expect(bernoulliRegistrationSql).toContain("'internal'::public.publication_status");
    expect(bernoulliRegistrationSql).toContain("where not exists (\n  select 1");
    expect(bernoulliRegistrationSql).not.toContain(
      "'published'::public.publication_status"
    );
    expect(bernoulliRegistrationSql).not.toContain(
      "'bernoulli-flow-lab',\n  'Approved for student use'"
    );
  });

  it("demotes operational publication for every unapproved simulation", () => {
    expect(migrationSql).toContain("update public.simulations");
    expect(migrationSql).toContain("publication_status = 'internal'");
    expect(migrationSql).toContain("where publication_status = 'published'");
    expect(migrationSql).toContain(
      "technical_review_status <> 'Approved for student use'"
    );
  });

  it("defines atomic assessment completion as a service-role-only database function", () => {
    expect(migrationSql).toContain(
      "create or replace function public.complete_assessment_attempt_transaction"
    );
    expect(migrationSql).toContain("returns setof public.assessment_attempts");
    expect(migrationSql).toContain("security definer");
    expect(migrationSql).toContain("for update");
    expect(migrationSql).toContain("update public.assessment_attempts");
    expect(migrationSql).toContain("insert into public.lesson_progress");
    expect(migrationSql).toContain("insert into public.audit_events");
    expect(migrationSql).toContain(
      "grant execute on function public.complete_assessment_attempt_transaction"
    );
    expect(migrationSql).toContain("to service_role");
    expect(migrationSql).toContain("from authenticated");
    expect(migrationSql).toContain("from anon");
  });

  it("defines atomic simulation completion as a service-role-only database function", () => {
    expect(migrationSql).toContain(
      "create or replace function public.complete_simulation_attempt_transaction"
    );
    expect(migrationSql).toContain("returns setof public.simulation_attempts");
    expect(migrationSql).toContain("security definer");
    expect(migrationSql).toContain("update public.simulation_attempts");
    expect(migrationSql).toContain("insert into public.lesson_progress");
    expect(migrationSql).toContain("insert into public.audit_events");
    expect(migrationSql).toContain(
      "grant execute on function public.complete_simulation_attempt_transaction"
    );
    expect(migrationSql).toContain("to service_role");
    expect(migrationSql).toContain("from authenticated");
    expect(migrationSql).toContain("from anon");
  });

  it("records exact-version content review decisions through an authenticated atomic gate", () => {
    expect(migrationSql).toContain(
      "create or replace function public.record_content_review_decision"
    );
    expect(migrationSql).toContain("security definer");
    expect(migrationSql).toContain("v_item.author_profile_id = v_reviewer_id");
    expect(migrationSql).toContain("p_governance_version <> v_item.current_version");
    expect(migrationSql).toContain("v_version.snapshot ->> 'version'");
    expect(migrationSql).toContain("accessibility_review_complete");
    expect(migrationSql).toContain("insert into public.review_records");
    expect(migrationSql).toContain("insert into public.audit_events");
    expect(migrationSql).toContain(
      "revoke insert, update, delete on table public.review_records from anon, authenticated"
    );
    expect(migrationSql).toContain(
      "grant execute on function public.record_content_review_decision"
    );
    expect(migrationSql).toContain("to authenticated, service_role");
  });

  it("seeds all required roles", () => {
    for (const role of [
      "student",
      "lecturer",
      "content_author",
      "engineering_reviewer",
      "administrator",
      "platform_owner"
    ]) {
      expect(seedSql).toContain(`'${role}'`);
    }
  });

  it("adds audited Platform Owner management without broadening student-private admin access", () => {
    expect(migrationSql).toContain("add value if not exists 'platform_owner'");
    expect(migrationSql).toContain("create or replace function public.is_platform_owner");
    expect(migrationSql).toContain(
      "create or replace function public.manage_profile_role"
    );
    expect(migrationSql).toContain("Users cannot change their own privileged roles");
    expect(migrationSql).toContain(
      "The final Platform Owner assignment cannot be removed"
    );
    expect(migrationSql).toContain("insert into public.audit_events");
    expect(migrationSql).toContain("drop policy if exists profile_roles_admin_all");
    expect(migrationSql).toContain("drop policy if exists roles_admin_all");
    expect(migrationSql).not.toContain(
      "select public.is_platform_owner() or public.is_admin() as is_admin"
    );
  });

  it("uses the named profile-role constraint without PL/pgSQL output-column ambiguity", () => {
    expect(profileRoleConflictFixSql).toContain(
      "on conflict on constraint profile_roles_profile_id_role_id_key do nothing"
    );
    expect(profileRoleConflictFixSql).not.toContain(
      "on conflict (profile_id, role_id) do nothing"
    );
    expect(profileRoleConflictFixSql).toContain(
      "create or replace function public.manage_profile_role"
    );
  });

  it("persists exact-version review assignments behind RLS and an audited manager gate", () => {
    const policies = policiesForTable("review_assignments").join("\n");

    expect(migrationSql).toContain("create table public.review_assignments");
    expect(migrationSql).toContain("foreign key (governance_item_id, content_version)");
    expect(migrationSql).toContain(
      "unique (governance_item_id, content_version, reviewer_profile_id, review_type)"
    );
    expect(policies).toContain("reviewer_profile_id = auth.uid()");
    expect(policies).toContain("public.is_platform_manager()");
    expect(migrationSql).toContain(
      "create or replace function public.manage_review_assignment"
    );
    expect(migrationSql).toContain(
      "Users cannot assign an engineering review to themselves"
    );
    expect(migrationSql).toContain(
      "An active exact-version review assignment is required"
    );
    expect(migrationSql).toContain("content.review_assignment.' || p_operation");
    expect(migrationSql).toContain(
      "revoke all on table public.review_assignments from anon, authenticated"
    );
    expect(migrationSql).toContain(
      "grant select on table public.review_assignments to authenticated, service_role"
    );
  });

  it("publishes an exact approved staging version atomically and idempotently", () => {
    expect(migrationSql).toContain(
      "create or replace function public.publish_approved_content_version_to_staging"
    );
    expect(migrationSql).toContain("for update");
    expect(migrationSql).toContain("p_environment is distinct from 'staging'");
    expect(migrationSql).toContain(
      "The approving reviewer must differ from the content author"
    );
    expect(migrationSql).toContain(
      "Every required approval attestation must be complete"
    );
    expect(migrationSql).toContain(
      "The exact-version engineering review assignment is not complete"
    );
    expect(migrationSql).toContain(
      "A later unresolved review finding blocks publication"
    );
    expect(migrationSql).toContain("'approvalRecordId', p_approval_record_id");
    expect(migrationSql).toContain("'artifactSha256', p_artifact_sha256");
    expect(migrationSql).toContain("'environment', p_environment");
    expect(migrationSql).toContain("was_already_published boolean");
    expect(migrationSql).toContain(
      "grant execute on function public.publish_approved_content_version_to_staging"
    );
    expect(migrationSql).toContain("to authenticated, service_role");
    expect(migrationSql).toContain("from public, anon");
  });

  it("gates the pilot assessment on exact reviewed version and lesson evidence", () => {
    expect(assessmentIntegritySql).toContain(
      "create or replace function public.is_current_published_assessment"
    );
    expect(assessmentIntegritySql).toContain(
      "assessment_version.snapshot ->> 'artifactSha256' = a.artifact_sha256"
    );
    expect(assessmentIntegritySql).toContain(
      "assessment_version.snapshot ->> 'relatedLessonVersion' = a.lesson_content_version"
    );
    expect(assessmentIntegritySql).toContain(
      "approval.reviewer_profile_id <> assessment_item.author_profile_id"
    );
    expect(assessmentIntegritySql).toContain("assignment.status = 'completed'");
    expect(assessmentIntegritySql).toContain(
      "a.answer_protection_status = 'server_only'"
    );
    expect(assessmentIntegritySql).toContain("a.unresolved_review_blockers = false");
  });

  it("keeps pilot progress and attempt mutations behind service-only transactions", () => {
    expect(assessmentIntegritySql).toContain(
      "create or replace function public.record_pilot_lesson_activity_progress"
    );
    expect(assessmentIntegritySql).toContain(
      "create or replace function public.start_assessment_attempt_transaction"
    );
    expect(assessmentIntegritySql).toContain(
      "create or replace function public.complete_assessment_attempt_transaction"
    );
    expect(assessmentIntegritySql).toContain(
      "revoke insert, update, delete on table public.lesson_progress from anon, authenticated"
    );
    expect(assessmentIntegritySql).toContain(
      "revoke insert, update, delete on table public.assessment_attempts from anon, authenticated"
    );
    expect(assessmentIntegritySql).toContain(") to service_role;");
    expect(assessmentIntegritySql).toContain(
      "on conflict (lesson_content_id, student_profile_id)"
    );
  });

  it("prepares assessment v2 for review without approving or publishing it", () => {
    expect(assessmentReviewSeedSql).toContain("'ASM-FLUID-PRESSURE-001'");
    expect(assessmentReviewSeedSql).toContain("'basic-fluid-pressure-check'");
    expect(assessmentReviewSeedSql).toContain("'version', '2'");
    expect(assessmentReviewSeedSql).toContain(
      "'artifactSha256', 'db6268839cdfb959e7f7e392d9879cb3518b30d8b13ee01686cdd88ec71cec88'"
    );
    expect(assessmentReviewSeedSql).toContain("'Engineering review required'");
    expect(assessmentReviewSeedSql).toContain("'draft'");
    expect(assessmentReviewSeedSql).not.toContain(
      "'Approved for student use'::public.content_status"
    );
  });

  it("keeps service-role credentials out of browser application code", () => {
    const appFiles = readdirSync(join(root, "apps/web/src/app"), {
      recursive: true,
      withFileTypes: true
    })
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name));

    for (const file of appFiles) {
      const content = readFileSync(file, "utf8");
      expect(content, file).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    }
  });
});
