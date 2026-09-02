import { describe, expect, it } from "vitest";

import {
  getAuthConfigurationDiagnostics,
  getPublicEnv,
  getServerEnv,
  validateLocalTestAuthSafety
} from "./index";

describe("environment validation", () => {
  it("uses safe development defaults when Supabase is not configured", () => {
    const env = getServerEnv({});

    expect(env.nodeEnv).toBe("development");
    expect(env.supabase.isConfigured).toBe(false);
  });

  it("accepts complete public Supabase configuration", () => {
    const env = getPublicEnv({
      NODE_ENV: "test",
      NEXT_PUBLIC_APP_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key"
    });

    expect(env).toEqual({
      appEnv: "test",
      supabase: {
        isConfigured: true,
        url: "https://example.supabase.co",
        anonKey: "anon-key"
      }
    });
  });

  it("requires complete staging configuration", () => {
    expect(() =>
      getServerEnv({
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_ENV: "staging",
        NEXT_PUBLIC_SUPABASE_URL: "https://staging.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key"
      })
    ).toThrow(/SUPABASE_SERVICE_ROLE_KEY is required for staging/);
  });

  it("accepts complete staging configuration without exposing server-only values publicly", () => {
    const publicEnv = getPublicEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_ENV: "staging",
      APP_BASE_URL: "https://staging.industrial-learn.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://staging.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      SUPABASE_PROJECT_REF: "staging-project-ref",
      SUPABASE_DB_URL: "postgresql://example.invalid/staging"
    });

    expect(publicEnv).toEqual({
      appEnv: "staging",
      supabase: {
        isConfigured: true,
        url: "https://staging.supabase.co",
        anonKey: "anon-key"
      }
    });
  });

  it("blocks local test authentication in staging and production", () => {
    expect(() =>
      getServerEnv({
        NEXT_PUBLIC_APP_ENV: "staging",
        INDUSTRIAL_LEARN_AUTH_MODE: "local"
      })
    ).toThrow(/Local test authentication is not allowed/);

    expect(() =>
      getServerEnv({
        NEXT_PUBLIC_APP_ENV: "production",
        INDUSTRIAL_LEARN_AUTH_MODE: "local"
      })
    ).toThrow(/Local test authentication is not allowed/);
  });

  it("allows local test authentication only for e2e on approved local hosts", () => {
    expect(() =>
      validateLocalTestAuthSafety({
        appEnv: "test",
        appBaseUrl: "http://127.0.0.1:3000",
        authMode: "local",
        isE2E: true
      })
    ).not.toThrow();

    expect(() =>
      validateLocalTestAuthSafety({
        appEnv: "development",
        appBaseUrl: "https://staging.industrial-learn.example",
        authMode: "local",
        isE2E: true
      })
    ).toThrow(/approved local test host/);

    expect(() =>
      validateLocalTestAuthSafety({
        appEnv: "development",
        appBaseUrl: "http://127.0.0.1:3000",
        authMode: "local",
        isE2E: false
      })
    ).toThrow(/INDUSTRIAL_LEARN_E2E=true/);
  });

  it("keeps server-only Supabase values in server env only", () => {
    const serverEnv = getServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      SUPABASE_PROJECT_REF: "project-ref",
      SUPABASE_DB_URL: "postgresql://example.invalid/app"
    });

    expect(serverEnv.supabase).toEqual({
      isConfigured: true,
      url: "https://example.supabase.co",
      anonKey: "anon-key",
      serviceRoleKey: "service-role-key",
      projectRef: "project-ref",
      dbUrl: "postgresql://example.invalid/app"
    });
  });

  it("rejects incomplete public Supabase configuration", () => {
    expect(() =>
      getServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co"
      })
    ).toThrow(/must be provided together/);
  });

  it("reports only missing variable names in safe auth diagnostics", () => {
    const diagnostics = getAuthConfigurationDiagnostics({
      NEXT_PUBLIC_APP_ENV: "staging",
      INDUSTRIAL_LEARN_AUTH_MODE: "supabase",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      VERCEL_ENV: "preview"
    });

    expect(diagnostics).toEqual({
      appEnvironment: "staging",
      authMode: "supabase",
      vercelEnvironment: "preview",
      missingSignupVariables: [
        "APP_BASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY"
      ],
      missingStagingVariables: [
        "APP_BASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_PROJECT_REF",
        "SUPABASE_DB_URL"
      ]
    });
    expect(JSON.stringify(diagnostics)).not.toContain("example.supabase.co");
  });
});
