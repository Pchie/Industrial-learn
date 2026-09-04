import "server-only";

import {
  createAttemptPersistenceServices,
  type AssessmentAttemptRepository,
  type AttemptAuditRepository,
  type AttemptPersistenceRepositories,
  type AttemptTransactionRunner,
  type PersistedAssessmentAttempt,
  type SimulationAttemptRepository
} from "@industrial-learn/database";
import type { Assessment, CompetencyLevel } from "@industrial-learn/assessment-core";

import { createAssessmentFromCatalog, listAssessmentCatalog } from "./catalog";
import {
  recordLocalAssessmentDashboardAttempt,
  recordLocalLessonProgress
} from "../student-dashboard/local-dashboard-store";

const attempts = new Map<string, PersistedAssessmentAttempt>();
const assessments = new Map<string, Assessment>(
  listAssessmentCatalog().map((entry) => [
    entry.localAssessmentId,
    createAssessmentFromCatalog(entry, {
      reviewStatus: "Approved for student use"
    })
  ])
);

export function resetLocalAssessmentStoreForTests() {
  attempts.clear();
}

export function createLocalAssessmentPersistence() {
  const repositories = createLocalRepositories();

  return {
    services: createAttemptPersistenceServices(repositories),
    repositories
  };
}

export function listLocalAssessmentAttempts(input: {
  studentProfileId: string;
  assessmentId: string;
}) {
  return Array.from(attempts.values())
    .filter(
      (attempt) =>
        attempt.studentProfileId === input.studentProfileId &&
        attempt.assessmentId === input.assessmentId
    )
    .sort((left, right) => right.attemptNumber - left.attemptNumber);
}

function createLocalRepositories(): AttemptPersistenceRepositories {
  const assessmentsRepository: AssessmentAttemptRepository = {
    getAssessment(assessmentId) {
      return Promise.resolve(assessments.get(assessmentId) ?? null);
    },
    getStartedAssessmentAttempt(input) {
      return Promise.resolve(
        Array.from(attempts.values()).find(
          (attempt) =>
            attempt.studentProfileId === input.studentProfileId &&
            attempt.assessmentId === input.assessmentId &&
            attempt.attemptNumber === input.attemptNumber
        ) ?? null
      );
    },
    getAssessmentAttemptForReview(input) {
      return Promise.resolve(
        attempts.get(key(input.studentProfileId, input.attemptId)) ?? null
      );
    },
    nextAssessmentAttemptNumber(input) {
      const count = Array.from(attempts.values()).filter(
        (attempt) =>
          attempt.studentProfileId === input.studentProfileId &&
          attempt.assessmentId === input.assessmentId
      ).length;
      return Promise.resolve(count + 1);
    },
    createAssessmentAttempt(attempt) {
      const created = { ...attempt, id: crypto.randomUUID() };
      attempts.set(key(created.studentProfileId, created.id), created);
      return Promise.resolve(created);
    },
    updateAssessmentProgress(input) {
      const existing = attempts.get(key(input.studentProfileId, input.attemptId));
      if (!existing) {
        throw new Error("Local assessment attempt was not found.");
      }
      const updated = { ...existing, submittedAnswers: input.answers };
      attempts.set(key(input.studentProfileId, input.attemptId), updated);
      return Promise.resolve(updated);
    },
    completeAssessmentAttempt(input) {
      const existing = attempts.get(key(input.studentProfileId, input.attemptId));
      if (!existing) {
        throw new Error("Local assessment attempt was not found.");
      }
      const completed: PersistedAssessmentAttempt = {
        ...existing,
        status: "graded",
        submittedAnswers: input.answers,
        scoringSummary: input.scoringSummary,
        competencyAwards: input.competencyAwards,
        idempotencyKey: input.idempotencyKey,
        submittedAt: input.submittedAt,
        gradedAt: input.submittedAt
      };
      attempts.set(key(completed.studentProfileId, completed.id), completed);
      recordLocalAssessmentDashboardAttempt(completed.studentProfileId, {
        id: completed.id,
        assessmentSlug: "basic-fluid-pressure-check",
        title: "Basic Fluid Pressure Check",
        moduleSlug: "fluid-mechanics-foundations",
        status: completed.status,
        score: input.scoringSummary.earnedPoints,
        maxScore: input.scoringSummary.maxPoints,
        submittedAt: input.submittedAt,
        competencyLevel: highestAward(input.competencyAwards),
        incorrectTopics: input.scoringSummary.questionResults
          .filter((result) => !result.correct)
          .map((result) => result.questionId),
        unitErrors: input.scoringSummary.questionResults.filter((result) =>
          result.errors.some((error) => error.includes("Unit must be"))
        ).length
      });
      recordLocalLessonProgress(completed.studentProfileId, {
        id: "pilot-progress-basic-fluid-pressure",
        lessonSlug: "basic-fluid-pressure",
        moduleSlug: "fluid-mechanics-foundations",
        status: "graded",
        percentComplete: 100,
        startedAt: existing.startedAt,
        completedAt: input.submittedAt,
        lastActivityAt: input.submittedAt
      });
      return Promise.resolve(completed);
    },
    findCompletedAssessmentByIdempotency(input) {
      return Promise.resolve(
        Array.from(attempts.values()).find(
          (attempt) =>
            attempt.studentProfileId === input.studentProfileId &&
            attempt.assessmentId === input.assessmentId &&
            attempt.idempotencyKey === input.idempotencyKey &&
            (attempt.status === "submitted" || attempt.status === "graded")
        ) ?? null
      );
    },
    recordCompetencyAwards() {
      return Promise.resolve();
    },
    updateLessonProgressFromAssessment() {
      return Promise.resolve();
    }
  };

  const simulationsRepository: SimulationAttemptRepository = {
    createSimulationAttempt() {
      throw new Error("Simulation attempts are not part of the assessment browser flow.");
    },
    getSimulationAttempt() {
      return Promise.resolve(null);
    },
    findCompletedSimulationByIdempotency() {
      return Promise.resolve(null);
    },
    completeSimulationAttempt() {
      throw new Error("Simulation attempts are not part of the assessment browser flow.");
    },
    recordCompetencyAwards() {
      return Promise.resolve();
    },
    updateLessonProgressFromSimulation() {
      return Promise.resolve();
    }
  };

  const audit: AttemptAuditRepository = {
    recordEvent() {
      return Promise.resolve();
    }
  };

  const transactions: AttemptTransactionRunner = {
    async transaction(operation) {
      return operation();
    }
  };

  return {
    assessments: assessmentsRepository,
    simulations: simulationsRepository,
    audit,
    transactions
  };
}

function key(studentProfileId: string, attemptId: string) {
  return `${studentProfileId}:${attemptId}`;
}

function highestAward(awards: Partial<Record<CompetencyLevel, number>>) {
  const ordered: CompetencyLevel[] = [
    "Designed",
    "Diagnosed",
    "Operated",
    "Calculated",
    "Understood",
    "Introduced"
  ];

  return ordered.find((level) => (awards[level] ?? 0) > 0);
}
