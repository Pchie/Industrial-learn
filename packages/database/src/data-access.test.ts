import { describe, expect, it } from "vitest";
import {
  createDataAccessServices,
  createSupabasePublicClient,
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
  type AssessmentAttemptDto,
  type AuditEventInput,
  type Caller,
  type EnrolmentDto,
  type IndustrialLearnRepositories,
  type LessonProgressDto,
  type Page,
  type Principal,
  type ProfileDto,
  type PublishedAssessmentDto,
  type PublishedLessonDto,
  type ReviewRecordDto,
  toPublicError
} from "./index";

const studentAId = "11111111-1111-4111-8111-111111111111";
const studentBId = "22222222-2222-4222-8222-222222222222";
const lecturerId = "33333333-3333-4333-8333-333333333333";
const unrelatedLecturerId = "44444444-4444-4444-8444-444444444444";
const reviewerId = "55555555-5555-4555-8555-555555555555";
const adminId = "66666666-6666-4666-8666-666666666666";
const lessonId = "77777777-7777-4777-8777-777777777777";
const assessmentId = "88888888-8888-4888-8888-888888888888";

const configuredEnv = {
  nodeEnv: "test" as const,
  appEnv: "test" as const,
  appBaseUrl: "http://127.0.0.1:3000",
  authMode: "supabase" as const,
  isE2E: false,
  supabase: {
    isConfigured: true,
    url: "https://example.supabase.co",
    anonKey: "anon",
    serviceRoleKey: "service-role",
    projectRef: "project-ref",
    dbUrl: "postgresql://example.invalid/app"
  }
};

function principal(profileId: string, roles: Principal["roles"]): Principal {
  return {
    profileId,
    authUserId: profileId,
    email: `${profileId}@industrial-learn.test`,
    roles
  };
}

function authenticated(profileId: string, roles: Principal["roles"]): Caller {
  return {
    kind: "authenticated",
    principal: principal(profileId, roles)
  };
}

function pageByCursor<T extends { id: string }>(
  items: T[],
  input: { limit: number; cursor?: string | undefined; sortDirection?: "asc" | "desc" }
): Page<T> {
  const sorted = [...items].sort((left, right) =>
    input.sortDirection === "asc"
      ? left.id.localeCompare(right.id)
      : right.id.localeCompare(left.id)
  );
  const start = input.cursor
    ? Math.max(sorted.findIndex((item) => item.id === input.cursor) + 1, 0)
    : 0;
  const selected = sorted.slice(start, start + input.limit);
  const last = selected.at(-1);
  const hasMore = start + input.limit < sorted.length;

  return {
    items: selected,
    nextCursor: hasMore ? last?.id : undefined
  };
}

