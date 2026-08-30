export const AUTH_SESSION_COOKIE = "il_session";
export const AUTH_REFRESH_COOKIE = "il_refresh";

export const APP_ROLES = [
  "student",
  "lecturer",
  "content_author",
  "engineering_reviewer",
  "administrator",
  "platform_owner"
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const APP_CAPABILITIES = [
  "dashboard:read",
  "learning:read",
  "projects:self:read",
  "assessments:self:read",
  "cohort:read",
  "learning:assign",
  "content:draft:write",
  "content:review:read",
  "admin:access",
  "workspace:student",
  "workspace:author",
  "workspace:review",
  "workspace:lecturer",
  "workspace:admin",
  "workspace:owner",
  "content:preview",
  "content:review:approve",
  "roles:manage",
  "audit:read",
  "platform:manage"
] as const;

export type AppCapability = (typeof APP_CAPABILITIES)[number];

export type AccountStatus = "active" | "unverified" | "disabled" | "missing_profile";

export type AuthProfile = {
  id: string;
  authUserId: string;
  email: string;
  displayName: string;
  accountStatus: AccountStatus;
  roles: AppRole[];
};

export type AuthenticatedSession = {
  authUserId: string;
  email: string;
  profile: AuthProfile;
  roles: AppRole[];
  capabilities: AppCapability[];
  expiresAt: string;
};

export type AuthFailureCode =
  | "missing_session"
  | "expired_session"
  | "invalid_credentials"
  | "unverified_email"
  | "missing_profile"
  | "disabled_account"
  | "access_denied"
  | "expired_reset_link"
  | "network_failure"
  | "configuration_error"
  | "invalid_redirect"
  | "profile_creation_failed";

export type AuthResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      code: AuthFailureCode;
      message: string;
    };

export type SessionTokens = {
  accessToken: string;
  refreshToken?: string | undefined;
  expiresAt: string;
};

export type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
  redirectTo: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type PasswordResetRequest = {
  email: string;
  redirectTo: string;
};

export type PasswordUpdateInput = {
  password: string;
  resetToken?: string | undefined;
  accessToken?: string | undefined;
};

export type AuthProvider = {
  signUp: (input: SignUpInput) => Promise<AuthResult<{ tokens?: SessionTokens }>>;
  signIn: (input: SignInInput) => Promise<AuthResult<{ tokens: SessionTokens }>>;
  signOut: (tokens: Partial<SessionTokens>) => Promise<void>;
  requestPasswordReset: (input: PasswordResetRequest) => Promise<AuthResult<null>>;
  updatePassword: (input: PasswordUpdateInput) => Promise<AuthResult<null>>;
  verifyEmail: (token: string, type?: string) => Promise<AuthResult<null>>;
  resolveSession: (
    tokens: Partial<SessionTokens>
  ) => Promise<AuthResult<AuthenticatedSession>>;
  createProfileForAuthenticatedUser: (
    authUser: Pick<AuthProfile, "authUserId" | "email" | "displayName">
  ) => Promise<AuthResult<AuthProfile>>;
};

const capabilitiesByRole: Record<AppRole, AppCapability[]> = {
  student: [
    "workspace:student",
    "dashboard:read",
    "learning:read",
    "projects:self:read",
    "assessments:self:read"
  ],
  lecturer: ["workspace:student", "workspace:lecturer", "cohort:read", "learning:assign"],
  content_author: [
    "workspace:student",
    "workspace:author",
    "content:preview",
    "content:draft:write",
    "content:review:read"
  ],
  engineering_reviewer: [
    "workspace:student",
    "workspace:review",
    "content:preview",
    "content:review:read",
    "content:review:approve"
  ],
  administrator: [
    "workspace:author",
    "workspace:review",
    "workspace:admin",
    "content:preview",
    "content:draft:write",
    "content:review:read",
    "content:review:approve",
    "admin:access",
    "roles:manage",
    "audit:read",
    "platform:manage"
  ],
  platform_owner: [
    "workspace:student",
    "workspace:author",
    "workspace:review",
    "workspace:lecturer",
    "workspace:admin",
    "workspace:owner",
    "content:preview",
    "content:draft:write",
    "content:review:read",
    "admin:access",
    "roles:manage",
    "audit:read",
    "platform:manage"
  ]
};

const safeErrorMessages: Record<AuthFailureCode, string> = {
  missing_session: "Please sign in to continue.",
  expired_session: "Your session has expired. Please sign in again.",
  invalid_credentials: "The email or password was not accepted.",
  unverified_email: "Please verify your email address before signing in.",
  missing_profile:
    "Your account is authenticated but does not have an application profile.",
  disabled_account: "This account is disabled. Contact an administrator for help.",
  access_denied: "You do not have access to this area.",
  expired_reset_link: "The password reset link is invalid or expired.",
  network_failure: "The authentication service could not be reached.",
  configuration_error: "Authentication is not configured correctly.",
  invalid_redirect: "The requested redirect is not allowed.",
  profile_creation_failed: "The application profile could not be created."
};

export function ok<T>(value: T): AuthResult<T> {
  return { ok: true, value };
}

export function fail<T = never>(
  code: AuthFailureCode,
  message = safeErrorMessages[code]
): AuthResult<T> {
  return { ok: false, code, message };
}

export function capabilitiesForRoles(roles: AppRole[]) {
  return Array.from(
    new Set(roles.flatMap((role) => capabilitiesByRole[role] ?? []))
  ).sort();
}

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}

export function hasRole(session: AuthenticatedSession, role: AppRole) {
  return session.roles.includes(role);
}

export function hasAnyRole(session: AuthenticatedSession, roles: AppRole[]) {
  return roles.some((role) => hasRole(session, role));
}

export function hasCapability(session: AuthenticatedSession, capability: AppCapability) {
  return session.capabilities.includes(capability);
}

export function requireRoleResult(session: AuthenticatedSession, role: AppRole) {
  return hasRole(session, role) ? ok(session) : fail("access_denied");
}

export function requireAnyRoleResult(session: AuthenticatedSession, roles: AppRole[]) {
  return hasAnyRole(session, roles) ? ok(session) : fail("access_denied");
}

export function requireCapabilityResult(
  session: AuthenticatedSession,
  capability: AppCapability
) {
  return hasCapability(session, capability) ? ok(session) : fail("access_denied");
}

export function safeInternalRedirect(
  input: FormDataEntryValue | string | null | undefined,
  fallback = "/dashboard"
) {
  const value = typeof input === "string" ? input.trim() : "";

  if (!value) {
    return fallback;
  }

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("\n")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://industrial-learn.local");
    return parsed.origin === "https://industrial-learn.local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}

export function absoluteAppUrl(path: string, appBaseUrl: string | undefined) {
  const internalPath = safeInternalRedirect(path, "/");

  if (!appBaseUrl) {
    return internalPath;
  }

  return new URL(internalPath, appBaseUrl).toString();
}

export function publicAuthMessage(code: string | null | undefined) {
  if (!code || !(code in safeErrorMessages)) {
    return "";
  }

  return safeErrorMessages[code as AuthFailureCode];
}

export function normaliseEmail(email: FormDataEntryValue | string | null | undefined) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function readRequiredString(
  value: FormDataEntryValue | string | null | undefined
) {
  return typeof value === "string" ? value.trim() : "";
}
