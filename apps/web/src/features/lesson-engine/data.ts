import fluidPressureLesson from "../../../../../content/lessons/fluid-pressure/basic-fluid-pressure.json";
import smartPumpUnitsLesson from "../../../../../content/lessons/smart-pump-systems/pump-system-units-and-measurements.json";
import fluidPressureSource from "../../../../../sources/fluid-pressure/source-record.json";
import smartPumpSource from "../../../../../sources/smart-pump-systems/source-record.json";

import type { SourceRecord, StructuredLesson } from "./types";

const lessons = [
  fluidPressureLesson as StructuredLesson,
  smartPumpUnitsLesson as StructuredLesson
];
const sourceRecords = [
  fluidPressureSource as SourceRecord,
  smartPumpSource as SourceRecord
];

export function getLessons() {
  return lessons;
}

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getSourceRecordsById(sourceIds: string[]) {
  return sourceRecords.filter((source) => sourceIds.includes(source.id));
}
