"use server";

import { redirect } from "next/navigation";
import { getAuthConfigurationDiagnostics, getServerEnv } from "@industrial-learn/env";

import {
  clearSessionCookies,
  clearRecoveryCookie,
  getAuthProvider,
  readSessionTokens,
  readRecoveryToken,
  resolveAuthenticatedSession,
  setSessionCookies,
  setRecoveryCookie
} from "./server";
import {
  absoluteAppUrl,
  normaliseEmail,
  readRequiredString,
  safeInternalRedirect
} from "./session-core";
import { recordOperationalEvent, safeHashIdentifier } from "../monitoring/server";

export async function signUpAction(formData: FormData) {
  const next = safeInternalRedirect(formData.get("next"), "/dashboard");
  const email = normaliseEmail(formData.get("email"));
  const enteredPassword = formData.get("password");
  const password = typeof enteredPassword === "string" ? enteredPassword : "";
  const displayName = readRequiredString(formData.get("displayName"));
  const result = await (
    await getAuthProvider()
  ).signUp({
    email,
    password,
    displayName,
    redirectTo: absoluteAppUrl("/auth/verify", getServerEnv().appBaseUrl)
  });

  if (!result.ok) {
    recordOperationalEvent({
      category: "auth_failure",
      operation: "sign_up",
      result: "failure",
      route: "/auth/sign-up",
      safeUserId: safeHashIdentifier(email),
      details: {
        code: result.code,
        ...(result.code === "configuration_error"
          ? { configuration: getAuthConfigurationDiagnostics() }
          : {})
      }
    });
    redirect(`/auth/sign-up?next=${encodeURIComponent(next)}&error=${result.code}`);
  }

  if (result.value.tokens) {
    await setSessionCookies(result.value.tokens);
    redirect(next);
  }

  redirect(`/auth/sign-in?next=${encodeURIComponent(next)}&status=verify_email`);
}

export async function signInAction(formData: FormData) {
  const next = safeInternalRedirect(formData.get("next"), "/dashboard");
  const email = normaliseEmail(formData.get("email"));
  const enteredPassword = formData.get("password");
  const password = typeof enteredPassword === "string" ? enteredPassword : "";
  const result = await (await getAuthProvider()).signIn({ email, password });

  if (!result.ok) {
    recordOperationalEvent({
      category: "auth_failure",
      operation: "sign_in",
      result: "failure",
      route: "/auth/sign-in",
      safeUserId: safeHashIdentifier(email),
      details: {
        code: result.code,
        ...(result.code === "configuration_error"
          ? { configuration: getAuthConfigurationDiagnostics() }
          : {})
      }
    });
    redirect(`/auth/sign-in?next=${encodeURIComponent(next)}&error=${result.code}`);
  }

  await setSessionCookies(result.value.tokens);
  redirect(next);
}

export async function signOutAction() {
  const tokens = await readSessionTokens();
  const session = await resolveAuthenticatedSession();
  if (session.ok) {
    await (
      await getAuthProvider()
    ).signOut({
      ...(tokens.accessToken ? { accessToken: tokens.accessToken } : {}),
      ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
      expiresAt: session.value.expiresAt
    });
  }
  await clearSessionCookies();
  redirect("/auth/sign-in?status=signed_out");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = normaliseEmail(formData.get("email"));
  const result = await (
    await getAuthProvider()
  ).requestPasswordReset({
    email,
    redirectTo: absoluteAppUrl("/auth/verify", getServerEnv().appBaseUrl)
  });
  if (!result.ok)
    recordOperationalEvent({
      category: "auth_failure",
      operation: "request_password_reset",
      result: "failure",
      route: "/auth/forgot-password",
      details: { code: result.code }
    });
  redirect("/auth/forgot-password?status=reset_requested");
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get("password");
  if (typeof password !== "string" || password.length < 8 || password.length > 256) {
    redirect("/auth/reset-password?error=invalid_credentials");
  }
  const accessToken = await readRecoveryToken();
  if (!accessToken) redirect("/auth/reset-password?error=expired_reset_link");
  const result = await (
    await getAuthProvider()
  ).updatePassword({
    password,
    accessToken
  });

  if (!result.ok) {
    recordOperationalEvent({
      category: "auth_failure",
      operation: "reset_password",
      result: "failure",
      route: "/auth/reset-password",
      details: { code: result.code }
    });
    redirect(`/auth/reset-password?error=${result.code}`);
  }

  await (await getAuthProvider()).signOut({ accessToken });
  await clearSessionCookies();
  redirect("/auth/sign-in?status=password_updated");
}

export async function confirmEmailAction(formData: FormData) {
  const tokenHash = readRequiredString(formData.get("token_hash"));
  const type = formData.get("type");
  await clearRecoveryCookie();
  if (!tokenHash || tokenHash.length > 512 || (type !== "email" && type !== "recovery")) {
    redirect("/auth/verify?error=expired_session");
  }
  const result = await (await getAuthProvider()).verifyEmail(tokenHash, type);
  if (!result.ok) {
    recordOperationalEvent({
      category: "auth_failure",
      operation: "confirm_email_link",
      result: "failure",
      route: "/auth/verify",
      details: { code: result.code }
    });
    redirect("/auth/verify?error=expired_session");
  }
  // Recovery is not a normal login; only the password form receives authority.
  await clearSessionCookies();
  if (type === "recovery") {
    await setRecoveryCookie(result.value.tokens);
    redirect("/auth/reset-password");
  }
  await (await getAuthProvider()).signOut(result.value.tokens);
  redirect("/auth/sign-in?status=email_verified");
}
