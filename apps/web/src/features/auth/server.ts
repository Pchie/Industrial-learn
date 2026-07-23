import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerEnv } from "@industrial-learn/env";

import { createSupabaseAuthProvider } from "./supabase-provider";
import {
  AUTH_REFRESH_COOKIE,
  AUTH_SESSION_COOKIE,
  fail,
  publicAuthMessage,
  requireAnyRoleResult,
  safeInternalRedirect,
  type AppRole,
  type AuthProvider,
  type AuthResult,
  type AuthenticatedSession,
  type SessionTokens
} from "./session-core";

const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export async function getAuthProvider(): Promise<AuthProvider> {
  const env = getServerEnv();
  const explicitLocalMode =
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true";

  if (env.supabase.isConfigured) {
    return createSupabaseAuthProvider(env);
  }

  if (explicitLocalMode) {
    const { createTestLocalAuthProvider } = await import("./test-local-provider");
    return createTestLocalAuthProvider();
  }

  return createSupabaseAuthProvider(env);
}

export async function setSessionCookies(tokens: SessionTokens) {
  const cookieStore = await cookies();
  const maxAge = Math.max(
    1,
    Math.floor((Date.parse(tokens.expiresAt) - Date.now()) / 1000)
  );

  cookieStore.set(AUTH_SESSION_COOKIE, tokens.accessToken, {
    ...secureCookieOptions,
    maxAge
  });

  if (tokens.refreshToken) {
    cookieStore.set(AUTH_REFRESH_COOKIE, tokens.refreshToken, {
      ...secureCookieOptions,
      maxAge: 60 * 60 * 24 * 30
    });
  }
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_SESSION_COOKIE);
  cookieStore.delete(AUTH_REFRESH_COOKIE);
}

export async function resolveAuthenticatedSession(): Promise<
  AuthResult<AuthenticatedSession>
> {
  const { accessToken, refreshToken } = await readSessionTokens();

  if (!accessToken) {
    return fail("missing_session");
  }

  return (await getAuthProvider()).resolveSession({
    accessToken,
    ...(refreshToken ? { refreshToken } : {})
  });
}

export async function readSessionTokens() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(AUTH_SESSION_COOKIE)?.value,
    refreshToken: cookieStore.get(AUTH_REFRESH_COOKIE)?.value
  };
}

export async function requireAuthenticatedUser(nextPath = "/dashboard") {
  const result = await resolveAuthenticatedSession();

  if (!result.ok) {
    redirect(
      `/auth/sign-in?next=${encodeURIComponent(safeInternalRedirect(nextPath))}&error=${result.code}`
    );
  }

  return result.value;
}

export async function requireAnyRole(roles: AppRole[], nextPath: string) {
  const session = await requireAuthenticatedUser(nextPath);
  const result = requireAnyRoleResult(session, roles);

  if (!result.ok) {
    redirect(
      `/auth/error?error=access_denied&next=${encodeURIComponent(safeInternalRedirect(nextPath))}`
    );
  }

  return session;
}

export async function requireRole(role: AppRole, nextPath: string) {
  return requireAnyRole([role], nextPath);
}

export async function requireStudentProfile(nextPath = "/dashboard") {
  return requireRole("student", nextPath);
}

export async function requireContentReviewer(nextPath = "/review") {
  return requireRole("engineering_reviewer", nextPath);
}

export async function requireAdministrator(nextPath = "/admin") {
  return requireRole("administrator", nextPath);
}

export function authMessageForUrl(code: string | string[] | undefined) {
  return publicAuthMessage(Array.isArray(code) ? code[0] : code);
}
