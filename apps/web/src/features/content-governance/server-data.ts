import "server-only";

import { createSupabaseServerClient } from "@industrial-learn/database";
import { getServerEnv } from "@industrial-learn/env";

import type { AuthenticatedSession } from "../auth/session-core";

export type GovernanceDecisionHistory = {
  id: string;
  reviewerProfileId: string;
  decision: "approved" | "changes_requested" | "rejected";
  comments: string;
  reviewedAt: string;
  governanceVersion: number;
};

export type GovernanceReviewAssignment = {
  id: string;
  reviewerProfileId: string;
  contentVersion: number;
  reviewType: string;
  status: "assigned" | "in_progress" | "completed" | "cancelled";
  assignedAt: string;
};

export type GovernanceInterfaceItem = {
  id: string;
  governanceItemId?: string;
  title: string;
  slug: string;
  entityType: string;
  authorName: string;
  authorProfileId?: string;
  workflowStatus: string;
  publicationStatus: string;
  currentVersion: number;
  contentVersion: string;
  artifactSha256?: string;
  relatedLessonId?: string;
  relatedLessonSlug?: string;
  relatedLessonVersion?: string;
  learningOutcomeIds: string[];
  questionCount?: number;
  publishedVersion?: number | undefined;
  sourceIds: string[];
  equationIds: string[];
  requiredReviews: string[];
  completedReviews: string[];
  reviewerComments: string[];
  decisionHistory: GovernanceDecisionHistory[];
  assignment?: GovernanceReviewAssignment | undefined;
  isAssignedToActor: boolean;
  moduleTitle: string;
  reviewType: string;
  sourceStatus: string;
  equationStatus: string;
  simulationStatus: string;
  accessibilityStatus: string;
  lastModified: string;
};

export type GovernanceInterfaceModel = {
  actorProfileId: string;
  actorName: string;
  items: GovernanceInterfaceItem[];
  dataSource: "staging-database" | "local-e2e" | "unavailable";
  error?: string;
};

export function loadAuthorGovernanceModel(
  session: AuthenticatedSession
): GovernanceInterfaceModel {
  return {
    actorProfileId: session.profile.id,
    actorName: session.profile.displayName,
    items: isLocalGovernanceMode() ? localItemsForAuthor(session.profile.email) : [],
    dataSource: isLocalGovernanceMode() ? "local-e2e" : "unavailable"
  };
}

