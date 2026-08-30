import type {
  ContentReviewStatus,
  PublicationStatus,
  StructuredLessonContent,
  WorkflowActor,
  WorkflowRole
} from "@industrial-learn/content-review-workflow";
import { ApplicationError, translateDatabaseError } from "./errors";
import { requireAuthenticated } from "./authorization";
import type { Caller } from "./domain";

export type GovernedContentType =
  | "theory_lesson"
  | "calculation_lesson"
  | "simulation_lesson"
  | "assessment"
  | "engineering_project"
  | "professional_development";

export type ContentWorkflowStatus =
  ContentReviewStatus | "Published" | "Revision required" | "Archived";

export type GovernanceDecision =
  "approved" | "changes_requested" | "rejected" | "comment";

export type GovernanceItem = {
  id: string;
  entityTable: string;
  entityId: string;
  entityType: GovernedContentType;
  slug: string;
  title: string;
  authorProfileId: string;
  currentVersion: number;
  publishedVersion?: number | undefined;
  workflowStatus: ContentWorkflowStatus;
  publicationStatus: PublicationStatus;
  rollbackReason?: string | undefined;
  archivedAt?: string | undefined;
};

export type GovernanceVersion = {
  id: string;
  governanceItemId: string;
  version: number;
  previousVersion?: number | undefined;
  snapshot: StructuredLessonContent;
  changeSummary: string;
  authorProfileId: string;
  sourceIds: string[];
  reviewStatus: ContentReviewStatus;
  publicationStatus: PublicationStatus;
  createdAt: string;
  publishedAt?: string | undefined;
  archivedAt?: string | undefined;
};

export type GovernanceReviewRecord = {
  id: string;
  governanceItemId: string;
  reviewerProfileId: string;
  reviewerRole: WorkflowRole;
  reviewType: ReviewRequirement;
  contentVersion: number;
  decision: GovernanceDecision;
  comments: string;
  reviewedAt: string;
  evidenceChecked: Record<string, boolean>;
  sourceIdsChecked: string[];
  equationIdsChecked: string[];
  simulationTestIdsChecked: string[];
  safetyReviewOutcome?: "passed" | "failed" | "not_applicable" | undefined;
};

export type ReviewRequirement =
  | "source"
  | "equation"
  | "simulation"
  | "safety"
  | "educational_structure"
  | "engineering_approval";

export type GovernanceAuditInput = {
  actorProfileId: string;
  action: string;
  entityId: string;
  metadata?: Record<string, string | number | boolean | null> | undefined;
};

export type ContentGovernanceRepository = {
  createItem(input: {
    item: GovernanceItem;
    version: GovernanceVersion;
  }): Promise<GovernanceItem>;
  getItem(itemId: string): Promise<GovernanceItem | null>;
  listDraftsForActor(actorProfileId: string): Promise<GovernanceItem[]>;
  listReviewQueue(): Promise<GovernanceItem[]>;
  updateItem(item: GovernanceItem): Promise<GovernanceItem>;
  createVersion(version: GovernanceVersion): Promise<GovernanceVersion>;
  getVersion(input: {
    itemId: string;
    version: number;
  }): Promise<GovernanceVersion | null>;
  listVersions(itemId: string): Promise<GovernanceVersion[]>;
  createReviewRecord(record: GovernanceReviewRecord): Promise<GovernanceReviewRecord>;
  listReviewRecords(itemId: string): Promise<GovernanceReviewRecord[]>;
  recordAudit(input: GovernanceAuditInput): Promise<void>;
  historicalAssessmentReferences(input: {
    itemId: string;
    version: number;
  }): Promise<number>;
};

export type ContentGovernanceTransactionRunner = {
  transaction<T>(operation: () => Promise<T>): Promise<T>;
};

export type ContentGovernanceRepositories = {
  content: ContentGovernanceRepository;
  transactions: ContentGovernanceTransactionRunner;
};

export type ContentGovernanceContext = {
  caller: Caller;
};

