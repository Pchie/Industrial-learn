import { createClient } from "@supabase/supabase-js";
import type { IndustrialLearnEnv } from "@industrial-learn/env";

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ServiceRoleJustification =
  | "profile-provisioning"
  | "audit-administration"
  | "content-publication"
  | "account-administration";

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("Privileged database clients are server-only.");
  }
}

function requirePublicSupabaseConfig(env: IndustrialLearnEnv) {
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error("Supabase public configuration is not available.");
  }

  return {
    url: env.supabase.url,
    anonKey: env.supabase.anonKey
  };
}

export function createSupabasePublicClient(env: IndustrialLearnEnv) {
  const config = requirePublicSupabaseConfig(env);

  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      persistSession: false
    }
  });
}

export function createSupabaseServerClient(
  env: IndustrialLearnEnv,
  sessionAccessToken: string
) {
  assertServerRuntime();
  const config = requirePublicSupabaseConfig(env);

  if (!sessionAccessToken.trim()) {
    throw new Error("A session access token is required for session-bound access.");
  }

  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${sessionAccessToken}`
      }
    }
  });
}

export function createSupabaseServiceRoleClient(
  env: IndustrialLearnEnv,
  justification: ServiceRoleJustification
) {
  assertServerRuntime();

  if (!justification) {
    throw new Error("Service-role database access requires explicit justification.");
  }

  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    throw new Error("Supabase service-role configuration is not available.");
  }

  return createClient<Database>(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
