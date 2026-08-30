import { describe, expect, it } from "vitest";

import fluidPressureAssessment from "../../../content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json";

import {
  createInMemoryAttemptStore,
  deliverAssessment,
  openingAssessmentProgressAward,
  recordCompletedAttempt,
  reviewCompletedAttempt,
  submitAssessment,
  type Assessment
} from "./index";

const assessment = fluidPressureAssessment as Assessment;

describe("assessment delivery access control", () => {
  it("keeps every item within the taught outcomes and foundational competency scope", () => {
    expect(assessment.learningOutcomeIds).toEqual([
      "LO-FP-001",
      "LO-FP-002",
      "LO-FP-003"
    ]);
    expect(
      assessment.questions.every((question) =>
        question.learningOutcomeIds.every((outcomeId) =>
          assessment.learningOutcomeIds.includes(outcomeId)
        )
      )
    ).toBe(true);
    expect(
      assessment.questions.some((question) =>
        ["simulation-task", "fault-diagnosis", "design-challenge"].includes(question.type)
      )
    ).toBe(false);
    expect(
      assessment.questions.some((question) =>
        ["Operated", "Diagnosed", "Designed"].includes(question.competencyLevel)
      )
    ).toBe(false);
  });

  it("does not expose answers, explanations, rubrics, or simulation hints before submission", () => {
    const delivered = deliverAssessment(assessment, "assessment");
    const serialized = JSON.stringify(delivered);

    expect(serialized).not.toContain("correctChoiceId");
    expect(serialized).not.toContain("expectedAnswer");
    expect(serialized).not.toContain("correctFaultId");
    expect(serialized).not.toContain("diagnosticEvidenceIds");
    expect(serialized).not.toContain("rubric");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain("SIM-HYD-CYL-FORCE-001");
    expect(serialized).not.toContain("simulationId");
    expect(serialized).not.toContain("The expected result is 10000 N.");
  });

  it("awards no progress for merely opening an assessment", () => {
    expect(openingAssessmentProgressAward()).toBe(0);
  });
});

describe("assessment scoring", () => {
  it("scores the scope-aligned assessment and records only taught competency", () => {
    const attempt = submitAssessment({
      assessment,
      studentId: "student-001",
      submittedAt: "2026-07-21T18:00:00.000Z",
      attemptId: "ATT-FP-001",
      answers: [
        { questionId: "Q-FP-MCQ-001", type: "multiple-choice", choiceId: "A" },
        {
          questionId: "Q-FP-NUM-001",
          type: "numeric-engineering-calculation",
          answer: { value: 400.2, unit: "Pa" }
        },
        {
          questionId: "Q-FP-DIAGRAM-001",
          type: "diagram-question",
          labelIds: ["surface-a"]
        },
        {
          questionId: "Q-FP-UNIT-001",
          type: "multiple-choice",
          choiceId: "A"
        },
        {
          questionId: "Q-FP-APPLICATION-001",
          type: "multiple-choice",
          choiceId: "A"
        }
      ]
    });

    expect(attempt.earnedPoints).toBe(6);
    expect(attempt.maxPoints).toBe(6);
    expect(attempt.competencyProgress.Understood).toBe(4);
    expect(attempt.competencyProgress.Calculated).toBe(2);
    expect(attempt.competencyProgress.Operated).toBeUndefined();
    expect(attempt.competencyProgress.Diagnosed).toBeUndefined();
    expect(attempt.competencyProgress.Designed).toBeUndefined();
  });

  it("applies numeric tolerances", () => {
    const within = submitAssessment({
      assessment,
      studentId: "student-001",
      answers: [
        {
          questionId: "Q-FP-NUM-001",
          type: "numeric-engineering-calculation",
          answer: { value: 400.4, unit: "Pa" }
        }
      ]
    });
    const outside = submitAssessment({
      assessment,
      studentId: "student-001",
      answers: [
        {
          questionId: "Q-FP-NUM-001",
          type: "numeric-engineering-calculation",
          answer: { value: 401, unit: "Pa" }
        }
      ]
    });

    expect(
      within.questionResults.find((result) => result.questionId === "Q-FP-NUM-001")
        ?.earnedPoints
    ).toBe(2);
    expect(
      outside.questionResults.find((result) => result.questionId === "Q-FP-NUM-001")
        ?.earnedPoints
    ).toBe(0);
  });

  it("validates units for numeric answers", () => {
    const attempt = submitAssessment({
      assessment,
      studentId: "student-001",
      answers: [
        {
          questionId: "Q-FP-NUM-001",
          type: "numeric-engineering-calculation",
          answer: { value: 400, unit: "kPa" }
        }
      ]
    });
    const numericResult = attempt.questionResults.find(
      (result) => result.questionId === "Q-FP-NUM-001"
    );

    expect(numericResult?.earnedPoints).toBe(0);
    expect(numericResult?.errors[0]).toContain("Unit must be Pa");
  });
});

describe("assessment attempt review", () => {
  it("records attempts and allows the owning student to review completed explanations", () => {
    const store = createInMemoryAttemptStore();
    const attempt = submitAssessment({
      assessment,
      studentId: "student-001",
      attemptId: "ATT-FP-REVIEW-001",
      answers: [{ questionId: "Q-FP-MCQ-001", type: "multiple-choice", choiceId: "A" }]
    });

    recordCompletedAttempt(store, attempt);

    const ownerReview = reviewCompletedAttempt(store, "student-001", "ATT-FP-REVIEW-001");
    const otherStudentReview = reviewCompletedAttempt(
      store,
      "student-002",
      "ATT-FP-REVIEW-001"
    );

    expect(ownerReview?.questionResults[0]?.explanation).toContain("foundational model");
    expect(otherStudentReview).toBeUndefined();
  });
});
