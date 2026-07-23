import { createClient } from "@supabase/supabase-js";
import type { IndustrialLearnEnv } from "@industrial-learn/env";

import {
  capabilitiesForRoles,
  fail,
  isAppRole,
  ok,
  type AppRole,
  type AuthProfile,
  type AuthProvider,
  type AuthResult,
  type AuthenticatedSession,
  type PasswordResetRequest,
  type PasswordUpdateInput,
  type SessionTokens,
  type SignInInput,
  type SignUpInput
} from "./session-core";

type SupabaseAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
    user_metadata?: {
      display_name?: string;
      full_name?: string;
    };
  };
  error?: string;
  error_description?: string;
  msg?: string;
};

type ProfileRow = {
  id: string;
  email: string;
  display_name: string;
  deleted_at: string | null;
};

type ProfileRoleRow = {
  roles?: {
    role_key?: string;
  };
};

export function createSupabaseAuthProvider(env: IndustrialLearnEnv): AuthProvider {
  if (!env.supabase.url || !env.supabase.anonKey) {
    return unavailableProvider();
  }

  const authBase = `${env.supabase.url}/auth/v1`;
  const restBase = `${env.supabase.url}/rest/v1`;

  return {
    async signUp(input: SignUpInput) {
      const response = await authFetch<SupabaseAuthResponse>(env, `${authBase}/signup`, {
        method: "POST",
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          data: { display_name: input.displayName },
          email_redirect_to: input.redirectTo
        })
      });

      if (!response.ok) {
        return mapAuthFailure(response);
      }

      const user = response.value.user;
      if (user?.id && user.email) {
        const profile = await createSupabaseProfile(env, {
          authUserId: user.id,
          email: user.email,
          displayName: input.displayName
        });
        if (!profile.ok) {
          return profile;
        }
      }

      const tokens = tokensFromResponse(response.value);
      return ok(tokens ? { tokens } : {});
    },

    async signIn(input: SignInInput) {
      const response = await authFetch<SupabaseAuthResponse>(
        env,
        `${authBase}/token?grant_type=password`,
        {
          method: "POST",
          body: JSON.stringify({ email: input.email, password: input.password })
        }
      );

      if (!response.ok) {
        return mapAuthFailure(response);
      }

      const tokens = tokensFromResponse(response.value);
      if (!tokens) {
        return fail("invalid_credentials");
      }

      return ok({ tokens });
    },

    async signOut(tokens: Partial<SessionTokens>) {
      if (!tokens.accessToken) {
        return;
      }
      await authFetch(env, `${authBase}/logout`, {
        method: "POST",
        accessToken: tokens.accessToken
      });
    },

    async requestPasswordReset(input: PasswordResetRequest) {
      await authFetch(env, `${authBase}/recover`, {
        method: "POST",
        body: JSON.stringify({ email: input.email, redirect_to: input.redirectTo })
      });
      return ok(null);
    },

    async updatePassword(input: PasswordUpdateInput) {
      if (!input.accessToken && !input.resetToken) {
        return fail("expired_reset_link");
      }

      const accessToken = input.accessToken ?? input.resetToken;
      if (!accessToken) {
        return fail("expired_reset_link");
      }

      const response = await authFetch(env, `${authBase}/user`, {
        method: "PUT",
        accessToken,
        body: JSON.stringify({ password: input.password })
      });

      return response.ok ? ok(null) : fail("expired_reset_link");
    },

    async verifyEmail(token: string, type = "signup") {
      const response = await authFetch(env, `${authBase}/verify`, {
        method: "POST",
        body: JSON.stringify({ token, type })
      });
      return response.ok ? ok(null) : fail("expired_session");
    },

    async resolveSession(tokens: Partial<SessionTokens>) {
      if (!tokens.accessToken) {
        return fail("missing_session");
      }

      const userResponse = await authFetch<SupabaseAuthResponse>(
        env,
        `${authBase}/user`,
        {
          method: "GET",
          accessToken: tokens.accessToken
        }
      );

      if (
        !userResponse.ok ||
        !userResponse.value.user?.id ||
        !userResponse.value.user.email
      ) {
        return fail("expired_session");
      }

      const profile = await resolveSupabaseProfile(env, restBase, tokens.accessToken, {
        authUserId: userResponse.value.user.id,
        email: userResponse.value.user.email,
        displayName:
          userResponse.value.user.user_metadata?.display_name ??
          userResponse.value.user.user_metadata?.full_name ??
          userResponse.value.user.email
      });

      if (!profile.ok) {
        return profile;
      }

      const session: AuthenticatedSession = {
        authUserId: userResponse.value.user.id,
        email: userResponse.value.user.email,
        profile: profile.value,
        roles: profile.value.roles,
        capabilities: capabilitiesForRoles(profile.value.roles),
        expiresAt: tokens.expiresAt ?? new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };

      return ok(session);
    },

    async createProfileForAuthenticatedUser(authUser) {
      return createSupabaseProfile(env, authUser);
    }
  };
}

