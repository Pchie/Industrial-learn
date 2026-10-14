import type { Assessment } from "@industrial-learn/assessment-core";
import type { PersistedAssessmentAttempt } from "@industrial-learn/database";

export type HistoricalAssessmentVersion = {
  assessmentId: string;
  contentVersion: number;
  artifactSha256: string;
  assessment: Assessment;
};

/** Call only with verified archive entries. Never pick the newest version. */
export function resolveHistoricalAssessment(
  ownerId: string,
  attempt: PersistedAssessmentAttempt,
  versions: readonly HistoricalAssessmentVersion[]
) {
  if (
    attempt.studentProfileId !== ownerId ||
    attempt.status !== "graded" ||
    !attempt.scoringSummary
  )
    return null;
  const matches = versions.filter(
    (v) =>
      v.assessmentId === attempt.assessmentId &&
      v.contentVersion === attempt.contentVersion
  );
  if (matches.length !== 1) return null;
  const version = matches[0]!;
  const scoring = attempt.scoringSummary;
  if (
    scoring.assessmentId !== attempt.assessmentId ||
    scoring.studentId !== ownerId ||
    scoring.questionResults.length !== version.assessment.questions.length ||
    version.assessment.questions.some(
      (question) =>
        !scoring.questionResults.some((result) => result.questionId === question.id)
    )
  )
    return null;
  return {
    assessment: version.assessment,
    attempt,
    contentVersion: version.contentVersion
  };
}
