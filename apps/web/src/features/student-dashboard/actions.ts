"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStudentProfile } from "../auth/server";
import { dismissDashboardRecommendation } from "./server-data";

export async function dismissRecommendationAction(formData: FormData) {
  const recommendationId = formData.get("recommendationId");
  const session = await requireStudentProfile("/dashboard");

  if (typeof recommendationId !== "string") {
    throw new Error("Recommendation identifier is required.");
  }

  await dismissDashboardRecommendation(session, recommendationId);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
