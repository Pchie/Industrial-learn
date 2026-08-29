import dynamic from "next/dynamic";
import type { ReactNode } from "react";

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

type VisualExperienceRenderer = (lesson: StructuredLesson) => ReactNode;

const visualExperienceRegistry: Record<string, VisualExperienceRenderer> = {
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
  lesson: StructuredLesson
): Partial<Record<VisualLessonStageId, ReactNode>> | undefined {
  const simulationId = lesson.simulationIds?.find(
    (candidate) =>
      visualExperienceRegistry[candidate] && getPublicSimulationCatalogById(candidate)
  );
  const renderExperience = simulationId
    ? visualExperienceRegistry[simulationId]
    : undefined;

  return renderExperience ? { heroExperience: renderExperience(lesson) } : undefined;
}

export function getInternalVisualExperienceOverrides(
  lesson: StructuredLesson
): Partial<Record<VisualLessonStageId, ReactNode>> | undefined {
  const simulationId = lesson.simulationIds?.find(
    (candidate) => visualExperienceRegistry[candidate]
  );
  const renderExperience = simulationId
    ? visualExperienceRegistry[simulationId]
    : undefined;

  return renderExperience ? { heroExperience: renderExperience(lesson) } : undefined;
}

export function projectLessonForPublicDelivery(
  lesson: StructuredLesson
): StructuredLesson {
  return {
    ...lesson,
    sections: Object.fromEntries(
      Object.entries(lesson.sections).map(([sectionId, section]) => [
        sectionId,
        {
          ...section,
          blocks: section.blocks.flatMap(projectBlockForPublicDelivery)
        }
      ])
    ) as StructuredLesson["sections"],
    ...(lesson.simulationIds
      ? {
          simulationIds: lesson.simulationIds.filter((simulationId) =>
            Boolean(getPublicSimulationCatalogById(simulationId))
          )
        }
      : {}),
    ...(lesson.experienceSequence
      ? {
          experienceSequence: lesson.experienceSequence.map((stage) => ({
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
