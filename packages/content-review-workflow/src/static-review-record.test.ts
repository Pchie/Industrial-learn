import { describe, expect, it } from "vitest";

import {
  evaluateStaticLessonReviewGate,
  validateStaticTechnicalReviewRecord,
  type StaticReviewRequirement,
  type StaticTechnicalReviewRecord
} from "./static-review-record";

const subject = {
  id: "LES-FLUID-PRESSURE-001",
  version: "0.2.0",
  authorId: "author-fluid-pressure",
  sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2012"],
  equationIds: ["EQ-FLUID-PRESSURE-001"],
  simulationIds: [],
  requiresSafetyReview: true
} as const;

describe("static technical review records", () => {
  it("grants publication authority only to a complete exact-version review package", () => {
    expect(
      evaluateStaticLessonReviewGate({
        subject,
        reviewRecords: approvedRecords()
      })
    ).toEqual({
      approved: true,
      authority: { currentVersion: "0.2.0", publishedVersion: "0.2.0" },
      missingRequirements: []
    });
  });

  it("fails closed for self-approval and stale review records", () => {
    const selfReviews = approvedRecords().map((record) => ({
      ...record,
      reviewerId: subject.authorId
    }));
    const staleReviews = approvedRecords().map((record) => ({
      ...record,
      entityVersion: "0.1.0"
    }));

    expect(
      evaluateStaticLessonReviewGate({ subject, reviewRecords: selfReviews }).approved
    ).toBe(false);
    expect(
      evaluateStaticLessonReviewGate({ subject, reviewRecords: staleReviews }).approved
    ).toBe(false);
  });

  it("requires complete source and equation coverage", () => {
    const records = approvedRecords().map((record) =>
      record.reviewType === "source" || record.reviewType === "equation"
        ? { ...record, sourceIdsChecked: [], equationIdsChecked: [] }
        : record
    );
    const result = evaluateStaticLessonReviewGate({ subject, reviewRecords: records });

    expect(result.missingRequirements).toContain("source");
    expect(result.missingRequirements).toContain("equation");
  });

  it("requires administrator authorization without replacing engineering approval", () => {
    const records = approvedRecords().map((record) =>
      record.reviewType === "publication_authorization"
        ? { ...record, reviewerRole: "engineering_reviewer" as const }
        : record
    );
    const result = evaluateStaticLessonReviewGate({ subject, reviewRecords: records });

    expect(result.approved).toBe(false);
    expect(result.missingRequirements).toEqual(["publication_authorization"]);
  });

  it("rejects malformed reviewer identity, role, and timestamp metadata", () => {
    const malformed = {
      ...approvedRecords()[0],
      reviewerName: "",
      reviewerRole: "student",
      reviewedAt: "today"
    };

    expect(validateStaticTechnicalReviewRecord(malformed)).toEqual(
      expect.arrayContaining([
        "reviewerName is required",
        "reviewerRole is invalid",
        "reviewedAt must be an ISO 8601 timestamp"
      ])
    );
  });
});

function approvedRecords(): StaticTechnicalReviewRecord[] {
  const reviewTypes: StaticReviewRequirement[] = [
    "source",
    "educational_structure",
    "equation",
    "safety",
    "engineering_approval",
    "publication_authorization"
  ];

  return reviewTypes.map((reviewType, index) => ({
    schemaVersion: "1.0.0",
    id: `REV-FLUID-PRESSURE-${index + 1}`,
    entityId: subject.id,
    entityType: "lesson",
    entityVersion: subject.version,
    authorId: subject.authorId,
    reviewerId: `reviewer-${reviewType}`,
    reviewerName: `Reviewer ${reviewType}`,
    reviewerRole:
      reviewType === "educational_structure"
        ? "lecturer"
        : reviewType === "publication_authorization"
          ? "administrator"
          : "engineering_reviewer",
    reviewType,
    decision: "approved",
    reviewStatus:
      reviewType === "engineering_approval" || reviewType === "publication_authorization"
        ? "Approved for student use"
        : "Engineering review required",
    notes: `Reviewed ${reviewType}.`,
    evidenceChecked: { reviewComplete: true },
    sourceIdsChecked: reviewType === "source" ? [...subject.sourceIds] : [],
    equationIdsChecked: reviewType === "equation" ? [...subject.equationIds] : [],
    simulationTestIdsChecked: [],
    safetyReviewOutcome: reviewType === "safety" ? "passed" : "not_applicable",
    reviewedAt: "2026-08-30T12:00:00.000Z"
  }));
}