export async function loadReviewGovernanceModel(
  session: AuthenticatedSession,
  accessToken: string | undefined
): Promise<GovernanceInterfaceModel> {
  if (isLocalGovernanceMode()) {
    const local = await import("../auth/test-local-provider");
    return {
      actorProfileId: session.profile.id,
      actorName: session.profile.displayName,
      items: localItemsForReview(session, local.listLocalReviewAssignments()),
      dataSource: "local-e2e"
    };
  }

  if (!accessToken) {
    return unavailableModel(session, "Authenticated database token is unavailable.");
  }

  try {
    const client = createSupabaseServerClient(getServerEnv(), accessToken);
    const { data: items, error: itemsError } = await client
      .from("content_governance_items")
      .select(
        "id,entity_type,slug,title,author_profile_id,current_version,published_version,workflow_status,publication_status,updated_at"
      )
      .order("updated_at", { ascending: false });

    if (itemsError) {
      throw itemsError;
    }

    const itemIds = (items ?? []).map((item) => item.id);
    if (itemIds.length === 0) {
      return {
        actorProfileId: session.profile.id,
        actorName: session.profile.displayName,
        items: [],
        dataSource: "staging-database"
      };
    }

    const authorIds = [...new Set((items ?? []).map((item) => item.author_profile_id))];
    const [
      { data: versions, error: versionsError },
      { data: reviews, error: reviewsError },
      { data: assignments, error: assignmentsError },
      { data: authorLabels, error: authorLabelsError }
    ] = await Promise.all([
      client
        .from("content_versions")
        .select("governance_item_id,version,snapshot,source_ids")
        .in("governance_item_id", itemIds),
      client
        .from("review_records")
        .select(
          "id,governance_item_id,content_version,reviewer_profile_id,decision,notes,reviewed_at,review_type,evidence_checked"
        )
        .in("governance_item_id", itemIds)
        .order("reviewed_at", { ascending: false }),
      client
        .from("review_assignments")
        .select(
          "id,governance_item_id,content_version,reviewer_profile_id,assigned_by_profile_id,review_type,status,reason,assigned_at,completed_at,cancelled_at,created_at,updated_at"
        )
        .in("governance_item_id", itemIds)
        .order("assigned_at", { ascending: false }),
      client.rpc("list_content_author_labels", { p_profile_ids: authorIds })
    ]);

    if (versionsError || reviewsError || assignmentsError || authorLabelsError) {
      throw new Error(
        versionsError?.message ??
          reviewsError?.message ??
          assignmentsError?.message ??
          authorLabelsError?.message ??
          "Review evidence query failed."
      );
    }

    const authorNames = new Map(
      (authorLabels ?? []).map((author) => [author.profile_id, author.display_name])
    );
    const manager = session.roles.some(
      (role) => role === "administrator" || role === "platform_owner"
    );
    const visibleItems = (items ?? []).filter((item) => {
      if (manager) {
        return true;
      }
      return (assignments ?? []).some(
        (assignment) =>
          assignment.governance_item_id === item.id &&
          assignment.content_version === item.current_version &&
          assignment.reviewer_profile_id === session.profile.id &&
          assignment.status !== "cancelled"
      );
    });

    return {
      actorProfileId: session.profile.id,
      actorName: session.profile.displayName,
      items: visibleItems.map((item) => {
        const version = (versions ?? []).find(
          (candidate) =>
            candidate.governance_item_id === item.id &&
            candidate.version === item.current_version
        );
        const itemReviews = (reviews ?? []).filter(
          (review) => review.governance_item_id === item.id
        );
        const itemAssignments = (assignments ?? []).filter(
          (assignment) =>
            assignment.governance_item_id === item.id &&
            assignment.content_version === item.current_version &&
            assignment.status !== "cancelled"
        );
        const assignment = manager
          ? itemAssignments[0]
          : itemAssignments.find(
              (candidate) => candidate.reviewer_profile_id === session.profile.id
            );
        const snapshot = version?.snapshot ?? {};
        const contentVersion =
          typeof snapshot.version === "string"
            ? snapshot.version
            : String(item.current_version);
        const sourceIds = stringArray(snapshot.sourceIds) ?? version?.source_ids ?? [];
        const equationIds = stringArray(snapshot.equationIds) ?? [];
        const learningOutcomeIds = stringArray(snapshot.learningOutcomeIds) ?? [];

        return {
          id: typeof snapshot.id === "string" ? snapshot.id : `GOVERNANCE-${item.id}`,
          governanceItemId: item.id,
          title: item.title,
          slug: item.slug,
          entityType: item.entity_type,
          authorName: authorNames.get(item.author_profile_id) ?? "Named content author",
          authorProfileId: item.author_profile_id,
          workflowStatus: item.workflow_status,
          publicationStatus: item.publication_status,
          currentVersion: item.current_version,
          contentVersion,
          ...optionalStringField("artifactSha256", snapshot.artifactSha256),
          ...optionalStringField("relatedLessonId", snapshot.relatedLessonId),
          ...optionalStringField("relatedLessonSlug", snapshot.relatedLessonSlug),
          ...optionalStringField("relatedLessonVersion", snapshot.relatedLessonVersion),
          learningOutcomeIds,
          ...(typeof snapshot.questionCount === "number"
            ? { questionCount: snapshot.questionCount }
            : {}),
          ...(item.published_version ? { publishedVersion: item.published_version } : {}),
          sourceIds,
          equationIds,
          requiredReviews: requiredReviewsFor(item.entity_type),
          completedReviews: completedReviews(itemReviews),
          reviewerComments: itemReviews.map((review) => review.notes),
          decisionHistory: itemReviews.map((review) => ({
            id: review.id,
            reviewerProfileId: review.reviewer_profile_id,
            decision: review.decision,
            comments: review.notes,
            reviewedAt: review.reviewed_at,
            governanceVersion: review.content_version ?? item.current_version
          })),
          ...(assignment
            ? {
                assignment: {
                  id: assignment.id,
                  reviewerProfileId: assignment.reviewer_profile_id,
                  contentVersion: assignment.content_version,
                  reviewType: assignment.review_type,
                  status: assignment.status,
                  assignedAt: assignment.assigned_at
                }
              }
            : {}),
          isAssignedToActor: assignment?.reviewer_profile_id === session.profile.id,
          moduleTitle:
            typeof snapshot.moduleTitle === "string"
              ? snapshot.moduleTitle
              : "Fluid Mechanics Foundations",
          reviewType: "Independent engineering review",
          sourceStatus:
            (version?.source_ids.length ?? 0) > 0
              ? "Source evidence attached"
              : "Source required",
          equationStatus:
            equationIds.length > 0
              ? "Implementation and evidence supplied; human check required"
              : "No equation evidence registered",
          simulationStatus:
            item.entity_type === "assessment"
              ? "No simulation task is included in this assessment version"
              : "No standalone simulation required for this lesson",
          accessibilityStatus: "Automated evidence supplied; human check required",
          lastModified: item.updated_at
        };
      }),
      dataSource: "staging-database"
    };
  } catch {
    return unavailableModel(
      session,
      "The protected governance records could not be loaded. No review action is available."
    );
  }
}

