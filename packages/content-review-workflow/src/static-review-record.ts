import type { ContentReviewStatus, ContentVersion } from "./publication-visibility";

export const STATIC_REVIEW_REQUIREMENTS = [
  "source",
  "educational_structure",
  "equation",
  "simulation",
  "safety",
  "engineering_approval",
  "publication_authorization"
] as const;

export const STATIC_REVIEWER_ROLES = [
  "lecturer",
  "engineering_reviewer",
  "administrator"
] as const;

export type StaticReviewRequirement = (typeof STATIC_REVIEW_REQUIREMENTS)[number];
export type StaticReviewerRole = (typeof STATIC_REVIEWER_ROLES)[number];

export type StaticTechnicalReviewRecord = {
  schemaVersion: "1.0.0";
  id: string;
  entityId: string;
  entityType: "lesson";
  entityVersion: ContentVersion;
  authorId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: StaticReviewerRole;
  reviewType: StaticReviewRequirement;
  decision: "approved" | "changes_requested" | "rejected";
  reviewStatus: ContentReviewStatus;
  notes: string;
  evidenceChecked: Record<string, boolean>;
  sourceIdsChecked: string[];
  equationIdsChecked: string[];
  simulationTestIdsChecked: string[];
  safetyReviewOutcome: "passed" | "failed" | "not_applicable";
  reviewedAt: string;
};

export type StaticLessonReviewSubject = {
  id: string;
  version: ContentVersion;
  authorId?: string | null;
  sourceIds: readonly string[];
  equationIds: readonly string[];
  simulationIds: readonly string[];
  requiresSafetyReview: boolean;
};

export type StaticLessonReviewGate = {
  approved: boolean;
  authority: {
    currentVersion: ContentVersion;
    publishedVersion: ContentVersion;
  } | null;
  missingRequirements: Array<StaticReviewRequirement | "authorship">;
};

const CONTENT_REVIEW_STATUSES: readonly ContentReviewStatus[] = [
  "Draft",
  "Source required",
  "Source checked",
  "Equation checked",
  "Simulation checked",
  "Engineering review required",
  "Approved for student use"
];

export function validateStaticTechnicalReviewRecord(record: unknown): string[] {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return ["record must be an object"];
  }

  const candidate = record as Record<string, unknown>;
  const errors: string[] = [];

  if (candidate.schemaVersion !== "1.0.0") {
    errors.push("schemaVersion must be 1.0.0");
  }
  for (const field of [
    "id",
    "entityId",
    "authorId",
    "reviewerId",
    "reviewerName",
    "notes"
  ]) {
    if (!hasText(candidate[field])) {
      errors.push(`${field} is required`);
    }
  }
  if (hasText(candidate.id) && !/^REV-[A-Z0-9-]+$/.test(candidate.id)) {
    errors.push("id must use the REV-* format");
  }
  if (hasText(candidate.entityId) && !/^LES-[A-Z0-9-]+$/.test(candidate.entityId)) {
    errors.push("entityId must use the LES-* format");
  }
  if (candidate.entityType !== "lesson") {
    errors.push("entityType must be lesson");
  }
  if (!isContentVersion(candidate.entityVersion)) {
    errors.push("entityVersion is required");
  }
  if (!STATIC_REVIEWER_ROLES.includes(candidate.reviewerRole as StaticReviewerRole)) {
    errors.push("reviewerRole is invalid");
  }
  if (
    !STATIC_REVIEW_REQUIREMENTS.includes(candidate.reviewType as StaticReviewRequirement)
  ) {
    errors.push("reviewType is invalid");
  }
  if (
    !["approved", "changes_requested", "rejected"].includes(String(candidate.decision))
  ) {
    errors.push("decision is invalid");
  }
  if (!CONTENT_REVIEW_STATUSES.includes(candidate.reviewStatus as ContentReviewStatus)) {
    errors.push("reviewStatus is invalid");
  }
  if (!isBooleanRecord(candidate.evidenceChecked)) {
    errors.push("evidenceChecked must contain boolean values");
  }
  for (const field of [
    "sourceIdsChecked",
    "equationIdsChecked",
    "simulationTestIdsChecked"
  ]) {
    if (!isStringArray(candidate[field])) {
      errors.push(`${field} must be an array of non-empty strings`);
    }
  }
  if (
    !["passed", "failed", "not_applicable"].includes(
      String(candidate.safetyReviewOutcome)
    )
  ) {
    errors.push("safetyReviewOutcome is invalid");
  }
  if (!isIsoTimestamp(candidate.reviewedAt)) {
    errors.push("reviewedAt must be an ISO 8601 timestamp");
  }

  return errors;
}

