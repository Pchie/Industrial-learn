import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCapability } from "@/features/auth/server";
import { DashboardOverview } from "@/features/student-dashboard/dashboard-overview";
import { referencePreviewEnabled } from "@/features/student-dashboard/reference-preview-policy";
import styles from "@/features/student-dashboard/dashboard.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Fictional dashboard design preview | Industrial Learn",
  robots: { index: false, follow: false }
};

export default async function ReferenceDashboardPage() {
  if (!referencePreviewEnabled(process.env)) notFound();
  await requireCapability("content:preview", "/internal/reference-dashboard");
  const { referenceDashboardDemo } =
    await import("@/features/student-dashboard/reference-demo");
  return (
    <div className={styles.dashboard} data-student-workspace data-reference-demo>
      <aside
        id="reference-demo-notice"
        className="reference-demo-notice"
        aria-label="Fictional design preview"
      >
        Design preview · Fictional data
      </aside>
      <div className={styles.content}>
        <DashboardOverview data={referenceDashboardDemo} />
      </div>
    </div>
  );
}
