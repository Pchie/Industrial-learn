import fluidPressureAssessment from "../../../../../content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json";
import type { Assessment } from "@industrial-learn/assessment-core";

export type AssessmentCatalogEntry = {
  slug: string;
  aliases: string[];
  localAssessmentId: string;
  artifactSha256: string;
  title: string;
  description: string;
  moduleSlug: string;
  moduleTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonId: string;
  lessonVersion: string;
  estimatedMinutes: number;
  contentVersion: number;
  sourceIds: string[];
  equationIds: string[];
  learningOutcomeIds: string[];
};

export const assessmentCatalog: AssessmentCatalogEntry[] = [
  {
    slug: "basic-fluid-pressure-check",
    aliases: [
      "staging-pressure-check",
      "fluid-pressure-basic-check",
      "basic-fluid-pressure-competency-check"
    ],
    localAssessmentId: "ASM-FLUID-PRESSURE-001",
    artifactSha256: "db6268839cdfb959e7f7e392d9879cb3518b30d8b13ee01686cdd88ec71cec88",
    title: "Basic Fluid Pressure Check",
    description:
      "A short graded check covering pressure meaning, SI units, pressure calculation, visual comparison, and simple application reasoning.",
    moduleSlug: "fluid-mechanics-foundations",
    moduleTitle: "Fluid Mechanics Foundations",
    lessonSlug: "basic-fluid-pressure",
    lessonTitle: "Basic Fluid Pressure",
    lessonId: "LES-FLUID-PRESSURE-001",
    lessonVersion: "0.4.0",
    estimatedMinutes: 15,
    contentVersion: 2,
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2012", "SRC-PSU-CIMBALA-PRESSURE-BASICS"],
    equationIds: ["EQ-FLUID-PRESSURE-001"],
    learningOutcomeIds: ["LO-FP-001", "LO-FP-002", "LO-FP-003"]
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
