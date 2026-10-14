import { getPublicLessons } from "../lesson-engine/data";
import { lessonHasCompletionEvidence, type StudentDashboardData } from "./data";

export const learningViews = ["all", "in-progress", "completed", "saved"] as const;
export type LearningView = (typeof learningViews)[number];
export function learningView(value: string | undefined): LearningView {
  return learningViews.find((view) => view === value) ?? "all";
}

export function buildLearningLibrary(
  data: StudentDashboardData,
  view: LearningView,
  query: string
) {
  const unavailable = new Set(data.unavailableSections ?? []);
  const saved = new Set(
    unavailable.has("saved") ? [] : data.savedLessons.map((lesson) => lesson.lessonSlug)
  );
  const records = unavailable.has("lessons") ? [] : data.lessonProgress;
  const completed = new Set(
    records.filter(lessonHasCompletionEvidence).map((record) => record.lessonSlug)
  );
  const lessons = getPublicLessons().map((lesson) => ({
    ...lesson,
    state: unavailable.has("lessons")
      ? "Progress unavailable"
      : completed.has(lesson.slug)
        ? "Completed"
        : records.some(
              (record) =>
                record.lessonSlug === lesson.slug && record.status === "in_progress"
            )
          ? "In progress"
          : "Available",
    saved: saved.has(lesson.slug)
  }));
  const publicSlugs = new Set(lessons.map((lesson) => lesson.slug));
  const unavailableSaved = unavailable.has("saved")
    ? []
    : data.savedLessons
        .filter((bookmark) => !publicSlugs.has(bookmark.lessonSlug))
        .map((bookmark) => ({ id: bookmark.id }));
  const counts = {
    all: lessons.length,
    "in-progress": lessons.filter((lesson) => lesson.state === "In progress").length,
    completed: lessons.filter((lesson) => lesson.state === "Completed").length,
    saved: lessons.filter((lesson) => lesson.saved).length + unavailableSaved.length
  };
  const normalized = query.trim().toLowerCase();
  return {
    counts,
    unavailableSaved,
    lessons: lessons.filter(
      (lesson) =>
        (view === "all" ||
          (view === "saved" && lesson.saved) ||
          (view === "in-progress" && lesson.state === "In progress") ||
          (view === "completed" && lesson.state === "Completed")) &&
        `${lesson.title} ${lesson.description}`.toLowerCase().includes(normalized)
    )
  };
}
