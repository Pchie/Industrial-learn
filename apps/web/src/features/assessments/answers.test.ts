import { describe, expect, it } from "vitest";
import { deliverAssessment, type Assessment } from "@industrial-learn/assessment-core";

import fluidPressureAssessment from "../../../../../content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json";
import { parseAssessmentAnswers } from "./answers";

const assessment = {
  ...(fluidPressureAssessment as Assessment),
  reviewStatus: "Approved for student use"
};

describe("assessment browser answer parsing", () => {
  it("serializes complete form data without exposing answer keys", () => {
    const delivered = deliverAssessment(assessment, "assessment");
    const form = new FormData();

    form.set("answer-Q-FP-MCQ-001", "A");
    form.set("answer-Q-FP-NUM-001-value", "0.4");
    form.set("answer-Q-FP-NUM-001-unit", "kPa");
    form.append("answer-Q-FP-COMP-001", "force");
    form.append("answer-Q-FP-COMP-001", "area");
    form.append("answer-Q-FP-DIAGRAM-001", "F");
    form.append("answer-Q-FP-DIAGRAM-001", "A");
    form.set("answer-Q-FP-SEQ-001-step-0", "check-units");
    form.set("answer-Q-FP-SEQ-001-step-1", "substitute");
    form.set("answer-Q-FP-SEQ-001-step-2", "interpret");
    form.set("answer-Q-FP-SIM-001-measurement-cylinderForce-value", "10000");
    form.set("answer-Q-FP-SIM-001-measurement-cylinderForce-unit", "N");
    form.set("answer-Q-FP-FAULT-001-fault", "seal-leak");
    form.append("answer-Q-FP-FAULT-001-evidence", "force-below-pressure-area-prediction");
    form.set("answer-Q-FP-DESIGN-001-response", "Stay inside supervised training.");

    const parsed = parseAssessmentAnswers(delivered, form, { requireComplete: true });

    expect(parsed.missingQuestionIds).toEqual([]);
    expect(parsed.invalidMessages).toEqual([]);
    expect(parsed.answers).toHaveLength(8);
    expect(JSON.stringify(delivered)).not.toContain("expectedAnswer");
    expect(JSON.stringify(delivered)).not.toContain("correctChoiceId");
    expect(JSON.stringify(delivered)).not.toContain("The expected result is 10000 N.");
  });

  it("reports missing and invalid values without guessing", () => {
    const delivered = deliverAssessment(assessment, "assessment");
    const form = new FormData();

    form.set("answer-Q-FP-NUM-001-value", "not-a-number");
    form.set("answer-Q-FP-NUM-001-unit", "Pa");

    const parsed = parseAssessmentAnswers(delivered, form, { requireComplete: true });

    expect(parsed.invalidMessages).toContain(
      "Q-FP-NUM-001 requires a numeric value and unit."
    );
    expect(parsed.missingQuestionIds).toContain("Q-FP-MCQ-001");
  });
});
