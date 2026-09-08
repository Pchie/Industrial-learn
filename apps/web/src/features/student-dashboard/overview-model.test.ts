import { describe, expect, it } from "vitest";
import { buildDashboardExperience } from "./experience";
import { buildDashboardOverview, visibleProgress } from "./overview-model";
import { referencePreviewEnabled } from "./reference-preview-policy";
import type { StudentDashboardData } from "./data";

const empty: StudentDashboardData = {
  profile: { id: "a", displayName: "Student A", email: "a@example.test" },
  enrolments: [],
  lessonProgress: [],
  assessmentAttempts: [],
  simulationAttempts: [],
  projectSubmissions: [],
  savedLessons: [],
  dismissedRecommendationIds: [],
  loadedAt: "2026-09-08T10:00:00Z",
  partialDataWarnings: []
};
describe("shared reference presentation", () => {
  it("never substitutes fictional progress or courses in the live model", () => {
    const view = buildDashboardOverview(buildDashboardExperience(empty));
    expect(view.demo).toBe(false);
    expect(view.progress.percent).toBeNull();
    expect(view.metric.value).toBe("--");
    expect(view.cards).toHaveLength(4);
    expect(
      view.cards.every((card) => card.href.startsWith("/lessons/basic-fluid-pressure"))
    ).toBe(true);
    expect(view.cards.every((card) => card.progress === undefined)).toBe(true);
    expect(view.awards.every((award) => !award.awarded)).toBe(true);
    expect(view.activity).toEqual([]);
    expect(JSON.stringify(view)).not.toMatch(
      /Pump Fundamentals|Heat Exchanger|AI Mentor/
    );
  });
  it("labels progress with a shown-lesson denominator, and rejects unknown state", () => {
    expect(visibleProgress(["Completed", "Available"], false).percent).toBe(50);
    expect(visibleProgress(["Completed", "In progress"], false).percent).toBe(50);
    expect(visibleProgress(["Completed"], true).percent).toBeNull();
    expect(visibleProgress(["Progress unavailable"], false).percent).toBeNull();
    expect(visibleProgress([], false).percent).toBeNull();
  });
  it("does not expose failed records through the overview", () => {
    const view = buildDashboardOverview(
      buildDashboardExperience({ ...empty, unavailableSections: ["lessons"] })
    );
    expect(view.progress.percent).toBeNull();
    expect(view.metric.value).toBe("--");
    expect(view.warning).toBe(true);
    expect(view.lessonProgressUnavailable).toBe(true);
    const assessmentFailure = buildDashboardOverview(
      buildDashboardExperience({ ...empty, unavailableSections: ["assessments"] })
    );
    expect(assessmentFailure.warning).toBe(true);
    expect(assessmentFailure.lessonProgressUnavailable).toBe(false);
  });
});
describe("fictional reference preview safety", () => {
  const enabled = {
    INDUSTRIAL_LEARN_E2E: "true",
    INDUSTRIAL_LEARN_AUTH_MODE: "local",
    NEXT_PUBLIC_APP_ENV: "test",
    APP_BASE_URL: "http://127.0.0.1:3166"
  };
  it("requires all local synthetic-mode guards", () => {
    expect(referencePreviewEnabled(enabled)).toBe(true);
    for (const key of Object.keys(enabled)) {
      expect(referencePreviewEnabled({ ...enabled, [key]: undefined })).toBe(false);
    }
  });
  it("fails closed on staging, production and malformed URLs", () => {
    expect(
      referencePreviewEnabled({ ...enabled, NEXT_PUBLIC_APP_ENV: "production" })
    ).toBe(false);
    expect(
      referencePreviewEnabled({
        ...enabled,
        APP_BASE_URL: "https://industrial-learn.vercel.app"
      })
    ).toBe(false);
    expect(
      referencePreviewEnabled({
        ...enabled,
        APP_BASE_URL: "http://localhost.attacker.test"
      })
    ).toBe(false);
    expect(referencePreviewEnabled({ ...enabled, APP_BASE_URL: "invalid" })).toBe(false);
    expect(
      referencePreviewEnabled({ ...enabled, INDUSTRIAL_LEARN_AUTH_MODE: "supabase" })
    ).toBe(false);
  });
});
