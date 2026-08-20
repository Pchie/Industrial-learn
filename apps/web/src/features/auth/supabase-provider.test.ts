import { afterEach, describe, expect, it, vi } from "vitest";
import type { IndustrialLearnEnv } from "@industrial-learn/env";

import { createSupabaseAuthProvider } from "./supabase-provider";

const configuredEnv: IndustrialLearnEnv = {
  nodeEnv: "test",
  appEnv: "test",
  appBaseUrl: "http://127.0.0.1:3000",
  authMode: "supabase",
  isE2E: false,
  supabase: {
    isConfigured: true,
    url: "https://supabase.example.test",
    anonKey: "anon-key",
    serviceRoleKey: undefined,
    projectRef: "project-ref",
    dbUrl: undefined
  }
};

describe("supabase auth provider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves sessions from the direct Supabase user response shape", async () => {
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;
        requests.push(url);

        if (url.endsWith("/auth/v1/user")) {
          return Promise.resolve(
            Response.json({
              id: "auth-student",
              email: "student@example.test",
              user_metadata: {
                display_name: "Staging Student"
              }
            })
          );
        }

        if (url.includes("/rest/v1/profiles")) {
          return Promise.resolve(
            Response.json([
              {
                id: "auth-student",
                email: "student@example.test",
                display_name: "Staging Student",
                deleted_at: null
              }
            ])
          );
        }

        if (url.includes("/rest/v1/profile_roles")) {
          return Promise.resolve(
            Response.json([
              {
                roles: {
                  role_key: "student"
                }
              }
            ])
          );
        }

        return Promise.resolve(Response.json({ message: "not found" }, { status: 404 }));
      })
    );

    const provider = createSupabaseAuthProvider(configuredEnv);
    const result = await provider.resolveSession({
      accessToken: "valid-access-token",
      expiresAt: "2026-07-31T22:00:00.000Z"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected session resolution to succeed");
    }
    expect(result.value.authUserId).toBe("auth-student");
    expect(result.value.profile.roles).toEqual(["student"]);
    expect(result.value.capabilities).toContain("dashboard:read");
    expect(requests).toContain("https://supabase.example.test/auth/v1/user");
  });
});
