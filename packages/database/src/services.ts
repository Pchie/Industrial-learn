import {
  assertContentStaff,
  assertSelfOrAdmin,
  assertStudentPrivateAccess,
  hasRole,
  requireAuthenticated
} from "./authorization";
import type { AssessmentAttemptDto, Caller, Page, Principal, ProfileDto } from "./domain";
import { ApplicationError, translateDatabaseError } from "./errors";
import type {
  IndustrialLearnRepositories,
  StudentRecordQuery
} from "./repository-contracts";
import {
  profileIdInputSchema,
  paginationSchema,
  publishedAssessmentInputSchema,
  publishedContentInputSchema,
  studentRecordListInputSchema,
  submitAssessmentAttemptInputSchema,
  updateProfileInputSchema
} from "./validation";

type StudentRecordInput = {
  studentProfileId: string;
  limit?: number | undefined;
  cursor?: string | undefined;
  sortDirection?: "asc" | "desc" | undefined;
};

type DataAccessContext = {
  caller: Caller;
  repositories: IndustrialLearnRepositories;
};

async function safeRepositoryCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }

    throw translateDatabaseError(error);
  }
}

function parseOrInvalid<T>(parser: { parse: (input: unknown) => T }, input: unknown) {
  try {
    return parser.parse(input);
  } catch {
    throw new ApplicationError("invalid_input");
  }
}

async function canLecturerAccessStudent(
  repositories: IndustrialLearnRepositories,
  principal: Principal,
  studentProfileId: string
) {
  return hasRole(principal, "lecturer")
    ? repositories.profiles.lecturerCanAccessStudent(
        principal.profileId,
        studentProfileId
      )
    : false;
}

async function assertStudentRecordAccess(
  repositories: IndustrialLearnRepositories,
  principal: Principal,
  studentProfileId: string
) {
  const lecturerAuthorised = await canLecturerAccessStudent(
    repositories,
    principal,
    studentProfileId
  );
  assertStudentPrivateAccess(principal, studentProfileId, lecturerAuthorised);
}

function studentRecordQuery(input: StudentRecordInput): StudentRecordQuery {
  const parsed = parseOrInvalid(studentRecordListInputSchema, input);

  return {
    studentProfileId: parsed.studentProfileId,
    limit: parsed.limit,
    cursor: parsed.cursor,
    sortDirection: parsed.sortDirection
  };
}

function excludeHiddenAssessmentAnswers(
  page: Page<AssessmentAttemptDto>
): Page<AssessmentAttemptDto> {
  return {
    ...page,
    items: page.items.map((attempt) => ({
      ...attempt,
      answers:
        attempt.status === "graded" || attempt.status === "submitted"
          ? attempt.answers?.map((answer) => ({
              questionId: answer.questionId,
              submittedValue: answer.submittedValue,
              isCorrect: answer.isCorrect,
              explanation: answer.explanation
            }))
          : undefined
    }))
  };
}

