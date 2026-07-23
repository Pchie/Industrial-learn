export const CONTENT_REVIEW_STATUSES = [
  "Draft",
  "Source required",
  "Source checked",
  "Equation checked",
  "Simulation checked",
  "Engineering review required",
  "Approved for student use"
] as const;

export type ContentReviewStatus = (typeof CONTENT_REVIEW_STATUSES)[number];

export type PublicationStatus = "draft" | "published" | "archived";

export type WorkflowRole =
  "content_author" | "lecturer" | "engineering_reviewer" | "administrator";

export type WorkflowActor = {
  id: string;
  displayName: string;
  roles: WorkflowRole[];
  policy?: {
    allowSelfApproval?: boolean;
  };
};

export type SourceReference = {
  sourceId: string;
  approvalStatus: "Source checked" | "Approved for student use";
};

export type StructuredLessonContent = {
  title: string;
  description: string;
  sections: Record<string, unknown>;
};

export type ReviewRecord = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  decision: "approved" | "changes_requested" | "rejected" | "comment";
  reviewStatus: ContentReviewStatus;
  notes: string;
  sourceCheckPassed: boolean;
  equationCheckPassed: boolean;
  simulationCheckPassed: boolean;
  safetyCheckPassed: boolean;
  reviewedAt: string;
};

export type RevisionRecord = {
  version: number;
  snapshot: StructuredLessonContent;
  changeSummary: string;
  actorId: string;
  createdAt: string;
};

export type AuditEvent = {
  actorId: string;
  action: string;
  entityId: string;
  severity: "info" | "warning" | "security";
  occurredAt: string;
  metadata: Record<string, string | number | boolean>;
};

export type LessonWorkflowRecord = {
  id: string;
  slug: string;
  authorId: string;
  content: StructuredLessonContent;
  reviewStatus: ContentReviewStatus;
  publicationStatus: PublicationStatus;
  version: number;
  sourceReferences: SourceReference[];
  equationReview?: {
    reviewerId: string;
    reviewedAt: string;
    equationIds: string[];
    passed: boolean;
  };
  simulationReview?: {
    reviewerId: string;
    reviewedAt: string;
    testCaseIds: string[];
    passed: boolean;
  };
  safetyReview?: {
    reviewerId: string;
    reviewedAt: string;
    passed: boolean;
    notes: string;
  };
  engineeringApproval?: {
    reviewerId: string;
    reviewerName: string;
    reviewedAt: string;
  };
  revisions: RevisionRecord[];
  reviewRecords: ReviewRecord[];
  auditLog: AuditEvent[];
  publishedVersions: RevisionRecord[];
};

export type WorkflowResult = {
  record: LessonWorkflowRecord;
  auditEvent: AuditEvent;
};

export function createDraftLesson({
  actor,
  content,
  id,
  now,
  slug
}: {
  actor: WorkflowActor;
  content: StructuredLessonContent;
  id: string;
  now: string;
  slug: string;
}): WorkflowResult {
  requireAnyRole(
    actor,
    ["content_author", "lecturer", "administrator"],
    "create draft lesson"
  );

  const recordWithoutAudit: LessonWorkflowRecord = {
    id,
    slug,
    authorId: actor.id,
    content,
    reviewStatus: "Draft",
    publicationStatus: "draft",
    version: 1,
    sourceReferences: [],
    revisions: [
      {
        version: 1,
        snapshot: content,
        changeSummary: "Initial draft created.",
        actorId: actor.id,
        createdAt: now
      }
    ],
    reviewRecords: [],
    auditLog: [],
    publishedVersions: []
  };
  const auditEvent = createAuditEvent(actor, id, "lesson.draft.created", "info", now, {
    version: 1
  });
  const record = appendAudit(recordWithoutAudit, auditEvent);

  return { record, auditEvent };
}

export function editStructuredLessonContent({
  actor,
  changeSummary,
  content,
  now,
  record
}: {
  actor: WorkflowActor;
  changeSummary: string;
  content: StructuredLessonContent;
  now: string;
  record: LessonWorkflowRecord;
}): WorkflowResult {
  requireCanEdit(actor, record);
  if (record.publicationStatus === "published") {
    throw new Error(
      "Published content must be rolled back or copied to a new draft before editing."
    );
  }

  const nextVersion = record.version + 1;
  const updated: LessonWorkflowRecord = {
    ...record,
    content,
    version: nextVersion,
    reviewStatus: "Draft",
    revisions: [
      ...record.revisions,
      {
        version: nextVersion,
        snapshot: content,
        changeSummary,
        actorId: actor.id,
        createdAt: now
      }
    ]
  };
  delete updated.engineeringApproval;
  const auditEvent = createAuditEvent(
    actor,
    record.id,
    "lesson.content.edited",
    "info",
    now,
    {
      version: nextVersion
    }
  );

  return withAudit(updated, auditEvent);
}

