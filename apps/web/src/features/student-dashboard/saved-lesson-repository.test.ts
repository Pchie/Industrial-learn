import { describe, expect, it, vi } from "vitest";
import { createSavedLessonRepository } from "./saved-lesson-repository";
const target = { id: "LES-SYNTHETIC-001", slug: "synthetic-lesson", version: "0.4.0" };
function repository(request: typeof fetch) {
  return createSavedLessonRepository(
    "https://example.test",
    "public-key",
    "student-token",
    request
  );
}

describe("canonical private bookmarks: 53E-F02/F09", () => {
  it("removes an unavailable bookmark by owner-scoped ID without metadata", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json(true));
    await repository(request).removeById("student-a", "bookmark-id");
    expect(request.mock.calls[0]?.[0]).toContain("/rpc/remove_saved_lesson");
    expect(JSON.parse(request.mock.calls[0]![1]!.body as string)).toEqual({
      p_student_profile_id: "student-a",
      p_bookmark_id: "bookmark-id"
    });
    await expect(
      repository(
        vi.fn<typeof fetch>().mockResolvedValue(Response.json(false))
      ).removeById("student-b", "bookmark-id")
    ).rejects.toThrow("could not be removed");
  });
  it("resolves exact governed identity using the ordinary student token", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json([{ governance_item_id: "existing-governance-id", saved: false }])
      );
    expect(await repository(request).isSaved("student-a", target)).toBe(false);
    expect(request).toHaveBeenCalledWith(
      "https://example.test/rest/v1/rpc/resolve_saved_lesson",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        headers: {
          apikey: "public-key",
          Authorization: "Bearer student-token",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          p_student_profile_id: "student-a",
          p_slug: target.slug,
          p_content_id: target.id,
          p_content_version: target.version
        })
      })
    );
  });
  it("returns only a confirmed atomic save, including duplicate save", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockImplementation(() => Promise.resolve(Response.json(true)));
    await repository(request).setSaved("student-a", target, true);
    await repository(request).setSaved("student-a", target, true);
    expect(request).toHaveBeenCalledTimes(2);
    expect(JSON.parse(request.mock.calls[0]![1]!.body as string)).toMatchObject({
      p_saved: true,
      p_student_profile_id: "student-a",
      p_content_id: target.id
    });
  });
  it("removes an owned withdrawn target without an eligible-content lookup", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json(false));
    await repository(request).setSaved(
      "student-a",
      { id: "", slug: "withdrawn-lesson", version: "" },
      false
    );
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[0]).toContain("/rpc/set_saved_lesson");
    expect(JSON.parse(request.mock.calls[0]![1]!.body as string)).toMatchObject({
      p_saved: false,
      p_slug: "withdrawn-lesson",
      p_student_profile_id: "student-a"
    });
  });
  it.each([
    { rows: [] },
    { rows: [{ saved: true }] },
    {
      rows: [
        { governance_item_id: "a", saved: true },
        { governance_item_id: "b", saved: true }
      ]
    }
  ])("rejects missing or ambiguous canonical mapping", async ({ rows }) => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json(rows));
    await expect(repository(request).isSaved("student-a", target)).rejects.toThrow(
      "unavailable"
    );
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("does not claim success on a write rejection or unconfirmed state", async () => {
    for (const response of [
      new Response(null, { status: 403 }),
      Response.json(false),
      Response.json(null)
    ]) {
      await expect(
        repository(vi.fn<typeof fetch>().mockResolvedValue(response)).setSaved(
          "student-a",
          target,
          true
        )
      ).rejects.toThrow("could not be updated");
    }
  });
  it("surfaces read outages without fixture fallback", async () => {
    await expect(
      repository(
        vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }))
      ).isSaved("student-a", target)
    ).rejects.toThrow("could not be loaded");
  });
});
