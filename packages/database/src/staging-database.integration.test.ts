import { describe, expect, it } from "vitest";

const runStagingIntegration = process.env.RUN_STAGING_DB_INTEGRATION === "true";

const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "STAGING_STUDENT_A_ACCESS_TOKEN",
  "STAGING_STUDENT_B_ACCESS_TOKEN",
  "STAGING_STUDENT_A_PROFILE_ID",
  "STAGING_STUDENT_B_PROFILE_ID"
] as const;

const describeIfConfigured = runStagingIntegration ? describe : describe.skip;

describeIfConfigured("staging database RLS integration", () => {
  it("has all required non-secret and synthetic test identity inputs", () => {
    const missing = requiredKeys.filter((key) => !process.env[key]?.trim());

    expect(missing).toEqual([]);
  });

  it("does not expose private tables to an unauthenticated anon request", async () => {
    for (const table of [
      "profiles",
      "lesson_progress",
      "assessment_attempts",
      "simulation_attempts",
      "project_submissions",
      "review_records",
      "content_versions",
      "audit_events"
    ]) {
      const response = await restSelect(table);

      expect([200, 401, 403], `${table} status`).toContain(response.status);
      if (response.status === 200) {
        expect(await response.json(), `${table} rows`).toEqual([]);
      }
    }
  });

  it("allows a student to read their own profile and denies another student profile", async () => {
    const ownProfile = await restSelect(
      "profiles",
      process.env.STAGING_STUDENT_A_ACCESS_TOKEN,
      `id=eq.${encodeURIComponent(requiredEnv("STAGING_STUDENT_A_PROFILE_ID"))}`
    );
    const otherProfile = await restSelect(
      "profiles",
      process.env.STAGING_STUDENT_A_ACCESS_TOKEN,
      `id=eq.${encodeURIComponent(requiredEnv("STAGING_STUDENT_B_PROFILE_ID"))}`
    );

    expect(ownProfile.status).toBe(200);
    expect(await ownProfile.json()).toHaveLength(1);
    expect([200, 401, 403]).toContain(otherProfile.status);
    if (otherProfile.status === 200) {
      expect(await otherProfile.json()).toEqual([]);
    }
  });

  it("does not expose answer correctness through direct answer choice reads", async () => {
    const response = await restSelect(
      "answer_choices",
      process.env.STAGING_STUDENT_A_ACCESS_TOKEN
    );

    expect([200, 401, 403]).toContain(response.status);
    if (response.status === 200) {
      expect(await response.json()).toEqual([]);
    }
  });

  it("does not allow direct authenticated reads of private question explanations", async () => {
    const response = await restSelect(
      "questions",
      process.env.STAGING_STUDENT_A_ACCESS_TOKEN,
      "select=id,explanation&limit=1"
    );

    expect([401, 403]).toContain(response.status);
  });

  it("requires exact review evidence for every student-visible lesson and simulation", async () => {
    for (const table of ["lessons", "simulations"]) {
      const response = await restSelect(
        table,
        process.env.STAGING_STUDENT_A_ACCESS_TOKEN,
        "select=id,slug,version,technical_review_status,publication_status"
      );
      expect(response.status).toBe(200);
      const rows = (await response.json()) as Array<{
        id: string;
        slug: string;
        version: number;
        technical_review_status: string;
        publication_status: string;
      }>;
      for (const row of rows) {
        expect(row.publication_status).toBe("published");
        expect(row.technical_review_status).toBe("Approved for student use");
        const evidence = await fetch(
          `${requiredEnv("NEXT_PUBLIC_SUPABASE_URL")}/rest/v1/rpc/has_current_engineering_publication`,
          {
            method: "POST",
            headers: {
              apikey: requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
              Authorization: `Bearer ${requiredEnv("STAGING_STUDENT_A_ACCESS_TOKEN")}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              p_entity_table: table,
              p_entity_id: row.id,
              p_version: row.version,
              p_slug: row.slug
            })
          }
        );
        expect(evidence.status).toBe(200);
        expect(await evidence.json()).toBe(true);
      }
    }
  });

  it("hides legacy published-looking fixtures that have no independent review", async () => {
    for (const [table, slugs] of [
      [
        "lessons",
        "prompt-33a-published-lesson,prompt-33b-lesson-published_approved,staging-fluid-pressure"
      ],
      [
        "simulations",
        "prompt-33a-simulation,prompt-33b-simulation-published_approved,staging-hydraulic-cylinder"
      ]
    ]) {
      const response = await restSelect(
        table!,
        process.env.STAGING_STUDENT_A_ACCESS_TOKEN,
        `select=id&slug=in.(${slugs})`
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual([]);
    }
  });
});

async function restSelect(
  table: string,
  accessToken = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  query = "select=id&limit=1"
) {
  const baseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const url = `${baseUrl}/rest/v1/${table}?${query}`;

  return fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken ?? anonKey}`
    }
  });
}

function requiredEnv(key: string) {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`${key} is required for staging integration tests.`);
  }
  return value;
}
