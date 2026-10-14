import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), manager: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(url);
  }
}));
vi.mock("../auth/server", () => ({
  requirePlatformManager: mocks.manager,
  readSessionTokens: () => Promise.resolve({ accessToken: "synthetic-token" })
}));
vi.mock("@industrial-learn/database", () => ({
  createSupabaseServerClient: () => ({ rpc: mocks.rpc }),
  createSupabaseServiceRoleClient: vi.fn()
}));
import { setAccountStatusAction } from "./actions";
function form(operation: string) {
  const data = new FormData();
  data.set("targetProfileId", "synthetic-target");
  data.set("operation", operation);
  data.set("reason", "Synthetic account status regression");
  data.set("confirmed", "on");
  return data;
}
beforeEach(() => {
  mocks.manager.mockResolvedValue({ profile: { id: "manager" } });
  mocks.rpc.mockResolvedValue({ error: null });
  vi.stubEnv("INDUSTRIAL_LEARN_AUTH_MODE", "supabase");
  vi.stubEnv("INDUSTRIAL_LEARN_E2E", "false");
  vi.stubEnv("NEXT_PUBLIC_APP_ENV", "test");
});
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
describe("53E-F08 account status operation", () => {
  it.each(["", "enable-now", "invalid", "DISABLE"])(
    "rejects malformed operation %s without changing the target",
    async (operation) => {
      await expect(setAccountStatusAction(form(operation))).rejects.toThrow(
        "invalid_account_change"
      );
      expect(mocks.rpc).not.toHaveBeenCalled();
    }
  );
  it.each(["enable", "disable"])(
    "passes only explicit %s to the audited manager RPC",
    async (operation) => {
      await expect(setAccountStatusAction(form(operation))).rejects.toThrow(
        operation === "enable" ? "account_enabled" : "account_disabled"
      );
      expect(mocks.rpc).toHaveBeenCalledWith("set_profile_disabled", {
        p_target_profile_id: "synthetic-target",
        p_disabled: operation === "disable",
        p_reason: "Synthetic account status regression"
      });
    }
  );
  it("denies direct requests by a non-manager", async () => {
    mocks.manager.mockRejectedValue(new Error("access_denied"));
    await expect(setAccountStatusAction(form("enable"))).rejects.toThrow("access_denied");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
