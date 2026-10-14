import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthProfile } from "../auth/session-core";
import * as lessonData from "../lesson-engine/data";
import { buildLearningLibrary, learningView } from "./learning-library";
import {
  loadLocalStudentDashboardData,
  resetLocalDashboardStoreForTests,
  setLocalSavedLesson
} from "./local-dashboard-store";

const profile: AuthProfile = {
  id: "library-a",
  authUserId: "library-a",
  displayName: "Library Student",
  email: "library-a@example.test",
  accountStatus: "active",
  roles: ["student"]
};
afterEach(() => {
  resetLocalDashboardStoreForTests();
  vi.restoreAllMocks();
});
describe("connected learning library", () => {
  it("offers only private bookmark IDs for unavailable saved content", () => {
    const data = loadLocalStudentDashboardData(profile);
    data.savedLessons = [
      {
        id: "owned-bookmark",
        lessonSlug: "withdrawn-private-title",
        savedAt: "2026-09-11"
      }
    ];
    const library = buildLearningLibrary(data, "saved", "");
    expect(library.lessons).toEqual([]);
    expect(library.unavailableSaved).toEqual([{ id: "owned-bookmark" }]);
    expect(library.counts.saved).toBe(1);
    expect(JSON.stringify(library)).not.toContain("withdrawn-private-title");
    data.unavailableSections = ["saved"];
    expect(buildLearningLibrary(data, "saved", "").unavailableSaved).toEqual([]);
  });
  it("shows genuine empty completion states and searches only published lessons", () => {
    const model = loadLocalStudentDashboardData(profile);
    expect(buildLearningLibrary(model, "completed", "").lessons).toEqual([]);
    expect(
      buildLearningLibrary(model, "all", "pressure").lessons.map((lesson) => lesson.slug)
    ).toEqual(["basic-fluid-pressure"]);
    expect(buildLearningLibrary(model, "all", "hydraulic").lessons).toEqual([]);
    expect(learningView("invalid")).toBe("all");
  });
  it("persists an idempotent saved state per student without awarding progress", () => {
    setLocalSavedLesson(profile, "basic-fluid-pressure", true);
    setLocalSavedLesson(profile, "basic-fluid-pressure", true);
    const data = loadLocalStudentDashboardData(profile);
    expect(data.savedLessons).toHaveLength(1);
    expect(data.lessonProgress).toHaveLength(0);
    expect(buildLearningLibrary(data, "saved", "").lessons).toHaveLength(1);
    expect(
      loadLocalStudentDashboardData({
        ...profile,
        id: "library-b",
        email: "library-b@example.test"
      }).savedLessons
    ).toHaveLength(0);
    setLocalSavedLesson(profile, "basic-fluid-pressure", false);
    expect(loadLocalStudentDashboardData(profile).savedLessons).toHaveLength(0);
  });
  it("never substitutes zero or completion for unavailable records", () => {
    const data = loadLocalStudentDashboardData(profile);
    const model = {
      ...data,
      unavailableSections: ["lessons", "saved"] satisfies NonNullable<
        typeof data.unavailableSections
      >
    };
    const library = buildLearningLibrary(model, "all", "");
    expect(library.lessons[0]?.state).toBe("Progress unavailable");
    expect(library.counts.completed).toBe(0);
  });
  it("keeps the whole library independent of the dashboard's six-card preview", () => {
    const template = lessonData.getPublicLessons()[0]!;
    const lessons = Array.from({ length: 7 }, (_, index) => ({
      ...template,
      slug: `test-lesson-${index}`
    }));
    vi.spyOn(lessonData, "getPublicLessons").mockReturnValue(lessons);
    const data = loadLocalStudentDashboardData(profile);
    data.savedLessons = lessons.map((lesson) => ({
      id: lesson.slug,
      lessonSlug: lesson.slug,
      savedAt: "2026-09-11T12:00:00Z"
    }));
    data.lessonProgress = lessons.map((lesson, index) => ({
      id: lesson.slug,
      lessonSlug: lesson.slug,
      moduleSlug: "test-module",
      status: index === 6 ? "graded" : "in_progress"
    }));
    const library = buildLearningLibrary(data, "saved", "");
    expect(library.lessons).toHaveLength(7);
    expect(library.counts).toEqual({ all: 7, saved: 7, "in-progress": 6, completed: 1 });
  });
});
