"use server";

import { redirect } from "next/navigation";
import { getServerEnv } from "@industrial-learn/env";

import {
  clearSessionCookies,
  getAuthProvider,
  readSessionTokens,
  resolveAuthenticatedSession,
  setSessionCookies
} from "./server";
import {
  absoluteAppUrl,
  normaliseEmail,
  readRequiredString,
  safeInternalRedirect
} from "./session-core";

export async function signUpAction(formData: FormData) {
  const next = safeInternalRedirect(formData.get("next"), "/dashboard");
  const email = normaliseEmail(formData.get("email"));
  const password = readRequiredString(formData.get("password"));
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
  const password = readRequiredString(formData.get("password"));
  const result = await (await getAuthProvider()).signIn({ email, password });

  if (!result.ok) {
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
  await (
    await getAuthProvider()
  ).requestPasswordReset({
    email,
    redirectTo: absoluteAppUrl("/auth/reset-password", getServerEnv().appBaseUrl)
  });
  redirect("/auth/forgot-password?status=reset_requested");
}

export async function resetPasswordAction(formData: FormData) {
  const password = readRequiredString(formData.get("password"));
  const resetToken = readRequiredString(formData.get("token"));
  const session = await resolveAuthenticatedSession();
  const tokens = await readSessionTokens();
  const result = await (
    await getAuthProvider()
  ).updatePassword({
    password,
    resetToken,
    ...(session.ok && tokens.accessToken ? { accessToken: tokens.accessToken } : {})
  });

  if (!result.ok) {
    redirect(`/auth/reset-password?error=${result.code}`);
  }

  redirect("/auth/sign-in?status=password_updated");
}
