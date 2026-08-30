import "server-only";

import { createSupabaseServerClient } from "@industrial-learn/database";
import { getServerEnv } from "@industrial-learn/env";

import type { AppRole, AuthenticatedSession } from "../auth/session-core";

export type ManagedUser = {
  profileId: string;
  email: string;
  displayName: string;
  accountStatus: string;
  roles: AppRole[];
  updatedAt: string;
};

export type AccessAuditEntry = {
  id: string;
  actorProfileId: string | null;
  action: string;
  targetProfileId: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
};

export type PlatformAdministrationModel = {
  users: ManagedUser[];
  audit: AccessAuditEntry[];
  source: "staging-database" | "local-e2e" | "unavailable";
  error?: string;
};

export async function loadPlatformAdministrationModel(
  session: AuthenticatedSession,
  accessToken: string | undefined
): Promise<PlatformAdministrationModel> {
  if (isLocalAdministrationMode()) {
    const local = await import("../auth/test-local-provider");
    return {
      users: local.listLocalUsersForAdministration(),
      audit: local.listLocalAccessAudit(),
      source: "local-e2e"
    };
  }

  if (!accessToken) {
    return unavailable("Authenticated database access is unavailable.");
  }

  try {
    const client = createSupabaseServerClient(getServerEnv(), accessToken);
    const [usersResult, auditResult] = await Promise.all([
      client.rpc("list_platform_users"),
      client.rpc("list_platform_access_audit", { p_limit: 50 })
    ]);

    if (usersResult.error || auditResult.error) {
      throw new Error(
        usersResult.error?.message ??
          auditResult.error?.message ??
          "Platform access query failed."
      );
    }

    return {
      users: (usersResult.data ?? []).map((user) => ({
        profileId: user.profile_id,
        email: user.email,
        displayName: user.display_name,
        accountStatus: user.account_status,
        roles: user.roles.filter(isAppRole),
        updatedAt: user.updated_at
      })),
      audit: (auditResult.data ?? []).map((entry) => ({
        id: entry.audit_id,
        actorProfileId: entry.actor_profile_id,
        action: entry.action,
        targetProfileId: entry.target_profile_id,
        metadata: entry.metadata,
        occurredAt: entry.occurred_at
      })),
      source: "staging-database"
    };
  } catch {
    return unavailable(
      `Role-management records could not be loaded for ${session.profile.displayName}.`
    );
  }
}

function isAppRole(value: string): value is AppRole {
  return [
    "student",
    "lecturer",
    "content_author",
    "engineering_reviewer",
    "administrator",
    "platform_owner"
  ].includes(value);
}

function isLocalAdministrationMode() {
  return (
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true"
  );
}

function unavailable(error: string): PlatformAdministrationModel {
  return { users: [], audit: [], source: "unavailable", error };
}
