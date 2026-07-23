export type ReviewStatus =
  | "Draft"
  | "Source required"
  | "Source checked"
  | "Equation checked"
  | "Simulation checked"
  | "Engineering review required"
  | "Approved for student use";

export type LessonSectionId =
  | "lessonHeader"
  | "estimatedCompletionTime"
  | "difficulty"
  | "prerequisites"
  | "learningOutcomes"
  | "whyTopicMatters"
  | "keyTerminology"
  | "visualExplanation"
  | "theory"
  | "equations"
  | "workedExamples"
  | "interactiveActivity"
  | "faultFindingExercise"
  | "safetyConsiderations"
  | "knowledgeCheck"
  | "summary"
  | "sources"
  | "nextRecommendedLesson";

export type SymbolRecord = {
  symbol: string;
  name: string;
  unit: string;
};

type BlockBase = {
  id: string;
  sourceIds?: string[];
};

export type ParagraphBlock = BlockBase & {
  type: "paragraph";
  text: string;
};

export type DefinitionBlock = BlockBase & {
  type: "definition";
  term: string;
  definition: string;
};

export type DiagramBlock = BlockBase & {
  type: "diagram";
  title: string;
  altText: string;
  description: string;
  caption?: string;
};

export type EquationBlock = BlockBase & {
  type: "equation";
  name: string;
  expression: string;
  symbols: SymbolRecord[];
};

export type SymbolTableBlock = BlockBase & {
  type: "symbolTable";
  symbols: SymbolRecord[];
};

export type UnitNoteBlock = BlockBase & {
  type: "unitNote";
  quantity: string;
  siUnit: string;
  note: string;
};

export type AssumptionBlock = BlockBase & {
  type: "assumption";
  text: string;
};

export type WorkedCalculationBlock = BlockBase & {
  type: "workedCalculation";
  title: string;
  given: string[];
  steps: Array<{
    label: string;
    expression?: string;
    explanation: string;
  }>;
  result: string;
  interpretation: string;
};

export type EngineeringInterpretationBlock = BlockBase & {
  type: "engineeringInterpretation";
  text: string;
};

export type WarningBlock = BlockBase & {
  type: "warning";
  severity: "info" | "warning" | "fault";
  title: string;
  text: string;
};

export type FaultCaseBlock = BlockBase & {
  type: "faultCase";
  title: string;
  symptoms: string[];
  likelyCauses: string[];
  safeResponse: string;
};

export type QuestionBlock = BlockBase & {
  type: "question";
  prompt: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  answerExplanation: string;
};

export type SourceCitationBlock = {
  id: string;
  type: "sourceCitation";
  sourceId: string;
  note: string;
};

export type LessonContentBlock =
  | ParagraphBlock
  | DefinitionBlock
  | DiagramBlock
  | EquationBlock
  | SymbolTableBlock
  | UnitNoteBlock
  | AssumptionBlock
  | WorkedCalculationBlock
  | EngineeringInterpretationBlock
  | WarningBlock
  | FaultCaseBlock
  | QuestionBlock
  | SourceCitationBlock;

export type LessonSection = {
  title: string;
  blocks: LessonContentBlock[];
};

export type StructuredLesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  publicationStatus: "draft" | "internal" | "scheduled" | "published" | "archived";
  reviewStatus: ReviewStatus;
  version: string;
  estimatedCompletionTime: string;
  difficulty: string;
  prerequisites: string[];
  knowledgeFileIds: string[];
  sourceIds: string[];
  learningOutcomes: string[];
  requiredSections: LessonSectionId[];
  sections: Record<LessonSectionId, LessonSection>;
};

export type SourceRecord = {
  id: string;
  title: string;
  citation: string;
  approvalStatus: ReviewStatus;
  reviewStatus: ReviewStatus;
  evidenceStatus: "missing" | "partial" | "approved";
  limitations?: string[];
};
