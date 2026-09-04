import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { getBasicPressureExperienceContent } from "../basic-fluid-pressure-lesson/content";
import { getBernoulliFlowExperienceContent } from "../bernoulli-flow-lab/content";
import { getHydraulicCylinderExperienceContent } from "../hydraulic-cylinder-lesson/content";
import { getPublicSimulationCatalogById } from "../simulations/catalog";

import type { LessonContentBlock, StructuredLesson, VisualLessonStageId } from "./types";

const HydraulicCylinderVisualLesson = dynamic(() =>
  import("../hydraulic-cylinder-lesson/hydraulic-cylinder-visual-lesson").then(
    (module) => module.HydraulicCylinderVisualLesson
  )
);

const BernoulliFlowVisualLesson = dynamic(() =>
  import("../bernoulli-flow-lab/bernoulli-flow-visual-lesson").then(
    (module) => module.BernoulliFlowVisualLesson
  )
);

const BasicFluidPressureVisualExperience = dynamic(() =>
  import("../basic-fluid-pressure-lesson/basic-fluid-pressure-visual-experience").then(
    (module) => module.BasicFluidPressureVisualExperience
  )
);

type VisualExperienceContext = {
  canSaveProgress: boolean;
};

type VisualExperienceRenderer = (
  lesson: StructuredLesson,
  context: VisualExperienceContext
) => ReactNode;

const visualExperienceRegistry: Record<string, VisualExperienceRenderer> = {
  "VIS-FLUID-PRESSURE-HERO-001": (lesson, context) => (
    <BasicFluidPressureVisualExperience
      canSaveProgress={context.canSaveProgress}
      content={getBasicPressureExperienceContent(lesson)}
    />
  ),
  "SIM-HYD-CYL-FORCE-001": (lesson) => (
    <HydraulicCylinderVisualLesson
      content={getHydraulicCylinderExperienceContent(lesson)}
    />
  ),
  "SIM-FLUID-BERNOULLI-FLOW-001": (lesson) => (
    <BernoulliFlowVisualLesson content={getBernoulliFlowExperienceContent(lesson)} />
  )
};

export const REGISTERED_VISUAL_EXPERIENCE_IDS = Object.freeze(
  Object.keys(visualExperienceRegistry)
);

export function getPublicVisualExperienceOverrides(
  lesson: StructuredLesson,
  context: VisualExperienceContext = { canSaveProgress: false }
): Partial<Record<VisualLessonStageId, ReactNode>> | undefined {
  const experienceId = resolveVisualExperienceId(lesson, false);
  const renderExperience = experienceId
    ? visualExperienceRegistry[experienceId]
    : undefined;

  return renderExperience
    ? { heroExperience: renderExperience(lesson, context) }
    : undefined;
}

function resolveVisualExperienceId(lesson: StructuredLesson, internal: boolean) {
  const primaryVisualBlockId = lesson.visualMetadata?.firstScreen.primaryVisualBlockId;
  if (primaryVisualBlockId && visualExperienceRegistry[primaryVisualBlockId]) {
    return primaryVisualBlockId;
  }

  return lesson.simulationIds?.find(
    (candidate) =>
      visualExperienceRegistry[candidate] &&
      (internal || getPublicSimulationCatalogById(candidate))
  );
}

export function getInternalVisualExperienceOverrides(
  lesson: StructuredLesson
): Partial<Record<VisualLessonStageId, ReactNode>> | undefined {
  const experienceId = resolveVisualExperienceId(lesson, true);
  const renderExperience = experienceId
    ? visualExperienceRegistry[experienceId]
    : undefined;

  return renderExperience
    ? { heroExperience: renderExperience(lesson, { canSaveProgress: false }) }
    : undefined;
}

export function projectLessonForPublicDelivery(
  lesson: StructuredLesson
): StructuredLesson {
  const publicLesson = {
    ...lesson
  } as StructuredLesson & { multipleSourceVerification?: unknown };
  delete publicLesson.approvalRecordIds;
  delete publicLesson.authorProfileId;
  delete publicLesson.multipleSourceVerification;
  delete publicLesson.publishedVersion;

  return {
    ...publicLesson,
    sections: Object.fromEntries(
      Object.entries(publicLesson.sections).map(([sectionId, section]) => [
        sectionId,
        {
          ...section,
          blocks: section.blocks.flatMap(projectBlockForPublicDelivery)
        }
      ])
    ) as StructuredLesson["sections"],
    ...(publicLesson.simulationIds
      ? {
          simulationIds: publicLesson.simulationIds.filter((simulationId) =>
            Boolean(getPublicSimulationCatalogById(simulationId))
          )
        }
      : {}),
    ...(publicLesson.experienceSequence
      ? {
          experienceSequence: publicLesson.experienceSequence.map((stage) => ({
            ...stage,
            blocks: stage.blocks.flatMap(projectBlockForPublicDelivery)
          }))
        }
      : {})
  };
}

function projectBlockForPublicDelivery(block: LessonContentBlock): LessonContentBlock[] {
  if (block.type === "realWorldApplication" && block.relatedSimulationId) {
    if (getPublicSimulationCatalogById(block.relatedSimulationId)) {
      return [block];
    }
    const safeBlock = { ...block };
    delete safeBlock.relatedSimulationId;
    return [safeBlock];
  }

  const simulationId = simulationIdForBlock(block);
  return simulationId && !getPublicSimulationCatalogById(simulationId) ? [] : [block];
}

function simulationIdForBlock(block: LessonContentBlock) {
  switch (block.type) {
    case "heroSimulation":
    case "linkedSchematic":
    case "faultChallenge":
      return block.simulationId;
    default:
      return undefined;
  }
}
