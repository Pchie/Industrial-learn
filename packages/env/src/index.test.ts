import { describe, expect, it } from "vitest";

import { getPublicEnv, getServerEnv } from "./index";

describe("environment validation", () => {
  it("uses safe development defaults when Supabase is not configured", () => {
    const env = getServerEnv({});

    expect(env.nodeEnv).toBe("development");
    expect(env.supabase.isConfigured).toBe(false);
  });

  it("accepts complete public Supabase configuration", () => {
    const env = getPublicEnv({
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key"
    });

    expect(env.supabase).toEqual({
      isConfigured: true,
      url: "https://example.supabase.co",
      anonKey: "anon-key"
    });
  });

  it("rejects incomplete public Supabase configuration", () => {
    expect(() =>
      getServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co"
      })
    ).toThrow(/must be provided together/);
  });
});
