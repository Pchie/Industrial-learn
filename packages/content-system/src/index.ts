import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

export const REVIEW_STATUSES = [
  "Draft",
  "Source required",
  "Source checked",
  "Equation checked",
  "Simulation checked",
  "Engineering review required",
  "Approved for student use"
] as const;

export const LESSON_ENGINE_REQUIRED_SECTIONS = [
  "lessonHeader",
  "estimatedCompletionTime",
  "difficulty",
  "prerequisites",
  "learningOutcomes",
  "whyTopicMatters",
  "keyTerminology",
  "visualExplanation",
  "theory",
  "equations",
  "workedExamples",
  "interactiveActivity",
  "faultFindingExercise",
  "safetyConsiderations",
  "knowledgeCheck",
  "summary",
  "sources",
  "nextRecommendedLesson"
] as const;

export const LESSON_CONTENT_BLOCK_TYPES = [
  "paragraph",
  "definition",
  "diagram",
  "equation",
  "symbolTable",
  "unitNote",
  "assumption",
  "workedCalculation",
  "engineeringInterpretation",
  "warning",
  "faultCase",
  "question",
  "sourceCitation"
] as const;

export const ASSESSMENT_QUESTION_TYPES = [
  "multiple-choice",
  "numeric-engineering-calculation",
  "component-identification",
  "diagram-question",
  "sequence-question",
  "simulation-task",
  "fault-diagnosis",
  "design-challenge"
] as const;

export const COMPETENCY_LEVELS = [
  "Introduced",
  "Understood",
  "Calculated",
  "Operated",
  "Diagnosed",
  "Designed"
] as const;

type ReviewStatus = (typeof REVIEW_STATUSES)[number];
type LessonSectionId = (typeof LESSON_ENGINE_REQUIRED_SECTIONS)[number];
type LessonContentBlockType = (typeof LESSON_CONTENT_BLOCK_TYPES)[number];
type AssessmentQuestionType = (typeof ASSESSMENT_QUESTION_TYPES)[number];
type CompetencyLevel = (typeof COMPETENCY_LEVELS)[number];

type SourceRecord = {
  id: string;
  title?: string;
  documentType?: string;
  citation?: string;
  approvalStatus?: ReviewStatus;
  evidenceStatus: "missing" | "partial" | "approved";
  reviewStatus: ReviewStatus;
  filePath?: string | null;
  relevantPages?: string[];
};

type Equation = {
  id: string;
  symbols: string[];
  siUnits: Record<string, string>;
  sourceIds: string[];
  reviewStatus: ReviewStatus;
};

type KnowledgeFile = {
  metadata: {
    id: string;
    sourceIds: string[];
  };
  equations: Equation[];
  symbolDefinitions: Array<{ symbol: string; unit: string }>;
  sourceCitations: string[];
  sourceReferences?: SourceReference[];
  reviewStatus: ReviewStatus;
};

type SourceReference = {
  sourceId: string;
  section?: string;
  pages?: string;
};

type Lesson = {
  id: string;
  publicationStatus: "draft" | "internal" | "scheduled" | "published" | "archived";
  reviewStatus: ReviewStatus;
  knowledgeFileIds: string[];
  sourceIds: string[];
  requiredSections: LessonSectionId[];
  sections: Record<string, { title?: string; blocks?: unknown[] }>;
};

type Assessment = {
  id: string;
  lessonId: string;
  title: string;
  learningOutcomeIds: string[];
  questions: AssessmentQuestion[];
  sourceIds: string[];
  reviewStatus: ReviewStatus;
};

type AssessmentQuestion = {
  id: string;
  type: AssessmentQuestionType;
  prompt: string;
  learningOutcomeIds: string[];
  competencyLevel: CompetencyLevel;
  points: number;
  explanation: string;
  sourceIds: string[];
  expectedAnswer?: { value?: unknown; unit?: unknown };
  tolerance?: { absolute?: unknown };
};

export type ContentValidationResult = {
  errors: string[];
  warnings: string[];
};

function readJsonFiles(root: string) {
  const files: string[] = [];

  function walk(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && extname(entry.name) === ".json") {
        files.push(fullPath);
      }
    }
  }

  walk(root);

  return files.map((file) => ({
    file,
    data: JSON.parse(readFileSync(file, "utf8")) as unknown
  }));
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === "string" && REVIEW_STATUSES.includes(value as ReviewStatus);
}

function unknownArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [];
}

