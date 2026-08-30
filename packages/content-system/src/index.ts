import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, isAbsolute, join } from "node:path";
import {
  evaluateStaticLessonReviewGate,
  validateStaticTechnicalReviewRecord,
  type StaticTechnicalReviewRecord
} from "@industrial-learn/content-review-workflow/static-review-record";

export const REVIEW_STATUSES = [
  "Draft",
  "Source required",
  "Source checked",
  "Equation checked",
  "Simulation checked",
  "Engineering review required",
  "Approved for student use"
] as const;

export const SOURCE_AUTHORITY_CATEGORIES = [
  "governing-authoritative",
  "official-technical-documentation",
  "university-engineering-textbook",
  "university-peer-reviewed-educational",
  "supporting"
] as const;

export const SOURCE_SELECTION_ROLES = [
  "governing",
  "primary",
  "corroborating",
  "supporting"
] as const;

export const ACADEMIC_PUBLISHER_ASSESSMENT_OUTCOMES = [
  "mcgraw-hill-selected",
  "equivalent-source-selected",
  "preferred-source-not-legally-available",
  "preferred-source-insufficient",
  "not-applicable-to-source-role"
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
  "sourceCitation",
  "heroSimulation",
  "interactiveDiagram",
  "animation",
  "observationQuestion",
  "microTheory",
  "liveEquation",
  "componentCutaway",
  "linkedSchematic",
  "engineeringChallenge",
  "faultChallenge",
  "realWorldApplication",
  "deepDive"
] as const;

export const VISUAL_LESSON_STAGE_IDS = [
  "heroExperience",
  "explore",
  "observe",
  "microTheory",
  "liveEquation",
  "engineeringChallenge",
  "faultMode",
  "realWorldApplication",
  "knowledgeCheck",
  "deepDive",
  "sources"
] as const;

export const VISUAL_LESSON_TYPES = [
  "phenomenon",
  "component",
  "system",
  "calculation",
  "diagnostic",
  "design"
] as const;

export const VISUAL_PROGRESSION_STEPS = [
  "see",
  "play",
  "calculate",
  "challenge",
  "apply",
  "check"
] as const;

export const VISUAL_LESSON_TYPE_REQUIREMENTS = {
  phenomenon: ["observationQuestion", "microTheory"],
  component: ["componentCutaway", "observationQuestion", "microTheory"],
  system: ["linkedSchematic", "observationQuestion", "microTheory"],
  calculation: ["liveEquation", "engineeringChallenge"],
  diagnostic: ["heroSimulation", "faultChallenge"],
  design: ["engineeringChallenge", "realWorldApplication"]
} as const satisfies Record<VisualLessonType, readonly LessonContentBlockType[]>;

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
type VisualLessonStageId = (typeof VISUAL_LESSON_STAGE_IDS)[number];
type VisualLessonType = (typeof VISUAL_LESSON_TYPES)[number];
type VisualProgressionStep = (typeof VISUAL_PROGRESSION_STEPS)[number];
type AssessmentQuestionType = (typeof ASSESSMENT_QUESTION_TYPES)[number];
type CompetencyLevel = (typeof COMPETENCY_LEVELS)[number];
type SourceAuthorityCategory = (typeof SOURCE_AUTHORITY_CATEGORIES)[number];
type SourceSelectionRole = (typeof SOURCE_SELECTION_ROLES)[number];
type AcademicPublisherAssessmentOutcome =
  (typeof ACADEMIC_PUBLISHER_ASSESSMENT_OUTCOMES)[number];

