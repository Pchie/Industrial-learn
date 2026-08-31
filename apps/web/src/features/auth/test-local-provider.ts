import { randomBytes } from "node:crypto";

import {
  capabilitiesForRoles,
  fail,
  ok,
  type AppRole,
  type AuthProfile,
  type AuthProvider,
  type AuthenticatedSession,
  type PasswordResetRequest,
  type PasswordUpdateInput,
  type SessionTokens,
  type SignInInput,
  type SignUpInput
} from "./session-core";

type LocalUser = {
  authUserId: string;
  email: string;
  password: string;
  displayName: string;
  verified: boolean;
  disabled: boolean;
  profile: AuthProfile;
};

type LocalSession = {
  authUserId: string;
  expiresAt: string;
};

export type LocalAccessAudit = {
  id: string;
  actorProfileId: string;
  action: string;
  targetProfileId: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
};

type LocalAuthStore = {
  users: Map<string, LocalUser>;
  sessions: Map<string, LocalSession>;
  resetTokens: Map<string, string>;
  accessAudit: LocalAccessAudit[];
};

const localGlobal = globalThis as typeof globalThis & {
  __industrialLearnLocalAuth?: LocalAuthStore;
};
const localStore = localGlobal.__industrialLearnLocalAuth ?? {
  users: new Map<string, LocalUser>(),
  sessions: new Map<string, LocalSession>(),
  resetTokens: new Map<string, string>(),
  accessAudit: []
};
localGlobal.__industrialLearnLocalAuth = localStore;

const localUsers = localStore.users;
const localSessions = localStore.sessions;
const resetTokens = localStore.resetTokens;
const localAccessAudit = localStore.accessAudit;

if (localUsers.size === 0) {
  seedLocalUsers();
}

export function createTestLocalAuthProvider(): AuthProvider {
  return {
    signUp(input: SignUpInput) {
      const email = input.email.trim().toLowerCase();
      if (!email || !input.password || !input.displayName.trim()) {
        return Promise.resolve(
          fail(
            "invalid_credentials",
            "Registration requires a name, email, and password."
          )
        );
      }

      if (localUsers.has(email)) {
        return Promise.resolve(
          fail("invalid_credentials", "Account registration could not be completed.")
        );
      }

      const authUserId = `local-${randomToken(12)}`;
      const profile = createProfile(authUserId, email, input.displayName.trim(), [
        "student"
      ]);
      localUsers.set(email, {
        authUserId,
        email,
        password: input.password,
        displayName: profile.displayName,
        verified: true,
        disabled: false,
        profile
      });

      return Promise.resolve(ok({ tokens: createSession(authUserId) }));
    },

    signIn(input: SignInInput) {
      const email = input.email.trim().toLowerCase();
      const user = localUsers.get(email);
      if (!user || user.password !== input.password) {
        return Promise.resolve(fail("invalid_credentials"));
      }
      if (!user.verified) {
        return Promise.resolve(fail("unverified_email"));
      }
      if (user.disabled) {
        return Promise.resolve(fail("disabled_account"));
      }

      return Promise.resolve(ok({ tokens: createSession(user.authUserId) }));
    },

    signOut(tokens: Partial<SessionTokens>) {
      if (tokens.accessToken) {
        localSessions.delete(tokens.accessToken);
      }
      return Promise.resolve();
    },

    requestPasswordReset(input: PasswordResetRequest) {
      const email = input.email.trim().toLowerCase();
      if (localUsers.has(email)) {
        resetTokens.set(`reset-${randomToken(16)}`, email);
      }

      return Promise.resolve(ok(null));
    },

    updatePassword(input: PasswordUpdateInput) {
      if (!input.resetToken) {
        return Promise.resolve(fail("expired_reset_link"));
      }
      const email = resetTokens.get(input.resetToken);
      if (!email) {
        return Promise.resolve(fail("expired_reset_link"));
      }
      const user = localUsers.get(email);
      if (!user) {
        return Promise.resolve(fail("expired_reset_link"));
      }
      user.password = input.password;
      resetTokens.delete(input.resetToken);
      return Promise.resolve(ok(null));
    },

    verifyEmail() {
      return Promise.resolve(ok(null));
    },

    resolveSession(tokens: Partial<SessionTokens>) {
      if (!tokens.accessToken) {
        return Promise.resolve(fail("missing_session"));
      }

      const localSession = localSessions.get(tokens.accessToken);
      if (!localSession) {
        return Promise.resolve(fail("expired_session"));
      }

      if (Date.parse(localSession.expiresAt) <= Date.now()) {
        localSessions.delete(tokens.accessToken);
        return Promise.resolve(fail("expired_session"));
      }

      const user = findUserByAuthId(localSession.authUserId);
      if (!user) {
        return Promise.resolve(fail("missing_profile"));
      }
      if (user.disabled || user.profile.accountStatus === "disabled") {
        return Promise.resolve(fail("disabled_account"));
      }

      const session: AuthenticatedSession = {
        authUserId: user.authUserId,
        email: user.email,
        profile: user.profile,
        roles: user.profile.roles,
        capabilities: capabilitiesForRoles(user.profile.roles),
        expiresAt: localSession.expiresAt
      };

      return Promise.resolve(ok(session));
    },

    createProfileForAuthenticatedUser(authUser) {
      const existing = findUserByAuthId(authUser.authUserId);
      if (existing) {
        return Promise.resolve(ok(existing.profile));
      }

      const email = authUser.email.trim().toLowerCase();
      if (localUsers.has(email)) {
        return Promise.resolve(fail("profile_creation_failed"));
      }

      const profile = createProfile(authUser.authUserId, email, authUser.displayName, [
        "student"
      ]);
      localUsers.set(email, {
        authUserId: authUser.authUserId,
        email,
        password: randomToken(24),
        displayName: profile.displayName,
        verified: true,
        disabled: false,
        profile
      });
      return Promise.resolve(ok(profile));
    }
  };
}

