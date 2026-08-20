import { describe, expect, it } from "vitest";

import { isSensitiveMonitoringKey, redactMonitoringPayload } from "./redaction";

describe("monitoring redaction", () => {
  it("redacts secrets, answer content, cookies, and request bodies", () => {
    const redacted = redactMonitoringPayload({
      route: "/assessments/demo",
      authorization: "Bearer eyJexample.secret",
      cookie: "session=value",
      submittedAnswers: [{ questionId: "Q1", response: "private answer" }],
      hiddenCorrectAnswer: "42",
      body: { password: "unsafe" },
      nested: {
        resetToken: "reset-token-value",
        safeCount: 2
      }
    });

    expect(JSON.stringify(redacted)).not.toContain("private answer");
    expect(JSON.stringify(redacted)).not.toContain("reset-token-value");
    expect(JSON.stringify(redacted)).not.toContain("unsafe");
    expect(redacted).toMatchObject({
      route: "/assessments/demo",
      authorization: "[Redacted]",
      cookie: "[Redacted]",
      submittedAnswers: "[Redacted]",
      hiddenCorrectAnswer: "[Redacted]",
      body: "[Redacted]",
      nested: {
        resetToken: "[Redacted]",
        safeCount: 2
      }
    });
  });

  it("treats assessment and source-data fields as sensitive", () => {
    expect(isSensitiveMonitoringKey("correctChoiceId")).toBe(true);
    expect(isSensitiveMonitoringKey("sourceDocumentBody")).toBe(true);
    expect(isSensitiveMonitoringKey("route")).toBe(false);
  });
});
