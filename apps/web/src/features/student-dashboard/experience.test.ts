import { afterEach, describe, expect, it, vi } from "vitest";
import * as lessons from "../lesson-engine/data";
import * as simulations from "../simulations/catalog";
import { buildDashboardExperience, dashboardDate } from "./experience";
import type { StudentDashboardData } from "./data";

const empty: StudentDashboardData = {
  profile: { id: "student-a", displayName: "Student A", email: "a@example.test" },
  enrolments: [],
  lessonProgress: [],
  assessmentAttempts: [],
  simulationAttempts: [],
  projectSubmissions: [],
  savedLessons: [],
  dismissedRecommendationIds: [],
  loadedAt: "2026-09-07T10:00:00Z",
  partialDataWarnings: []
};
const lessonRecord = {
  id: "progress-a",
  lessonSlug: "basic-fluid-pressure",
  moduleSlug: "fluid-mechanics-foundations",
  status: "in_progress",
  percentComplete: 5,
  lastActivityAt: "2026-09-07T09:00:00Z"
} as const;
const attempt = {
  id: "attempt-a",
  assessmentSlug: "basic-fluid-pressure-check",
  title: "Check",
  moduleSlug: "fluid-mechanics-foundations",
  status: "graded",
  score: 6,
  maxScore: 6,
  contentVersion: 2,
  reviewAvailable: true,
  competencyAwards: { Understood: 4, Calculated: 2 }
} as const;