export function resetLocalAuthStoreForTests() {
  localUsers.clear();
  localSessions.clear();
  resetTokens.clear();
  localAccessAudit.length = 0;
  seedLocalUsers();
}

export function listLocalUsersForAdministration() {
  return Array.from(localUsers.values())
    .map((user) => ({
      profileId: user.profile.id,
      email: user.email,
      displayName: user.displayName,
      accountStatus: user.disabled ? "disabled" : "active",
      roles: [...user.profile.roles],
      updatedAt: new Date(0).toISOString()
    }))
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
}

export function listLocalAccessAudit() {
  return [...localAccessAudit].reverse();
}

export function manageLocalUserRole(input: {
  actorProfileId: string;
  targetProfileId: string;
  role: AppRole;
  operation: "add" | "remove";
  reason: string;
}) {
  const actor = findUserByProfileId(input.actorProfileId);
  const target = findUserByProfileId(input.targetProfileId);
  if (
    !actor ||
    !target ||
    input.actorProfileId === input.targetProfileId ||
    (!actor.profile.roles.includes("administrator") &&
      !actor.profile.roles.includes("platform_owner")) ||
    (input.role === "platform_owner" && !actor.profile.roles.includes("platform_owner"))
  ) {
    throw new Error("Role assignment was denied.");
  }

  const roles = new Set(target.profile.roles);
  if (input.operation === "add") {
    roles.add(input.role);
  } else {
    if (roles.size <= 1) {
      throw new Error("An active profile must retain at least one role.");
    }
    if (
      input.role === "platform_owner" &&
      listLocalUsersForAdministration().filter((user) =>
        user.roles.includes("platform_owner")
      ).length <= 1
    ) {
      throw new Error("The final Platform Owner assignment cannot be removed.");
    }
    roles.delete(input.role);
  }
  target.profile.roles = [...roles];
  localAccessAudit.push({
    id: `local-audit-${randomToken(6)}`,
    actorProfileId: input.actorProfileId,
    action: `platform.role.${input.operation}`,
    targetProfileId: input.targetProfileId,
    metadata: { role: input.role, reason: input.reason },
    occurredAt: new Date().toISOString()
  });
}

export function setLocalUserDisabled(input: {
  actorProfileId: string;
  targetProfileId: string;
  disabled: boolean;
  reason: string;
}) {
  const actor = findUserByProfileId(input.actorProfileId);
  const target = findUserByProfileId(input.targetProfileId);
  if (
    !actor ||
    !target ||
    input.actorProfileId === input.targetProfileId ||
    (!actor.profile.roles.includes("administrator") &&
      !actor.profile.roles.includes("platform_owner")) ||
    target.profile.roles.includes("platform_owner")
  ) {
    throw new Error("Account status change was denied.");
  }
  target.disabled = input.disabled;
  target.profile.accountStatus = input.disabled ? "disabled" : "active";
  localAccessAudit.push({
    id: `local-audit-${randomToken(6)}`,
    actorProfileId: input.actorProfileId,
    action: input.disabled ? "platform.account.disabled" : "platform.account.enabled",
    targetProfileId: input.targetProfileId,
    metadata: { reason: input.reason },
    occurredAt: new Date().toISOString()
  });
}

