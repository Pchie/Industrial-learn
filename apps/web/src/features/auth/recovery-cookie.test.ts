import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRecoveryTicket, verifyRecoveryTicket } from "./recovery-ticket";

const jar = vi.hoisted(() => ({
  get: vi.fn<(name: string) => { value: string } | undefined>(),
  set: vi.fn(),
  delete: vi.fn<(name: string) => void>()
}));
vi.mock("next/headers", () => ({ cookies: () => Promise.resolve(jar) }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("./supabase-provider", () => ({ createSupabaseAuthProvider: vi.fn() }));

import {
  clearSessionCookies,
  readRecoveryToken,
  resolveAuthenticatedSession,
  setRecoveryCookie
} from "./server";

beforeEach(() => {
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("password recovery cookie boundary", () => {
  it.each(["production", "test"])(
    "sets a short-lived HttpOnly recovery cookie in %s",
    async (environment) => {
      vi.stubEnv("NODE_ENV", environment);
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-09-08T12:00:00Z"));
      await setRecoveryCookie({
        accessToken: "test-recovery",
        expiresAt: "2026-09-08T13:00:00Z"
      });
      expect(jar.set).toHaveBeenCalledWith("il_recovery", expect.any(String), {
        httpOnly: true,
        sameSite: "lax",
        secure: environment === "production",
        path: "/",
        maxAge: 600
      });
      const ticket: unknown = jar.set.mock.calls[0]?.[1];
      if (typeof ticket !== "string")
        throw new Error("Expected a signed recovery ticket.");
      expect(verifyRecoveryTicket(ticket, "test-key")).toBe("test-recovery");
    }
  );

  it("does not extend a short provider session", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T12:00:00Z"));
    await setRecoveryCookie({
      accessToken: "test-recovery",
      expiresAt: "2026-09-08T12:00:30Z"
    });
    expect(jar.set).toHaveBeenCalledWith(
      "il_recovery",
      expect.any(String),
      expect.objectContaining({ maxAge: 30 })
    );
  });

  it("never resolves recovery authority as an ordinary application session", async () => {
    const ticket = createRecoveryTicket(
      {
        accessToken: "test-recovery",
        expiresAt: new Date(Date.now() + 60000).toISOString()
      },
      "test-key"
    );
    jar.get.mockImplementation((name) =>
      name === "il_recovery" ? { value: ticket } : undefined
    );
    expect(await readRecoveryToken()).toBe("test-recovery");
    expect(await resolveAuthenticatedSession()).toMatchObject({
      ok: false,
      code: "missing_session"
    });
  });

  it("rejects a normal token relabelled as a recovery cookie", async () => {
    jar.get.mockReturnValue({ value: "ordinary-session" });
    expect(await readRecoveryToken()).toBeUndefined();
  });

  it("logout clears recovery and normal session cookies", async () => {
    await clearSessionCookies();
    expect(jar.delete.mock.calls.map((call) => call[0]).sort()).toEqual([
      "il_recovery",
      "il_refresh",
      "il_session"
    ]);
  });
});