type SourceRecord = {
  id: string;
  title?: string;
  author?: string;
  organisation?: string;
  edition?: string;
  version?: string;
  publicationDate?: string;
  accessDate?: string;
  documentType?: string;
  copyrightStatus?: string;
  authorityLevel?: number;
  authorityCategory?: SourceAuthorityCategory;
  reliabilityLevel?: unknown;
  publisher?: string;
  isbn?: string;
  sourceSelection?: {
    role?: SourceSelectionRole;
    rationale?: string;
    preferredAcademicPublisherAssessment?: {
      applicable?: boolean;
      outcome?: AcademicPublisherAssessmentOutcome;
      rationale?: string;
    };
  };
  traceability?: {
    knowledgeFileIds?: string[];
    equationIds?: string[];
    simulationIds?: string[];
  };
  conflicts?: {
    status?: "none-recorded" | "documented" | "unresolved";
    notes?: string[];
  };
  citation?: string;
  approvalStatus?: ReviewStatus;
  evidenceStatus: "missing" | "partial" | "approved";
  reviewStatus: ReviewStatus;
  filePath?: string | null;
  accessMode?: "local-file" | "metadata-only";
  url?: string;
  rights?: {
    licence?: string;
    permittedInternalUse?: string;
    mayDistribute?: boolean;
    metadataOnly?: boolean;
    studentMayOpenDirectly?: boolean;
  };
  reviewer?: string | null;
  reviewDate?: string | null;
  verification?: {
    documentOpened?: boolean;
    metadataVerified?: boolean;
  };
  relevantSections?: string[];
  relevantPages?: string[];
  limitations?: string[];
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
  version: string;
  authorProfileId?: string;
  publicationStatus: "draft" | "internal" | "scheduled" | "published" | "archived";
  reviewStatus: ReviewStatus;
  knowledgeFileIds: string[];
  sourceIds: string[];
  learningOutcomeIds?: string[];
  equationIds?: string[];
  simulationIds?: string[];
  multipleSourceVerification?: {
    status?: "verified" | "exception-approved" | "required";
    sourceIds?: string[];
    rationale?: string;
    reviewerId?: string;
    reviewedAt?: string;
  };
  requiredSections: LessonSectionId[];
  sections: Record<string, { title?: string; blocks?: unknown[] }>;
  schemaVersion?: string;
  experienceModel?: "linear-v1" | "visual-v2";
  lessonType?: VisualLessonType | "theory";
  visualStandardVersion?: string;
  visualMetadata?: {
    firstScreen?: {
      purpose?: unknown;
      primaryVisualBlockId?: unknown;
      primaryControlIds?: unknown;
    };
    progression?: unknown;
    inputs?: unknown;
    outputs?: unknown;
  };
  experienceSequence?: Array<{
    stage?: VisualLessonStageId;
    title?: string;
    blocks?: unknown[];
  }>;
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

function isSourceAuthorityCategory(value: unknown): value is SourceAuthorityCategory {
  return (
    typeof value === "string" &&
    SOURCE_AUTHORITY_CATEGORIES.includes(value as SourceAuthorityCategory)
  );
}

function isSourceSelectionRole(value: unknown): value is SourceSelectionRole {
  return (
    typeof value === "string" &&
    SOURCE_SELECTION_ROLES.includes(value as SourceSelectionRole)
  );
}

function isAcademicPublisherAssessmentOutcome(
  value: unknown
): value is AcademicPublisherAssessmentOutcome {
  return (
    typeof value === "string" &&
    ACADEMIC_PUBLISHER_ASSESSMENT_OUTCOMES.includes(
      value as AcademicPublisherAssessmentOutcome
    )
  );
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

const VISUAL_CONTENT_BLOCK_TYPES = new Set<LessonContentBlockType>([
  "heroSimulation",
  "interactiveDiagram",
  "animation",
  "observationQuestion",
  "microTheory",
  "liveEquation",
  "componentCutaway",
  "linkedSchematic",
  "engineeringChallenge",
  "faultChallenge",
  "realWorldApplication",
  "deepDive"
]);

function isVisualContentBlockType(value: unknown): value is LessonContentBlockType {
  return isLessonContentBlockType(value) && VISUAL_CONTENT_BLOCK_TYPES.has(value);
}

function isVisualLessonStageId(value: unknown): value is VisualLessonStageId {
  return (
    typeof value === "string" &&
    VISUAL_LESSON_STAGE_IDS.includes(value as VisualLessonStageId)
  );
}

function isVisualLessonType(value: unknown): value is VisualLessonType {
  return (
    typeof value === "string" && VISUAL_LESSON_TYPES.includes(value as VisualLessonType)
  );
}

function isVisualProgressionStep(value: unknown): value is VisualProgressionStep {
  return (
    typeof value === "string" &&
    VISUAL_PROGRESSION_STEPS.includes(value as VisualProgressionStep)
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

function formatReviewRequirement(
  requirement:
    | "authorship"
    | "source"
    | "educational_structure"
    | "equation"
    | "simulation"
    | "safety"
    | "engineering_approval"
    | "publication_authorization"
) {
  const labels = {
    authorship: "an identified content author",
    source: "a matching independent source review",
    educational_structure: "a matching independent educational-structure review",
    equation: "a matching independent equation review",
    simulation: "a matching independent simulation review",
    safety: "a matching independent safety review",
    engineering_approval: "a matching named independent engineering approval",
    publication_authorization: "a matching administrator publication authorization"
  } as const;

  return labels[requirement];
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

  if (isVisualContentBlockType(record.type)) {
    validateVisualLessonBlock(record, file, errors);
  }
}

function validateVisualLessonBlock(
  record: Record<string, unknown>,
  file: string,
  errors: string[]
) {
  const blockLabel = `${String(record.type)} block ${String(record.id)}`;

  if (!hasText(record.title) || !hasText(record.description)) {
    errors.push(`${file}: ${blockLabel} requires a title and description.`);
  }

  if (collectBlockSourceIds(record).length === 0) {
    errors.push(`${file}: ${blockLabel} requires source IDs.`);
  }

  if (!isReviewStatus(record.reviewStatus)) {
    errors.push(`${file}: ${blockLabel} has an invalid review status.`);
  }

  const accessibility = record.accessibility;
  if (!accessibility || typeof accessibility !== "object") {
    errors.push(`${file}: ${blockLabel} requires accessibility metadata.`);
  } else {
    const metadata = accessibility as Record<string, unknown>;
    for (const field of [
      "label",
      "textAlternative",
      "keyboardInstructions",
      "reducedMotionFallback"
    ]) {
      if (!hasText(metadata[field])) {
        errors.push(`${file}: ${blockLabel} accessibility requires ${field}.`);
      }
    }
  }

  for (const field of ["simulationId", "relatedSimulationId"]) {
    const reference = record[field];
    if (reference !== undefined && !isReferenceId(reference, "SIM")) {
      errors.push(`${file}: ${blockLabel} has malformed ${field}.`);
    }
  }

  const requiredReferences: Partial<Record<LessonContentBlockType, [string, string]>> = {
    heroSimulation: ["simulationId", "SIM"],
    interactiveDiagram: ["diagramId", "DIAG"],
    animation: ["animationId", "ANIM"],
    liveEquation: ["equationId", "EQ"],
    linkedSchematic: ["simulationId", "SIM"],
    engineeringChallenge: ["challengeId", "CH"],
    faultChallenge: ["faultId", "FAULT"],
    realWorldApplication: ["applicationId", "APP"]
  };
  const requirement = requiredReferences[record.type as LessonContentBlockType];
  if (requirement) {
    const [field, prefix] = requirement;
    if (!isReferenceId(record[field], prefix)) {
      errors.push(`${file}: ${blockLabel} has malformed ${field}.`);
    }
  }

  if (record.type === "engineeringChallenge" || record.type === "faultChallenge") {
    validateChallengeBlock(record, blockLabel, file, errors);
  }
}

function validateChallengeBlock(
  record: Record<string, unknown>,
  blockLabel: string,
  file: string,
  errors: string[]
) {
  if (record.type === "engineeringChallenge" && !hasText(record.objective)) {
    errors.push(`${file}: ${blockLabel} requires objective.`);
  }
  const patterns = ["target", "constraint", "diagnosis", "design"];
  if (!patterns.includes(String(record.pattern))) {
    errors.push(`${file}: ${blockLabel} requires a valid challenge pattern.`);
  }
  if (record.type === "faultChallenge" && record.pattern !== "diagnosis") {
    errors.push(`${file}: ${blockLabel} must use the diagnosis challenge pattern.`);
  }
  for (const field of ["goal", "successCondition"]) {
    if (!hasText(record[field])) {
      errors.push(`${file}: ${blockLabel} requires ${field}.`);
    }
  }
  for (const field of ["allowedActions", "modelAssumptions"]) {
    if (unknownArray(record[field]).length === 0) {
      errors.push(`${file}: ${blockLabel} requires ${field}.`);
    }
  }
  const feedback = record.feedback;
  if (!feedback || typeof feedback !== "object") {
    errors.push(`${file}: ${blockLabel} requires structured feedback.`);
    return;
  }
  for (const field of ["beforeCheck", "onSuccess", "onIncomplete"]) {
    if (!hasText((feedback as Record<string, unknown>)[field])) {
      errors.push(`${file}: ${blockLabel} feedback requires ${field}.`);
    }
  }
}

const PRIMARY_VISUAL_BLOCK_TYPES = new Set<LessonContentBlockType>([
  "heroSimulation",
  "interactiveDiagram",
  "animation",
  "componentCutaway",
  "linkedSchematic"
]);

function validateVisualMetadata(
  lesson: Lesson,
  blocks: Array<Record<string, unknown>>,
  file: string,
  errors: string[]
) {
  const metadata = lesson.visualMetadata;
  if (!metadata || typeof metadata !== "object") {
    errors.push(`${file}: visual-v2 lessons require visual metadata.`);
    return;
  }

  const firstScreen = metadata.firstScreen;
  if (!firstScreen || typeof firstScreen !== "object") {
    errors.push(`${file}: visual-v2 lessons require first-screen metadata.`);
  } else {
    if (!hasText(firstScreen.purpose)) {
      errors.push(`${file}: first-screen metadata requires a one-sentence purpose.`);
    }
    if (!hasText(firstScreen.primaryVisualBlockId)) {
      errors.push(`${file}: first-screen metadata requires a primary visual block ID.`);
    } else {
      const primaryVisual = blocks.find(
        (block) => block.id === firstScreen.primaryVisualBlockId
      );
      if (
        !primaryVisual ||
        !PRIMARY_VISUAL_BLOCK_TYPES.has(primaryVisual.type as LessonContentBlockType)
      ) {
        errors.push(
          `${file}: first-screen primary visual must reference a visual block.`
        );
      }
    }
    if (unknownArray(firstScreen.primaryControlIds).filter(hasText).length === 0) {
      errors.push(
        `${file}: first-screen metadata requires a primary control or start action.`
      );
    }
  }

  const progression = unknownArray(metadata.progression);
  if (
    progression.length < 3 ||
    progression.some((step) => !isVisualProgressionStep(step))
  ) {
    errors.push(
      `${file}: visual lesson progression requires at least three valid steps.`
    );
  }

  const inputs = unknownArray(metadata.inputs);
  if (inputs.length === 0) {
    errors.push(`${file}: visual-v2 lessons require input metadata.`);
  }
  for (const input of inputs) {
    validateSimulationInput(input, file, errors);
  }
  const inputIds = new Set(
    inputs
      .filter(
        (input): input is Record<string, unknown> =>
          Boolean(input) && typeof input === "object"
      )
      .map((input) => input.id)
      .filter(hasText)
  );
  for (const controlId of unknownArray(firstScreen?.primaryControlIds).filter(hasText)) {
    if (!inputIds.has(controlId)) {
      errors.push(
        `${file}: first-screen control ${controlId} has no matching input metadata.`
      );
    }
  }

  const outputs = unknownArray(metadata.outputs);
  if (outputs.length === 0) {
    errors.push(`${file}: visual-v2 lessons require output metadata.`);
  }
  for (const output of outputs) {
    validateSimulationOutput(output, file, errors);
  }
}

function validateSimulationInput(input: unknown, file: string, errors: string[]) {
  if (!input || typeof input !== "object") {
    errors.push(`${file}: simulation input metadata must be an object.`);
    return;
  }
  const record = input as Record<string, unknown>;
  const label = `simulation input ${String(record.id)}`;
  for (const field of [
    "id",
    "label",
    "quantity",
    "unit",
    "internalUnit",
    "validation",
    "accessibilityLabel",
    "educationalDescription"
  ]) {
    if (!hasText(record[field])) {
      errors.push(`${file}: ${label} requires ${field}.`);
    }
  }
  for (const field of ["default", "minimum", "maximum", "step"]) {
    if (!Number.isFinite(record[field])) {
      errors.push(`${file}: ${label} requires a finite ${field}.`);
    }
  }
  if (Number(record.step) <= 0) {
    errors.push(`${file}: ${label} step must be greater than zero.`);
  }
  if (
    Number.isFinite(record.minimum) &&
    Number.isFinite(record.maximum) &&
    Number(record.minimum) >= Number(record.maximum)
  ) {
    errors.push(`${file}: ${label} minimum must be less than maximum.`);
  }
  if (
    Number.isFinite(record.default) &&
    (Number(record.default) < Number(record.minimum) ||
      Number(record.default) > Number(record.maximum))
  ) {
    errors.push(`${file}: ${label} default must be inside its input range.`);
  }
  const validity = record.modelValidityRange;
  if (!validity || typeof validity !== "object") {
    errors.push(`${file}: ${label} requires a model-validity range.`);
  } else {
    const range = validity as Record<string, unknown>;
    if (!Number.isFinite(range.minimum) || !Number.isFinite(range.maximum)) {
      errors.push(`${file}: ${label} model-validity range must be finite.`);
    } else if (Number(range.minimum) >= Number(range.maximum)) {
      errors.push(`${file}: ${label} model-validity minimum must be less than maximum.`);
    }
  }
}

function validateSimulationOutput(output: unknown, file: string, errors: string[]) {
  if (!output || typeof output !== "object") {
    errors.push(`${file}: simulation output metadata must be an object.`);
    return;
  }
  const record = output as Record<string, unknown>;
  const label = `simulation output ${String(record.id)}`;
  for (const field of [
    "id",
    "label",
    "quantity",
    "unit",
    "internalUnit",
    "interpretation",
    "measurementSource"
  ]) {
    if (!hasText(record[field])) {
      errors.push(`${file}: ${label} requires ${field}.`);
    }
  }
  if (
    !["valid", "warning", "invalid", "unavailable"].includes(String(record.validityState))
  ) {
    errors.push(`${file}: ${label} requires a valid validityState.`);
  }
}

function isReferenceId(value: unknown, prefix: string) {
  return typeof value === "string" && new RegExp(`^${prefix}-[A-Z0-9-]+$`).test(value);
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

function isHttpsUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validateApprovedSourceEvidence(
  source: SourceRecord,
  file: string,
  workspaceRoot: string,
  errors: string[]
) {
  const requiredTextFields: Array<[string, string | null | undefined]> = [
    ["title", source.title],
    ["author", source.author],
    ["organisation", source.organisation],
    ["version", source.version],
    ["publication date", source.publicationDate],
    ["access date", source.accessDate],
    ["document type", source.documentType],
    ["copyright status", source.copyrightStatus],
    ["citation", source.citation],
    ["reviewer", source.reviewer],
    ["review date", source.reviewDate]
  ];

  for (const [label, value] of requiredTextFields) {
    if (!hasText(value)) {
      errors.push(`${file}: approved source ${source.id} requires ${label}.`);
    }
  }

  if (
    !Number.isInteger(source.authorityLevel) ||
    (source.authorityLevel ?? 0) < 1 ||
    (source.authorityLevel ?? 0) > 5
  ) {
    errors.push(`${file}: approved source ${source.id} requires authority level 1-5.`);
  }

  const expectedCategoryByLevel: Partial<Record<number, SourceAuthorityCategory>> = {
    1: "governing-authoritative",
    2: "official-technical-documentation",
    3: "university-engineering-textbook",
    4: "university-peer-reviewed-educational",
    5: "supporting"
  };
  const expectedCategory = expectedCategoryByLevel[source.authorityLevel ?? 0];

  if (!isSourceAuthorityCategory(source.authorityCategory)) {
    errors.push(`${file}: approved source ${source.id} requires an authority category.`);
  } else if (expectedCategory && source.authorityCategory !== expectedCategory) {
    errors.push(
      `${file}: source ${source.id} authority level ${source.authorityLevel} must use category ${expectedCategory}.`
    );
  }

  if (!isSourceSelectionRole(source.sourceSelection?.role)) {
    errors.push(
      `${file}: approved source ${source.id} requires a source-selection role.`
    );
  }
  if (!hasText(source.sourceSelection?.rationale)) {
    errors.push(`${file}: approved source ${source.id} requires a selection rationale.`);
  }
  if (source.authorityLevel === 5 && source.sourceSelection?.role !== "supporting") {
    errors.push(`${file}: Level 5 source ${source.id} must have a supporting role.`);
  }

  const academicAssessment = source.sourceSelection?.preferredAcademicPublisherAssessment;
  const needsAcademicAssessment =
    source.authorityLevel === 3 ||
    (source.authorityLevel === 4 && source.sourceSelection?.role === "primary");

  if (needsAcademicAssessment) {
    if (
      academicAssessment?.applicable !== true ||
      !isAcademicPublisherAssessmentOutcome(academicAssessment.outcome) ||
      academicAssessment.outcome === "not-applicable-to-source-role" ||
      !hasText(academicAssessment.rationale)
    ) {
      errors.push(
        `${file}: primary academic source ${source.id} requires a documented preferred-publisher assessment.`
      );
    }
  } else if (
    academicAssessment &&
    (!isAcademicPublisherAssessmentOutcome(academicAssessment.outcome) ||
      !hasText(academicAssessment.rationale))
  ) {
    errors.push(
      `${file}: source ${source.id} has an incomplete preferred-publisher assessment.`
    );
  }

  if (
    source.authorityLevel === 3 &&
    (!hasText(source.publisher) ||
      !hasText(source.edition) ||
      !hasText(source.publicationDate))
  ) {
    errors.push(
      `${file}: university textbook source ${source.id} requires publisher, edition, and publication date.`
    );
  }

  const traceability = source.traceability;
  if (
    !Array.isArray(traceability?.knowledgeFileIds) ||
    !Array.isArray(traceability?.equationIds) ||
    !Array.isArray(traceability?.simulationIds)
  ) {
    errors.push(
      `${file}: approved source ${source.id} requires knowledge, equation, and simulation traceability arrays.`
    );
  }

  if (
    !source.conflicts ||
    !["none-recorded", "documented", "unresolved"].includes(
      source.conflicts.status ?? ""
    ) ||
    !source.conflicts.notes?.some(hasText)
  ) {
    errors.push(`${file}: approved source ${source.id} requires conflict metadata.`);
  }

  if (!source.verification?.documentOpened || !source.verification.metadataVerified) {
    errors.push(`${file}: approved source ${source.id} requires document verification.`);
  }

  if (!source.relevantSections?.length) {
    errors.push(`${file}: approved source ${source.id} requires relevant sections.`);
  }

  if (!source.limitations?.length) {
    errors.push(`${file}: approved source ${source.id} requires limitations.`);
  }

  if (
    !hasText(source.rights?.licence) ||
    !hasText(source.rights?.permittedInternalUse) ||
    typeof source.rights?.mayDistribute !== "boolean" ||
    typeof source.rights?.metadataOnly !== "boolean" ||
    typeof source.rights?.studentMayOpenDirectly !== "boolean"
  ) {
    errors.push(
      `${file}: approved source ${source.id} requires complete rights metadata.`
    );
  }

  if (source.filePath) {
    const sourcePath = isAbsolute(source.filePath)
      ? source.filePath
      : join(workspaceRoot, source.filePath);

    if (!existsSync(sourcePath)) {
      errors.push(`${file}: approved source file '${source.filePath}' does not exist.`);
    }
  } else if (
    source.accessMode !== "metadata-only" ||
    !source.rights?.metadataOnly ||
    !isHttpsUrl(source.url)
  ) {
    errors.push(
      `${file}: approved metadata-only source ${source.id} requires an HTTPS source URL and rights metadata.`
    );
  }
}

function validateMultipleSourceVerification(
  lesson: Lesson,
  file: string,
  sourcesById: Map<string, SourceRecord>,
  errors: string[]
) {
  if (
    (lesson.equationIds?.length ?? 0) === 0 &&
    (lesson.simulationIds?.length ?? 0) === 0
  ) {
    return;
  }

  const verification = lesson.multipleSourceVerification;
  const verificationSourceIds = [...new Set(verification?.sourceIds ?? [])];
  const credibleVerificationSourceIds = verificationSourceIds.filter((sourceId) => {
    const level = sourcesById.get(sourceId)?.authorityLevel;
    return typeof level === "number" && level >= 1 && level <= 4;
  });
  const hasNamedIndependentReviewer =
    hasText(verification?.reviewerId) &&
    verification?.reviewerId !== lesson.authorProfileId;

  if (
    !verification ||
    !["verified", "exception-approved"].includes(verification.status ?? "") ||
    !hasText(verification.rationale) ||
    !hasNamedIndependentReviewer ||
    !hasText(verification.reviewedAt)
  ) {
    errors.push(
      `${file}: approved or published lesson ${lesson.id} requires named independent multiple-source verification.`
    );
    return;
  }

  if (verification.status === "verified" && credibleVerificationSourceIds.length < 2) {
    errors.push(
      `${file}: verified lesson ${lesson.id} requires at least two Level 1-4 corroborating source IDs.`
    );
  }

  if (
    verification.status === "exception-approved" &&
    credibleVerificationSourceIds.length < 1
  ) {
    errors.push(
      `${file}: multiple-source exception for lesson ${lesson.id} requires its available Level 1-4 source ID.`
    );
  }

  for (const sourceId of verificationSourceIds) {
    if (!lesson.sourceIds.includes(sourceId)) {
      errors.push(
        `${file}: multiple-source verification for ${lesson.id} references source ${sourceId} outside the lesson source list.`
      );
    }
    if (sourcesById.get(sourceId)?.evidenceStatus !== "approved") {
      errors.push(
        `${file}: multiple-source verification for ${lesson.id} requires approved evidence for ${sourceId}.`
      );
    }
  }
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
  const reviewFiles = readJsonFiles(join(workspaceRoot, "content/reviews"));
  const assessmentFiles = readJsonFiles(join(workspaceRoot, "content/assessments"));
  const projectFiles = readJsonFiles(join(workspaceRoot, "content/projects"));

  const sourceIds = new Set(sourceRecords.map(({ data }) => data.id));
  const sourcesById = new Map(sourceRecords.map(({ data }) => [data.id, data]));
  const knowledgeIds = new Set(knowledgeFiles.map(({ data }) => data.metadata.id));
  const lessonIds = new Set(lessonFiles.map(({ data }) => data.id));
  const lessonsById = new Map(lessonFiles.map(({ data }) => [data.id, data]));
  const reviewRecordIds = new Set<string>();

  for (const { data, file } of reviewFiles) {
    const recordErrors = validateStaticTechnicalReviewRecord(data);
    for (const error of recordErrors) {
      errors.push(`${file}: invalid technical review record: ${error}.`);
    }
    if (recordErrors.length > 0) {
      continue;
    }

    const record = data as StaticTechnicalReviewRecord;
    if (reviewRecordIds.has(record.id)) {
      errors.push(`${file}: duplicate technical review record ID ${record.id}.`);
    }
    reviewRecordIds.add(record.id);
    if (!lessonIds.has(record.entityId)) {
      errors.push(
        `${file}: technical review record ${record.id} references unknown lesson ${record.entityId}.`
      );
    }
  }

  for (const { data, file } of sourceRecords) {
    if (data.reliabilityLevel !== undefined) {
      errors.push(
        `${file}: source ${data.id} uses legacy reliabilityLevel; use authorityLevel and authorityCategory.`
      );
    }
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
    if (data.evidenceStatus === "approved") {
      validateApprovedSourceEvidence(data, file, workspaceRoot, errors);
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
    if (data.conflicts?.status === "unresolved") {
      warnings.push(`${file}: source ${data.id} has an unresolved source conflict.`);
      if (
        data.reviewStatus === "Approved for student use" ||
        data.approvalStatus === "Approved for student use"
      ) {
        errors.push(
          `${file}: source ${data.id} cannot be approved with unresolved conflicts.`
        );
      }
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
      data.publicationStatus === "published" ||
      data.reviewStatus === "Approved for student use"
    ) {
      validateMultipleSourceVerification(data, file, sourcesById, errors);

      const reviewGate = evaluateStaticLessonReviewGate({
        subject: {
          id: data.id,
          version: data.version,
          authorId: data.authorProfileId ?? null,
          sourceIds: data.sourceIds,
          equationIds: data.equationIds ?? [],
          simulationIds: data.simulationIds ?? [],
          requiresSafetyReview: true
        },
        reviewRecords: reviewFiles.map(({ data: reviewRecord }) => reviewRecord)
      });

      for (const requirement of reviewGate.missingRequirements) {
        errors.push(
          `${file}: approved or published lesson ${data.id} version ${data.version} requires ${formatReviewRequirement(requirement)}.`
        );
      }
    }

    if (
      data.publicationStatus === "published" &&
      data.sourceIds.some(
        (sourceId) => sourcesById.get(sourceId)?.evidenceStatus !== "approved"
      )
    ) {
      errors.push(`${file}: published lessons cannot use missing source evidence.`);
    }

    if (
      (data.publicationStatus === "published" ||
        data.reviewStatus === "Approved for student use") &&
      data.sourceIds.some(
        (sourceId) => sourcesById.get(sourceId)?.conflicts?.status === "unresolved"
      )
    ) {
      errors.push(
        `${file}: approved or published lessons cannot use unresolved source conflicts.`
      );
    }

    if (
      data.experienceModel !== undefined &&
      data.experienceModel !== "linear-v1" &&
      data.experienceModel !== "visual-v2"
    ) {
      errors.push(`${file}: invalid lesson experience model.`);
    }

    if (data.experienceModel === "visual-v2") {
      if (!hasText(data.schemaVersion)) {
        errors.push(`${file}: visual-v2 lessons require a schema version.`);
      }
      if (data.visualStandardVersion !== "1.0.0") {
        errors.push(`${file}: visual-v2 lessons require visual standard version 1.0.0.`);
      }
      if (!isVisualLessonType(data.lessonType)) {
        errors.push(`${file}: visual-v2 lessons require a valid lessonType.`);
      }

      const stages = unknownArray(data.experienceSequence);
      const visualBlocks: Array<Record<string, unknown>> = [];
      if (stages.length === 0) {
        errors.push(`${file}: visual-v2 lessons require an experience sequence.`);
      }

      for (const stage of stages) {
        if (!stage || typeof stage !== "object") {
          errors.push(`${file}: visual lesson stage must be a structured object.`);
          continue;
        }

        const stageRecord = stage as Record<string, unknown>;
        if (!isVisualLessonStageId(stageRecord.stage)) {
          errors.push(`${file}: visual lesson stage has an invalid stage ID.`);
        }
        if (!hasText(stageRecord.title)) {
          errors.push(`${file}: visual lesson stage requires a title.`);
        }

        const blocks = unknownArray(stageRecord.blocks);
        if (blocks.length === 0) {
          errors.push(`${file}: visual lesson stage requires content blocks.`);
        }
        for (const block of blocks) {
          if (block && typeof block === "object") {
            visualBlocks.push(block as Record<string, unknown>);
          }
          validateLessonBlock(block, file, sourceIds, errors);
        }
      }

      const firstStage = stages[0];
      const firstStageRecord =
        firstStage && typeof firstStage === "object"
          ? (firstStage as Record<string, unknown>)
          : null;
      const primaryVisualBlockId = data.visualMetadata?.firstScreen?.primaryVisualBlockId;
      const firstStageBlockIds = unknownArray(firstStageRecord?.blocks)
        .filter(
          (block): block is Record<string, unknown> =>
            Boolean(block) && typeof block === "object"
        )
        .map((block) => block.id);
      if (
        firstStageRecord?.stage !== "heroExperience" ||
        !hasText(primaryVisualBlockId) ||
        !firstStageBlockIds.includes(primaryVisualBlockId)
      ) {
        errors.push(
          `${file}: the heroExperience first stage must contain the declared first-screen visual.`
        );
      }

      validateVisualMetadata(data, visualBlocks, file, errors);

      if (isVisualLessonType(data.lessonType)) {
        const blockTypes = new Set(visualBlocks.map((block) => block.type));
        for (const requiredType of VISUAL_LESSON_TYPE_REQUIREMENTS[data.lessonType]) {
          if (!blockTypes.has(requiredType)) {
            errors.push(
              `${file}: ${data.lessonType} lessons require a ${requiredType} block.`
            );
          }
        }
      }
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
    const assessment = data as Assessment;
    validateAssessment(assessment, file, sourceIds, errors);

    const lesson = lessonsById.get(assessment.lessonId);
    if (!lesson) {
      errors.push(
        `${file}: assessment references unknown lesson ${assessment.lessonId}.`
      );
      continue;
    }

    const taughtOutcomeIds = new Set(lesson.learningOutcomeIds ?? []);
    if (taughtOutcomeIds.size === 0) {
      errors.push(
        `${file}: lesson ${assessment.lessonId} must declare stable learningOutcomeIds for its assessment.`
      );
      continue;
    }

    for (const outcomeId of [
      ...assessment.learningOutcomeIds,
      ...assessment.questions.flatMap((question) => question.learningOutcomeIds)
    ]) {
      if (!taughtOutcomeIds.has(outcomeId)) {
        errors.push(
          `${file}: learning outcome ${outcomeId} is not taught by lesson ${assessment.lessonId}.`
        );
      }
    }
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
