import "server-only";

import type { AuthenticatedSession } from "../auth/session-core";

export type GovernanceInterfaceItem = {
  id: string;
  title: string;
  slug: string;
  entityType: string;
  authorName: string;
  workflowStatus: string;
  publicationStatus: string;
  currentVersion: number;
  publishedVersion?: number | undefined;
  sourceIds: string[];
  requiredReviews: string[];
  completedReviews: string[];
  reviewerComments: string[];
};

export type GovernanceInterfaceModel = {
  actorName: string;
  items: GovernanceInterfaceItem[];
};

export function loadAuthorGovernanceModel(
  session: AuthenticatedSession
): GovernanceInterfaceModel {
  return {
    actorName: session.profile.displayName,
    items: isLocalGovernanceMode() ? localItemsForAuthor(session.profile.email) : []
  };
}

export function loadReviewGovernanceModel(
  session: AuthenticatedSession
): GovernanceInterfaceModel {
  return {
    actorName: session.profile.displayName,
    items: isLocalGovernanceMode() ? localItemsForReview() : []
  };
}

function isLocalGovernanceMode() {
  return (
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true"
  );
}

function localItemsForAuthor(email: string) {
  if (email !== "author@example.test" && email !== "admin@example.test") {
    return [];
  }

  return localGovernanceItems;
}

function localItemsForReview() {
  return localGovernanceItems.filter(
    (item) => item.workflowStatus === "Engineering review required"
  );
}

const localGovernanceItems: GovernanceInterfaceItem[] = [
  {
    id: "basic-fluid-pressure",
    title: "Basic Fluid Pressure",
    slug: "basic-fluid-pressure",
    entityType: "calculation_lesson",
    authorName: "Content Author",
    workflowStatus: "Engineering review required",
    publicationStatus: "draft",
    currentVersion: 2,
    publishedVersion: 1,
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2012"],
    requiredReviews: ["source", "equation", "safety", "engineering_approval"],
    completedReviews: ["source", "equation"],
    reviewerComments: ["Clarify the SI unit assumption before final approval."]
  }
];
