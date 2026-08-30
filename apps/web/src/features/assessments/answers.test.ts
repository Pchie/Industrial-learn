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
    form.append("answer-Q-FP-DIAGRAM-001", "surface-a");
    form.set("answer-Q-FP-UNIT-001", "A");
    form.set("answer-Q-FP-APPLICATION-001", "A");

    const parsed = parseAssessmentAnswers(delivered, form, { requireComplete: true });

    expect(parsed.missingQuestionIds).toEqual([]);
    expect(parsed.invalidMessages).toEqual([]);
    expect(parsed.answers).toHaveLength(5);
    expect(JSON.stringify(delivered)).not.toContain("expectedAnswer");
    expect(JSON.stringify(delivered)).not.toContain("correctChoiceId");
    expect(JSON.stringify(delivered)).not.toContain("correctLabelIds");
    expect(JSON.stringify(delivered)).not.toContain('"explanation"');
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
