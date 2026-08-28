export const CONTENT_REVIEW_STATUSES = [
  "Draft",
  "Source required",
  "Source checked",
  "Equation checked",
  "Simulation checked",
  "Engineering review required",
  "Approved for student use"
] as const;

export const PUBLICATION_STATUSES = [
  "draft",
  "internal",
  "scheduled",
  "published",
  "archived"
] as const;

export const CONTENT_AUDIENCES = [
  "public",
  "student",
  "lecturer",
  "content_author",
  "engineering_reviewer",
  "administrator"
] as const;

export const SOURCE_EVIDENCE_STATUSES = ["missing", "partial", "approved"] as const;

export type ContentReviewStatus = (typeof CONTENT_REVIEW_STATUSES)[number];
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];
export type ContentAudience = (typeof CONTENT_AUDIENCES)[number];
export type SourceEvidenceStatus = (typeof SOURCE_EVIDENCE_STATUSES)[number];
export type ContentVersion = string | number;

export type PublicationVisibilityMetadata = {
  publicationStatus?: PublicationStatus | null;
  reviewStatus?: ContentReviewStatus | null;
  version?: ContentVersion | null;
  currentVersion?: ContentVersion | null;
  publishedVersion?: ContentVersion | null;
  archivedAt?: string | null;
  evidenceStatus?: SourceEvidenceStatus | null;
  authorProfileId?: string | null;
};

export type PublicationAccessContext = {
  actorProfileId?: string | null;
  contentAuthorAuthorized?: boolean;
  lecturerAuthorized?: boolean;
  reviewerAuthorized?: boolean;
  administratorAuthorized?: boolean;
};

export type PublicationVisibilityReason =
  | "public-current-version"
  | "internal-author"
  | "internal-authorized-content-author"
  | "internal-authorized-lecturer"
  | "internal-authorized-reviewer"
  | "internal-authorized-administrator"
  | "missing-publication-status"
  | "invalid-publication-status"
  | "publication-not-started"
  | "not-published"
  | "archived"
  | "missing-review-status"
  | "invalid-review-status"
  | "review-not-approved"
  | "missing-evidence-status"
  | "invalid-evidence-status"
  | "evidence-not-approved"
  | "missing-version"
  | "missing-published-version"
  | "version-not-current-published"
  | "invalid-version-relationship"
  | "internal-authorization-required";

export type PublicationVisibilityDecision = {
  visible: boolean;
  scope: "public" | "internal" | "none";
  reason: PublicationVisibilityReason;
};

export type PublicationVisibilityInput = {
  audience: ContentAudience;
  metadata: PublicationVisibilityMetadata;
  access?: PublicationAccessContext;
};

export function evaluatePublicationVisibility(
  input: PublicationVisibilityInput
): PublicationVisibilityDecision {
  const publicDecision = evaluatePublicVisibility(input.metadata);

  if (input.audience === "public" || input.audience === "student") {
    return publicDecision;
  }

  if (publicDecision.visible) {
    return publicDecision;
  }

  const access = input.access ?? {};

  switch (input.audience) {
    case "content_author":
      if (
        hasIdentity(access.actorProfileId) &&
        hasIdentity(input.metadata.authorProfileId) &&
        access.actorProfileId === input.metadata.authorProfileId
      ) {
        return visibleInternally("internal-author");
      }
      return access.contentAuthorAuthorized
        ? visibleInternally("internal-authorized-content-author")
        : denied("internal-authorization-required");
    case "lecturer":
      return access.lecturerAuthorized
        ? visibleInternally("internal-authorized-lecturer")
        : denied("internal-authorization-required");
    case "engineering_reviewer":
      return access.reviewerAuthorized
        ? visibleInternally("internal-authorized-reviewer")
        : denied("internal-authorization-required");
    case "administrator":
      return access.administratorAuthorized
        ? visibleInternally("internal-authorized-administrator")
        : denied("internal-authorization-required");
  }
}

export function isContentVisible(input: PublicationVisibilityInput) {
  return evaluatePublicationVisibility(input).visible;
}

function evaluatePublicVisibility(
  metadata: PublicationVisibilityMetadata
): PublicationVisibilityDecision {
  if (metadata.publicationStatus === undefined || metadata.publicationStatus === null) {
    return denied("missing-publication-status");
  }
  if (!isPublicationStatus(metadata.publicationStatus)) {
    return denied("invalid-publication-status");
  }
  if (metadata.publicationStatus === "scheduled") {
    return denied("publication-not-started");
  }
  if (metadata.publicationStatus === "archived" || hasIdentity(metadata.archivedAt)) {
    return denied("archived");
  }
  if (metadata.publicationStatus !== "published") {
    return denied("not-published");
  }

  if (metadata.reviewStatus === undefined || metadata.reviewStatus === null) {
    return denied("missing-review-status");
  }
  if (!isContentReviewStatus(metadata.reviewStatus)) {
    return denied("invalid-review-status");
  }
  if (metadata.reviewStatus !== "Approved for student use") {
    return denied("review-not-approved");
  }

  if (metadata.evidenceStatus === undefined || metadata.evidenceStatus === null) {
    return denied("missing-evidence-status");
  }
  if (!isSourceEvidenceStatus(metadata.evidenceStatus)) {
    return denied("invalid-evidence-status");
  }
  if (metadata.evidenceStatus !== "approved") {
    return denied("evidence-not-approved");
  }

  if (!isContentVersion(metadata.version)) {
    return denied("missing-version");
  }
  if (!isContentVersion(metadata.publishedVersion)) {
    return denied("missing-published-version");
  }
  if (!sameVersion(metadata.version, metadata.publishedVersion)) {
    return denied("version-not-current-published");
  }
  if (
    isContentVersion(metadata.currentVersion) &&
    typeof metadata.currentVersion === "number" &&
    typeof metadata.publishedVersion === "number" &&
    metadata.publishedVersion > metadata.currentVersion
  ) {
    return denied("invalid-version-relationship");
  }

  return {
    visible: true,
    scope: "public",
    reason: "public-current-version"
  };
}

function isPublicationStatus(value: unknown): value is PublicationStatus {
  return PUBLICATION_STATUSES.includes(value as PublicationStatus);
}

function isContentReviewStatus(value: unknown): value is ContentReviewStatus {
  return CONTENT_REVIEW_STATUSES.includes(value as ContentReviewStatus);
}

function isSourceEvidenceStatus(value: unknown): value is SourceEvidenceStatus {
  return SOURCE_EVIDENCE_STATUSES.includes(value as SourceEvidenceStatus);
}

function isContentVersion(value: unknown): value is ContentVersion {
  return (
    (typeof value === "number" && Number.isInteger(value) && value > 0) ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function sameVersion(left: ContentVersion, right: ContentVersion) {
  return typeof left === typeof right && left === right;
}

function hasIdentity(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function visibleInternally(
  reason: Extract<PublicationVisibilityReason, `internal-${string}`>
): PublicationVisibilityDecision {
  return { visible: true, scope: "internal", reason };
}

function denied(reason: PublicationVisibilityReason): PublicationVisibilityDecision {
  return { visible: false, scope: "none", reason };
}
