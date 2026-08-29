import {
  evaluatePublicationVisibility,
  type ContentAudience,
  type ContentVersion,
  type PublicationAccessContext,
  type PublicationVisibilityDecision,
  type PublicationStatus,
  type ContentReviewStatus
} from "@industrial-learn/content-review-workflow/publication-visibility";

import type { StaticSourceRecord } from "./source-records";

export type StaticGovernedContent = {
  id?: string;
  publicationStatus?: unknown;
  reviewStatus?: unknown;
  technicalReviewStatus?: unknown;
  version?: unknown;
  archivedAt?: unknown;
  authorProfileId?: unknown;
  sourceIds?: readonly string[];
};

export type StaticPublicationAuthority = {
  currentVersion?: ContentVersion | null;
  publishedVersion?: ContentVersion | null;
};

export type StaticPublicationVisibilityInput = {
  audience: ContentAudience;
  record: StaticGovernedContent;
  sourceRecords: readonly StaticSourceRecord[];
  authority?: StaticPublicationAuthority;
  access?: PublicationAccessContext;
};

export function evaluateStaticPublicationVisibility(
  input: StaticPublicationVisibilityInput
): PublicationVisibilityDecision {
  const reviewStatus = input.record.reviewStatus ?? input.record.technicalReviewStatus;

  return evaluatePublicationVisibility({
    audience: input.audience,
    metadata: {
      publicationStatus: (input.record.publicationStatus ??
        null) as PublicationStatus | null,
      reviewStatus: (reviewStatus ?? null) as ContentReviewStatus | null,
      version: (input.record.version ?? null) as ContentVersion | null,
      archivedAt: (input.record.archivedAt ?? null) as string | null,
      evidenceStatus: aggregateSourceEvidence(
        input.record.sourceIds ?? [],
        input.sourceRecords
      ),
      ...(typeof input.record.authorProfileId === "string"
        ? { authorProfileId: input.record.authorProfileId }
        : {}),
      ...(input.authority?.currentVersion !== undefined
        ? { currentVersion: input.authority.currentVersion }
        : {}),
      ...(input.authority?.publishedVersion !== undefined
        ? { publishedVersion: input.authority.publishedVersion }
        : {})
    },
    ...(input.access ? { access: input.access } : {})
  });
}

export function aggregateSourceEvidence(
  sourceIds: readonly string[],
  sourceRecords: readonly StaticSourceRecord[]
) {
  if (sourceIds.length === 0) {
    return "missing" as const;
  }

  const byId = new Map(sourceRecords.map((source) => [source.id, source]));
  const statuses = sourceIds.map((sourceId) => byId.get(sourceId)?.evidenceStatus);

  if (
    statuses.some(
      (status) => status !== "approved" && status !== "partial" && status !== "missing"
    ) ||
    statuses.some((status) => status === "missing")
  ) {
    return "missing" as const;
  }
  if (statuses.some((status) => status === "partial")) {
    return "partial" as const;
  }
  return "approved" as const;
}
