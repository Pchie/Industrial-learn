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
  it("does not expose answers, explanations, rubrics, or simulation hints before submission", () => {
    const delivered = deliverAssessment(assessment, "assessment");
    const serialized = JSON.stringify(delivered);

    expect(serialized).not.toContain("correctChoiceId");
    expect(serialized).not.toContain("expectedAnswer");
    expect(serialized).not.toContain("correctFaultId");
    expect(serialized).not.toContain("diagnosticEvidenceIds");
    expect(serialized).not.toContain("rubric");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain("The expected result is 10000 N.");
  });

  it("awards no progress for merely opening an assessment", () => {
    expect(openingAssessmentProgressAward()).toBe(0);
  });
});

describe("assessment scoring", () => {
  it("scores correct mixed assessment answers and records competency progress", () => {
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
          questionId: "Q-FP-COMP-001",
          type: "component-identification",
          componentIds: ["area", "force"]
        },
        {
          questionId: "Q-FP-DIAGRAM-001",
          type: "diagram-question",
          labelIds: ["F", "A"]
        },
        {
          questionId: "Q-FP-SEQ-001",
          type: "sequence-question",
          stepOrder: ["check-units", "substitute", "interpret"]
        },
        {
          questionId: "Q-FP-SIM-001",
          type: "simulation-task",
          measurements: { cylinderForce: { value: 10_000.5, unit: "N" } }
        },
        {
          questionId: "Q-FP-FAULT-001",
          type: "fault-diagnosis",
          faultId: "seal-leak",
          evidenceIds: ["force-below-pressure-area-prediction"]
        },
        {
          questionId: "Q-FP-DESIGN-001",
          type: "design-challenge",
          rubricAwardedPoints: { "safety-boundary": 1, "review-boundary": 1 }
        }
      ]
    });

    expect(attempt.earnedPoints).toBe(12);
    expect(attempt.maxPoints).toBe(12);
    expect(attempt.competencyProgress.Calculated).toBe(3);
    expect(attempt.competencyProgress.Operated).toBe(2);
    expect(attempt.competencyProgress.Diagnosed).toBe(2);
    expect(attempt.competencyProgress.Designed).toBe(2);
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

  it("validates units for numeric and simulation answers", () => {
    const attempt = submitAssessment({
      assessment,
      studentId: "student-001",
      answers: [
        {
          questionId: "Q-FP-NUM-001",
          type: "numeric-engineering-calculation",
          answer: { value: 400, unit: "kPa" }
        },
        {
          questionId: "Q-FP-SIM-001",
          type: "simulation-task",
          measurements: { cylinderForce: { value: 10_000, unit: "kN" } }
        }
      ]
    });
    const numericResult = attempt.questionResults.find(
      (result) => result.questionId === "Q-FP-NUM-001"
    );
    const simulationResult = attempt.questionResults.find(
      (result) => result.questionId === "Q-FP-SIM-001"
    );

    expect(numericResult?.earnedPoints).toBe(0);
    expect(numericResult?.errors[0]).toContain("Unit must be Pa");
    expect(simulationResult?.earnedPoints).toBe(0);
    expect(simulationResult?.errors[0]).toContain("Unit must be N");
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

    expect(ownerReview?.questionResults[0]?.explanation).toContain(
      "Pressure is treated as normal force"
    );
    expect(otherStudentReview).toBeUndefined();
  });
});