function unavailableModel(session: AuthenticatedSession, error: string) {
  return {
    actorProfileId: session.profile.id,
    actorName: session.profile.displayName,
    items: [],
    dataSource: "unavailable" as const,
    error
  };
}

function requiredReviewsFor(entityType: string) {
  return entityType === "calculation_lesson" || entityType === "assessment"
    ? ["source", "equation", "safety and limitations", "educational", "accessibility"]
    : ["source", "educational", "accessibility"];
}

function stringArray(value: unknown) {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
    ? value
    : undefined;
}

function optionalStringField<Key extends string>(key: Key, value: unknown) {
  return typeof value === "string" && value.trim()
    ? ({ [key]: value } as Record<Key, string>)
    : {};
}

function completedReviews(
  reviews: Array<{
    review_type: string | null;
    evidence_checked: Record<string, unknown>;
  }>
) {
  const completed = new Set<string>();
  for (const review of reviews) {
    if (review.review_type) {
      completed.add(review.review_type);
    }
    for (const [key, value] of Object.entries(review.evidence_checked)) {
      if (value === true) {
        completed.add(key.replaceAll("_", " "));
      }
    }
  }
  return [...completed];
}

function isLocalGovernanceMode() {
  return (
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true"
  );
}

function localItemsForAuthor(email: string) {
  if (
    email !== "author@example.test" &&
    email !== "admin@example.test" &&
    email !== "owner@example.test"
  ) {
    return [];
  }
  return localGovernanceItems;
}

function localItemsForReview(
  session: AuthenticatedSession,
  assignments: Array<{
    id: string;
    governanceItemId: string;
    contentVersion: number;
    reviewerProfileId: string;
    reviewType: "engineering_approval";
    status: "assigned" | "in_progress" | "completed" | "cancelled";
    assignedAt: string;
  }>
) {
  const manager = session.roles.some(
    (role) => role === "administrator" || role === "platform_owner"
  );

  return localGovernanceItems.flatMap((item) => {
    const itemAssignments = assignments.filter(
      (assignment) =>
        assignment.governanceItemId === item.governanceItemId &&
        assignment.contentVersion === item.currentVersion &&
        assignment.status !== "cancelled"
    );
    const assignment = manager
      ? itemAssignments[0]
      : itemAssignments.find(
          (candidate) => candidate.reviewerProfileId === session.profile.id
        );
    if (!manager && !assignment) {
      return [];
    }

    return [
      {
        ...item,
        ...(assignment ? { assignment } : {}),
        isAssignedToActor: assignment?.reviewerProfileId === session.profile.id
      }
    ];
  });
}

const localGovernanceItems: GovernanceInterfaceItem[] = [
  {
    id: "LES-FLUID-PRESSURE-001",
    governanceItemId: "94f5c2b9-a0b9-43f5-8b6b-4a3a67fc4f01",
    title: "Basic Fluid Pressure",
    slug: "basic-fluid-pressure",
    entityType: "calculation_lesson",
    authorName: "Content Author",
    authorProfileId: "local-content-author-profile",
    workflowStatus: "Engineering review required",
    publicationStatus: "draft",
    currentVersion: 4,
    contentVersion: "0.4.0",
    learningOutcomeIds: ["LO-FP-001", "LO-FP-002", "LO-FP-003"],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2012", "SRC-PSU-CIMBALA-PRESSURE-BASICS"],
    equationIds: ["EQ-FLUID-PRESSURE-001"],
    requiredReviews: [
      "source",
      "equation",
      "safety and limitations",
      "educational",
      "accessibility"
    ],
    completedReviews: [],
    reviewerComments: [],
    decisionHistory: [],
    isAssignedToActor: false,
    moduleTitle: "Fluid Mechanics Foundations",
    reviewType: "Independent engineering review",
    sourceStatus: "Source evidence attached",
    equationStatus: "Implementation and evidence supplied; human check required",
    simulationStatus: "No standalone simulation required for this lesson",
    accessibilityStatus: "Automated evidence supplied; human check required",
    lastModified: "2026-08-30T00:00:00.000Z"
  }
];