export function inviteLocalUser(input: {
  actorProfileId: string;
  email: string;
  displayName: string;
  role: "lecturer" | "content_author" | "engineering_reviewer";
  reason: string;
}) {
  const actor = findUserByProfileId(input.actorProfileId);
  if (
    !actor ||
    (!actor.profile.roles.includes("administrator") &&
      !actor.profile.roles.includes("platform_owner"))
  ) {
    throw new Error("Invitation was denied.");
  }
  const email = input.email.trim().toLowerCase();
  if (localUsers.has(email)) {
    throw new Error("An account already exists for this email address.");
  }
  addSeedUser(email, input.displayName.trim(), [input.role]);
  const target = localUsers.get(email);
  if (!target) {
    throw new Error("The invitation could not be registered.");
  }
  localAccessAudit.push({
    id: `local-audit-${randomToken(6)}`,
    actorProfileId: input.actorProfileId,
    action: "platform.invitation.created",
    targetProfileId: target.profile.id,
    metadata: { role: input.role, reason: input.reason },
    occurredAt: new Date().toISOString()
  });
}

function seedLocalUsers() {
  addSeedUser("student@example.test", "Industrial Student", ["student"]);
  addSeedUser("active.student@example.test", "Active Industrial Student", ["student"]);
  addSeedUser("recommendation.student@example.test", "Recommendation Student", [
    "student"
  ]);
  addSeedUser("quiet.student@example.test", "Quiet Industrial Student", ["student"]);
  addSeedUser("assessment.student@example.test", "Assessment Test Student", ["student"]);
  addSeedUser("simulation.student@example.test", "Simulation Test Student", ["student"]);
  addSeedUser("simulation.keyboard@example.test", "Simulation Keyboard Student", [
    "student"
  ]);
  addSeedUser("simulation.duplicate@example.test", "Simulation Duplicate Student", [
    "student"
  ]);
  addSeedUser("simulation.private@example.test", "Simulation Private Student", [
    "student"
  ]);
  addSeedUser("simulation.mobile@example.test", "Simulation Mobile Student", ["student"]);
  addSeedUser("database.failure@example.test", "Database Failure Student", ["student"]);
  addSeedUser("student.b@example.test", "Second Industrial Student", ["student"]);
  addSeedUser("lecturer@example.test", "Industrial Lecturer", ["lecturer"]);
  addSeedUser("reviewer@example.test", "Engineering Reviewer", ["engineering_reviewer"]);
  addSeedUser("author@example.test", "Content Author", ["content_author"]);
  addSeedUser("author-reviewer@example.test", "Author Reviewer", [
    "student",
    "content_author",
    "engineering_reviewer"
  ]);
  addSeedUser("admin@example.test", "Platform Administrator", ["administrator"]);
  addSeedUser("owner@example.test", "Platform Owner", ["platform_owner"]);
  addSeedUser("unverified@example.test", "Unverified Student", ["student"], {
    verified: false
  });
  addSeedUser("disabled@example.test", "Disabled Student", ["student"], {
    disabled: true
  });
}

function addSeedUser(
  email: string,
  displayName: string,
  roles: AppRole[],
  options: { verified?: boolean; disabled?: boolean } = {}
) {
  const authUserId = `local-${email.replace(/[^a-z0-9]/g, "-")}`;
  const profile = createProfile(
    authUserId,
    email,
    displayName,
    roles,
    options.disabled ? "disabled" : "active"
  );
  localUsers.set(email, {
    authUserId,
    email,
    password: "IndustrialLearn1!",
    displayName,
    verified: options.verified ?? true,
    disabled: options.disabled ?? false,
    profile
  });
}

function createProfile(
  authUserId: string,
  email: string,
  displayName: string,
  roles: AppRole[],
  accountStatus: AuthProfile["accountStatus"] = "active"
): AuthProfile {
  return {
    id: `profile-${authUserId}`,
    authUserId,
    email,
    displayName,
    accountStatus,
    roles
  };
}

function createSession(authUserId: string): SessionTokens {
  const accessToken = `local-session-${randomToken(24)}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  localSessions.set(accessToken, { authUserId, expiresAt });
  return {
    accessToken,
    refreshToken: `local-refresh-${randomToken(24)}`,
    expiresAt
  };
}

function findUserByAuthId(authUserId: string) {
  return Array.from(localUsers.values()).find((user) => user.authUserId === authUserId);
}

function findUserByProfileId(profileId: string) {
  return Array.from(localUsers.values()).find((user) => user.profile.id === profileId);
}

function randomToken(byteLength: number) {
  return randomBytes(byteLength).toString("hex");
}
