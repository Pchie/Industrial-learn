import type {
  DeepDiveBlock,
  EngineeringChallengeBlock,
  HeroSimulationBlock,
  MicroTheoryBlock,
  ObservationQuestionBlock,
  RealWorldApplicationBlock,
  StructuredLesson,
  VisualLessonContentBlock
} from "../lesson-engine/types";

export type BernoulliFlowExperienceContent = {
  hero: HeroSimulationBlock;
  observations: ObservationQuestionBlock[];
  microTheory: MicroTheoryBlock;
  challenges: EngineeringChallengeBlock[];
  application: RealWorldApplicationBlock;
  deepDive: DeepDiveBlock;
};

export function getBernoulliFlowExperienceContent(
  lesson: StructuredLesson
): BernoulliFlowExperienceContent {
  const blocks = (lesson.experienceSequence ?? []).flatMap((stage) => stage.blocks);

  return {
    hero: requireBlock(blocks, "heroSimulation", lesson.id),
    observations: blocks.filter(
      (block): block is ObservationQuestionBlock => block.type === "observationQuestion"
    ),
    microTheory: requireBlock(blocks, "microTheory", lesson.id),
    challenges: blocks.filter(
      (block): block is EngineeringChallengeBlock => block.type === "engineeringChallenge"
    ),
    application: requireBlock(blocks, "realWorldApplication", lesson.id),
    deepDive: requireBlock(blocks, "deepDive", lesson.id)
  };
}

function requireBlock<Type extends VisualLessonContentBlock["type"]>(
  blocks: Array<
    | VisualLessonContentBlock
    | Exclude<
        StructuredLesson["sections"][keyof StructuredLesson["sections"]]["blocks"][number],
        VisualLessonContentBlock
      >
  >,
  type: Type,
  lessonId: string
): Extract<VisualLessonContentBlock, { type: Type }> {
  const block = blocks.find(
    (candidate): candidate is Extract<VisualLessonContentBlock, { type: Type }> =>
      candidate.type === type
  );

  if (!block) {
    throw new Error(`Lesson ${lessonId} requires a ${type} visual block.`);
  }

  return block;
}
