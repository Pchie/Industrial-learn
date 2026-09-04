import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { assessmentCatalog } from "./catalog";
import {
  evaluateAssessmentPublicationGate,
  type AssessmentPublicationRecord,
  type AssessmentReleaseDescriptor
} from "./publication-gate";

const descriptor: AssessmentReleaseDescriptor = {
  slug: "basic-fluid-pressure-check",
  contentId: "ASM-FLUID-PRESSURE-001",
  contentVersion: 2,
  artifactSha256: "db6268839cdfb959e7f7e392d9879cb3518b30d8b13ee01686cdd88ec71cec88",
  lessonId: "LES-FLUID-PRESSURE-001",
  lessonSlug: "basic-fluid-pressure",
  lessonVersion: "0.4.0",
  moduleSlug: "fluid-mechanics-foundations"
};

const publishedVersionTwo: AssessmentPublicationRecord = {
  slug: descriptor.slug,
  content_id: descriptor.contentId,
  version: descriptor.contentVersion,
  published_version: descriptor.contentVersion,
  artifact_sha256: descriptor.artifactSha256,
  lesson_content_id: descriptor.lessonId,
  lesson_slug: descriptor.lessonSlug,
  lesson_content_version: descriptor.lessonVersion,
  module_slug: descriptor.moduleSlug,
  technical_review_status: "Approved for student use",
  publication_status: "published",
  governance_item_id: "assessment-governance-item",
  review_record_id: "independent-review-record",
  publication_authorization_id: "assessment-publication-authorization",
  answer_protection_status: "server_only",
  unresolved_review_blockers: false,
  published_at: "2026-09-05T00:00:00.000Z"
};

describe("assessment publication gate", () => {
  it("binds version 2 to the unchanged frozen assessment artifact", () => {
    const artifact = readFileSync(
      join(
        process.cwd(),
        "content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json"
      )
    );
    const sha256 = createHash("sha256").update(artifact).digest("hex");

    expect(assessmentCatalog[0]?.contentVersion).toBe(2);
    expect(assessmentCatalog[0]?.artifactSha256).toBe(sha256);
  });

  it("rejects a published version 1 row when the lesson expects version 2", () => {
    const result = evaluateAssessmentPublicationGate(descriptor, {
      ...publishedVersionTwo,
      slug: "staging-pressure-check",
      content_id: null,
      version: 1,
      published_version: null,
      artifact_sha256: null,
      lesson_content_id: null,
      lesson_slug: null,
      lesson_content_version: null,
      module_slug: null,
      governance_item_id: null,
      review_record_id: null,
      publication_authorization_id: null,
      answer_protection_status: null,
      unresolved_review_blockers: null,
      published_at: null
    });

    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain("Assessment content version does not match.");
    expect(result.reasons).toContain("Assessment artifact hash does not match.");
  });

  it("allows only the exact approved and published version 2 record", () => {
    expect(evaluateAssessmentPublicationGate(descriptor, publishedVersionTwo)).toEqual({
      allowed: true,
      reasons: []
    });
  });

  it("fails closed when review, answer-protection, or publication metadata disagrees", () => {
    const result = evaluateAssessmentPublicationGate(descriptor, {
      ...publishedVersionTwo,
      review_record_id: null,
      answer_protection_status: "not_verified",
      unresolved_review_blockers: true
    });

    expect(result.allowed).toBe(false);
    expect(result.reasons).toEqual([
      "Assessment review record is missing.",
      "Assessment answer protection is not verified.",
      "Assessment has an unresolved review blocker."
    ]);
  });
});