export function addApprovedSourceReferences({
  actor,
  now,
  record,
  sourceReferences
}: {
  actor: WorkflowActor;
  now: string;
  record: LessonWorkflowRecord;
  sourceReferences: SourceReference[];
}): WorkflowResult {
  requireAnyRole(
    actor,
    ["content_author", "lecturer", "engineering_reviewer", "administrator"],
    "add sources"
  );
  if (sourceReferences.length === 0) {
    throw new Error("At least one approved source reference is required.");
  }
  if (
    sourceReferences.some(
      (source) =>
        !["Source checked", "Approved for student use"].includes(source.approvalStatus)
    )
  ) {
    throw new Error("Only checked or approved source references may be attached.");
  }

  const updated = {
    ...record,
    sourceReferences,
    reviewStatus: "Source checked" as ContentReviewStatus
  };
  const auditEvent = createAuditEvent(
    actor,
    record.id,
    "lesson.sources.added",
    "info",
    now,
    {
      sourceCount: sourceReferences.length
    }
  );

  return withAudit(updated, auditEvent);
}

export function reviewEquations({
  actor,
  equationIds,
  now,
  passed,
  record
}: {
  actor: WorkflowActor;
  equationIds: string[];
  now: string;
  passed: boolean;
  record: LessonWorkflowRecord;
}): WorkflowResult {
  requireReviewer(actor, "review equations");
  if (equationIds.length === 0) {
    throw new Error("Equation review requires at least one equation ID.");
  }

  const updated = {
    ...record,
    equationReview: { reviewerId: actor.id, reviewedAt: now, equationIds, passed },
    reviewStatus: passed
      ? ("Equation checked" as ContentReviewStatus)
      : record.reviewStatus
  };
  const auditEvent = createAuditEvent(
    actor,
    record.id,
    "lesson.equations.reviewed",
    "info",
    now,
    { passed }
  );

  return withAudit(updated, auditEvent);
}

export function recordSimulationTests({
  actor,
  now,
  passed,
  record,
  testCaseIds
}: {
  actor: WorkflowActor;
  now: string;
  passed: boolean;
  record: LessonWorkflowRecord;
  testCaseIds: string[];
}): WorkflowResult {
  requireReviewer(actor, "record simulation tests");
  if (testCaseIds.length === 0) {
    throw new Error("Simulation review requires test case IDs.");
  }

  const updated = {
    ...record,
    simulationReview: { reviewerId: actor.id, reviewedAt: now, testCaseIds, passed },
    reviewStatus: passed
      ? ("Simulation checked" as ContentReviewStatus)
      : record.reviewStatus
  };
  const auditEvent = createAuditEvent(
    actor,
    record.id,
    "lesson.simulation.tests.recorded",
    "info",
    now,
    {
      passed
    }
  );

  return withAudit(updated, auditEvent);
}

export function recordSafetyReview({
  actor,
  now,
  notes,
  passed,
  record
}: {
  actor: WorkflowActor;
  now: string;
  notes: string;
  passed: boolean;
  record: LessonWorkflowRecord;
}): WorkflowResult {
  requireReviewer(actor, "record safety review");

  const updated = {
    ...record,
    safetyReview: { reviewerId: actor.id, reviewedAt: now, passed, notes }
  };
  const auditEvent = createAuditEvent(
    actor,
    record.id,
    "lesson.safety.reviewed",
    "info",
    now,
    { passed }
  );

  return withAudit(updated, auditEvent);
}

export function addReviewerComments({
  actor,
  notes,
  now,
  record
}: {
  actor: WorkflowActor;
  notes: string;
  now: string;
  record: LessonWorkflowRecord;
}): WorkflowResult {
  requireAnyRole(
    actor,
    ["lecturer", "engineering_reviewer", "administrator"],
    "add reviewer comments"
  );

  const reviewRecord = createReviewRecord(
    actor,
    "comment",
    record.reviewStatus,
    notes,
    now,
    record
  );
  const updated = { ...record, reviewRecords: [...record.reviewRecords, reviewRecord] };
  const auditEvent = createAuditEvent(
    actor,
    record.id,
    "lesson.review.comment.added",
    "info",
    now,
    {}
  );

  return withAudit(updated, auditEvent);
}

