import { afterEach, describe, expect, it, vi } from "vitest";

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
      expect(jar.set).toHaveBeenCalledWith("il_recovery", "test-recovery", {
        httpOnly: true,
        sameSite: "lax",
        secure: environment === "production",
        path: "/",
        maxAge: 600
      });
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
      "test-recovery",
      expect.objectContaining({ maxAge: 30 })
    );
  });

  it("never resolves recovery authority as an ordinary application session", async () => {
    jar.get.mockImplementation((name) =>
      name === "il_recovery" ? { value: "test-recovery" } : undefined
    );
    expect(await readRecoveryToken()).toBe("test-recovery");
    expect(await resolveAuthenticatedSession()).toMatchObject({
      ok: false,
      code: "missing_session"
    });
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
