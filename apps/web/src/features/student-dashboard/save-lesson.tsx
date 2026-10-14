"use client";

import { useActionState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import {
  removeUnavailableSavedLessonAction,
  saveLessonAction
} from "./saved-lesson-action";

export function RemoveUnavailableSavedLesson({ id }: { id: string }) {
  const [state, action, pending] = useActionState(removeUnavailableSavedLessonAction, {
    removed: false,
    error: false
  });
  if (state.removed) return <p role="status">Saved lesson removed.</p>;
  return (
    <form action={action} className="save-lesson">
      <input type="hidden" name="bookmarkId" value={id} />
      <button type="submit" className="il-button il-button--secondary" disabled={pending}>
        {pending ? "Removing…" : "Remove unavailable saved lesson"}
      </button>
      {state.error && (
        <span role="alert">The saved lesson could not be removed. Please try again.</span>
      )}
    </form>
  );
}

export function SaveLesson({ slug, saved }: { slug: string; saved: boolean }) {
  const [state, action, pending] = useActionState(saveLessonAction, {
    saved,
    message: "",
    error: false
  });
  return (
    <form action={action} className="save-lesson">
      <input type="hidden" name="lessonSlug" value={slug} />
      <input type="hidden" name="intent" value={state.saved ? "remove" : "save"} />
      <button
        className="il-button il-button--secondary"
        type="submit"
        aria-pressed={state.saved}
        disabled={pending}
      >
        {state.saved ? (
          <BookmarkCheck size={17} aria-hidden="true" />
        ) : (
          <Bookmark size={17} aria-hidden="true" />
        )}
        {pending ? "Saving…" : state.saved ? "Saved lesson" : "Save lesson"}
      </button>
      <span role={state.error ? "alert" : "status"}>{state.message}</span>
    </form>
  );
}