function collectSourceIds(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  const candidate = value as { sourceIds?: unknown; sourceCitations?: unknown };
  const sourceIds = unknownArray(candidate.sourceIds);
  const sourceCitations = unknownArray(candidate.sourceCitations);
  const ids: unknown[] = [...sourceIds, ...sourceCitations];

  return ids.filter((id): id is string => typeof id === "string");
}

function collectSourceIdsDeep(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  const direct = collectSourceIds(value);

  if (Array.isArray(value)) {
    return [...direct, ...value.flatMap((item) => collectSourceIdsDeep(item))];
  }

  return [
    ...direct,
    ...Object.values(value as Record<string, unknown>).flatMap((item) =>
      collectSourceIdsDeep(item)
    )
  ];
}

function isLessonContentBlockType(value: unknown): value is LessonContentBlockType {
  return (
    typeof value === "string" &&
    LESSON_CONTENT_BLOCK_TYPES.includes(value as LessonContentBlockType)
  );
}

function isAssessmentQuestionType(value: unknown): value is AssessmentQuestionType {
  return (
    typeof value === "string" &&
    ASSESSMENT_QUESTION_TYPES.includes(value as AssessmentQuestionType)
  );
}

function isCompetencyLevel(value: unknown): value is CompetencyLevel {
  return (
    typeof value === "string" && COMPETENCY_LEVELS.includes(value as CompetencyLevel)
  );
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function collectBlockSourceIds(block: unknown): string[] {
  if (!block || typeof block !== "object") {
    return [];
  }

  const sourceIds = collectSourceIds(block);
  const sourceId = (block as { sourceId?: unknown }).sourceId;

  return hasText(sourceId) ? [...sourceIds, sourceId] : sourceIds;
}

function validateSymbolRecords(
  records: unknown[],
  blockId: unknown,
  blockLabel: string,
  file: string,
  errors: string[]
) {
  if (records.length === 0) {
    errors.push(
      `${file}: ${blockLabel} block ${String(blockId)} must define symbols and SI units.`
    );
  }

  for (const symbolRecord of records) {
    if (!symbolRecord || typeof symbolRecord !== "object") {
      errors.push(
        `${file}: ${blockLabel} block ${String(blockId)} contains an invalid symbol record.`
      );
      continue;
    }

    const symbol = symbolRecord as { symbol?: unknown; name?: unknown; unit?: unknown };
    if (!hasText(symbol.symbol) || !hasText(symbol.name) || !hasText(symbol.unit)) {
      errors.push(
        `${file}: ${blockLabel} block ${String(blockId)} has an undefined symbol or SI unit.`
      );
    }
  }
}

function validateLessonBlock(
  block: unknown,
  file: string,
  sourceIds: Set<string>,
  errors: string[]
) {
  if (!block || typeof block !== "object") {
    errors.push(`${file}: lesson content block must be an object.`);
    return;
  }

  const record = block as Record<string, unknown>;

  if (!hasText(record.id)) {
    errors.push(`${file}: lesson content block is missing an id.`);
  }

  if (!isLessonContentBlockType(record.type)) {
    errors.push(`${file}: invalid lesson content block type '${String(record.type)}'.`);
  }

  for (const sourceId of collectBlockSourceIds(record)) {
    if (!sourceIds.has(sourceId)) {
      errors.push(`${file}: source ID ${sourceId} does not exist.`);
    }
  }

  if (record.type === "diagram" && !hasText(record.altText)) {
    errors.push(
      `${file}: diagram block ${String(record.id)} requires accessible alt text.`
    );
  }

  if (record.type === "equation") {
    if (!hasText(record.expression)) {
      errors.push(
        `${file}: equation block ${String(record.id)} is missing an expression.`
      );
    }
    validateSymbolRecords(
      unknownArray(record.symbols),
      record.id,
      "equation",
      file,
      errors
    );
  }

  if (record.type === "symbolTable") {
    validateSymbolRecords(
      unknownArray(record.symbols),
      record.id,
      "symbol table",
      file,
      errors
    );
  }

  if (record.type === "workedCalculation" && unknownArray(record.steps).length === 0) {
    errors.push(
      `${file}: worked calculation block ${String(record.id)} requires expandable steps.`
    );
  }
}

function validateAssessment(
  assessment: Assessment,
  file: string,
  sourceIds: Set<string>,
  errors: string[]
) {
  if (!isReviewStatus(assessment.reviewStatus)) {
    errors.push(`${file}: invalid review status '${String(assessment.reviewStatus)}'.`);
  }

  if (
    !Array.isArray(assessment.learningOutcomeIds) ||
    assessment.learningOutcomeIds.length === 0
  ) {
    errors.push(`${file}: assessment must reference at least one learning outcome.`);
  }

  for (const sourceId of assessment.sourceIds) {
    if (!sourceIds.has(sourceId)) {
      errors.push(`${file}: source ID ${sourceId} does not exist.`);
    }
  }

  for (const question of assessment.questions) {
    if (!isAssessmentQuestionType(question.type)) {
      errors.push(
        `${file}: question ${question.id} has invalid type '${String(question.type)}'.`
      );
    }
    if (!isCompetencyLevel(question.competencyLevel)) {
      errors.push(`${file}: question ${question.id} has invalid competency level.`);
    }
    if (
      !Array.isArray(question.learningOutcomeIds) ||
      question.learningOutcomeIds.length === 0
    ) {
      errors.push(`${file}: question ${question.id} must reference learning outcomes.`);
    }
    if (!hasText(question.explanation)) {
      errors.push(`${file}: question ${question.id} must include an answer explanation.`);
    }
    if (!Number.isFinite(question.points) || question.points < 0) {
      errors.push(`${file}: question ${question.id} must define non-negative points.`);
    }
    for (const sourceId of question.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`${file}: source ID ${sourceId} does not exist.`);
      }
    }
    if (question.type === "numeric-engineering-calculation") {
      if (
        !question.expectedAnswer ||
        !Number.isFinite(question.expectedAnswer.value) ||
        !hasText(question.expectedAnswer.unit)
      ) {
        errors.push(
          `${file}: numeric question ${question.id} must define a unit-aware expected answer.`
        );
      }
      if (!question.tolerance || !Number.isFinite(question.tolerance.absolute)) {
        errors.push(
          `${file}: numeric question ${question.id} must define an absolute tolerance.`
        );
      }
    }
  }
}

