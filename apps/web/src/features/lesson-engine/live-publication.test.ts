import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { isLiveLessonPublished } from "./live-publication";
import { getPublicLessons } from "./data";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("saved lesson reopening publication", () => {
  it("denies withdrawal and backend outages without exposing the static lesson", async () => {
    vi.stubEnv("INDUSTRIAL_LEARN_AUTH_MODE", "supabase");
    vi.stubEnv("INDUSTRIAL_LEARN_E2E", "false");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-test-key");
    const lesson = getPublicLessons()[0]!;
    const published = { governance_item_id: "00000000-0000-4000-8000-000000000001" };
    for (const body of [[], [{}], [null], [published, published], [published]]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));
      expect(await isLiveLessonPublished(lesson)).toBe(
        body.length === 1 && body[0] === published
      );
    }
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await isLiveLessonPublished(lesson)).toBe(false);
  });
});