afterEach(() => vi.restoreAllMocks());
describe("dashboard presentation evidence", () => {
  it("gives a new student eligible learning without fictional context or progress", () => {
    const model = buildDashboardExperience(empty);
    expect(model.next?.slug).toBe("basic-fluid-pressure");
    expect(model.nextAction).toBe("Start lesson");
    expect(model.currentYear).toBeUndefined();
    expect(model.currentSemester).toBeUndefined();
    expect(model.programmeTitle).toBeUndefined();
    expect(model.completedLessonCount).toBeUndefined();
    expect(model.results).toEqual([]);
    expect(model.practice).toEqual([]);
    expect(model.recommendations).toEqual([]);
    expect(Object.values(model.awards)).toEqual([0, 0, 0, 0, 0, 0]);
  });
  it("returns to a recorded lesson without awarding completion for opening", () => {
    const model = buildDashboardExperience({ ...empty, lessonProgress: [lessonRecord] });
    expect(model.nextAction).toBe("Return to lesson");
    expect(model.lastActivityAt).toBe(lessonRecord.lastActivityAt);
    expect(model.learning[0]?.state).toBe("In progress");
    expect(model.completedLessonCount).toBe(0);
  });
  it("keeps completion evidence deduplicated and excludes withdrawn content", () => {
    const model = buildDashboardExperience({
      ...empty,
      lessonProgress: [
        { ...lessonRecord, status: "graded" },
        { ...lessonRecord, id: "duplicate", percentComplete: 100 },
        {
          ...lessonRecord,
          id: "withdrawn",
          lessonSlug: "hydraulic-cylinder-force",
          status: "graded",
          lastActivityAt: "2026-09-08T09:00:00Z"
        }
      ]
    });
    expect(model.completedLessonCount).toBe(1);
    expect(model.previousUnavailable).toBe(true);
    expect(model.learning.map((l) => l.slug)).not.toContain("hydraulic-cylinder-force");
    expect(model.next?.slug).toBe("basic-fluid-pressure");
  });
  it("does not infer year, semester or assigned modules from enrolment alone", () => {
    const model = buildDashboardExperience({
      ...empty,
      enrolments: [
        {
          id: "enrolment",
          programmeSlug: "mechanical-foundations",
          cohortTitle: "Cohort",
          enrolledAt: "2026-09-01",
          moduleSlugs: []
        }
      ]
    });
    expect(model.currentYear).toBeUndefined();
    expect(model.currentSemester).toBeUndefined();
    expect(model.moduleCards).toEqual([]);
  });
  it("shows only review-permitted exact-version results and explicit server awards", () => {
    const model = buildDashboardExperience({
      ...empty,
      assessmentAttempts: [
        attempt,
        { ...attempt, id: "old", contentVersion: 1 },
        { ...attempt, id: "denied", reviewAvailable: false },
        { ...attempt, id: "pending", status: "in_progress" }
      ]
    });
    expect(model.results.map((r) => r.id)).toEqual(["attempt-a"]);
    expect(model.awards.Understood).toBe(4);
    expect(model.awards.Calculated).toBe(2);
    expect(model.unavailableResults).toBe(true);
    expect(
      buildDashboardExperience({
        ...empty,
        assessmentAttempts: [{ ...attempt, competencyAwards: {} }]
      }).awards.Calculated
    ).toBe(0);
  });
  it("does not replace failed records with zero or leak them through recent activity", () => {
    const model = buildDashboardExperience({
      ...empty,
      lessonProgress: [lessonRecord],
      assessmentAttempts: [attempt],
      unavailableSections: ["lessons", "assessments"]
    });
    expect(model.completedLessonCount).toBeUndefined();
    expect(model.learning[0]?.state).toBe("Progress unavailable");
    expect(model.results).toEqual([]);
    expect(model.base.recentActivity).toEqual([]);
    expect(model.recommendations).toEqual([]);
    expect(model.awards.Calculated).toBe(0);
  });
  it("handles no published content and rejects saved unpublished links", () => {
    vi.spyOn(lessons, "getPublicLessons").mockReturnValue([]);
    const model = buildDashboardExperience({
      ...empty,
      savedLessons: [
        { id: "saved", lessonSlug: "hydraulic-cylinder-force", savedAt: "2026-09-01" }
      ]
    });
    expect(model.next).toBeUndefined();
    expect(model.learning).toEqual([]);
    expect(model.results).toEqual([]);
    expect(model.savedLessons).toEqual([]);
  });
  it("does not manufacture dates", () => {
    expect(dashboardDate(undefined)).toBe("Date unavailable");
    expect(dashboardDate("not-a-date")).toBe("Date unavailable");
    expect(dashboardDate("2026-09-07T10:00:00Z")).toBe("7 Sept 2026");
  });
  it("offers only related eligible practice and respects recorded prerequisites", () => {
    const entry = {
      ...simulations.simulationRegistry[0]!,
      lessonSlug: "basic-fluid-pressure",
      prerequisitePolicy: "required" as const,
      prerequisiteLessonSlugs: ["basic-fluid-pressure"]
    };
    vi.spyOn(simulations, "getPublicSimulationCatalog").mockReturnValue([entry]);
    expect(buildDashboardExperience(empty).practice).toEqual([]);
    const data = {
      ...empty,
      lessonProgress: [{ ...lessonRecord, status: "graded" as const }]
    };
    expect(buildDashboardExperience(data).practice[0]?.slug).toBe(entry.slug);
    expect(
      buildDashboardExperience({ ...data, unavailableSections: ["lessons"] }).practice
    ).toEqual([]);
    vi.mocked(simulations.getPublicSimulationCatalog).mockReturnValue([
      { ...entry, intendedAvailability: "coming-later" }
    ]);
    expect(buildDashboardExperience(data).practice).toEqual([]);
  });
  it("distinguishes practice from assessment activity without inferring awards", () => {
    const entry = simulations.simulationRegistry[0]!;
    vi.spyOn(simulations, "getPublicSimulationCatalog").mockReturnValue([entry]);
    const simulation = {
      id: "run",
      simulationSlug: entry.slug,
      title: entry.definition.title,
      moduleSlug: entry.moduleSlug,
      mode: "explore",
      status: "submitted" as const,
      scenarioState: "normal-state",
      startedAt: "2026-09-07T10:00:00Z"
    };
    const practice = buildDashboardExperience({
      ...empty,
      simulationAttempts: [simulation]
    });
    expect(practice.simulationActivity[0]?.resultSummary).toBe("Practice submitted");
    expect(practice.simulationActivity[0]?.lastRunAt).toBe(simulation.startedAt);
    expect(practice.awards.Operated).toBe(0);
    const assessment = buildDashboardExperience({
      ...empty,
      simulationAttempts: [{ ...simulation, mode: "assessment" }]
    });
    expect(assessment.simulationActivity[0]?.resultSummary).toBe("Assessment submitted");
    const graded = buildDashboardExperience({
      ...empty,
      simulationAttempts: [
        {
          ...simulation,
          mode: "assessment",
          status: "graded",
          competencyAwards: { Operated: 2 }
        }
      ]
    });
    expect(graded.awards.Operated).toBe(2);
  });
});
