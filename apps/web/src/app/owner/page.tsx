import Link from "next/link";

import { Alert, Breadcrumbs } from "@industrial-learn/design-system";

import { ProtectedPage } from "@/features/auth/protected-page";
import { requirePlatformOwner } from "@/features/auth/server";

const ownerAreas = [
  ["Users and roles", "/admin/users"],
  ["Programmes and curriculum", "/learn"],
  ["Content authoring", "/author"],
  ["Engineering reviews", "/review"],
  ["Sources and governed content", "/review"],
  ["Simulation registry", "/simulations"],
  ["Publication records", "/review"],
  ["Audit log", "/admin/users#access-audit-title"],
  ["System status", "/api/health"]
] as const;

export default async function OwnerPage() {
  const session = await requirePlatformOwner("/owner");

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs
        items={[
          { href: "/workspace", label: "Workspace" },
          { href: "/owner", label: "Platform Management" }
        ]}
      />
      <ProtectedPage
        description="Manage users, governance, publication records, and platform operations through audited controls."
        session={session}
        title="Platform Management"
      >
        <Alert title="Access is not approval" tone="warning">
          Platform Owner access permits inspection and workflow management. It does not
          satisfy independent engineering review.
        </Alert>
        <div className="owner-area-grid">
          {ownerAreas.map(([label, href]) => (
            <Link key={label} href={href}>
              {label}
            </Link>
          ))}
        </div>
        <section aria-labelledby="view-as-title" className="management-section">
          <h2 id="view-as-title">View workspace as</h2>
          <p>
            This changes only the interface. It never impersonates another user or loads
            their private data.
          </p>
          <div className="workspace-links">
            <Link href="/dashboard?perspective=student">Student</Link>
            <Link href="/author?perspective=author">Author</Link>
            <Link href="/review?perspective=reviewer">Reviewer</Link>
            <Link href="/lecturer?perspective=lecturer">Lecturer</Link>
          </div>
        </section>
      </ProtectedPage>
    </div>
  );
}