export function requestChanges({
  actor,
  notes,
  now,
  record
}: {
  actor: WorkflowActor;
  notes: string;
  now: string;
  record: LessonWorkflowRecord;
}): WorkflowResult {
  requireAnyRole(
    actor,
    ["lecturer", "engineering_reviewer", "administrator"],
    "request changes"
  );

  const reviewRecord = createReviewRecord(
    actor,
    "changes_requested",
    record.reviewStatus,
    notes,
    now,
    record
  );
  const updated = {
    ...record,
    reviewStatus: "Draft" as ContentReviewStatus,
    reviewRecords: [...record.reviewRecords, reviewRecord]
  };
  const auditEvent = createAuditEvent(
    actor,
    record.id,
    "lesson.review.changes_requested",
    "warning",
    now,
    {}
  );

  return withAudit(updated, auditEvent);
}

export function approveOrRejectContent({
  actor,
  decision,
  notes,
  now,
  policy,
  record,
  requiresSafetyReview,
  requiresSimulationReview
}: {
  actor: WorkflowActor;
  decision: "approved" | "rejected";
  notes: string;
  now: string;
  policy?: { allowSelfApproval?: boolean };
  record: LessonWorkflowRecord;
  requiresSafetyReview: boolean;
  requiresSimulationReview: boolean;
}): WorkflowResult {
  requireReviewer(actor, `${decision} content`);
  enforceSelfApprovalPolicy(actor, record, policy);

  if (decision === "rejected") {
    const reviewRecord = createReviewRecord(
      actor,
      "rejected",
      record.reviewStatus,
      notes,
      now,
      record
    );
    const updated = { ...record, reviewRecords: [...record.reviewRecords, reviewRecord] };
    const auditEvent = createAuditEvent(
      actor,
      record.id,
      "lesson.review.rejected",
      "warning",
      now,
      {}
    );
    return withAudit(updated, auditEvent);
  }

  const gateErrors = publicationGateErrors(record, {
    requiresSafetyReview,
    requiresSimulationReview,
    requireEngineeringApproval: false
  });
  if (gateErrors.length > 0) {
    throw new Error(`Content cannot be approved: ${gateErrors.join(" ")}`);
  }

  const reviewRecord = createReviewRecord(
    actor,
    "approved",
    "Approved for student use",
    notes,
    now,
    record
  );
  const updated = {
    ...record,
    reviewStatus: "Approved for student use" as ContentReviewStatus,
    engineeringApproval: {
      reviewerId: actor.id,
      reviewerName: actor.displayName,
      reviewedAt: now
    },
    reviewRecords: [...record.reviewRecords, reviewRecord]
  };
  const auditEvent = createAuditEvent(
    actor,
    record.id,
    "lesson.review.approved",
    "info",
    now,
    {
      version: record.version
    }
  );

  return withAudit(updated, auditEvent);
}

export function publishApprovedContent({
  actor,
  now,
  record,
  requiresSafetyReview,
  requiresSimulationReview
}: {
  actor: WorkflowActor;
  now: string;
  record: LessonWorkflowRecord;
  requiresSafetyReview: boolean;
  requiresSimulationReview: boolean;
}): WorkflowResult {
  requireAnyRole(actor, ["administrator"], "publish approved content");

  const gateErrors = publicationGateErrors(record, {
    requiresSafetyReview,
    requiresSimulationReview,
    requireEngineeringApproval: true
  });
  if (gateErrors.length > 0) {
    throw new Error(`Content cannot be published: ${gateErrors.join(" ")}`);
  }

  const publishedVersion = currentRevision(record);
  const updated = {
    ...record,
    publicationStatus: "published" as PublicationStatus,
    publishedVersions: [...record.publishedVersions, publishedVersion]
  };
  const auditEvent = createAuditEvent(actor, record.id, "lesson.published", "info", now, {
    version: record.version
  });

  return withAudit(updated, auditEvent);
}

export function rollBackPublication({
  actor,
  now,
  record,
  targetVersion
}: {
  actor: WorkflowActor;
  now: string;
  record: LessonWorkflowRecord;
  targetVersion: number;
}): WorkflowResult {
  requireAnyRole(actor, ["administrator"], "roll back publication");
  const revision = record.revisions.find((item) => item.version === targetVersion);
  if (!revision) {
    throw new Error(`Revision ${targetVersion} does not exist.`);
  }

  const updated = {
    ...record,
    content: revision.snapshot,
    version: revision.version,
    publicationStatus: "archived" as PublicationStatus
  };
  const auditEvent = createAuditEvent(
    actor,
    record.id,
    "lesson.publication.rolled_back",
    "warning",
    now,
    {
      targetVersion
    }
  );

  return withAudit(updated, auditEvent);
}

export function viewRevisionHistory(actor: WorkflowActor, record: LessonWorkflowRecord) {
  requireAnyRole(
    actor,
    ["content_author", "lecturer", "engineering_reviewer", "administrator"],
    "view revision history"
  );
  if (
    actor.id !== record.authorId &&
    !hasAnyRole(actor, ["lecturer", "engineering_reviewer", "administrator"])
  ) {
    throw new Error(
      "Only the author or authorised review staff may view revision history."
    );
  }

  return record.revisions;
}

