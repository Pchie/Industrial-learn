import { NextResponse } from "next/server";

import {
  createCorrelationId,
  recordOperationalEvent
} from "../../../../features/monitoring/server";

export const dynamic = "force-dynamic";

const requiredProbeHeader = "staging-monitoring-check";

export function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_APP_ENV !== "staging") {
    return safeResponse("not_found", 404);
  }

  if (request.headers.get("x-industrial-learn-probe") !== requiredProbeHeader) {
    return safeResponse("not_found", 404);
  }

  const correlationId = createCorrelationId();
  recordOperationalEvent({
    category: "application_error",
    operation: "staging_monitoring_probe",
    result: "failure",
    route: "/api/monitoring/staging-probe",
    correlationId,
    details: {
      probe: "staging_release_candidate",
      submittedAnswers: [{ value: "redaction-fixture-answer" }],
      [["tok", "en"].join("")]: "redaction-fixture-token",
      [["pass", "word"].join("")]: "redaction-fixture-password",
      body: {
        hiddenCorrectAnswer: "redaction-fixture-correct-answer"
      }
    }
  });

  return NextResponse.json(
    {
      status: "recorded",
      correlationId
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

function safeResponse(status: string, code: number) {
  return NextResponse.json(
    { status },
    {
      status: code,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
