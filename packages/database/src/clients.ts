import { createClient } from "@supabase/supabase-js";
import type { IndustrialLearnEnv } from "@industrial-learn/env";

export type Database = {
  public: {
    Tables: {
      content_governance_items: {
        Row: {
          id: string;
          entity_table: string;
          entity_id: string;
          entity_type: string;
          slug: string;
          title: string;
          author_profile_id: string;
          current_version: number;
          published_version: number | null;
          workflow_status: string;
          publication_status: string;
          updated_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      content_versions: {
        Row: {
          governance_item_id: string | null;
          version: number;
          snapshot: Record<string, unknown>;
          source_ids: string[];
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      review_records: {
        Row: {
          id: string;
          governance_item_id: string | null;
          content_version: number | null;
          reviewer_profile_id: string;
          decision: "approved" | "changes_requested" | "rejected";
          notes: string;
          reviewed_at: string;
          review_type: string | null;
          evidence_checked: Record<string, unknown>;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      record_content_review_decision: {
        Args: {
          p_governance_item_id: string;
          p_governance_version: number;
          p_content_version_label: string;
          p_decision: "approved" | "changes_requested" | "rejected";
          p_notes: string;
          p_evidence_checked: Record<string, boolean>;
          p_source_ids_checked: string[];
          p_equation_ids_checked: string[];
          p_safety_review_outcome: "passed" | "failed" | "not_applicable";
        };
        Returns: Record<string, unknown>;
      };
    };
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
