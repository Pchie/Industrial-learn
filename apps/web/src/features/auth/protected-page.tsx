import Link from "next/link";
import type { ReactNode } from "react";
import { Alert, Badge } from "@industrial-learn/design-system";

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
    <section className="section-band" aria-labelledby="protected-title">
      <p className="eyebrow">Protected area</p>
      <h1 id="protected-title">{title}</h1>
      <p>{description}</p>
      <Alert title="Server session resolved" tone="info">
        Access is based on the trusted server session for {session.profile.displayName}.
      </Alert>
      <div className="protected-role-list" aria-label="Resolved roles">
        {session.roles.map((role) => (
          <Badge key={role} tone="normal">
            {role}
          </Badge>
        ))}
      </div>
      {children}
      <p>
        <Link href="/auth/sign-out">Sign out</Link>
      </p>
    </section>
  );
}
