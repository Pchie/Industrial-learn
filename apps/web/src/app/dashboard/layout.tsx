import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div data-student-workspace>{children}</div>;
}