function createRepositories(options: { failAudit?: boolean } = {}) {
  const auditEvents: AuditEventInput[] = [];
  const profiles = new Map<string, ProfileDto>([
    [
      studentAId,
      {
        id: studentAId,
        displayName: "Student A",
        email: "student-a@example.test"
      }
    ],
    [
      studentBId,
      {
        id: studentBId,
        displayName: "Student B",
        email: "student-b@example.test"
      }
    ]
  ]);
  const lecturerAccess = new Set([`${lecturerId}:${studentAId}`]);
  const progressRows: LessonProgressDto[] = [
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      lessonId,
      studentProfileId: studentAId,
      status: "submitted",
      percentComplete: 60
    },
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      lessonId,
      studentProfileId: studentAId,
      status: "graded",
      percentComplete: 100
    },
    {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      lessonId,
      studentProfileId: studentBId,
      status: "in_progress",
      percentComplete: 20
    }
  ];
  const attempts: AssessmentAttemptDto[] = [
    {
      id: "99999999-9999-4999-8999-999999999999",
      assessmentId,
      studentProfileId: studentAId,
      status: "in_progress",
      answers: [
        {
          questionId: "12121212-1212-4121-8121-121212121212",
          submittedValue: "A",
          isCorrect: true,
          explanation: "Hidden until submission."
        }
      ]
    }
  ];
  const publishedAssessment: PublishedAssessmentDto = {
    id: assessmentId,
    slug: "fluid-pressure-check",
    title: "Fluid pressure knowledge check",
    description: "Pilot assessment.",
    version: 1,
    questions: [
      {
        id: "12121212-1212-4121-8121-121212121212",
        questionType: "single_choice",
        prompt: "Which variables define pressure?",
        points: 1,
        displayOrder: 1,
        choices: [
          {
            id: "abababab-abab-4aba-8bab-abababababab",
            choiceText: "Force and area",
            displayOrder: 1
          }
        ]
      }
    ]
  };
  const publishedLesson: PublishedLessonDto = {
    id: lessonId,
    slug: "fluid-pressure",
    title: "Fluid pressure",
    description: "Pressure fundamentals.",
    difficulty: "Foundational",
    academicLevel: "First year",
    estimatedDurationMinutes: 35,
    technicalReviewStatus: "Approved for student use",
    publicationStatus: "published",
    version: 1
  };
  const reviewRecords: ReviewRecordDto[] = [
    {
      id: "13131313-1313-4131-8131-131313131313",
      entityTable: "lessons",
      entityId: lessonId,
      reviewerProfileId: reviewerId,
      decision: "approved",
      reviewStatus: "Approved for student use",
      reviewedAt: "2026-07-22T00:00:00.000Z"
    }
  ];

  const repositories: IndustrialLearnRepositories = {
    profiles: {
      allowedCaller: "authenticated",
      ownershipRule: "self, authorised lecturer, administrator",
      getProfileById(profileId) {
        return Promise.resolve(profiles.get(profileId) ?? null);
      },
      updatePermittedProfileFields(profileId, fields) {
        const existing = profiles.get(profileId);

        if (!existing) {
          return Promise.reject(new Error("database table public.profiles not found"));
        }

        const updated = {
          ...existing,
          ...fields
        };
        profiles.set(profileId, updated);
        return Promise.resolve(updated);
      },
      lecturerCanAccessStudent(requestingLecturerId, studentProfileId) {
        return Promise.resolve(
          lecturerAccess.has(`${requestingLecturerId}:${studentProfileId}`)
        );
      }
    },
    programmes: {
      allowedCaller: "authenticated",
      ownershipRule: "published catalogue, enrolment, authorised cohort, content staff",
      listPublishedProgrammes(input) {
        return Promise.resolve(
          pageByCursor(
            [
              {
                id: "41414141-4141-4141-8141-414141414141",
                slug: "core-mechanical-engineering",
                title: "Core Mechanical Engineering",
                description: "Published programme.",
                publicationStatus: "published"
              }
            ],
            { ...input, sortDirection: "asc" }
          )
        );
      },
      listStudentEnrolments(input) {
        const rows: EnrolmentDto[] = [
          {
            id: "51515151-5151-4151-8151-515151515151",
            cohortId: "61616161-6161-4161-8161-616161616161",
            studentProfileId: input.studentProfileId,
            enrolledAt: "2026-07-22T00:00:00.000Z"
          }
        ];

        return Promise.resolve(pageByCursor(rows, input));
      }
    },
    lessonProgress: {
      allowedCaller: "authenticated",
      ownershipRule: "student self, authorised lecturer read, administrator",
      listForStudent(input) {
        return Promise.resolve(
          pageByCursor(
            progressRows.filter((row) => row.studentProfileId === input.studentProfileId),
            input
          )
        );
      }
    },
    assessments: {
      allowedCaller: "authenticated",
      ownershipRule: "published content for students; own or authorised attempts",
      getPublishedAssessment(lookupAssessmentId) {
        return Promise.resolve(
          lookupAssessmentId === assessmentId ? publishedAssessment : null
        );
      },
      listAttemptsForStudent(input) {
        return Promise.resolve(
          pageByCursor(
            attempts.filter(
              (attempt) => attempt.studentProfileId === input.studentProfileId
            ),
            input
          )
        );
      }
    },
    simulations: {
      allowedCaller: "authenticated",
      ownershipRule: "student self, authorised lecturer read, administrator",
      listAttemptsForStudent(input) {
        return Promise.resolve(pageByCursor([], input));
      }
    },
    projects: {
      allowedCaller: "authenticated",
      ownershipRule: "student self, authorised lecturer read, administrator",
      listSubmissionsForStudent(input) {
        return Promise.resolve(pageByCursor([], input));
      }
    },
    savedLessons: {
      allowedCaller: "authenticated",
      ownershipRule: "student self only unless administrator",
      listForStudent(input) {
        return Promise.resolve(pageByCursor([], input));
      }
    },
    publishedContent: {
      allowedCaller: "authenticated",
      ownershipRule: "published and approved content only for students",
      getPublishedLessonBySlug(slug) {
        return Promise.resolve(slug === publishedLesson.slug ? publishedLesson : null);
      }
    },
    contentReview: {
      allowedCaller: "content staff",
      ownershipRule: "review queues do not grant student-data access",
      listReviewRecords(input) {
        return Promise.resolve(
          pageByCursor(reviewRecords, { ...input, sortDirection: "desc" })
        );
      }
    },
    auditEvents: {
      allowedCaller: "application service",
      ownershipRule: "security-sensitive events, minimal metadata",
      recordEvent(input) {
        auditEvents.push(input);

        if (options.failAudit) {
          return Promise.reject(new Error("insert into public.audit_events failed"));
        }

        return Promise.resolve();
      }
    },
    transactions: {
      async transaction(operation) {
        const snapshot = [...auditEvents];

        try {
          return await operation();
        } catch (error) {
          auditEvents.splice(0, auditEvents.length, ...snapshot);
          throw error;
        }
      }
    }
  };

  return {
    repositories,
    auditEvents
  };
}

