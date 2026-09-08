import dynamic from "next/dynamic";
import type { StructuredLesson } from "../lesson-engine/types";
import { getHydraulicCylinderExperienceContent } from "../hydraulic-cylinder-lesson/content";
import { getBernoulliFlowExperienceContent } from "../bernoulli-flow-lab/content";
import type { ViewNavigation } from "./capabilities";

const HydraulicLesson = dynamic(() =>
  import("../hydraulic-cylinder-lesson/hydraulic-cylinder-visual-lesson").then(
    (module) => module.HydraulicCylinderVisualLesson
  )
);
const BernoulliLesson = dynamic(() =>
  import("../bernoulli-flow-lab/bernoulli-flow-visual-lesson").then(
    (module) => module.BernoulliFlowVisualLesson
  )
);

export function InspectionWorkspace({
  slug,
  lesson,
  navigation,
  inspectionEnabled = false
}: {
  slug: string;
  lesson: StructuredLesson;
  navigation: ViewNavigation;
  inspectionEnabled?: boolean;
}) {
  if (slug === "hydraulic-cylinder-force")
    return (
      <HydraulicLesson
        content={getHydraulicCylinderExperienceContent(lesson)}
        inspectionEnabled={inspectionEnabled}
        viewNavigation={navigation}
      />
    );
  if (slug === "bernoulli-flow-lab")
    return (
      <BernoulliLesson
        content={getBernoulliFlowExperienceContent(lesson)}
        inspectionEnabled={inspectionEnabled}
        viewNavigation={navigation}
      />
    );
  return null;
}
