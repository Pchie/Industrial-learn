import { NextResponse } from "next/server";

import { identityScope } from "@/features/auth/identity-scope";
import { resolveAuthenticatedSession } from "@/features/auth/server";
import { availableWorkspaces, primaryRoleLabel } from "@/features/auth/workspace-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await resolveAuthenticatedSession();
  if (!result.ok) {
    return NextResponse.json(
      { authenticated: false, identityScope: identityScope(null) },
      { status: 401, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const session = result.value;
  return NextResponse.json(
    {
      authenticated: true,
      identityScope: identityScope(session),
      displayName: session.profile.displayName,
      primaryRole: primaryRoleLabel(session.roles),
      roles: session.roles,
      workspaces: availableWorkspaces(session)
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
