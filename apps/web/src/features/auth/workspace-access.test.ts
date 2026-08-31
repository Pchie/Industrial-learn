import { describe, expect, it } from "vitest";

import { capabilitiesForRoles, type AuthenticatedSession } from "./session-core";
import { availableWorkspaces } from "./workspace-access";

describe("workspace access", () => {
  it.each([
    ["student", ["/dashboard"]],
    ["content_author", ["/dashboard", "/author"]],
    ["engineering_reviewer", ["/dashboard", "/review"]],
    ["lecturer", ["/dashboard", "/lecturer"]],
    ["administrator", ["/author", "/review", "/admin"]],
    ["platform_owner", ["/dashboard", "/author", "/review", "/lecturer", "/owner"]]
  ] as const)("shows only authorised workspaces for %s", (role, expected) => {
    const session: AuthenticatedSession = {
      authUserId: `auth-${role}`,
      email: `${role}@example.test`,
      profile: {
        id: `profile-${role}`,
        authUserId: `auth-${role}`,
        email: `${role}@example.test`,
        displayName: role,
        accountStatus: "active",
        roles: [role]
      },
      roles: [role],
      capabilities: capabilitiesForRoles([role]),
      expiresAt: "2026-09-01T00:00:00.000Z"
    };

    expect(availableWorkspaces(session).map((workspace) => workspace.href)).toEqual(
      expected
    );
  });
});
