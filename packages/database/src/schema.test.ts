import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migrationSql = readSqlDirectory("database/migrations");
const policySql = readSqlDirectory("database/policies");
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
    policySql.matchAll(
      new RegExp(`^create policy .* on public\\.${table}\\n[\\s\\S]*?;`, "gim")
    )
  ).map((match) => match[0]);
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

  it("seeds all required roles", () => {
    for (const role of [
      "student",
      "lecturer",
      "content_author",
      "engineering_reviewer",
      "administrator"
    ]) {
      expect(seedSql).toContain(`'${role}'`);
    }
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
