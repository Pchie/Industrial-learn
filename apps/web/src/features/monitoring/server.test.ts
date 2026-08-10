import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createCorrelationId,
  createMonitoringEvent,
  recordOperationalEvent,
  safeHashIdentifier,
  shouldEmitMonitoringEvent
} from "./server";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("server monitoring events", () => {
  it("adds staging release identity and redacts sensitive details", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    process.env = { ...process.env, NODE_ENV: "production" };
    process.env.APP_VERSION = "0.1.0-test";
    process.env.VERCEL_GIT_COMMIT_SHA = "abc123";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env[`SUPABASE_${"SERVICE"}_ROLE_KEY`] = "service";
    process.env.SUPABASE_PROJECT_REF = "project";
    process.env.SUPABASE_DB_URL = "postgres://example";
    process.env.APP_BASE_URL = "https://staging.example.test";
    process.env.INDUSTRIAL_LEARN_AUTH_MODE = "supabase";

    const event = createMonitoringEvent({
      category: "assessment_operation_failure",
      operation: "submit",
      result: "failure",
      route: "/assessments/demo",
      details: {
        submittedAnswers: [{ value: "do not log" }],
        token: "secret-token",
        status: "failed"
      }
    });

    expect(event.environment).toBe("staging");
    expect(event.appVersion).toBe("0.1.0-test");
    expect(event.commitHash).toBe("abc123");
    expect(event.details).toMatchObject({
      submittedAnswers: "[Redacted]",
      token: "[Redacted]",
      status: "failed"
    });
  });

  it("keeps monitoring disabled for local e2e test runs", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "development";
    process.env = { ...process.env, NODE_ENV: "test" };
    process.env.INDUSTRIAL_LEARN_E2E = "true";
    process.env.INDUSTRIAL_LEARN_AUTH_MODE = "local";
    process.env.APP_BASE_URL = "http://127.0.0.1:3000";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const event = recordOperationalEvent({
      category: "simulation_operation_failure",
      operation: "complete",
      result: "failure"
    });

    expect(shouldEmitMonitoringEvent()).toBe(false);
    expect(event.provider).toBe("vercel-runtime-logs");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("creates correlation ids and stable hashed identifiers", () => {
    expect(createCorrelationId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(safeHashIdentifier("Student@example.test")).toBe(
      safeHashIdentifier(" student@example.test ")
    );
    expect(safeHashIdentifier("Student@example.test")).not.toContain("@");
  });
});