export function viewAuditLog(actor: WorkflowActor, record: LessonWorkflowRecord) {
  requireAnyRole(actor, ["administrator"], "view audit log");
  return record.auditLog;
}

function publicationGateErrors(
  record: LessonWorkflowRecord,
  options: {
    requiresSafetyReview: boolean;
    requiresSimulationReview: boolean;
    requireEngineeringApproval: boolean;
  }
) {
  const errors: string[] = [];

  if (record.sourceReferences.length === 0) {
    errors.push("Valid sources are required.");
  }
  if (
    record.sourceReferences.some(
      (source) =>
        !["Source checked", "Approved for student use"].includes(source.approvalStatus)
    )
  ) {
    errors.push("All sources must be checked or approved.");
  }
  if (!record.equationReview?.passed) {
    errors.push("Completed equation review is required.");
  }
  if (options.requiresSimulationReview && !record.simulationReview?.passed) {
    errors.push("Completed simulation review is required.");
  }
  if (options.requiresSafetyReview && !record.safetyReview?.passed) {
    errors.push("Completed safety review is required.");
  }
  if (options.requireEngineeringApproval) {
    if (record.reviewStatus !== "Approved for student use") {
      errors.push("Content must be approved for student use.");
    }
    if (
      !record.engineeringApproval?.reviewerId ||
      !record.engineeringApproval.reviewedAt
    ) {
      errors.push("Named reviewer and review date are required.");
    }
    if (!record.version || record.version < 1) {
      errors.push("Content version is required.");
    }
  }

  return errors;
}

function requireCanEdit(actor: WorkflowActor, record: LessonWorkflowRecord) {
  if (actor.id === record.authorId || hasAnyRole(actor, ["administrator"])) {
    return;
  }
  requireAnyRole(actor, ["content_author"], "edit lesson content");
}

function requireReviewer(actor: WorkflowActor, action: string) {
  requireAnyRole(actor, ["engineering_reviewer", "administrator"], action);
}

function requireAnyRole(actor: WorkflowActor, roles: WorkflowRole[], action: string) {
  if (!hasAnyRole(actor, roles)) {
    throw new Error(`Actor ${actor.id} is not permitted to ${action}.`);
  }
}

function hasAnyRole(actor: WorkflowActor, roles: WorkflowRole[]) {
  return roles.some((role) => actor.roles.includes(role));
}

function enforceSelfApprovalPolicy(
  actor: WorkflowActor,
  record: LessonWorkflowRecord,
  policy?: { allowSelfApproval?: boolean }
) {
  const allowSelfApproval = Boolean(
    policy?.allowSelfApproval ?? actor.policy?.allowSelfApproval
  );
  if (actor.id === record.authorId && !allowSelfApproval) {
    throw new Error(
      "Authors may not approve their own content unless policy explicitly allows it."
    );
  }
}

function createReviewRecord(
  actor: WorkflowActor,
  decision: ReviewRecord["decision"],
  reviewStatus: ContentReviewStatus,
  notes: string,
  now: string,
  record: LessonWorkflowRecord
): ReviewRecord {
  return {
    id: `RR-${record.id}-${record.reviewRecords.length + 1}`,
    reviewerId: actor.id,
    reviewerName: actor.displayName,
    decision,
    reviewStatus,
    notes,
    sourceCheckPassed: record.sourceReferences.length > 0,
    equationCheckPassed: Boolean(record.equationReview?.passed),
    simulationCheckPassed: Boolean(record.simulationReview?.passed),
    safetyCheckPassed: Boolean(record.safetyReview?.passed),
    reviewedAt: now
  };
}

function currentRevision(record: LessonWorkflowRecord) {
  const revision = record.revisions.find((item) => item.version === record.version);
  if (!revision) {
    throw new Error(`Current revision ${record.version} does not exist.`);
  }

  return revision;
}

function createAuditEvent(
  actor: WorkflowActor,
  entityId: string,
  action: string,
  severity: AuditEvent["severity"],
  now: string,
  metadata: AuditEvent["metadata"]
): AuditEvent {
  return {
    actorId: actor.id,
    action,
    entityId,
    severity,
    occurredAt: now,
    metadata
  };
}

function withAudit(record: LessonWorkflowRecord, auditEvent: AuditEvent): WorkflowResult {
  return { record: appendAudit(record, auditEvent), auditEvent };
}

function appendAudit(
  record: LessonWorkflowRecord,
  auditEvent: AuditEvent
): LessonWorkflowRecord {
  return { ...record, auditLog: [...record.auditLog, auditEvent] };
}