describe("data-access services", () => {
  it("allows an authenticated student to read their own record", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    await expect(
      services.getProfile(
        { caller: authenticated(studentAId, ["student"]) },
        {
          profileId: studentAId
        }
      )
    ).resolves.toMatchObject({ id: studentAId });
  });

  it("prevents a student from reading another student record", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    await expect(
      services.getProfile(
        { caller: authenticated(studentAId, ["student"]) },
        {
          profileId: studentBId
        }
      )
    ).rejects.toMatchObject({ code: "access_denied" });
  });

  it("allows a lecturer to read an authorised cohort student", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    const result = await services.listLessonProgress(
      { caller: authenticated(lecturerId, ["lecturer"]) },
      { studentProfileId: studentAId, limit: 10 }
    );

    expect(Array.isArray(result.items)).toBe(true);
  });

  it("prevents a lecturer from reading an unrelated cohort student", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    await expect(
      services.listLessonProgress(
        { caller: authenticated(unrelatedLecturerId, ["lecturer"]) },
        { studentProfileId: studentAId, limit: 10 }
      )
    ).rejects.toMatchObject({ code: "access_denied" });
  });

  it("prevents a reviewer from accessing private student data", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    await expect(
      services.listAssessmentAttempts(
        { caller: authenticated(reviewerId, ["engineering_reviewer"]) },
        { studentProfileId: studentAId, limit: 10 }
      )
    ).rejects.toMatchObject({ code: "access_denied" });
  });

  it("denies unauthenticated private data access", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    await expect(
      services.listLessonProgress(
        { caller: { kind: "anonymous" } },
        { studentProfileId: studentAId, limit: 10 }
      )
    ).rejects.toMatchObject({ code: "authentication_required" });
  });

  it("rejects invalid IDs and unknown input fields", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    await expect(
      services.getProfile(
        { caller: authenticated(studentAId, ["student"]) },
        {
          profileId: "not-a-uuid"
        }
      )
    ).rejects.toMatchObject({ code: "invalid_input" });

    await expect(
      services.updateOwnProfile(
        { caller: authenticated(studentAId, ["student"]) },
        { profileId: studentAId, displayName: "Ada", role: "administrator" }
      )
    ).rejects.toMatchObject({ code: "invalid_input" });
  });

  it("excludes hidden assessment answers before completed review", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    const page = await services.listAssessmentAttempts(
      { caller: authenticated(studentAId, ["student"]) },
      { studentProfileId: studentAId, limit: 10 }
    );

    expect(page.items[0]?.answers).toBeUndefined();
  });

  it("excludes hidden answer keys from published assessments", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    const assessment = await services.getPublishedAssessment(
      { caller: authenticated(studentAId, ["student"]) },
      { assessmentId }
    );

    expect(JSON.stringify(assessment)).not.toContain("isCorrect");
    expect(JSON.stringify(assessment)).not.toContain("is_correct");
  });

  it("excludes unpublished or unapproved content", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    await expect(
      services.getPublishedLesson(
        { caller: authenticated(studentAId, ["student"]) },
        { slug: "unpublished-fluid-pressure" }
      )
    ).rejects.toMatchObject({ code: "resource_not_found" });
  });

  it("translates database errors without exposing raw SQL details", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    try {
      await services.updateOwnProfile(
        { caller: authenticated(adminId, ["administrator"]) },
        {
          profileId: "99999999-9999-4999-8999-999999999999",
          displayName: "Missing"
        }
      );
      throw new Error("Expected the service to reject");
    } catch (error) {
      const publicError = toPublicError(error);

      expect(publicError.code).toBe("unexpected_server_error");
      expect(publicError.message).not.toContain("public.profiles");
    }
  });

  it("rolls back transaction side effects when a write fails", async () => {
    const { repositories, auditEvents } = createRepositories({ failAudit: true });
    const services = createDataAccessServices(repositories);

    await expect(
      services.submitAssessmentAttempt(
        { caller: authenticated(studentAId, ["student"]) },
        {
          assessmentId,
          studentProfileId: studentAId,
          answers: [
            {
              questionId: "12121212-1212-4121-8121-121212121212",
              value: "A"
            }
          ]
        }
      )
    ).rejects.toMatchObject({ code: "unexpected_server_error" });

    expect(auditEvents).toHaveLength(0);
  });

  it("records audit events for sensitive writes", async () => {
    const { repositories, auditEvents } = createRepositories();
    const services = createDataAccessServices(repositories);

    await services.submitAssessmentAttempt(
      { caller: authenticated(studentAId, ["student"]) },
      {
        assessmentId,
        studentProfileId: studentAId,
        answers: [
          {
            questionId: "12121212-1212-4121-8121-121212121212",
            value: "A"
          }
        ]
      }
    );

    expect(auditEvents).toEqual([
      expect.objectContaining({
        actorProfileId: studentAId,
        action: "assessment_attempt_submitted",
        severity: "info"
      })
    ]);
  });

  it("supports pagination and stable sorting", async () => {
    const { repositories } = createRepositories();
    const services = createDataAccessServices(repositories);

    const firstPage = await services.listLessonProgress(
      { caller: authenticated(studentAId, ["student"]) },
      { studentProfileId: studentAId, limit: 1, sortDirection: "asc" }
    );
    const secondPage = await services.listLessonProgress(
      { caller: authenticated(studentAId, ["student"]) },
      {
        studentProfileId: studentAId,
        limit: 1,
        cursor: firstPage.nextCursor,
        sortDirection: "asc"
      }
    );

    expect(firstPage.items[0]?.id).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(secondPage.items[0]?.id).toBe("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
  });

  it("creates public and session-bound Supabase clients from configured env", () => {
    expect(createSupabasePublicClient(configuredEnv)).toBeDefined();
    expect(createSupabaseServerClient(configuredEnv, "session-token")).toBeDefined();
    expect(() => createSupabaseServerClient(configuredEnv, "")).toThrow(
      "session access token"
    );
  });

  it("keeps service-role clients server-only", () => {
    const writableGlobal = globalThis as typeof globalThis & { window?: unknown };
    const originalWindow = writableGlobal.window;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {}
    });

    expect(() =>
      createSupabaseServiceRoleClient(configuredEnv, "audit-administration")
    ).toThrow("server-only");

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow
    });
  });

  it("requires server-only service-role configuration for privileged clients", () => {
    expect(() =>
      createSupabaseServiceRoleClient(
        {
          ...configuredEnv,
          supabase: {
            ...configuredEnv.supabase,
            serviceRoleKey: undefined
          }
        },
        "profile-provisioning"
      )
    ).toThrow("service-role configuration");
  });
});
