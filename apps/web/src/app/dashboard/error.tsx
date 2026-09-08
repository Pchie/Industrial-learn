"use client";

import { DashboardErrorState } from "@/features/student-dashboard/error-state";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <DashboardErrorState retry={reset} />;
}
