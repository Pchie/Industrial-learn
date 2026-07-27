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
