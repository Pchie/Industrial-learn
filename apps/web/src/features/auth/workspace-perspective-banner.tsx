import { Alert } from "@industrial-learn/design-system";

import type { AuthenticatedSession } from "./session-core";

const perspectives = ["student", "author", "reviewer", "lecturer"] as const;

export function WorkspacePerspectiveBanner({
  perspective,
  session
}: {
  perspective?: string | undefined;
  session: AuthenticatedSession;
}) {
  if (
    !session.roles.includes("platform_owner") ||
    !perspectives.includes(perspective as (typeof perspectives)[number])
  ) {
    return null;
  }

  return (
    <Alert title={`VIEWING PLATFORM AS ${perspective?.toUpperCase()}`} tone="info">
      This is an interface perspective only. You remain signed in as Platform Owner and no
      other user's private data is loaded.
    </Alert>
  );
}
