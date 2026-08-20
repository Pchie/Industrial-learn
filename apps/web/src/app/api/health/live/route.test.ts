import { afterEach, describe, expect, it } from "vitest";

import { GET } from "./route";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("liveness health endpoint", () => {
  it("returns a minimal no-store liveness response", async () => {
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    process.env.APP_VERSION = "0.1.0-test";
    process.env.VERCEL_GIT_COMMIT_SHA = "abc123";

    const response = GET();
    const body = (await response.json()) as LiveHealthResponse;

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body).toMatchObject({
      status: "ok",
      environment: "staging",
      release: {
        version: "0.1.0-test",
        commit: "abc123"
      }
    });
    expect(body.correlationId).toBeTruthy();
  });
});

type LiveHealthResponse = {
  status: string;
  environment: string;
  release: {
    version: string;
    commit: string;
  };
  correlationId: string;
};