export function createDataAccessServices(repositories: IndustrialLearnRepositories) {
  return {
    async getProfile(context: Pick<DataAccessContext, "caller">, input: unknown) {
      const principal = requireAuthenticated(context.caller);
      const parsed = parseOrInvalid(profileIdInputSchema, input);
      const lecturerAuthorised = await canLecturerAccessStudent(
        repositories,
        principal,
        parsed.profileId
      );

      if (principal.profileId !== parsed.profileId) {
        assertStudentPrivateAccess(principal, parsed.profileId, lecturerAuthorised);
      }

      return safeRepositoryCall(async () => {
        const profile = await repositories.profiles.getProfileById(parsed.profileId);

        if (!profile) {
          throw new ApplicationError("resource_not_found");
        }

        return profile;
      });
    },

    async updateOwnProfile(
      context: Pick<DataAccessContext, "caller">,
      input: unknown
    ): Promise<ProfileDto> {
      const principal = requireAuthenticated(context.caller);
      const parsed = parseOrInvalid(updateProfileInputSchema, input);
      assertSelfOrAdmin(principal, parsed.profileId);
      const fields: Partial<
        Parameters<typeof repositories.profiles.updatePermittedProfileFields>[1]
      > = {};

      if (parsed.displayName !== undefined) {
        fields.displayName = parsed.displayName;
      }

      if (parsed.preferredName !== undefined) {
        fields.preferredName = parsed.preferredName;
      }

      if (parsed.institutionName !== undefined) {
        fields.institutionName = parsed.institutionName;
      }

      return safeRepositoryCall(async () =>
        repositories.profiles.updatePermittedProfileFields(parsed.profileId, fields)
      );
    },

    async listPublishedProgrammes(input: unknown) {
      return safeRepositoryCall(async () =>
        repositories.programmes.listPublishedProgrammes(
          parseOrInvalid(paginationSchema, input)
        )
      );
    },

    async listStudentEnrolments(
      context: Pick<DataAccessContext, "caller">,
      input: StudentRecordInput
    ) {
      const principal = requireAuthenticated(context.caller);
      const query = studentRecordQuery(input);
      await assertStudentRecordAccess(repositories, principal, query.studentProfileId);

      return safeRepositoryCall(async () =>
        repositories.programmes.listStudentEnrolments(query)
      );
    },

    async listLessonProgress(
      context: Pick<DataAccessContext, "caller">,
      input: StudentRecordInput
    ) {
      const principal = requireAuthenticated(context.caller);
      const query = studentRecordQuery(input);
      await assertStudentRecordAccess(repositories, principal, query.studentProfileId);

      return safeRepositoryCall(async () =>
        repositories.lessonProgress.listForStudent(query)
      );
    },

    async listAssessmentAttempts(
      context: Pick<DataAccessContext, "caller">,
      input: StudentRecordInput
    ) {
      const principal = requireAuthenticated(context.caller);
      const query = studentRecordQuery(input);
      await assertStudentRecordAccess(repositories, principal, query.studentProfileId);

      return safeRepositoryCall(async () =>
        excludeHiddenAssessmentAnswers(
          await repositories.assessments.listAttemptsForStudent(query)
        )
      );
    },

    async getPublishedAssessment(
      context: Pick<DataAccessContext, "caller">,
      input: unknown
    ) {
      requireAuthenticated(context.caller);
      const parsed = parseOrInvalid(publishedAssessmentInputSchema, input);

      return safeRepositoryCall(async () => {
        const assessment = await repositories.assessments.getPublishedAssessment(
          parsed.assessmentId
        );

        if (!assessment) {
          throw new ApplicationError("resource_not_found");
        }

        return assessment;
      });
    },

    async listSimulationAttempts(
      context: Pick<DataAccessContext, "caller">,
      input: StudentRecordInput
    ) {
      const principal = requireAuthenticated(context.caller);
      const query = studentRecordQuery(input);
      await assertStudentRecordAccess(repositories, principal, query.studentProfileId);

      return safeRepositoryCall(async () =>
        repositories.simulations.listAttemptsForStudent(query)
      );
    },

    async listProjectSubmissions(
      context: Pick<DataAccessContext, "caller">,
      input: StudentRecordInput
    ) {
      const principal = requireAuthenticated(context.caller);
      const query = studentRecordQuery(input);
      await assertStudentRecordAccess(repositories, principal, query.studentProfileId);

      return safeRepositoryCall(async () =>
        repositories.projects.listSubmissionsForStudent(query)
      );
    },

    async getPublishedLesson(context: Pick<DataAccessContext, "caller">, input: unknown) {
      requireAuthenticated(context.caller);
      const parsed = parseOrInvalid(publishedContentInputSchema, input);

      return safeRepositoryCall(async () => {
        const lesson = await repositories.publishedContent.getPublishedLessonBySlug(
          parsed.slug
        );

        if (!lesson) {
          throw new ApplicationError("resource_not_found");
        }

        return lesson;
      });
    },

    async listReviewRecords(context: Pick<DataAccessContext, "caller">, input: unknown) {
      const principal = requireAuthenticated(context.caller);
      assertContentStaff(principal);

      return safeRepositoryCall(async () =>
        repositories.contentReview.listReviewRecords(
          parseOrInvalid(paginationSchema, input)
        )
      );
    },

    async submitAssessmentAttempt(
      context: Pick<DataAccessContext, "caller">,
      input: unknown
    ) {
      const principal = requireAuthenticated(context.caller);
      const parsed = parseOrInvalid(submitAssessmentAttemptInputSchema, input);
      assertSelfOrAdmin(principal, parsed.studentProfileId);

      return safeRepositoryCall(async () =>
        repositories.transactions.transaction(async () => {
          await repositories.auditEvents.recordEvent({
            actorProfileId: principal.profileId,
            action: "assessment_attempt_submitted",
            entityTable: "assessment_attempts",
            entityId: parsed.assessmentId,
            severity: "info",
            metadata: {
              answerCount: parsed.answers.length
            }
          });

          return {
            assessmentId: parsed.assessmentId,
            studentProfileId: parsed.studentProfileId,
            answerCount: parsed.answers.length
          };
        })
      );
    }
  };
}
