import "server-only";
import { createHash } from "node:crypto";
import { getBackendMode, getServerEnv } from "@industrial-learn/env";
import type { AuthenticatedSession } from "./session-core";

/** An opaque cache scope, never a token or an authorisation credential. */
export function identityScope(session: AuthenticatedSession | null) {
  const env = getServerEnv();
  return createHash("sha256")
    .update(
      JSON.stringify([
        getBackendMode(env),
        env.appEnv,
        env.supabase.url ?? "loopback",
        session?.profile.id ?? null,
        [...(session?.roles ?? [])].sort()
      ])
    )
    .digest("hex");
}