function unavailableProvider(): AuthProvider {
  const unavailable = () => Promise.resolve(fail("configuration_error"));
  return {
    signUp: unavailable,
    signIn: unavailable,
    signOut: () => Promise.resolve(),
    requestPasswordReset: () => Promise.resolve(ok(null)),
    updatePassword: unavailable,
    verifyEmail: unavailable,
    resolveSession: unavailable,
    createProfileForAuthenticatedUser: unavailable
  };
}

async function authFetch<T = unknown>(
  env: IndustrialLearnEnv,
  url: string,
  init: RequestInit & { accessToken?: string } = {}
) {
  if (!env.supabase.anonKey) {
    return fail<T>("configuration_error");
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        apikey: env.supabase.anonKey,
        Authorization: `Bearer ${init.accessToken ?? env.supabase.anonKey}`,
        "Content-Type": "application/json",
        ...init.headers
      }
    });
    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : ({} as T);

    if (!response.ok) {
      return fail<T>(
        response.status === 401 ? "invalid_credentials" : "network_failure",
        authMessage(data)
      );
    }

    return ok(data);
  } catch {
    return fail<T>("network_failure");
  }
}

function mapAuthFailure<T>(response: { ok: false; message: string }): AuthResult<T> {
  const message = response.message.toLowerCase();
  if (message.includes("confirm") || message.includes("verify")) {
    return fail("unverified_email");
  }
  return fail("invalid_credentials");
}

function tokensFromResponse(response: SupabaseAuthResponse): SessionTokens | undefined {
  if (!response.access_token) {
    return undefined;
  }

  const tokens: SessionTokens = {
    accessToken: response.access_token,
    expiresAt: new Date(Date.now() + (response.expires_in ?? 3600) * 1000).toISOString()
  };
  if (response.refresh_token) {
    tokens.refreshToken = response.refresh_token;
  }
  return tokens;
}

async function resolveSupabaseProfile(
  env: IndustrialLearnEnv,
  restBase: string,
  accessToken: string,
  authUser: Pick<AuthProfile, "authUserId" | "email" | "displayName">
) {
  const profileRows = await restFetch<ProfileRow[]>(
    env,
    `${restBase}/profiles?id=eq.${encodeURIComponent(authUser.authUserId)}&select=id,email,display_name,deleted_at`,
    accessToken
  );
  if (!profileRows.ok) {
    return profileRows;
  }

  const profileRow = profileRows.value[0];
  if (!profileRow) {
    return createSupabaseProfile(env, authUser);
  }

  if (profileRow.deleted_at) {
    return fail<AuthProfile>("disabled_account");
  }

  const roleRows = await restFetch<ProfileRoleRow[]>(
    env,
    `${restBase}/profile_roles?profile_id=eq.${encodeURIComponent(profileRow.id)}&select=roles(role_key)`,
    accessToken
  );
  if (!roleRows.ok) {
    return roleRows;
  }

  const roles = roleRows.value
    .map((row) => row.roles?.role_key)
    .filter((role): role is AppRole => Boolean(role && isAppRole(role)));

  return ok<AuthProfile>({
    id: profileRow.id,
    authUserId: authUser.authUserId,
    email: profileRow.email,
    displayName: profileRow.display_name,
    accountStatus: roles.length > 0 ? "active" : "missing_profile",
    roles
  });
}

async function createSupabaseProfile(
  env: IndustrialLearnEnv,
  authUser: Pick<AuthProfile, "authUserId" | "email" | "displayName">
) {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    return fail<AuthProfile>("missing_profile");
  }

  try {
    const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { persistSession: false }
    });

    const { data: existing } = await admin
      .from("profiles")
      .select("id,email,display_name,deleted_at")
      .eq("id", authUser.authUserId)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await admin.from("profiles").insert({
        id: authUser.authUserId,
        email: authUser.email,
        display_name: authUser.displayName
      });
      if (insertError) {
        return fail<AuthProfile>("profile_creation_failed");
      }
    }

    const { data: role } = await admin
      .from("roles")
      .select("id")
      .eq("role_key", "student")
      .maybeSingle();
    if (!role?.id) {
      return fail<AuthProfile>("profile_creation_failed");
    }

    await admin.from("profile_roles").upsert(
      {
        profile_id: authUser.authUserId,
        role_id: role.id
      },
      { onConflict: "profile_id,role_id" }
    );

    return ok<AuthProfile>({
      id: authUser.authUserId,
      authUserId: authUser.authUserId,
      email: authUser.email,
      displayName: authUser.displayName,
      accountStatus: "active",
      roles: ["student"]
    });
  } catch {
    return fail<AuthProfile>("profile_creation_failed");
  }
}

async function restFetch<T>(env: IndustrialLearnEnv, url: string, accessToken: string) {
  if (!env.supabase.anonKey) {
    return fail<T>("configuration_error");
  }

  try {
    const response = await fetch(url, {
      headers: {
        apikey: env.supabase.anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    const data = (await response.json()) as T;
    return response.ok ? ok(data) : fail<T>("access_denied");
  } catch {
    return fail<T>("network_failure");
  }
}

function authMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return "Authentication failed.";
  }
  const record = data as Partial<SupabaseAuthResponse>;
  return (
    record.error_description ?? record.error ?? record.msg ?? "Authentication failed."
  );
}
