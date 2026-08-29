import { describe, expect, it } from "vitest";
import {
  buildStudentDashboardModel,
  buildWeakTopicRecommendations,
  calculateCompetencyProfile,
  calculateModuleProgress,
  type StudentDashboardData
} from "./data";
import { getInternalCurriculum } from "../curriculum/data";

const baseData: StudentDashboardData = {
  profile: {
    id: "student-a",
    displayName: "Student A",
    email: "student-a@example.test"
  },
  enrolments: [
    {
      id: "enrolment-a",
      programmeSlug: "mechanical-foundations",
      cohortTitle: "Mechanical Foundations",
      enrolledAt: "2026-02-01T00:00:00.000Z",
      currentYear: 1,
      currentSemester: 1,
      moduleSlugs: ["fluid-mechanics-foundations"]
    }
  ],
  lessonProgress: [],
  assessmentAttempts: [],
  simulationAttempts: [],
  projectSubmissions: [],
  savedLessons: [],
  dismissedRecommendationIds: [],
  loadedAt: "2026-07-22T00:00:00.000Z",
  partialDataWarnings: []
};

describe("student dashboard model", () => {
  it("does not award progress for merely opening a lesson", () => {
    const data = {
      ...baseData,
      lessonProgress: [
        {
          id: "opened-only",
          lessonSlug: "basic-fluid-pressure",
          moduleSlug: "fluid-mechanics-foundations",
          status: "in_progress",
          percentComplete: 5,
          startedAt: "2026-07-21T00:00:00.000Z",
          lastActivityAt: "2026-07-21T00:00:00.000Z"
        }
      ]
    } satisfies StudentDashboardData;
    const internalModule = getInternalCurriculum().modules.find(
      (module) => module.slug === "fluid-mechanics-foundations"
    );
    expect(internalModule).toBeDefined();

    const progress = calculateModuleProgress(internalModule!, data).progress;
    const publicModel = buildStudentDashboardModel(data);

    expect(progress.completedEvidence).toBe(0);
    expect(progress.explanation).toContain("Opening a lesson does not award progress");
    expect(publicModel.moduleCards).toEqual([]);
  });

  it("calculates competency evidence from assessments, simulations, and projects", () => {
    const profile = calculateCompetencyProfile({
      ...baseData,
      assessmentAttempts: [
        {
          id: "assessment-a",
          assessmentSlug: "fluid-pressure-basic-check",
          title: "Fluid pressure check",
          moduleSlug: "fluid-mechanics-foundations",
          status: "graded",
          score: 9,
          maxScore: 10
        }
      ],
      simulationAttempts: [
        {
          id: "simulation-a",
          simulationSlug: "hydraulic-cylinder-force",
          title: "Hydraulic cylinder force simulation",
          moduleSlug: "fluid-mechanics-foundations",
          mode: "Fault diagnosis",
          status: "submitted",
          scenarioState: "fault-state"
        }
      ],
      projectSubmissions: [
        {
          id: "project-a",
          projectSlug: "fluid-pressure-observation",
          title: "Fluid pressure project",
          moduleSlug: "fluid-mechanics-foundations",
          status: "submitted"
        }
      ]
    });

    expect(profile.Calculated).toBe(1);
    expect(profile.Diagnosed).toBe(1);
    expect(profile.Designed).toBe(1);
  });

  it("creates deterministic weak-topic recommendations from evidence", () => {
    const recommendations = buildWeakTopicRecommendations({
      ...baseData,
      assessmentAttempts: [
        {
          id: "assessment-a",
          assessmentSlug: "fluid-pressure-basic-check",
          title: "Fluid pressure check",
          moduleSlug: "fluid-mechanics-foundations",
          status: "graded",
          score: 4,
          maxScore: 10,
          incorrectTopics: ["Pressure from force and area"],
          unitErrors: 2
        }
      ]
    });

    expect(recommendations.map((item) => item.id)).toEqual([
      "assessment-fluid-pressure-basic-check",
      "topic-pressure-from-force-and-area",
      "units-fluid-pressure-basic-check"
    ]);
  });

  it("dismisses recommendations only when the authenticated student's data includes the dismissal", () => {
    const model = buildStudentDashboardModel({
      ...baseData,
      dismissedRecommendationIds: ["assessment-fluid-pressure-basic-check"],
      assessmentAttempts: [
        {
          id: "assessment-a",
          assessmentSlug: "fluid-pressure-basic-check",
          title: "Fluid pressure check",
          moduleSlug: "fluid-mechanics-foundations",
          status: "graded",
          score: 4,
          maxScore: 10
        }
      ]
    });

    expect(model.weakTopicRecommendations).toEqual([]);
  });

  it("uses unavailable states instead of misleading zero progress", () => {
    const model = buildStudentDashboardModel({
      ...baseData,
      enrolments: []
    });

    expect(model.state).toBe("new_student");
    expect(model.programmeProgress.available).toBe(false);
    expect(model.programmeProgress.explanation).toContain("unavailable");
  });
});
