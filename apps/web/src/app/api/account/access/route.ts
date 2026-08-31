import { NextResponse } from "next/server";

import { resolveAuthenticatedSession } from "@/features/auth/server";
import { availableWorkspaces, primaryRoleLabel } from "@/features/auth/workspace-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await resolveAuthenticatedSession();
  if (!result.ok) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const session = result.value;
  return NextResponse.json(
    {
      authenticated: true,
      displayName: session.profile.displayName,
      primaryRole: primaryRoleLabel(session.roles),
      roles: session.roles,
      workspaces: availableWorkspaces(session)
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
