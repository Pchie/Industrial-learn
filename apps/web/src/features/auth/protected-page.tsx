import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@industrial-learn/design-system";
import { ShieldCheck, LogOut } from "lucide-react";
import { PageHeading } from "../page-layout/components";
import { roleLabel } from "./workspace-access";

import type { AuthenticatedSession } from "./session-core";

export function ProtectedPage({
  children,
  description,
  session,
  title
}: {
  children?: ReactNode;
  description: string;
  session: AuthenticatedSession;
  title: string;
}) {
  return (
    <section className="protected-page" aria-labelledby="protected-title">
      <PageHeading
        id="protected-title"
        title={title}
        description={description}
        eyebrow="Your workspace"
      />
      <div className="protected-identity" role="status">
        <ShieldCheck size={20} aria-hidden="true" />
        <span>
          <span className="sr-only">Server session resolved. </span>Signed in as{" "}
          <strong>{session.profile.displayName}</strong>
        </span>
        <Link href="/account/access">Account access</Link>
      </div>
      <div className="protected-role-list" aria-label="Resolved roles">
        {session.roles.map((role) => (
          <Badge key={role} tone="normal">
            {roleLabel(role)}
          </Badge>
        ))}
      </div>
      {children}
      <p className="protected-sign-out">
        <Link href="/auth/sign-out">Sign out</Link>
        <LogOut size={16} aria-hidden="true" />
      </p>
    </section>
  );
}