export function requirementsForContentType(
  type: GovernedContentType
): ReviewRequirement[] {
  switch (type) {
    case "theory_lesson":
      return ["source", "educational_structure", "engineering_approval"];
    case "calculation_lesson":
      return ["source", "equation", "safety", "engineering_approval"];
    case "simulation_lesson":
      return ["source", "equation", "simulation", "safety", "engineering_approval"];
    case "assessment":
      return ["source", "equation", "engineering_approval"];
    case "engineering_project":
      return ["source", "safety", "engineering_approval"];
    case "professional_development":
      return ["educational_structure"];
  }
}

export function createContentGovernanceServices(
  repositories: ContentGovernanceRepositories
) {
  return {
    async createDraft(
      context: ContentGovernanceContext,
      input: {
        entityType: GovernedContentType;
        slug: string;
        title: string;
        content: StructuredLessonContent;
        changeSummary?: string | undefined;
      }
    ) {
      const actor = actorFromContext(context);
      requireAnyWorkflowRole(actor, [
        "content_author",
        "lecturer",
        "administrator",
        "platform_owner"
      ]);
      const now = new Date().toISOString();
      const item: GovernanceItem = {
        id: createGovernanceId(input.slug),
        entityTable: entityTableForType(input.entityType),
        entityId: createGovernanceId(`${input.slug}-entity`),
        entityType: input.entityType,
        slug: input.slug,
        title: input.title,
        authorProfileId: actor.id,
        currentVersion: 1,
        workflowStatus: "Draft",
        publicationStatus: "draft"
      };
      const version = versionRecord({
        item,
        version: 1,
        previousVersion: undefined,
        content: input.content,
        changeSummary: input.changeSummary ?? "Initial draft created.",
        actorId: actor.id,
        now,
        sourceIds: []
      });

      return safeCall(() =>
        repositories.transactions.transaction(async () => {
          const created = await repositories.content.createItem({ item, version });
          await repositories.content.recordAudit({
            actorProfileId: actor.id,
            action: "content.draft.created",
            entityId: item.id,
            metadata: { version: 1 }
          });
          return created;
        })
      );
    },

    async editDraft(
      context: ContentGovernanceContext,
      input: {
        itemId: string;
        content: StructuredLessonContent;
        changeSummary: string;
        sourceIds?: string[] | undefined;
      }
    ) {
      const actor = actorFromContext(context);
      const item = await loadItem(repositories, input.itemId);
      requireAuthorOrAdmin(actor, item);
      const now = new Date().toISOString();
      const nextVersion = item.currentVersion + 1;
      const updated: GovernanceItem = {
        ...item,
        currentVersion: nextVersion,
        workflowStatus: "Draft",
        publicationStatus: "draft"
      };
      const version = versionRecord({
        item: updated,
        version: nextVersion,
        previousVersion: item.currentVersion,
        content: input.content,
        changeSummary: input.changeSummary,
        actorId: actor.id,
        now,
        sourceIds: input.sourceIds ?? []
      });

      return safeCall(() =>
        repositories.transactions.transaction(async () => {
          await repositories.content.createVersion(version);
          const saved = await repositories.content.updateItem(updated);
          await repositories.content.recordAudit({
            actorProfileId: actor.id,
            action: "content.version.edited",
            entityId: item.id,
            metadata: { version: nextVersion }
          });
          return saved;
        })
      );
    },

    async addSourceReferences(
      context: ContentGovernanceContext,
      input: {
        itemId: string;
        sourceIds: string[];
      }
    ) {
      const actor = actorFromContext(context);
      const item = await loadItem(repositories, input.itemId);
      requireAnyWorkflowRole(actor, [
        "content_author",
        "lecturer",
        "engineering_reviewer",
        "administrator",
        "platform_owner"
      ]);
      if (input.sourceIds.length === 0) {
        throw new ApplicationError("invalid_input", {
          message: "At least one source ID is required."
        });
      }
      const version = await loadCurrentVersion(repositories, item);
      const updatedVersion = {
        ...version,
        sourceIds: input.sourceIds,
        reviewStatus: "Source checked" as const
      };
      const updatedItem = { ...item, workflowStatus: "Source checked" as const };

      return safeCall(() =>
        repositories.transactions.transaction(async () => {
          await repositories.content.createVersion(updatedVersion);
          const saved = await repositories.content.updateItem(updatedItem);
          await repositories.content.recordAudit({
            actorProfileId: actor.id,
            action: "content.sources.attached",
            entityId: item.id,
            metadata: { sourceCount: input.sourceIds.length }
          });
          return saved;
        })
      );
    },

    async submitForReview(context: ContentGovernanceContext, input: { itemId: string }) {
      const actor = actorFromContext(context);
      const item = await loadItem(repositories, input.itemId);
      requireAuthorOrAdmin(actor, item);
      const updated = { ...item, workflowStatus: "Engineering review required" as const };
      return saveStatus(repositories, actor, updated, "content.review.submitted");
    },

    async recordReview(
      context: ContentGovernanceContext,
      input: {
        itemId: string;
        reviewType: ReviewRequirement;
        decision: GovernanceDecision;
        comments: string;
        sourceIdsChecked?: string[] | undefined;
        equationIdsChecked?: string[] | undefined;
        simulationTestIdsChecked?: string[] | undefined;
        safetyReviewOutcome?: "passed" | "failed" | "not_applicable" | undefined;
        allowSelfApproval?: boolean | undefined;
      }
    ) {
      const actor = actorFromContext(context);
      const item = await loadItem(repositories, input.itemId);
      requireReviewAuthority(actor, input.reviewType);
      if (
        input.decision === "approved" &&
        input.reviewType === "engineering_approval" &&
        actor.id === item.authorProfileId &&
        !input.allowSelfApproval
      ) {
        throw new ApplicationError("access_denied", {
          message: "Authors cannot approve their own technical content by default."
        });
      }
      const now = new Date().toISOString();
      const record: GovernanceReviewRecord = {
        id: createGovernanceId(`${item.id}-${input.reviewType}-${now}`),
        governanceItemId: item.id,
        reviewerProfileId: actor.id,
        reviewerRole: primaryWorkflowRole(actor),
        reviewType: input.reviewType,
        contentVersion: item.currentVersion,
        decision: input.decision,
        comments: input.comments,
        reviewedAt: now,
        evidenceChecked: { checked: input.decision === "approved" },
        sourceIdsChecked: input.sourceIdsChecked ?? [],
        equationIdsChecked: input.equationIdsChecked ?? [],
        simulationTestIdsChecked: input.simulationTestIdsChecked ?? [],
        safetyReviewOutcome: input.safetyReviewOutcome
      };
      const updated = {
        ...item,
        workflowStatus:
          input.decision === "changes_requested"
            ? ("Revision required" as const)
            : statusAfterReview(item, input.reviewType)
      };

      return safeCall(() =>
        repositories.transactions.transaction(async () => {
          await repositories.content.createReviewRecord(record);
          const saved = await repositories.content.updateItem(updated);
          await repositories.content.recordAudit({
            actorProfileId: actor.id,
            action: `content.review.${input.decision}`,
            entityId: item.id,
            metadata: { reviewType: input.reviewType, version: item.currentVersion }
          });
          return saved;
        })
      );
    },

    async publish(context: ContentGovernanceContext, input: { itemId: string }) {
      const actor = actorFromContext(context);
      requireAnyWorkflowRole(actor, ["administrator", "platform_owner"]);
      const item = await loadItem(repositories, input.itemId);
      const version = await loadCurrentVersion(repositories, item);
      const reviews = await repositories.content.listReviewRecords(item.id);
      const gateErrors = publicationGateErrors(item, version, reviews);
      if (gateErrors.length > 0) {
        throw new ApplicationError("conflict", {
          message: `Content cannot be published: ${gateErrors.join(" ")}`
        });
      }
      const publishedVersion = {
        ...version,
        publicationStatus: "published" as const,
        publishedAt: new Date().toISOString()
      };
      const updated: GovernanceItem = {
        ...item,
        workflowStatus: "Published",
        publicationStatus: "published",
        publishedVersion: item.currentVersion
      };
      return safeCall(() =>
        repositories.transactions.transaction(async () => {
          await repositories.content.createVersion(publishedVersion);
          const saved = await repositories.content.updateItem(updated);
          await repositories.content.recordAudit({
            actorProfileId: actor.id,
            action: "content.published",
            entityId: item.id,
            metadata: { version: item.currentVersion }
          });
          return saved;
        })
      );
    },

    async rollback(
      context: ContentGovernanceContext,
      input: {
        itemId: string;
        targetVersion: number;
        reason: string;
      }
    ) {
      const actor = actorFromContext(context);
      requireAnyWorkflowRole(actor, ["administrator", "platform_owner"]);
      const item = await loadItem(repositories, input.itemId);
      const target = await repositories.content.getVersion({
        itemId: item.id,
        version: input.targetVersion
      });
      if (!target || target.publicationStatus !== "published") {
        throw new ApplicationError("resource_not_found");
      }
      const historicalReferences =
        await repositories.content.historicalAssessmentReferences({
          itemId: item.id,
          version: item.publishedVersion ?? item.currentVersion
        });
      const updated: GovernanceItem = {
        ...item,
        currentVersion: target.version,
        publishedVersion: target.version,
        workflowStatus: "Published",
        publicationStatus: "published",
        rollbackReason: input.reason
      };

      return safeCall(() =>
        repositories.transactions.transaction(async () => {
          const saved = await repositories.content.updateItem(updated);
          await repositories.content.recordAudit({
            actorProfileId: actor.id,
            action: "content.publication.rolled_back",
            entityId: item.id,
            metadata: {
              targetVersion: target.version,
              preservedHistoricalReferences: historicalReferences
            }
          });
          return saved;
        })
      );
    },

    async archive(
      context: ContentGovernanceContext,
      input: { itemId: string; reason: string }
    ) {
      const actor = actorFromContext(context);
      requireAnyWorkflowRole(actor, ["administrator", "platform_owner"]);
      const item = await loadItem(repositories, input.itemId);
      const updated: GovernanceItem = {
        ...item,
        workflowStatus: "Archived",
        publicationStatus: "archived",
        archivedAt: new Date().toISOString()
      };
      return saveStatus(repositories, actor, updated, "content.archived", {
        reason: input.reason
      });
    },

    async listDrafts(context: ContentGovernanceContext) {
      const actor = actorFromContext(context);
      requireAnyWorkflowRole(actor, [
        "content_author",
        "lecturer",
        "engineering_reviewer",
        "administrator",
        "platform_owner"
      ]);
      return repositories.content.listDraftsForActor(actor.id);
    },

    async listReviewQueue(context: ContentGovernanceContext) {
      const actor = actorFromContext(context);
      requireAnyWorkflowRole(actor, [
        "engineering_reviewer",
        "administrator",
        "platform_owner"
      ]);
      return repositories.content.listReviewQueue();
    },

    publicationGateErrors
  };
}

