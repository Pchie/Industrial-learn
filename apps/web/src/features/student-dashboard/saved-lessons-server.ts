import "server-only";
import { getBackendMode, getServerEnv } from "@industrial-learn/env";
import { readSessionTokens } from "../auth/server";
import type { AuthenticatedSession } from "../auth/session-core";
import { getPublicLessonBySlug } from "../lesson-engine/data";
import { createSavedLessonRepository } from "./saved-lesson-repository";

async function repository() {
  const env = getServerEnv();
  const { accessToken } = await readSessionTokens();
  if (!env.supabase.url || !env.supabase.anonKey || !accessToken) {
    throw new Error("Saved lesson access is unavailable.");
  }
  return createSavedLessonRepository(env.supabase.url, env.supabase.anonKey, accessToken);
}

function localMode() {
  return getBackendMode() === "local";
}

export async function removeSavedLessonById(
  session: AuthenticatedSession,
  bookmarkId: string
) {
  if (localMode()) {
    const { loadLocalStudentDashboardData, setLocalSavedLesson } =
      await import("./local-dashboard-store");
    const bookmark = loadLocalStudentDashboardData(session.profile).savedLessons.find(
      (row) => row.id === bookmarkId
    );
    if (!bookmark) throw new Error("Saved lesson could not be removed.");
    setLocalSavedLesson(session.profile, bookmark.lessonSlug, false);
    return;
  }
  await (await repository()).removeById(session.profile.id, bookmarkId);
}

export async function readSavedLesson(session: AuthenticatedSession, slug: string) {
  const lesson = getPublicLessonBySlug(slug);
  if (!lesson) throw new Error("Lesson is unavailable.");
  if (localMode()) {
    const { loadLocalStudentDashboardData } = await import("./local-dashboard-store");
    return loadLocalStudentDashboardData(session.profile).savedLessons.some(
      (lesson) => lesson.lessonSlug === slug
    );
  }
  return (await repository()).isSaved(session.profile.id, lesson);
}

export async function setSavedLesson(
  session: AuthenticatedSession,
  slug: string,
  saved: boolean
) {
  const lesson = getPublicLessonBySlug(slug);
  if (saved && !lesson) throw new Error("Lesson is unavailable.");
  if (localMode()) {
    const { setLocalSavedLesson } = await import("./local-dashboard-store");
    setLocalSavedLesson(session.profile, slug, saved);
    return;
  }
  await (
    await repository()
  ).setSaved(session.profile.id, lesson ?? { slug, id: "", version: "" }, saved);
}
