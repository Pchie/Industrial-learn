export type SavedLessonTarget = { id: string; slug: string; version: string };

/** Ordinary JWT RPCs derive ownership from auth.uid() and validate the expected owner. */
export function createSavedLessonRepository(
  url: string,
  anonKey: string,
  accessToken: string,
  request: typeof fetch = fetch
) {
  async function rpc(name: string, body: Record<string, unknown>) {
    const response = await request(`${url}/rest/v1/rpc/${name}`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok)
      throw new Error(
        name === "resolve_saved_lesson"
          ? "Saved lessons could not be loaded."
          : "Saved lesson could not be updated."
      );
    return (await response.json()) as unknown;
  }
  function args(studentProfileId: string, target: SavedLessonTarget) {
    return {
      p_student_profile_id: studentProfileId,
      p_slug: target.slug,
      p_content_id: target.id,
      p_content_version: target.version
    };
  }
  return {
    async removeById(studentProfileId: string, bookmarkId: string) {
      const confirmed = await rpc("remove_saved_lesson", {
        p_student_profile_id: studentProfileId,
        p_bookmark_id: bookmarkId
      });
      if (confirmed !== true) throw new Error("Saved lesson could not be removed.");
    },
    async isSaved(studentProfileId: string, target: SavedLessonTarget) {
      const rows = await rpc("resolve_saved_lesson", args(studentProfileId, target));
      if (!Array.isArray(rows) || rows.length !== 1)
        throw new Error(
          "Lesson is unavailable; canonical publication must be synchronized."
        );
      const row = rows[0] as Record<string, unknown> | null;
      if (
        !row ||
        typeof row.saved !== "boolean" ||
        typeof row.governance_item_id !== "string"
      )
        throw new Error(
          "Lesson is unavailable; canonical publication must be synchronized."
        );
      return row.saved;
    },
    async setSaved(studentProfileId: string, target: SavedLessonTarget, saved: boolean) {
      const confirmed = await rpc("set_saved_lesson", {
        ...args(studentProfileId, target),
        p_saved: saved
      });
      if (confirmed !== saved) throw new Error("Saved lesson could not be updated.");
    }
  };
}