export function publicationGateErrors(
  item: GovernanceItem,
  version: GovernanceVersion,
  reviews: GovernanceReviewRecord[]
) {
  const requirements = requirementsForContentType(item.entityType);
  const errors: string[] = [];

  if (requirements.includes("source") && version.sourceIds.length === 0) {
    errors.push("Valid source IDs are required.");
  }
  if (requirements.includes("equation") && !hasApprovedReview(reviews, "equation")) {
    errors.push("Equation review is required.");
  }
  if (requirements.includes("simulation") && !hasApprovedReview(reviews, "simulation")) {
    errors.push("Simulation evidence review is required.");
  }
  if (requirements.includes("safety") && !hasApprovedReview(reviews, "safety")) {
    errors.push("Safety review is required.");
  }
  if (
    requirements.includes("educational_structure") &&
    !hasApprovedReview(reviews, "educational_structure") &&
    item.entityType === "professional_development"
  ) {
    errors.push("Educational structure review is required.");
  }
  if (requirements.includes("engineering_approval")) {
    const approval = reviews.find(
      (review) =>
        review.reviewType === "engineering_approval" &&
        review.decision === "approved" &&
        review.reviewerProfileId !== item.authorProfileId
    );
    if (!approval) {
      errors.push("Named independent engineering reviewer approval is required.");
    }
  }
  if (item.currentVersion !== version.version) {
    errors.push("Current content version must be reviewed before publication.");
  }

  return errors;
}

