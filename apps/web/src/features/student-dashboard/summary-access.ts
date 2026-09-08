import { getAssessmentCatalogBySlug } from "../assessments/catalog";
import {
  evaluateAssessmentPublicationGate,
  type AssessmentPublicationRecord
} from "../assessments/publication-gate";
import { getPublicLessonBySlug } from "../lesson-engine/data";

export function canReviewDashboardAssessment(
  assessment: Record<string, unknown> | undefined,
  attempt: { status: unknown; content_version: unknown }
) {
  if (!assessment || typeof assessment.slug !== "string") return false;
  const entry = getAssessmentCatalogBySlug(assessment.slug);
  const lesson = entry && getPublicLessonBySlug(entry.lessonSlug);
  if (
    !entry ||
    lesson?.version !== entry.lessonVersion ||
    attempt.status !== "graded" ||
    attempt.content_version !== entry.contentVersion
  )
    return false;
  const sameSet = (raw: unknown, expected: string[]) =>
    Array.isArray(raw) &&
    raw.length === expected.length &&
    raw.every((item: unknown) => typeof item === "string" && expected.includes(item)) &&
    expected.every((item) => raw.includes(item));
  return (
    evaluateAssessmentPublicationGate(
      { ...entry, contentId: entry.localAssessmentId },
      assessment as AssessmentPublicationRecord
    ).allowed &&
    sameSet(assessment.source_ids, entry.sourceIds) &&
    sameSet(assessment.equation_ids, entry.equationIds) &&
    sameSet(assessment.learning_outcome_ids, entry.learningOutcomeIds)
  );
}
