import { createHash, randomUUID } from "node:crypto";

import { getServerEnv } from "@industrial-learn/env";

import { redactMonitoringPayload, type RedactedJson } from "./redaction";

export type MonitoringCategory =
  | "application_error"
  | "assessment_operation_failure"
  | "auth_failure"
  | "content_publication_failure"
  | "database_failure"
  | "health_check_failure"
  | "server_error"
  | "simulation_operation_failure"
  | "slow_route";

export type MonitoringResult = "failure" | "success" | "warning";

export type MonitoringEventInput = {
  category: MonitoringCategory;
  operation: string;
  result: MonitoringResult;
  route?: string | undefined;
  correlationId?: string | undefined;
  safeUserId?: string | undefined;
  details?: Record<string, unknown> | undefined;
};

export type MonitoringEvent = {
  event: "industrial_learn_operational_event";
  environment: string;
  provider: "vercel-runtime-logs";
  appVersion: string;
  commitHash: string;
  timestamp: string;
  category: MonitoringCategory;
  operation: string;
  result: MonitoringResult;
  route: string;
  correlationId: string;
  safeUserId?: string | undefined;
  details: RedactedJson;
};

export function createCorrelationId() {
  return randomUUID();
}

export function safeHashIdentifier(identifier: string | undefined) {
  if (!identifier) {
    return undefined;
  }

  return createHash("sha256")
    .update(identifier.trim().toLowerCase())
    .digest("hex")
    .slice(0, 24);
}

export function createMonitoringEvent(input: MonitoringEventInput): MonitoringEvent {
  const env = getMonitoringEnvSummary();
  return {
    event: "industrial_learn_operational_event",
    environment: env.appEnv,
    provider: "vercel-runtime-logs",
    appVersion: process.env.APP_VERSION || "0.1.0",
    commitHash: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    timestamp: new Date().toISOString(),
    category: input.category,
    operation: input.operation,
    result: input.result,
    route: input.route ?? "unknown",
    correlationId: input.correlationId ?? createCorrelationId(),
    ...(input.safeUserId ? { safeUserId: input.safeUserId } : {}),
    details: redactMonitoringPayload(input.details ?? {})
  };
}

export function shouldEmitMonitoringEvent() {
  const env = getMonitoringEnvSummary();
  return env.appEnv === "staging" && env.isE2E !== true;
}

export function recordOperationalEvent(input: MonitoringEventInput) {
  const event = createMonitoringEvent(input);

  if (!shouldEmitMonitoringEvent()) {
    return event;
  }

  const line = JSON.stringify(event);
  if (event.result === "failure") {
    console.error(line);
  } else if (event.result === "warning") {
    console.warn(line);
  } else {
    console.info(line);
  }

  return event;
}

export function recordError(input: {
  category: MonitoringCategory;
  operation: string;
  route?: string | undefined;
  correlationId?: string | undefined;
  safeUserId?: string | undefined;
  error: unknown;
  details?: Record<string, unknown> | undefined;
}) {
  return recordOperationalEvent({
    category: input.category,
    operation: input.operation,
    result: "failure",
    route: input.route,
    correlationId: input.correlationId,
    safeUserId: input.safeUserId,
    details: {
      ...input.details,
      errorCategory: input.error instanceof Error ? input.error.name : "UnknownError"
    }
  });
}

function getMonitoringEnvSummary() {
  try {
    const env = getServerEnv();
    return {
      appEnv: env.appEnv,
      isE2E: env.isE2E
    };
  } catch {
    return {
      appEnv: appEnvFromProcess(),
      isE2E: process.env.INDUSTRIAL_LEARN_E2E === "true"
    };
  }
}

function appEnvFromProcess() {
  const raw = process.env.NEXT_PUBLIC_APP_ENV;
  return raw === "test" || raw === "staging" || raw === "production"
    ? raw
    : "development";
}
