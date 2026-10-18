import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireStudent: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  revalidate: vi.fn()
}));
vi.mock("../auth/server", () => ({ requireStudentProfile: mocks.requireStudent }));
vi.mock("./saved-lessons-server", () => ({
  setSavedLesson: mocks.save,
  removeSavedLessonById: mocks.remove
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import {
  removeUnavailableSavedLessonAction,
  saveLessonAction
} from "./saved-lesson-action";

afterEach(() => vi.resetAllMocks());
describe("bookmark action confirmation and failure", () => {
  it("ignores client ownership and preserves a failed unavailable-bookmark removal", async () => {
    const session = { profile: { id: "synthetic-owner" } };
    mocks.requireStudent.mockResolvedValue(session);
    const form = new FormData();
    form.set("bookmarkId", "owned-bookmark");
    form.set("studentProfileId", "forged-owner");
    mocks.remove.mockRejectedValueOnce(new Error("offline"));
    expect(
      await removeUnavailableSavedLessonAction({ removed: false, error: false }, form)
    ).toEqual({ removed: false, error: true });
    expect(mocks.revalidate).not.toHaveBeenCalled();
    mocks.remove.mockResolvedValueOnce(undefined);
    expect(
      await removeUnavailableSavedLessonAction({ removed: false, error: false }, form)
    ).toEqual({ removed: true, error: false });
    expect(mocks.remove).toHaveBeenLastCalledWith(session, "owned-bookmark");
  });
  it.each([false, true])(
    "preserves the confirmed saved=%s state on write failure",
    async (saved) => {
      mocks.requireStudent.mockResolvedValue({ profile: { id: "synthetic-owner" } });
      mocks.save.mockRejectedValue(new Error("Unavailable"));
      const form = new FormData();
      form.set("lessonSlug", "basic-fluid-pressure");
      form.set("intent", saved ? "remove" : "save");
      const result = await saveLessonAction({ saved, message: "", error: false }, form);
      expect(result).toMatchObject({ saved, error: true });
      expect(mocks.revalidate).not.toHaveBeenCalled();
    }
  );
  it("checks current account status before a direct action can persist", async () => {
    mocks.requireStudent.mockRejectedValue(new Error("disabled_account"));
    await expect(
      saveLessonAction({ saved: false, message: "", error: false }, new FormData())
    ).rejects.toThrow("disabled_account");
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
