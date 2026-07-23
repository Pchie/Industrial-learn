export const DATA_ACCESS_ROLES = [
  "student",
  "lecturer",
  "content_author",
  "engineering_reviewer",
  "administrator"
] as const;

export type DataAccessRole = (typeof DATA_ACCESS_ROLES)[number];

export type Principal = {
  profileId: string;
  authUserId: string;
  email: string;
  roles: DataAccessRole[];
};

export type Caller =
  | {
      kind: "anonymous";
    }
  | {
      kind: "authenticated";
      principal: Principal;
    };

export type PublicationStatus =
  "draft" | "internal" | "scheduled" | "published" | "archived";

export type TechnicalReviewStatus =
  | "Draft"
  | "Source required"
  | "Source checked"
  | "Equation checked"
  | "Simulation checked"
  | "Engineering review required"
  | "Approved for student use";

export type AttemptStatus =
  "not_started" | "in_progress" | "submitted" | "graded" | "abandoned";

export type AuditSeverity = "info" | "warning" | "security" | "critical";

export type SortDirection = "asc" | "desc";

export type PaginationInput = {
  limit: number;
  cursor?: string | undefined;
};

export type Page<T> = {
  items: T[];
  nextCursor?: string | undefined;
};

export type ProfileDto = {
  id: string;
  displayName: string;
  email: string;
  preferredName?: string | undefined;
  institutionName?: string | undefined;
};

export type ProgrammeSummaryDto = {
  id: string;
  slug: string;
  title: string;
  description: string;
  publicationStatus: PublicationStatus;
};

export type EnrolmentDto = {
  id: string;
  cohortId: string;
  studentProfileId: string;
  enrolledAt: string;
  withdrawnAt?: string | undefined;
};

export type LessonProgressDto = {
  id: string;
  lessonId: string;
  studentProfileId: string;
  status: AttemptStatus;
  percentComplete: number;
  startedAt?: string | undefined;
  completedAt?: string | undefined;
  lastActivityAt?: string | undefined;
};

export type AssessmentAnswerReviewDto = {
  questionId: string;
  submittedValue: unknown;
  isCorrect?: boolean | undefined;
  explanation?: string | undefined;
};

export type AssessmentAttemptDto = {
  id: string;
  assessmentId: string;
  studentProfileId: string;
  status: AttemptStatus;
  score?: number | undefined;
  maxScore?: number | undefined;
  submittedAt?: string | undefined;
  answers?: AssessmentAnswerReviewDto[] | undefined;
};

export type AssessmentQuestionDto = {
  id: string;
  questionType: string;
  prompt: string;
  points: number;
  displayOrder: number;
  choices: {
    id: string;
    choiceText: string;
    displayOrder: number;
  }[];
};

export type PublishedAssessmentDto = {
  id: string;
  slug: string;
  title: string;
  description: string;
  version: number;
  questions: AssessmentQuestionDto[];
};

export type SimulationAttemptDto = {
  id: string;
  simulationId: string;
  studentProfileId: string;
  status: AttemptStatus;
  scenarioState: string;
  startedAt: string;
  completedAt?: string | undefined;
};

export type ProjectSubmissionDto = {
  id: string;
  projectId: string;
  studentProfileId: string;
  status: AttemptStatus;
  submittedAt?: string | undefined;
  reviewedAt?: string | undefined;
  reviewedByProfileId?: string | undefined;
};

export type SavedLessonDto = {
  id: string;
  lessonId: string;
  studentProfileId: string;
  savedAt: string;
};

export type PublishedLessonDto = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  academicLevel: string;
  estimatedDurationMinutes: number;
  technicalReviewStatus: TechnicalReviewStatus;
  publicationStatus: PublicationStatus;
  version: number;
};

export type ReviewRecordDto = {
  id: string;
  entityTable: string;
  entityId: string;
  reviewerProfileId: string;
  decision: "approved" | "changes_requested" | "rejected";
  reviewStatus: TechnicalReviewStatus;
  reviewedAt: string;
};

export type AuditEventInput = {
  actorProfileId: string;
  action: string;
  entityTable?: string | undefined;
  entityId?: string | undefined;
  severity: AuditSeverity;
  metadata?: Record<string, string | number | boolean | null> | undefined;
};
