import "server-only";

import { getServerEnv } from "@industrial-learn/env";

import type { AuthenticatedSession } from "../auth/session-core";
import { recordLocalLessonProgress } from "../student-dashboard/local-dashboard-store";

const LESSON = {
  contentId: "LES-FLUID-PRESSURE-001",
  slug: "basic-fluid-pressure",
  version: "0.4.0",
  moduleSlug: "fluid-mechanics-foundations"
} as const;

export async function recordBasicPressureActivityProgress(session: AuthenticatedSession) {
  const recordedAt = new Date().toISOString();

  if (isLocalProgressMode()) {
    recordLocalLessonProgress(session.profile.id, {
      id: "pilot-progress-basic-fluid-pressure",
      lessonSlug: LESSON.slug,
      moduleSlug: LESSON.moduleSlug,
      status: "in_progress",
      percentComplete: 50,
      startedAt: recordedAt,
      lastActivityAt: recordedAt
    });
    return;
  }

  const env = getServerEnv();
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    throw new Error("Pilot lesson progress persistence is not configured.");
  }

  const response = await fetch(
    `${env.supabase.url}/rest/v1/rpc/record_pilot_lesson_activity_progress`,
    {
      method: "POST",
      headers: {
        apikey: env.supabase.serviceRoleKey,
        Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        p_student_profile_id: session.profile.id,
        p_lesson_content_id: LESSON.contentId,
        p_lesson_slug: LESSON.slug,
        p_lesson_version: LESSON.version,
        p_module_slug: LESSON.moduleSlug,
        p_recorded_at: recordedAt
      }),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Pilot lesson progress could not be recorded.");
  }
}

function isLocalProgressMode() {
  return (
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true"
  );
}
