import type {
  AssessmentAttemptDto,
  AuditEventInput,
  EnrolmentDto,
  LessonProgressDto,
  Page,
  PaginationInput,
  ProfileDto,
  ProgrammeSummaryDto,
  ProjectSubmissionDto,
  PublishedAssessmentDto,
  PublishedLessonDto,
  ReviewRecordDto,
  SavedLessonDto,
  SimulationAttemptDto,
  SortDirection
} from "./domain.js";

export type StudentRecordQuery = PaginationInput & {
  studentProfileId: string;
  sortDirection: SortDirection;
};

export type ProfileRepository = {
  allowedCaller: "authenticated";
  ownershipRule: "self, authorised lecturer, administrator";
  getProfileById(profileId: string): Promise<ProfileDto | null>;
  updatePermittedProfileFields(
    profileId: string,
    fields: Partial<Pick<ProfileDto, "displayName" | "preferredName" | "institutionName">>
  ): Promise<ProfileDto>;
  lecturerCanAccessStudent(
    lecturerProfileId: string,
    studentProfileId: string
  ): Promise<boolean>;
};

export type ProgrammeRepository = {
  allowedCaller: "authenticated";
  ownershipRule: "published catalogue, enrolment, authorised cohort, content staff";
  listPublishedProgrammes(input: PaginationInput): Promise<Page<ProgrammeSummaryDto>>;
  listStudentEnrolments(input: StudentRecordQuery): Promise<Page<EnrolmentDto>>;
};

export type LessonProgressRepository = {
  allowedCaller: "authenticated";
  ownershipRule: "student self, authorised lecturer read, administrator";
  listForStudent(input: StudentRecordQuery): Promise<Page<LessonProgressDto>>;
};

export type AssessmentRepository = {
  allowedCaller: "authenticated";
  ownershipRule: "published content for students; own or authorised attempts";
  getPublishedAssessment(assessmentId: string): Promise<PublishedAssessmentDto | null>;
  listAttemptsForStudent(input: StudentRecordQuery): Promise<Page<AssessmentAttemptDto>>;
};

export type SimulationRepository = {
  allowedCaller: "authenticated";
  ownershipRule: "student self, authorised lecturer read, administrator";
  listAttemptsForStudent(input: StudentRecordQuery): Promise<Page<SimulationAttemptDto>>;
};

export type ProjectRepository = {
  allowedCaller: "authenticated";
  ownershipRule: "student self, authorised lecturer read, administrator";
  listSubmissionsForStudent(
    input: StudentRecordQuery
  ): Promise<Page<ProjectSubmissionDto>>;
};

export type SavedLessonRepository = {
  allowedCaller: "authenticated";
  ownershipRule: "student self only unless administrator";
  listForStudent(input: StudentRecordQuery): Promise<Page<SavedLessonDto>>;
};

export type PublishedContentRepository = {
  allowedCaller: "authenticated";
  ownershipRule: "published and approved content only for students";
  getPublishedLessonBySlug(slug: string): Promise<PublishedLessonDto | null>;
};

export type ContentReviewRepository = {
  allowedCaller: "content staff";
  ownershipRule: "review queues do not grant student-data access";
  listReviewRecords(input: PaginationInput): Promise<Page<ReviewRecordDto>>;
};

export type AuditRepository = {
  allowedCaller: "application service";
  ownershipRule: "security-sensitive events, minimal metadata";
  recordEvent(input: AuditEventInput): Promise<void>;
};

export type TransactionRunner = {
  transaction<T>(operation: () => Promise<T>): Promise<T>;
};

export type IndustrialLearnRepositories = {
  profiles: ProfileRepository;
  programmes: ProgrammeRepository;
  lessonProgress: LessonProgressRepository;
  assessments: AssessmentRepository;
  simulations: SimulationRepository;
  projects: ProjectRepository;
  savedLessons: SavedLessonRepository;
  publishedContent: PublishedContentRepository;
  contentReview: ContentReviewRepository;
  auditEvents: AuditRepository;
  transactions: TransactionRunner;
};