function isPlaceholderSource(source: SourceRecord) {
  const searchable = [source.id, source.title, source.documentType, source.citation]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return searchable.includes("placeholder") || searchable.includes("source required");
}

function validateSourceReference(
  reference: SourceReference,
  file: string,
  sourcesById: Map<string, SourceRecord>,
  errors: string[]
) {
  const source = sourcesById.get(reference.sourceId);

  if (!source) {
    errors.push(`${file}: source ID ${reference.sourceId} does not exist.`);
    return;
  }

  if (!reference.pages) {
    return;
  }

  const pages = source.relevantPages ?? [];

  if (source.evidenceStatus === "missing" || pages.length === 0) {
    errors.push(
      `${file}: page reference '${reference.pages}' for ${reference.sourceId} has no verified source metadata.`
    );
    return;
  }

  if (!pages.includes(reference.pages)) {
    errors.push(
      `${file}: page reference '${reference.pages}' for ${reference.sourceId} is not listed in the source metadata.`
    );
  }
}

export function validateContentSystem(
  workspaceRoot = process.cwd()
): ContentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sourceRecords = readJsonFiles(join(workspaceRoot, "sources")).map(
    ({ data, file }) => ({
      file,
      data: data as SourceRecord
    })
  );
  const knowledgeFiles = readJsonFiles(join(workspaceRoot, "knowledge")).map(
    ({ data, file }) => ({
      file,
      data: data as KnowledgeFile
    })
  );
  const lessonFiles = readJsonFiles(join(workspaceRoot, "content/lessons")).map(
    ({ data, file }) => ({
      file,
      data: data as Lesson
    })
  );
  const assessmentFiles = readJsonFiles(join(workspaceRoot, "content/assessments"));
  const projectFiles = readJsonFiles(join(workspaceRoot, "content/projects"));

  const sourceIds = new Set(sourceRecords.map(({ data }) => data.id));
  const sourcesById = new Map(sourceRecords.map(({ data }) => [data.id, data]));
  const knowledgeIds = new Set(knowledgeFiles.map(({ data }) => data.metadata.id));

  for (const { data, file } of sourceRecords) {
    if (!isReviewStatus(data.reviewStatus)) {
      errors.push(
        `${file}: invalid source review status '${String(data.reviewStatus)}'.`
      );
    }
    if (data.evidenceStatus !== "approved") {
      warnings.push(
        `${file}: missing technical evidence approval for source ${data.id}.`
      );
    }
    if (
      (data.reviewStatus === "Approved for student use" ||
        data.approvalStatus === "Approved for student use") &&
      data.evidenceStatus !== "approved"
    ) {
      errors.push(`${file}: approved source ${data.id} must have approved evidence.`);
    }
    if (
      isPlaceholderSource(data) &&
      (data.reviewStatus === "Approved for student use" ||
        data.approvalStatus === "Approved for student use" ||
        data.evidenceStatus === "approved")
    ) {
      errors.push(`${file}: placeholder source ${data.id} cannot be approved.`);
    }
  }

  for (const { data, file } of knowledgeFiles) {
    if (!isReviewStatus(data.reviewStatus)) {
      errors.push(
        `${file}: invalid knowledge review status '${String(data.reviewStatus)}'.`
      );
    }

    const referencedSourceIds = [...new Set(collectSourceIdsDeep(data))];

    for (const sourceId of referencedSourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`${file}: source ID ${sourceId} does not exist.`);
      }
    }

    if (JSON.stringify(data).length > 18_000) {
      errors.push(`${file}: knowledge file exceeds the focused-topic size policy.`);
    }

    for (const reference of data.sourceReferences ?? []) {
      validateSourceReference(reference, file, sourcesById, errors);
    }

    const definedSymbols = new Map(
      data.symbolDefinitions.map((definition) => [definition.symbol, definition.unit])
    );

    for (const equation of data.equations) {
      if (!isReviewStatus(equation.reviewStatus)) {
        errors.push(`${file}: equation ${equation.id} has invalid review status.`);
      }

      if (
        equation.reviewStatus === "Approved for student use" &&
        equation.sourceIds.length === 0
      ) {
        errors.push(`${file}: approved equation ${equation.id} requires source IDs.`);
      }

      for (const reference of (
        equation as Equation & { sourceReferences?: SourceReference[] }
      ).sourceReferences ?? []) {
        validateSourceReference(reference, file, sourcesById, errors);
      }

      for (const symbol of equation.symbols) {
        if (!definedSymbols.has(symbol)) {
          errors.push(
            `${file}: equation ${equation.id} symbol '${symbol}' is not defined.`
          );
        }
        if (!equation.siUnits[symbol]) {
          errors.push(
            `${file}: equation ${equation.id} symbol '${symbol}' has no SI unit.`
          );
        }
      }
    }
  }

  for (const { data, file } of lessonFiles) {
    if (!isReviewStatus(data.reviewStatus)) {
      errors.push(
        `${file}: invalid lesson review status '${String(data.reviewStatus)}'.`
      );
    }

    if (
      data.publicationStatus === "published" &&
      data.reviewStatus !== "Approved for student use"
    ) {
      errors.push(
        `${file}: published lessons require Approved for student use review status.`
      );
    }

    if (
      data.publicationStatus === "published" &&
      data.sourceIds.some(
        (sourceId) => sourcesById.get(sourceId)?.evidenceStatus !== "approved"
      )
    ) {
      errors.push(`${file}: published lessons cannot use missing source evidence.`);
    }

    for (const section of LESSON_ENGINE_REQUIRED_SECTIONS) {
      if (!data.requiredSections.includes(section)) {
        errors.push(`${file}: required lesson section '${section}' is not listed.`);
      }
      if (!(section in data.sections)) {
        errors.push(`${file}: required lesson section '${section}' is missing.`);
      }
    }

    for (const section of data.requiredSections) {
      const lessonSection = data.sections[section];
      if (!lessonSection || typeof lessonSection !== "object") {
        errors.push(
          `${file}: required lesson section '${section}' must be a structured object.`
        );
        continue;
      }

      if (!hasText(lessonSection.title)) {
        errors.push(`${file}: required lesson section '${section}' is missing a title.`);
      }

      const blocks = unknownArray(lessonSection.blocks);
      if (blocks.length === 0) {
        errors.push(
          `${file}: required lesson section '${section}' must contain content blocks.`
        );
      }

      for (const block of blocks) {
        validateLessonBlock(block, file, sourceIds, errors);
      }
    }

    for (const knowledgeFileId of data.knowledgeFileIds) {
      if (!knowledgeIds.has(knowledgeFileId)) {
        errors.push(`${file}: knowledge file ID ${knowledgeFileId} does not exist.`);
      }
    }

    for (const sourceId of data.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`${file}: source ID ${sourceId} does not exist.`);
      }
    }
  }

  for (const { data, file } of assessmentFiles) {
    validateAssessment(data as Assessment, file, sourceIds, errors);
  }

  for (const { data, file } of projectFiles) {
    const object = data as { reviewStatus?: unknown };
    if (!isReviewStatus(object.reviewStatus)) {
      errors.push(`${file}: invalid review status '${String(object.reviewStatus)}'.`);
    }
    for (const sourceId of collectSourceIds(data)) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`${file}: source ID ${sourceId} does not exist.`);
      }
    }
  }

  return { errors, warnings };
}
