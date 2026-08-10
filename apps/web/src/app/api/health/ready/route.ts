import { NextResponse } from "next/server";

import { getServerEnv } from "@industrial-learn/env";

import {
  createCorrelationId,
  recordOperationalEvent
} from "../../../../features/monitoring/server";

export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "failed";

type ReadinessResult = {
  ready: boolean;
  checks: {
    configuration: CheckStatus;
    database: CheckStatus;
    authProvider: CheckStatus;
  };
};

export async function GET() {
  const correlationId = createCorrelationId();
  const result = await checkReadiness();
  const status = result.ready ? 200 : 503;

  if (!result.ready) {
    recordOperationalEvent({
      category: "health_check_failure",
      operation: "readiness_check",
      result: "failure",
      route: "/api/health/ready",
      correlationId,
      details: result.checks
    });
  }

  return NextResponse.json(
    {
      status: result.ready ? "ready" : "not_ready",
      checks: result.checks,
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
      release: {
        version: process.env.APP_VERSION || "0.1.0",
        commit: process.env.VERCEL_GIT_COMMIT_SHA || "local"
      },
      correlationId
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function checkReadiness(): Promise<ReadinessResult> {
  try {
    const env = getServerEnv();
    const hasAuthConfiguration =
      env.authMode === "local" || Boolean(env.supabase.url && env.supabase.anonKey);
    const hasDatabaseConfiguration = Boolean(
      env.supabase.url && env.supabase.serviceRoleKey
    );

    if (!hasAuthConfiguration || !hasDatabaseConfiguration) {
      return {
        ready: false,
        checks: {
          configuration: "failed",
          authProvider: hasAuthConfiguration ? "ok" : "failed",
          database: hasDatabaseConfiguration ? "ok" : "failed"
        }
      };
    }

    const [authProvider, database] = await Promise.all([
      probeSupabaseAuth(env.supabase.url, env.supabase.anonKey),
      probeSupabaseDatabase(env.supabase.url, env.supabase.serviceRoleKey)
    ]);

    return {
      ready: authProvider === "ok" && database === "ok",
      checks: {
        configuration: "ok",
        authProvider,
        database
      }
    };
  } catch {
    return {
      ready: false,
      checks: {
        configuration: "failed",
        authProvider: "failed",
        database: "failed"
      }
    };
  }
}

async function probeSupabaseAuth(url: string | undefined, anonKey: string | undefined) {
  if (!url || !anonKey) {
    return "failed";
  }

  const response = await fetch(`${url}/auth/v1/health`, {
    headers: {
      apikey: anonKey
    },
    cache: "no-store"
  }).catch(() => null);

  return response && response.status < 500 ? "ok" : "failed";
}

async function probeSupabaseDatabase(
  url: string | undefined,
  serviceRoleKey: string | undefined
) {
  if (!url || !serviceRoleKey) {
    return "failed";
  }

  const response = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    },
    cache: "no-store"
  }).catch(() => null);

  return response && response.status < 500 ? "ok" : "failed";
}
