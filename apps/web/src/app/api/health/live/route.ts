import { NextResponse } from "next/server";

import { createCorrelationId } from "../../../../features/monitoring/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
      release: {
        version: process.env.APP_VERSION || "0.1.0",
        commit: process.env.VERCEL_GIT_COMMIT_SHA || "local"
      },
      correlationId: createCorrelationId()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
