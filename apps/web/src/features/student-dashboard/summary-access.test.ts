import { afterEach, describe, expect, it, vi } from "vitest";
import { assessmentCatalog } from "../assessments/catalog";
import * as lessons from "../lesson-engine/data";
import { canReviewDashboardAssessment } from "./summary-access";

const entry = assessmentCatalog[0]!;
const row = {
  slug: entry.slug,
  content_id: entry.localAssessmentId,
  version: entry.contentVersion,
  published_version: entry.contentVersion,
  artifact_sha256: entry.artifactSha256,
  lesson_content_id: entry.lessonId,
  lesson_slug: entry.lessonSlug,
  lesson_content_version: entry.lessonVersion,
  module_slug: entry.moduleSlug,
  technical_review_status: "Approved for student use",
  publication_status: "published",
  governance_item_id: "item",
  review_record_id: "review",
  publication_authorization_id: "authorization",
  answer_protection_status: "server_only",
  unresolved_review_blockers: false,
  published_at: "2026-09-07T00:00:00Z",
  source_ids: entry.sourceIds,
  equation_ids: entry.equationIds,
  learning_outcome_ids: entry.learningOutcomeIds
};
const attempt = { status: "graded", content_version: entry.contentVersion };
afterEach(() => vi.restoreAllMocks());
describe("dashboard review link permission", () => {
  it("accepts the exact published reviewed version", () => {
    expect(canReviewDashboardAssessment(row, attempt)).toBe(true);
  });
  it.each([
    { publication_status: "draft" },
    { technical_review_status: "Source required" },
    { review_record_id: null },
    { source_ids: [] },
    { equation_ids: [] },
    { learning_outcome_ids: [] },
    { artifact_sha256: "changed" },
    { answer_protection_status: "not_verified" },
    { unresolved_review_blockers: true }
  ])("rejects mismatched governance metadata %j", (change) => {
    expect(canReviewDashboardAssessment({ ...row, ...change }, attempt)).toBe(false);
  });
  it("rejects incomplete attempts, earlier versions and missing records", () => {
    expect(canReviewDashboardAssessment(row, { ...attempt, status: "in_progress" })).toBe(
      false
    );
    expect(canReviewDashboardAssessment(row, { ...attempt, content_version: 1 })).toBe(
      false
    );
    expect(canReviewDashboardAssessment(undefined, attempt)).toBe(false);
  });
  it("requires an accessible matching parent lesson", () => {
    vi.spyOn(lessons, "getPublicLessonBySlug").mockReturnValue(undefined);
    expect(canReviewDashboardAssessment(row, attempt)).toBe(false);
  });
});
