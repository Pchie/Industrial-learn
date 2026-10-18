import { describe, expect, it } from "vitest";
import type { Assessment, AssessmentAttempt } from "@industrial-learn/assessment-core";
import type { PersistedAssessmentAttempt } from "@industrial-learn/database";
import {
  resolveHistoricalAssessment,
  type HistoricalAssessmentVersion
} from "./historical-version";

const v1 = {
  id: "synthetic-assessment",
  title: "Original questions",
  questions: [
    {
      id: "old-question",
      prompt: "Original synthetic question",
      tolerance: 0.1,
      unit: "Pa"
    }
  ]
} as unknown as Assessment;
const v2 = {
  ...v1,
  title: "Revised questions",
  questions: [
    {
      id: "new-question",
      prompt: "Different synthetic question",
      tolerance: 2,
      unit: "N"
    }
  ]
} as unknown as Assessment;
const versions: HistoricalAssessmentVersion[] = [
  {
    assessmentId: v1.id,
    contentVersion: 1,
    artifactSha256: "1".repeat(64),
    assessment: v1
  },
  {
    assessmentId: v2.id,
    contentVersion: 2,
    artifactSha256: "2".repeat(64),
    assessment: v2
  }
];
const attempt = {
  id: "owned-attempt",
  assessmentId: v1.id,
  studentProfileId: "student-a",
  contentVersion: 1,
  status: "graded",
  competencyAwards: { Calculated: 1 },
  submittedAnswers: [{ questionId: "old-question", value: "synthetic-response" }],
  scoringSummary: {
    assessmentId: v1.id,
    studentId: "student-a",
    earnedPoints: 1,
    maxPoints: 3,
    questionResults: [{ questionId: "old-question" }]
  } as AssessmentAttempt
} as unknown as PersistedAssessmentAttempt;

describe("53E-F03 exact historical version binding", () => {
  it("keeps v1 questions, units, tolerances and scoring after v2 exists", () => {
    const result = resolveHistoricalAssessment("student-a", attempt, versions);
    expect(result?.assessment).toEqual(v1);
    expect(result?.contentVersion).toBe(1);
    expect(result?.attempt.scoringSummary).toBe(attempt.scoringSummary);
    expect(result?.assessment).not.toEqual(v2);
  });
  it("binds a v2 attempt only to v2", () => {
    const current = {
      ...attempt,
      contentVersion: 2,
      scoringSummary: {
        ...attempt.scoringSummary!,
        questionResults: [{ questionId: "new-question" }]
      } as AssessmentAttempt
    };
    expect(
      resolveHistoricalAssessment("student-a", current, versions)?.assessment
    ).toEqual(v2);
  });
  it("never substitutes current content for a missing historical artifact", () => {
    expect(resolveHistoricalAssessment("student-a", attempt, [versions[1]!])).toBeNull();
  });
  it("denies another student, incomplete attempts, ambiguous archives and wrong question context", () => {
    expect(resolveHistoricalAssessment("student-b", attempt, versions)).toBeNull();
    expect(
      resolveHistoricalAssessment(
        "student-a",
        { ...attempt, status: "in_progress" },
        versions
      )
    ).toBeNull();
    expect(
      resolveHistoricalAssessment("student-a", attempt, [...versions, versions[0]!])
    ).toBeNull();
    expect(
      resolveHistoricalAssessment(
        "student-a",
        { ...attempt, contentVersion: 2 },
        versions
      )
    ).toBeNull();
  });
  it("repeated review is read-only and never awards or rescales a score", () => {
    const before = JSON.stringify(attempt);
    for (let i = 0; i < 3; i++)
      resolveHistoricalAssessment("student-a", attempt, versions);
    expect(JSON.stringify(attempt)).toBe(before);
  });
});
