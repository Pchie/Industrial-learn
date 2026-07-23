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

const localUsers = new Map<string, LocalUser>();
const localSessions = new Map<string, LocalSession>();
const resetTokens = new Map<string, string>();

seedLocalUsers();

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
  seedLocalUsers();
}

function seedLocalUsers() {
  addSeedUser("student@example.test", "Industrial Student", ["student"]);
  addSeedUser("active.student@example.test", "Active Industrial Student", ["student"]);
  addSeedUser("recommendation.student@example.test", "Recommendation Student", [
    "student"
  ]);
  addSeedUser("quiet.student@example.test", "Quiet Industrial Student", ["student"]);
  addSeedUser("database.failure@example.test", "Database Failure Student", ["student"]);
  addSeedUser("student.b@example.test", "Second Industrial Student", ["student"]);
  addSeedUser("lecturer@example.test", "Industrial Lecturer", ["lecturer"]);
  addSeedUser("reviewer@example.test", "Engineering Reviewer", ["engineering_reviewer"]);
  addSeedUser("author@example.test", "Content Author", ["content_author"]);
  addSeedUser("admin@example.test", "Platform Administrator", ["administrator"]);
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

function randomToken(byteLength: number) {
  return randomBytes(byteLength).toString("hex");
}
