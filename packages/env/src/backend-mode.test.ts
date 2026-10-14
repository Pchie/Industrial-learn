import { describe, expect, it } from "vitest";
import { getServerEnv } from "./index";

const local = {
  NEXT_PUBLIC_APP_ENV: "test",
  INDUSTRIAL_LEARN_AUTH_MODE: "local",
  INDUSTRIAL_LEARN_E2E: "true",
  APP_BASE_URL: "http://127.0.0.1:3100"
};

describe("53E-F04 consistent backend selection", () => {
  it.each(["development", "test"])(
    "rejects mixed %s fixtures and real credentials",
    (appEnv) => {
      expect(() =>
        getServerEnv({
          ...local,
          NEXT_PUBLIC_APP_ENV: appEnv,
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-test-key"
        })
      ).toThrow(/cannot be combined/);
    }
  );
  it.each(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_DB_URL", "SUPABASE_PROJECT_REF"])(
    "rejects a lone %s in fixture mode",
    (key) => {
      expect(() => getServerEnv({ ...local, [key]: "test-only-value" })).toThrow(
        /cannot be combined/
      );
    }
  );
  it("rejects non-loopback and missing test intent before any adapter is selected", () => {
    expect(() =>
      getServerEnv({ ...local, APP_BASE_URL: "https://example.invalid" })
    ).toThrow(/local test host/);
    expect(() => getServerEnv({ ...local, INDUSTRIAL_LEARN_E2E: "false" })).toThrow(
      /E2E=true/
    );
  });
  it.each(["staging", "production"])("never uses local fixtures in %s", (appEnv) => {
    expect(() => getServerEnv({ ...local, NEXT_PUBLIC_APP_ENV: appEnv })).toThrow();
  });
  it("accepts isolated local fixtures and never defaults missing real configuration to them", () => {
    expect(getServerEnv(local).authMode).toBe("local");
    expect(getServerEnv({}).authMode).toBe("supabase");
  });
});
