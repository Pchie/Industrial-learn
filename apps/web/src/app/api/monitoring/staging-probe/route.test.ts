import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => vi.fn());
vi.mock("../../../../features/auth/server", () => ({
  resolveAuthenticatedSession: session
}));

import { GET } from "./route";

const originalEnv = { ...process.env };
beforeEach(() =>
  session.mockResolvedValue({ ok: true, value: { capabilities: ["platform:manage"] } })
);

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("staging monitoring probe", () => {
  it("is unavailable outside staging", async () => {
    process.env.NEXT_PUBLIC_APP_ENV = "development";
    const response = await GET(
      new Request(
        "https://app.example/api/monitoring/staging-probe?probe=staging-monitoring-check"
      )
    );

    expect(response.status).toBe(404);
  });

  it("requires the probe selector in staging", async () => {
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    const response = await GET(
      new Request("https://app.example/api/monitoring/staging-probe")
    );

    expect(response.status).toBe(404);
  });

  it.each([
    { ok: false, code: "missing_session" },
    { ok: true, value: { capabilities: ["workspace:student"] } },
    { ok: true, value: { capabilities: ["content:review:approve"] } }
  ])("denies callers without platform management permission", async (value) => {
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    session.mockResolvedValue(value);
    const response = await GET(
      new Request(
        "https://app.example/api/monitoring/staging-probe?probe=staging-monitoring-check"
      )
    );
    expect(response.status).toBe(403);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("emits a redacted staging-only monitoring event", async () => {
    process.env = {
      ...process.env,
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_ENV: "staging",
      APP_BASE_URL: "https://staging.example.test",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      [`SUPABASE_${"SERVICE"}_ROLE_KEY`]: "service-role",
      SUPABASE_PROJECT_REF: "project",
      SUPABASE_DB_URL: "postgres://example",
      INDUSTRIAL_LEARN_AUTH_MODE: "supabase"
    };
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await GET(
      new Request(
        "https://app.example/api/monitoring/staging-probe?probe=staging-monitoring-check"
      )
    );
    const body = (await response.json()) as { status: string; correlationId: string };

    expect(response.status).toBe(200);
    expect(body.status).toBe("recorded");
    expect(body.correlationId).toBeTruthy();
    expect(consoleSpy).toHaveBeenCalledOnce();
    const logged = String(consoleSpy.mock.calls[0]?.[0]);
    expect(logged).toContain("staging_monitoring_probe");
    expect(logged).not.toContain("redaction-fixture-answer");
    expect(logged).not.toContain("redaction-fixture-token");
    expect(logged).not.toContain("redaction-fixture-password");
    expect(logged).not.toContain("redaction-fixture-correct-answer");
  });
});