async function safeCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    throw translateDatabaseError(error);
  }
}

async function loadItem(repositories: ContentGovernanceRepositories, itemId: string) {
  const item = await repositories.content.getItem(itemId);
  if (!item) {
    throw new ApplicationError("resource_not_found");
  }
  return item;
}

async function loadCurrentVersion(
  repositories: ContentGovernanceRepositories,
  item: GovernanceItem
) {
  const version = await repositories.content.getVersion({
    itemId: item.id,
    version: item.currentVersion
  });
  if (!version) {
    throw new ApplicationError("resource_not_found");
  }
  return version;
}

function actorFromContext(context: ContentGovernanceContext): WorkflowActor {
  const principal = requireAuthenticated(context.caller);
  const roles = principal.roles.filter((role): role is WorkflowRole =>
    [
      "content_author",
      "lecturer",
      "engineering_reviewer",
      "administrator",
      "platform_owner"
    ].includes(role)
  );
  return {
    id: principal.profileId,
    displayName: principal.email,
    roles
  };
}

function requireAnyWorkflowRole(actor: WorkflowActor, roles: WorkflowRole[]) {
  if (!roles.some((role) => actor.roles.includes(role))) {
    throw new ApplicationError("access_denied");
  }
}

function requireAuthorOrAdmin(actor: WorkflowActor, item: GovernanceItem) {
  if (
    actor.id === item.authorProfileId ||
    actor.roles.includes("administrator") ||
    actor.roles.includes("platform_owner")
  ) {
    return;
  }
  throw new ApplicationError("access_denied");
}

