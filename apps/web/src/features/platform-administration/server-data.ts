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

export type ManagedReviewItem = {
  governanceItemId: string;
  slug: string;
  title: string;
  contentVersion: number;
  contentVersionLabel: string;
  workflowStatus: string;
  publicationStatus: string;
};

export type ManagedReviewAssignment = {
  id: string;
  governanceItemId: string;
  contentVersion: number;
  reviewerProfileId: string;
  assignedByProfileId: string;
  reviewType: "engineering_approval";
  status: "assigned" | "in_progress" | "completed" | "cancelled";
  reason: string;
  assignedAt: string;
};

export type PlatformAdministrationModel = {
  users: ManagedUser[];
  audit: AccessAuditEntry[];
  reviewItems: ManagedReviewItem[];
  reviewAssignments: ManagedReviewAssignment[];
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
      reviewItems: [localBasicPressureReviewItem],
      reviewAssignments: local.listLocalReviewAssignments(),
      source: "local-e2e"
    };
  }

  if (!accessToken) {
    return unavailable("Authenticated database access is unavailable.");
  }

  try {
    const client = createSupabaseServerClient(getServerEnv(), accessToken);
    const [usersResult, auditResult, reviewItemsResult, assignmentsResult] =
      await Promise.all([
        client.rpc("list_platform_users"),
        client.rpc("list_platform_access_audit", { p_limit: 50 }),
        client
          .from("content_governance_items")
          .select(
            "id,slug,title,current_version,workflow_status,publication_status,updated_at"
          )
          .order("updated_at", { ascending: false }),
        client
          .from("review_assignments")
          .select(
            "id,governance_item_id,content_version,reviewer_profile_id,assigned_by_profile_id,review_type,status,reason,assigned_at"
          )
          .order("assigned_at", { ascending: false })
      ]);

    if (
      usersResult.error ||
      auditResult.error ||
      reviewItemsResult.error ||
      assignmentsResult.error
    ) {
      throw new Error(
        usersResult.error?.message ??
          auditResult.error?.message ??
          reviewItemsResult.error?.message ??
          assignmentsResult.error?.message ??
          "Platform access query failed."
      );
    }

    const reviewItems = reviewItemsResult.data ?? [];
    const versionResult =
      reviewItems.length > 0
        ? await client
            .from("content_versions")
            .select("governance_item_id,version,snapshot,source_ids")
            .in(
              "governance_item_id",
              reviewItems.map((item) => item.id)
            )
        : { data: [], error: null };

    if (versionResult.error) {
      throw versionResult.error;
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
      reviewItems: reviewItems.map((item) => {
        const version = (versionResult.data ?? []).find(
          (candidate) =>
            candidate.governance_item_id === item.id &&
            candidate.version === item.current_version
        );
        return {
          governanceItemId: item.id,
          slug: item.slug,
          title: item.title,
          contentVersion: item.current_version,
          contentVersionLabel:
            typeof version?.snapshot.version === "string"
              ? version.snapshot.version
              : String(item.current_version),
          workflowStatus: item.workflow_status,
          publicationStatus: item.publication_status
        };
      }),
      reviewAssignments: (assignmentsResult.data ?? []).map((assignment) => ({
        id: assignment.id,
        governanceItemId: assignment.governance_item_id,
        contentVersion: assignment.content_version,
        reviewerProfileId: assignment.reviewer_profile_id,
        assignedByProfileId: assignment.assigned_by_profile_id,
        reviewType: assignment.review_type,
        status: assignment.status,
        reason: assignment.reason,
        assignedAt: assignment.assigned_at
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
  return {
    users: [],
    audit: [],
    reviewItems: [],
    reviewAssignments: [],
    source: "unavailable",
    error
  };
}

const localBasicPressureReviewItem: ManagedReviewItem = {
  governanceItemId: "94f5c2b9-a0b9-43f5-8b6b-4a3a67fc4f01",
  slug: "basic-fluid-pressure",
  title: "Basic Fluid Pressure",
  contentVersion: 4,
  contentVersionLabel: "0.4.0",
  workflowStatus: "Engineering review required",
  publicationStatus: "draft"
};
