import { beforeEach, describe, expect, it } from "vitest";

import {
  createTestLocalAuthProvider,
  resetLocalAuthStoreForTests
} from "./test-local-provider";

describe("local auth provider integration", () => {
  beforeEach(() => {
    resetLocalAuthStoreForTests();
  });

  it("resolves a valid authenticated student session", async () => {
    const provider = createTestLocalAuthProvider();
    const signIn = await provider.signIn({
      email: "student@example.test",
      password: "IndustrialLearn1!"
    });

    expect(signIn.ok).toBe(true);
    if (!signIn.ok) {
      throw new Error("expected sign-in success");
    }

    const session = await provider.resolveSession(signIn.value.tokens);
    expect(session.ok).toBe(true);
    if (!session.ok) {
      throw new Error("expected session success");
    }
    expect(session.value.profile.roles).toEqual(["student"]);
    expect(session.value.capabilities).toContain("dashboard:read");
  });

  it("rejects missing and expired sessions", async () => {
    const provider = createTestLocalAuthProvider();
    await expect(provider.resolveSession({})).resolves.toMatchObject({
      ok: false,
      code: "missing_session"
    });
    await expect(
      provider.resolveSession({
        accessToken: "not-a-real-session",
        expiresAt: new Date().toISOString()
      })
    ).resolves.toMatchObject({ ok: false, code: "expired_session" });
  });

  it("returns clear states for invalid, unverified, and disabled accounts", async () => {
    const provider = createTestLocalAuthProvider();

    await expect(
      provider.signIn({ email: "student@example.test", password: "wrong-password" })
    ).resolves.toMatchObject({ ok: false, code: "invalid_credentials" });
    await expect(
      provider.signIn({
        email: "unverified@example.test",
        password: "IndustrialLearn1!"
      })
    ).resolves.toMatchObject({ ok: false, code: "unverified_email" });
    await expect(
      provider.signIn({
        email: "disabled@example.test",
        password: "IndustrialLearn1!"
      })
    ).resolves.toMatchObject({ ok: false, code: "disabled_account" });
  });

  it("resolves lecturer, reviewer, and administrator roles from provider records", async () => {
    const provider = createTestLocalAuthProvider();

    await expect(signInRoles(provider, "lecturer@example.test")).resolves.toEqual([
      "lecturer"
    ]);
    await expect(signInRoles(provider, "reviewer@example.test")).resolves.toEqual([
      "engineering_reviewer"
    ]);
    await expect(signInRoles(provider, "admin@example.test")).resolves.toEqual([
      "administrator"
    ]);
  });

  it("creates profiles idempotently and prevents duplicate profile ownership", async () => {
    const provider = createTestLocalAuthProvider();
    const first = await provider.createProfileForAuthenticatedUser({
      authUserId: "auth-new",
      email: "new-profile@example.test",
      displayName: "New Profile"
    });
    const second = await provider.createProfileForAuthenticatedUser({
      authUserId: "auth-new",
      email: "new-profile@example.test",
      displayName: "New Profile"
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) {
      throw new Error("expected profile creation success");
    }
    expect(second.value.id).toBe(first.value.id);
    expect(second.value.roles).toEqual(["student"]);

    await expect(
      provider.createProfileForAuthenticatedUser({
        authUserId: "auth-other",
        email: "new-profile@example.test",
        displayName: "Profile Collision"
      })
    ).resolves.toMatchObject({ ok: false, code: "profile_creation_failed" });
  });

  it("does not disclose email existence during password reset requests", async () => {
    const provider = createTestLocalAuthProvider();

    await expect(
      provider.requestPasswordReset({
        email: "student@example.test",
        redirectTo: "/auth/reset-password"
      })
    ).resolves.toMatchObject({ ok: true });
    await expect(
      provider.requestPasswordReset({
        email: "missing@example.test",
        redirectTo: "/auth/reset-password"
      })
    ).resolves.toMatchObject({ ok: true });
  });
});

async function signInRoles(
  provider: ReturnType<typeof createTestLocalAuthProvider>,
  email: string
) {
  const signIn = await provider.signIn({ email, password: "IndustrialLearn1!" });
  if (!signIn.ok) {
    throw new Error(`expected sign-in success for ${email}`);
  }

  const session = await provider.resolveSession(signIn.value.tokens);
  if (!session.ok) {
    throw new Error(`expected session success for ${email}`);
  }

  return session.value.roles;
}