function requireReviewAuthority(actor: WorkflowActor, requirement: ReviewRequirement) {
  if (actor.roles.includes("administrator")) {
    return;
  }
  if (requirement === "educational_structure" && actor.roles.includes("lecturer")) {
    return;
  }
  if (actor.roles.includes("engineering_reviewer")) {
    return;
  }
  throw new ApplicationError("access_denied");
}

function primaryWorkflowRole(actor: WorkflowActor): WorkflowRole {
  return (
    (
      [
        "engineering_reviewer",
        "lecturer",
        "administrator",
        "content_author",
        "platform_owner"
      ] as const
    ).find((role) => actor.roles.includes(role)) ?? "content_author"
  );
}

function hasApprovedReview(reviews: GovernanceReviewRecord[], type: ReviewRequirement) {
  return reviews.some(
    (review) => review.reviewType === type && review.decision === "approved"
  );
}

function statusAfterReview(
  item: GovernanceItem,
  reviewType: ReviewRequirement
): ContentWorkflowStatus {
  if (reviewType === "source") {
    return "Source checked";
  }
  if (reviewType === "equation") {
    return "Equation checked";
  }
  if (reviewType === "simulation") {
    return "Simulation checked";
  }
  if (reviewType === "engineering_approval") {
    return "Approved for student use";
  }
  return item.workflowStatus;
}

async function saveStatus(
  repositories: ContentGovernanceRepositories,
  actor: WorkflowActor,
  item: GovernanceItem,
  action: string,
  metadata: Record<string, string | number | boolean | null> = {}
) {
  return safeCall(() =>
    repositories.transactions.transaction(async () => {
      const saved = await repositories.content.updateItem(item);
      await repositories.content.recordAudit({
        actorProfileId: actor.id,
        action,
        entityId: item.id,
        metadata
      });
      return saved;
    })
  );
}

function versionRecord(input: {
  item: GovernanceItem;
  version: number;
  previousVersion?: number | undefined;
  content: StructuredLessonContent;
  changeSummary: string;
  actorId: string;
  now: string;
  sourceIds: string[];
}): GovernanceVersion {
  return {
    id: `${input.item.id}-v${input.version}`,
    governanceItemId: input.item.id,
    version: input.version,
    previousVersion: input.previousVersion,
    snapshot: input.content,
    changeSummary: input.changeSummary,
    authorProfileId: input.actorId,
    sourceIds: input.sourceIds,
    reviewStatus: "Draft",
    publicationStatus: "draft",
    createdAt: input.now
  };
}

function entityTableForType(type: GovernedContentType) {
  switch (type) {
    case "assessment":
      return "assessments";
    case "engineering_project":
      return "projects";
    default:
      return "lessons";
  }
}

function createGovernanceId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
