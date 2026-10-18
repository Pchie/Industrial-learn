import "server-only";
import { getBackendMode, getServerEnv } from "@industrial-learn/env";
import type { StructuredLesson } from "./types";

/** Reopening a bookmark must pass current backend publication as well as the
 * checked-in engineering review gate. No private content or credentials returned. */
export async function isLiveLessonPublished(lesson: StructuredLesson) {
  if (getBackendMode() === "local") return true;
  const env = getServerEnv();
  if (!env.supabase.url || !env.supabase.anonKey) return false;
  try {
    const response = await fetch(
      `${env.supabase.url}/rest/v1/rpc/resolve_published_lesson`,
      {
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
        headers: { apikey: env.supabase.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          p_slug: lesson.slug,
          p_content_id: lesson.id,
          p_content_version: lesson.version
        })
      }
    );
    if (!response.ok) return false;
    const rows: unknown = await response.json();
    if (!Array.isArray(rows) || rows.length !== 1) return false;
    const row: unknown = rows[0];
    return (
      typeof row === "object" &&
      row !== null &&
      "governance_item_id" in row &&
      typeof row.governance_item_id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        row.governance_item_id
      )
    );
  } catch {
    return false;
  }
}
