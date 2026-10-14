"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "../auth/server";
import { removeSavedLessonById, setSavedLesson } from "./saved-lessons-server";

export type SavedLessonState = { saved: boolean; message: string; error: boolean };

export async function removeUnavailableSavedLessonAction(
  previous: { removed: boolean; error: boolean },
  form: FormData
) {
  const session = await requireStudentProfile("/my-learning");
  const id = form.get("bookmarkId");
  if (typeof id !== "string" || !id || id.length > 200)
    return { ...previous, error: true };
  try {
    await removeSavedLessonById(session, id);
  } catch {
    return { ...previous, error: true };
  }
  revalidatePath("/dashboard");
  revalidatePath("/my-learning");
  return { removed: true, error: false };
}

export async function saveLessonAction(
  previous: SavedLessonState,
  form: FormData
): Promise<SavedLessonState> {
  const session = await requireStudentProfile("/my-learning");
  const slug = form.get("lessonSlug");
  const intent = form.get("intent");
  if (
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    slug.length > 160 ||
    (intent !== "save" && intent !== "remove")
  ) {
    return { ...previous, error: true, message: "This lesson could not be saved." };
  }
  const saved = intent === "save";
  try {
    await setSavedLesson(session, slug, saved);
  } catch {
    return {
      ...previous,
      error: true,
      message: "Saved lessons are unavailable. Please try again."
    };
  }
  revalidatePath("/dashboard");
  revalidatePath("/my-learning");
  revalidatePath(`/lessons/${slug}`);
  return {
    saved,
    error: false,
    message: saved ? "Lesson saved to My Learning." : "Lesson removed from saved lessons."
  };
}
