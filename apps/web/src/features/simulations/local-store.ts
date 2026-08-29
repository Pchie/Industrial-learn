import {
  createAttemptPersistenceServices,
  type AssessmentAttemptRepository,
  type AttemptAuditRepository,
  type AttemptTransactionRunner,
  type PersistedSimulationAttempt,
  type SimulationAttemptRepository
} from "@industrial-learn/database";
import type { CompetencyLevel } from "@industrial-learn/assessment-core";

import { recordLocalSimulationDashboardAttempt } from "../student-dashboard/local-dashboard-store";
import { getSimulationCatalogBySlugForInternalUse } from "./catalog";

const attempts = new Map<string, PersistedSimulationAttempt>();

export function listLocalSimulationAttempts(input: {
  studentProfileId: string;
  simulationId?: string | undefined;
}) {
  return Array.from(attempts.values())
    .filter(
      (attempt) =>
        attempt.studentProfileId === input.studentProfileId &&
        (!input.simulationId || attempt.simulationId === input.simulationId)
    )
    .sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt));
}

export function createLocalSimulationPersistence() {
  const simulations: SimulationAttemptRepository = {
    createSimulationAttempt(attempt) {
      const id = `local-${attempt.simulationId}-${attempt.studentProfileId}-${Date.now()}`;
      const stored = { ...attempt, id };
      attempts.set(id, stored);
      return Promise.resolve(stored);
    },
    getSimulationAttempt(input) {
      const attempt = attempts.get(input.attemptId);
      return Promise.resolve(
        attempt && attempt.studentProfileId === input.studentProfileId ? attempt : null
      );
    },
    findCompletedSimulationByIdempotency(input) {
      return Promise.resolve(
        Array.from(attempts.values()).find(
          (attempt) =>
            attempt.studentProfileId === input.studentProfileId &&
            attempt.simulationId === input.simulationId &&
            attempt.idempotencyKey === input.idempotencyKey &&
            (attempt.status === "submitted" || attempt.status === "graded")
        ) ?? null
      );
    },
    completeSimulationAttempt(input) {
      const attempt = attempts.get(input.attemptId);
      if (!attempt || attempt.studentProfileId !== input.studentProfileId) {
        return Promise.reject(new Error("Simulation attempt was not found."));
      }

      const completed: PersistedSimulationAttempt = {
        ...attempt,
        status: input.status,
        completedAt: input.completedAt,
        inputState: input.inputState,
        outputSummary: input.outputSummary,
        faultIntroduced: input.faultIntroduced,
        measurementsTaken: input.measurementsTaken,
        diagnosisSubmitted: input.diagnosisSubmitted,
        score: input.score,
        competencyAwards: input.competencyAwards,
        idempotencyKey: input.idempotencyKey
      };
      attempts.set(input.attemptId, completed);
      recordDashboardAttempt(completed);
      return Promise.resolve(completed);
    },
    recordCompetencyAwards() {
      return Promise.resolve();
    },
    updateLessonProgressFromSimulation() {
      return Promise.resolve();
    }
  };

  return {
    repositories: {
      assessments: unusedAssessmentRepository(),
      simulations,
      audit: unusedAuditRepository(),
      transactions: snapshotTransactionRunner()
    },
    services: createAttemptPersistenceServices({
      assessments: unusedAssessmentRepository(),
      simulations,
      audit: unusedAuditRepository(),
      transactions: snapshotTransactionRunner()
    })
  };
}

function recordDashboardAttempt(attempt: PersistedSimulationAttempt) {
  const entry = getSimulationCatalogBySlugForInternalUse("hydraulic-cylinder-force");
  recordLocalSimulationDashboardAttempt(attempt.studentProfileId, {
    id: attempt.id,
    simulationSlug: entry?.slug ?? attempt.simulationId,
    title: entry?.definition.title ?? "Simulation attempt",
    moduleSlug: entry?.moduleSlug ?? "",
    mode: formatMode(attempt.mode),
    status: attempt.status,
    scenarioState: attempt.faultIntroduced ? "fault-state" : "normal-state",
    faultDiagnosisErrors:
      attempt.mode === "fault-diagnosis" && attempt.score === 0 ? 1 : undefined,
    completedAt: attempt.completedAt
  });
}

function snapshotTransactionRunner(): AttemptTransactionRunner {
  return {
    async transaction(operation) {
      const snapshot = new Map(attempts);
      try {
        return await operation();
      } catch (error) {
        attempts.clear();
        for (const [key, value] of snapshot) {
          attempts.set(key, value);
        }
        throw error;
      }
    }
  };
}

function unusedAssessmentRepository(): AssessmentAttemptRepository {
  return {
    getAssessment: () => Promise.resolve(null),
    getStartedAssessmentAttempt: () => Promise.resolve(null),
    getAssessmentAttemptForReview: () => Promise.resolve(null),
    nextAssessmentAttemptNumber: () => Promise.resolve(1),
    createAssessmentAttempt: () => Promise.reject(new Error("Assessment unused.")),
    updateAssessmentProgress: () => Promise.reject(new Error("Assessment unused.")),
    completeAssessmentAttempt: () => Promise.reject(new Error("Assessment unused.")),
    findCompletedAssessmentByIdempotency: () => Promise.resolve(null),
    recordCompetencyAwards: () => Promise.resolve(),
    updateLessonProgressFromAssessment: () => Promise.resolve()
  };
}

function unusedAuditRepository(): AttemptAuditRepository {
  return {
    recordEvent() {
      return Promise.resolve();
    }
  };
}

function formatMode(mode: string) {
  return mode
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function awardsLabel(awards: Partial<Record<CompetencyLevel, number>>) {
  const entries = Object.entries(awards).filter(([, value]) => Boolean(value));
  return entries.length === 0
    ? "No automatic competency awarded"
    : entries.map(([key, value]) => `${key} ${value}`).join(", ");
}