export function evaluateStaticLessonReviewGate(input: {
  subject: StaticLessonReviewSubject;
  reviewRecords: readonly unknown[];
}): StaticLessonReviewGate {
  const { subject } = input;
  if (!hasText(subject.authorId)) {
    return {
      approved: false,
      authority: null,
      missingRequirements: ["authorship"]
    };
  }

  const matchingRecords = input.reviewRecords.filter(
    (record): record is StaticTechnicalReviewRecord =>
      validateStaticTechnicalReviewRecord(record).length === 0 &&
      (record as StaticTechnicalReviewRecord).entityId === subject.id &&
      sameVersion(
        (record as StaticTechnicalReviewRecord).entityVersion,
        subject.version
      ) &&
      (record as StaticTechnicalReviewRecord).authorId === subject.authorId &&
      (record as StaticTechnicalReviewRecord).decision === "approved"
  );

  const required: StaticReviewRequirement[] = [
    "source",
    "educational_structure",
    ...(subject.equationIds.length > 0 ? (["equation"] as const) : []),
    ...(subject.simulationIds.length > 0 ? (["simulation"] as const) : []),
    ...(subject.requiresSafetyReview ? (["safety"] as const) : []),
    "engineering_approval",
    "publication_authorization"
  ];
  const missingRequirements = required.filter(
    (requirement) => !hasPassingReview(requirement, matchingRecords, subject)
  );

  if (missingRequirements.length > 0) {
    return { approved: false, authority: null, missingRequirements };
  }

  return {
    approved: true,
    authority: {
      currentVersion: subject.version,
      publishedVersion: subject.version
    },
    missingRequirements: []
  };
}

function hasPassingReview(
  requirement: StaticReviewRequirement,
  records: readonly StaticTechnicalReviewRecord[],
  subject: StaticLessonReviewSubject
) {
  return records.some((record) => {
    if (
      record.reviewType !== requirement ||
      !roleMayPerform(requirement, record.reviewerRole) ||
      (requirement !== "publication_authorization" &&
        record.reviewerId === subject.authorId)
    ) {
      return false;
    }
    if (requirement === "source") {
      return containsEvery(record.sourceIdsChecked, subject.sourceIds);
    }
    if (requirement === "equation") {
      return containsEvery(record.equationIdsChecked, subject.equationIds);
    }
    if (requirement === "simulation") {
      return record.simulationTestIdsChecked.length > 0;
    }
    if (requirement === "safety") {
      return record.safetyReviewOutcome === "passed";
    }
    if (
      requirement === "engineering_approval" ||
      requirement === "publication_authorization"
    ) {
      return (
        record.reviewStatus === "Approved for student use" &&
        Object.values(record.evidenceChecked).some(Boolean)
      );
    }
    return Object.values(record.evidenceChecked).some(Boolean);
  });
}

function roleMayPerform(requirement: StaticReviewRequirement, role: StaticReviewerRole) {
  if (requirement === "publication_authorization") {
    return role === "administrator";
  }
  if (role === "administrator" || role === "engineering_reviewer") {
    return true;
  }
  return requirement === "educational_structure" && role === "lecturer";
}

function containsEvery(actual: readonly string[], required: readonly string[]) {
  const actualIds = new Set(actual);
  return required.length > 0 && required.every((id) => actualIds.has(id));
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isContentVersion(value: unknown): value is ContentVersion {
  return (
    (typeof value === "number" && Number.isInteger(value) && value > 0) || hasText(value)
  );
}

function sameVersion(left: ContentVersion, right: ContentVersion) {
  return typeof left === typeof right && left === right;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(hasText);
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value as Record<string, unknown>).every(
      (entry) => typeof entry === "boolean"
    )
  );
}

function isIsoTimestamp(value: unknown) {
  return (
    hasText(value) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}
