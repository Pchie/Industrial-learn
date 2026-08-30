import fluidPressureAssessment from "../../../../../content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json";
import type { Assessment } from "@industrial-learn/assessment-core";

export type AssessmentCatalogEntry = {
  slug: string;
  aliases: string[];
  localAssessmentId: string;
  title: string;
  description: string;
  moduleSlug: string;
  moduleTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonId: string;
  estimatedMinutes: number;
  contentVersion: number;
  sourceIds: string[];
};

export const assessmentCatalog: AssessmentCatalogEntry[] = [
  {
    slug: "staging-pressure-check",
    aliases: ["fluid-pressure-basic-check", "basic-fluid-pressure-competency-check"],
    localAssessmentId: "ASM-FLUID-PRESSURE-001",
    title: "Basic Fluid Pressure Check",
    description:
      "A short graded check covering pressure meaning, SI units, pressure calculation, visual comparison, and simple application reasoning.",
    moduleSlug: "fluid-mechanics-foundations",
    moduleTitle: "Fluid Mechanics Foundations",
    lessonSlug: "basic-fluid-pressure",
    lessonTitle: "Basic Fluid Pressure",
    lessonId: "LES-FLUID-PRESSURE-001",
    estimatedMinutes: 15,
    contentVersion: 2,
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2012", "SRC-PSU-CIMBALA-PRESSURE-BASICS"]
  }
];

export function listAssessmentCatalog() {
  return assessmentCatalog;
}

export function getAssessmentCatalogBySlug(slug: string) {
  return assessmentCatalog.find(
    (entry) => entry.slug === slug || entry.aliases.includes(slug)
  );
}

export function createAssessmentFromCatalog(
  entry: AssessmentCatalogEntry,
  overrides: {
    id?: string | undefined;
    title?: string | undefined;
    lessonId?: string | undefined;
    reviewStatus?: string | undefined;
  } = {}
): Assessment {
  const assessment = fluidPressureAssessment as Assessment;

  return {
    ...assessment,
    id: overrides.id ?? entry.localAssessmentId,
    lessonId: overrides.lessonId ?? entry.lessonId,
    title: overrides.title ?? entry.title,
    sourceIds: entry.sourceIds,
    reviewStatus: overrides.reviewStatus ?? assessment.reviewStatus
  };
}
