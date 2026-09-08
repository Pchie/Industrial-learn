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
  it("exchanges a typed token hash for server-only session tokens", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        access_token: "exchanged-access",
        refresh_token: "exchanged-refresh",
        expires_in: 600
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await createSupabaseAuthProvider(configuredEnv).verifyEmail(
      "hashed-link",
      "recovery"
    );
    expect(result).toMatchObject({
      ok: true,
      value: { tokens: { accessToken: "exchanged-access" } }
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://supabase.example.test/auth/v1/verify",
      expect.objectContaining({
        body: JSON.stringify({ token_hash: "hashed-link", type: "recovery" }),
        cache: "no-store"
      })
    );
  });
  it("fails closed when verification omits an access token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ user: { id: "user" } }))
    );
    expect(
      await createSupabaseAuthProvider(configuredEnv).verifyEmail("hash", "email")
    ).toMatchObject({ ok: false });
  });
  it("reports recovery transport failures and uses the supported redirect query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({}, { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await createSupabaseAuthProvider(configuredEnv).requestPasswordReset({
      email: "student@example.test",
      redirectTo: "https://staging.example.test/auth/verify"
    });
    expect(result).toMatchObject({ ok: false, code: "network_failure" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/recover?redirect_to="),
      expect.objectContaining({ body: JSON.stringify({ email: "student@example.test" }) })
    );
  });
  it("never treats a missing recovery access token as a password update", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(
      await createSupabaseAuthProvider(configuredEnv).updatePassword({
        password: "Password123!"
      })
    ).toMatchObject({ ok: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });
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
              email_confirmed_at: "2026-07-01T00:00:00Z",
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

  it("rejects an unconfirmed account before reading or creating a profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: "unconfirmed",
        email: "student@example.test",
        email_confirmed_at: null
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    expect(
      await createSupabaseAuthProvider(configuredEnv).resolveSession({
        accessToken: "unconfirmed-token"
      })
    ).toMatchObject({ ok: false, code: "unverified_email" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("does not release a login session before verified profile provisioning succeeds", async () => {
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = input instanceof Request ? input.url : String(input);
        requests.push(url);
        if (url.includes("/token?"))
          return Promise.resolve(
            Response.json({ access_token: "test-login", expires_in: 3600 })
          );
        if (url.endsWith("/user"))
          return Promise.resolve(
            Response.json({
              id: "new-user",
              email: "new@example.test",
              email_confirmed_at: "2026-09-08T00:00:00Z"
            })
          );
        return Promise.resolve(Response.json([]));
      })
    );
    const result = await createSupabaseAuthProvider(configuredEnv).signIn({
      email: "new@example.test",
      password: "TestPassword123!"
    });
    expect(result).toMatchObject({ ok: false, code: "missing_profile" });
    expect(requests.some((url) => url.endsWith("/user"))).toBe(true);
    expect(requests.some((url) => url.includes("/profiles?"))).toBe(true);
  });

  it.each([false, true])(
    "creates only a student profile after verified identity; role failure=%s is not ignored",
    async (roleFailure) => {
      const requests: Array<{ url: string; body: string }> = [];
      vi.stubGlobal(
        "fetch",
        vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
          const request = input instanceof Request ? input : new Request(input, init);
          const url = request.url;
          const body = typeof init?.body === "string" ? init.body : "";
          requests.push({ url, body });
          if (url.endsWith("/auth/v1/user"))
            return Promise.resolve(
              Response.json({
                id: "new-user",
                email: "new@example.test",
                email_confirmed_at: "2026-07-01T00:00:00Z",
                user_metadata: { display_name: "New Student", role: "administrator" }
              })
            );
          if (url.includes("/profiles") && request.method === "GET")
            return Promise.resolve(Response.json([]));
          if (url.includes("/roles?"))
            return Promise.resolve(Response.json([{ id: "student-role" }]));
          if (url.includes("/profile_roles") && roleFailure)
            return Promise.resolve(Response.json({ message: "denied" }, { status: 403 }));
          return Promise.resolve(new Response(null, { status: 201 }));
        })
      );
      const provider = createSupabaseAuthProvider({
        ...configuredEnv,
        supabase: { ...configuredEnv.supabase, serviceRoleKey: "test-service-key" }
      });
      const result = await provider.resolveSession({ accessToken: "verified-token" });
      expect(result).toMatchObject(
        roleFailure
          ? { ok: false, code: "profile_creation_failed" }
          : { ok: true, value: { roles: ["student"] } }
      );
      const assignment = requests.find((request) =>
        request.url.includes("/profile_roles")
      );
      expect(assignment?.body).toContain("student-role");
      expect(assignment?.body).not.toContain("administrator");
    }
  );

  it("fails signup safely when public Supabase configuration is unavailable", async () => {
    const provider = createSupabaseAuthProvider({
      ...configuredEnv,
      supabase: {
        ...configuredEnv.supabase,
        isConfigured: false,
        url: undefined,
        anonKey: undefined
      }
    });

    await expect(
      provider.signUp({
        displayName: "Staging Reviewer",
        email: "reviewer@example.test",
        password: "IndustrialLearn1!",
        redirectTo: "https://staging.example.test/auth/verify"
      })
    ).resolves.toMatchObject({ ok: false, code: "configuration_error" });
  });

  it("defers profile creation until verified sign-in and sends the exact redirect as a query parameter", async () => {
    const requests: Array<{ body: string; method: string; url: string }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;
        requests.push({
          body: typeof init?.body === "string" ? init.body : "",
          method: init?.method ?? "GET",
          url
        });

        if (new URL(url).pathname.endsWith("/auth/v1/signup")) {
          return Promise.resolve(
            Response.json({
              user: { id: "auth-new-student", email: "new.student@example.test" }
            })
          );
        }
        if (url.includes("/rest/v1/profiles") && (init?.method ?? "GET") === "GET") {
          return Promise.resolve(Response.json([]));
        }
        if (url.includes("/rest/v1/roles")) {
          return Promise.resolve(Response.json([{ id: "student-role-id" }]));
        }
        return Promise.resolve(new Response(null, { status: 201 }));
      })
    );

    const provider = createSupabaseAuthProvider({
      ...configuredEnv,
      supabase: { ...configuredEnv.supabase, serviceRoleKey: "service-role-key" }
    });
    const result = await provider.signUp({
      displayName: "New Student",
      email: "new.student@example.test",
      password: "IndustrialLearn1!",
      redirectTo: "https://staging.example.test/auth/verify"
    });

    expect(result.ok).toBe(true);
    const signupRequest = requests.find((request) =>
      new URL(request.url).pathname.endsWith("/signup")
    );
    expect(signupRequest?.body).not.toContain("engineering_reviewer");
    expect(new URL(signupRequest!.url).searchParams.get("redirect_to")).toBe(
      "https://staging.example.test/auth/verify"
    );
    expect(signupRequest?.body).not.toContain("email_redirect_to");
    expect(requests.some((request) => request.url.includes("/rest/v1/"))).toBe(false);
  });
});
