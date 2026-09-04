import fluidPressureLesson from "../../../../../content/lessons/fluid-pressure/basic-fluid-pressure.json";
import bernoulliFlowLesson from "../../../../../content/lessons/fluid-mechanics/bernoulli-flow-lab.json";
import hydraulicCylinderLesson from "../../../../../content/lessons/hydraulics/hydraulic-cylinder-force.json";
import smartPumpUnitsLesson from "../../../../../content/lessons/smart-pump-systems/pump-system-units-and-measurements.json";
import thermodynamicsSystemsLesson from "../../../../../content/lessons/thermodynamics/systems-surroundings-boundaries.json";
import type {
  ContentAudience,
  PublicationAccessContext
} from "@industrial-learn/content-review-workflow/publication-visibility";
import { evaluateStaticLessonReviewGate } from "@industrial-learn/content-review-workflow/static-review-record";

import { getStaticTechnicalReviewRecords } from "../publication/review-records";
import { getStaticSourceRecordsById } from "../publication/source-records";
import { evaluateStaticPublicationVisibility } from "../publication/static-publication";
import type { SourceRecord, StructuredLesson } from "./types";

const lessons = [
  fluidPressureLesson as StructuredLesson,
  bernoulliFlowLesson as StructuredLesson,
  hydraulicCylinderLesson as StructuredLesson,
  smartPumpUnitsLesson as StructuredLesson,
  thermodynamicsSystemsLesson as StructuredLesson
];
export function getPublicLessons() {
  return lessons.filter((lesson) => lessonIsVisibleToAudience(lesson, "public"));
}

export function getPublicLessonBySlug(slug: string) {
  return getPublicLessons().find((lesson) => lesson.slug === slug);
}

export function searchPublicLessons(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const publicLessons = getPublicLessons();

  if (!normalizedQuery) {
    return publicLessons;
  }

  return publicLessons.filter((lesson) =>
    [
      lesson.title,
      lesson.description,
      lesson.slug,
      lesson.difficulty,
      ...lesson.learningOutcomes,
      ...lesson.sourceIds
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery)
  );
}

export function getSourceRecordsById(sourceIds: string[]) {
  return getStaticSourceRecordsById(sourceIds) as SourceRecord[];
}

export function getInternalLessonBySlug(input: {
  slug: string;
  audience: Exclude<ContentAudience, "public" | "student">;
  access: PublicationAccessContext;
}) {
  return lessons.find(
    (lesson) =>
      lesson.slug === input.slug &&
      lessonIsVisibleToAudience(lesson, input.audience, input.access)
  );
}

export function evaluateLessonPublication(
  lesson: StructuredLesson,
  input: {
    audience: ContentAudience;
    reviewRecords?: readonly unknown[];
    access?: PublicationAccessContext;
  }
) {
  const reviewGate = evaluateStaticLessonReviewGate({
    subject: {
      id: lesson.id,
      version: lesson.version,
      authorId: lesson.authorProfileId ?? null,
      sourceIds: lesson.sourceIds,
      equationIds: lesson.equationIds ?? [],
      simulationIds: lesson.simulationIds ?? [],
      requiresSafetyReview: true
    },
    reviewRecords: input.reviewRecords ?? getStaticTechnicalReviewRecords()
  });

  const exactPublishedVersion =
    lesson.publishedVersion === lesson.version ? reviewGate.authority : null;

  return evaluateStaticPublicationVisibility({
    audience: input.audience,
    record: lesson,
    sourceRecords: getStaticSourceRecordsById(lesson.sourceIds),
    ...(exactPublishedVersion ? { authority: exactPublishedVersion } : {}),
    ...(input.access ? { access: input.access } : {})
  });
}

function lessonIsVisibleToAudience(
  lesson: StructuredLesson,
  audience: ContentAudience,
  access?: PublicationAccessContext
) {
  return evaluateLessonPublication(lesson, {
    audience,
    ...(access ? { access } : {})
  }).visible;
}
