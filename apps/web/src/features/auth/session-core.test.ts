import { describe, expect, it } from "vitest";

import {
  absoluteAppUrl,
  capabilitiesForRoles,
  fail,
  requireAnyRoleResult,
  safeInternalRedirect,
  type AuthenticatedSession
} from "./session-core";

const studentSession: AuthenticatedSession = {
  authUserId: "auth-student",
  email: "student@example.test",
  profile: {
    id: "profile-student",
    authUserId: "auth-student",
    email: "student@example.test",
    displayName: "Student",
    accountStatus: "active",
    roles: ["student"]
  },
  roles: ["student"],
  capabilities: capabilitiesForRoles(["student"]),
  expiresAt: new Date(Date.now() + 60_000).toISOString()
};

describe("auth session core", () => {
  it("allows only safe internal redirects", () => {
    expect(safeInternalRedirect("/dashboard?hideRecommendations=1")).toBe(
      "/dashboard?hideRecommendations=1"
    );
    expect(safeInternalRedirect("https://evil.example/dashboard")).toBe("/dashboard");
    expect(safeInternalRedirect("//evil.example/dashboard")).toBe("/dashboard");
    expect(safeInternalRedirect("/\\evil")).toBe("/dashboard");
    expect(safeInternalRedirect("")).toBe("/dashboard");
  });

  it("builds absolute auth callback URLs from the configured app base URL", () => {
    expect(
      absoluteAppUrl(
        "/auth/verify?token=example",
        "https://industrial-learn-staging-git-development-kolobe.vercel.app"
      )
    ).toBe(
      "https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/verify?token=example"
    );
    expect(
      absoluteAppUrl("https://evil.example/auth/verify", "https://app.example")
    ).toBe("https://app.example/");
    expect(absoluteAppUrl("/auth/reset-password", undefined)).toBe(
      "/auth/reset-password"
    );
  });

  it("resolves capabilities from trusted roles", () => {
    expect(capabilitiesForRoles(["student"])).toContain("dashboard:read");
    expect(capabilitiesForRoles(["engineering_reviewer"])).toContain(
      "content:review:approve"
    );
    expect(capabilitiesForRoles(["administrator"])).toContain("admin:access");
  });

  it("authorises allowed roles and denies unauthorised role access", () => {
    expect(requireAnyRoleResult(studentSession, ["student"]).ok).toBe(true);
    const reviewerResult = requireAnyRoleResult(studentSession, ["engineering_reviewer"]);

    expect(reviewerResult).toEqual(fail("access_denied"));
  });
});
