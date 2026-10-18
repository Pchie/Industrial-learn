import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthenticatedSession } from "../auth/session-core";
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
import {
  createLocalAssessmentPersistence,
  resetLocalAssessmentStoreForTests
} from "./local-store";
import { createAssessmentFromCatalog, getAssessmentCatalogBySlug } from "./catalog";
import {
  loadAssessmentAttemptPage,
  loadCompletedAssessmentReview,
  startAssessmentForStudent
} from "./server";

const entry = getAssessmentCatalogBySlug("basic-fluid-pressure-check")!;
const session = {
  profile: {
    id: "synthetic-owner",
    email: "synthetic@example.test",
    displayName: "Synthetic",
    accountStatus: "active",
    roles: ["student"]
  },
  authUserId: "synthetic-owner",
  email: "synthetic@example.test",
  roles: ["student"],
  capabilities: ["workspace:student"]
} as AuthenticatedSession;
async function seed(version: number, graded = true) {
  const assessment = createAssessmentFromCatalog(entry);
  return createLocalAssessmentPersistence().repositories.assessments.createAssessmentAttempt(
    {
      id: "temporary",
      assessmentId: entry.localAssessmentId,
      studentProfileId: session.profile.id,
      contentVersion: version,
      attemptNumber: version,
      status: graded ? "graded" : "in_progress",
      submittedAnswers: [],
      competencyAwards: {},
      startedAt: new Date().toISOString(),
      ...(graded
        ? {
            scoringSummary: {
              id: "score-original",
              assessmentId: entry.localAssessmentId,
              studentId: session.profile.id,
              status: "completed",
              submittedAt: new Date().toISOString(),
              answers: [],
              earnedPoints: 0,
              maxPoints: 6,
              competencyProgress: {},
              questionResults: assessment.questions.map((q) => ({
                questionId: q.id,
                type: q.type,
                earnedPoints: 0,
                maxPoints: q.points,
                correct: false,
                explanation: "Synthetic result context",
                competencyLevel: q.competencyLevel,
                learningOutcomeIds: q.learningOutcomeIds,
                errors: []
              }))
            }
          }
        : {})
    }
  );
}
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_APP_ENV", "test");
  vi.stubEnv("APP_BASE_URL", "http://127.0.0.1:3100");
  vi.stubEnv("INDUSTRIAL_LEARN_AUTH_MODE", "local");
  vi.stubEnv("INDUSTRIAL_LEARN_E2E", "true");
  for (const key of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_PROJECT_REF",
    "SUPABASE_DB_URL"
  ])
    vi.stubEnv(key, "");
  resetLocalAssessmentStoreForTests();
});
afterEach(() => {
  resetLocalAssessmentStoreForTests();
  vi.unstubAllEnvs();
});

describe("53E-F03 direct attempt/review loaders", () => {
  it("never pairs a v1 completion with installed v2 questions", async () => {
    const attempt = await seed(1);
    expect(
      await loadCompletedAssessmentReview(session, entry.slug, attempt.id)
    ).toBeNull();
    expect(await loadAssessmentAttemptPage(session, entry.slug, attempt.id)).toBeNull();
  });
  it("rejects old in-progress delivery and starts an eligible v2 attempt", async () => {
    const old = await seed(1, false);
    expect(await loadAssessmentAttemptPage(session, entry.slug, old.id)).toBeNull();
    expect(await startAssessmentForStudent(session, entry.slug)).toMatchObject({
      contentVersion: 2
    });
  });
  it("returns exact owned v2 scoring on repeated review but denies B and manipulated slugs", async () => {
    const attempt = await seed(2);
    const first = await loadCompletedAssessmentReview(session, entry.slug, attempt.id);
    expect(first?.summary.contentVersion).toBe(2);
    expect(first?.attempt.scoringSummary).toEqual(attempt.scoringSummary);
    expect(await loadCompletedAssessmentReview(session, entry.slug, attempt.id)).toEqual(
      first
    );
    expect(
      await loadCompletedAssessmentReview(
        { ...session, profile: { ...session.profile, id: "student-b" } },
        entry.slug,
        attempt.id
      )
    ).toBeNull();
    expect(
      await loadCompletedAssessmentReview(session, "wrong-assessment", attempt.id)
    ).toBeNull();
  });
});
