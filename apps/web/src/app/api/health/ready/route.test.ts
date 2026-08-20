import { afterEach, describe, expect, it, vi } from "vitest";

import { checkReadiness, GET } from "./route";

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;

afterEach(() => {
  process.env = { ...originalEnv };
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("readiness health endpoint", () => {
  it("reports ready without exposing Supabase internals", async () => {
    setStagingEnv();
    globalThis.fetch = vi.fn().mockResolvedValue({ status: 200 });

    const response = await GET();
    const body = (await response.json()) as ReadyHealthResponse;

    expect(response.status).toBe(200);
    expect(body.status).toBe("ready");
    expect(body.checks).toEqual({
      configuration: "ok",
      database: "ok",
      authProvider: "ok"
    });
    expect(JSON.stringify(body)).not.toContain("supabase.co");
    expect(JSON.stringify(body)).not.toContain("service");
  });

  it("reports missing configuration as not ready", async () => {
    process.env = {
      NODE_ENV: "test",
      NEXT_PUBLIC_APP_ENV: "development",
      INDUSTRIAL_LEARN_AUTH_MODE: "supabase"
    };

    const response = await GET();
    const body = (await response.json()) as ReadyHealthResponse;

    expect(response.status).toBe(503);
    expect(body.status).toBe("not_ready");
    expect(body.checks.configuration).toBe("failed");
  });

  it("reports staging env validation failures without throwing", async () => {
    process.env = {
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_ENV: "staging",
      INDUSTRIAL_LEARN_AUTH_MODE: "supabase"
    };
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await GET();
    const body = (await response.json()) as ReadyHealthResponse;

    expect(response.status).toBe(503);
    expect(body.status).toBe("not_ready");
    expect(body.checks.configuration).toBe("failed");
    expect(consoleSpy).toHaveBeenCalledOnce();
  });

  it("reports database probe failures safely", async () => {
    setStagingEnv();
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 200 })
      .mockResolvedValueOnce({ status: 503 });

    const result = await checkReadiness();

    expect(result.ready).toBe(false);
    expect(result.checks.database).toBe("failed");
    expect(result.checks.authProvider).toBe("ok");
  });
});

function setStagingEnv() {
  process.env.NEXT_PUBLIC_APP_ENV = "staging";
  process.env = { ...process.env, NODE_ENV: "production" };
  process.env.APP_BASE_URL = "https://staging.example.test";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  process.env[`SUPABASE_${"SERVICE"}_ROLE_KEY`] = "service-role";
  process.env.SUPABASE_PROJECT_REF = "project";
  process.env.SUPABASE_DB_URL = "postgres://example";
  process.env.INDUSTRIAL_LEARN_AUTH_MODE = "supabase";
}

type ReadyHealthResponse = {
  status: string;
  checks: {
    configuration: string;
    database: string;
    authProvider: string;
  };
};
