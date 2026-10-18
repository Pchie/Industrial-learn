import { describe, expect, it } from "vitest";
import { summarizeStudyActivity } from "./activity-summary";
describe("study activity", () => {
  const now = "2026-09-11T12:00:00Z";
  it("starts with zero activity", () =>
    expect(summarizeStudyActivity([], now)).toEqual({
      streak: 0,
      points: [0, 0, 0, 0, 0, 0, 0]
    }));
  it("deduplicates multiple activities on a day and carries yesterday's streak", () => {
    expect(
      summarizeStudyActivity(
        ["2026-09-10T08:00:00Z", "2026-09-10T09:00:00Z", "2026-09-09T12:00:00Z"],
        now
      )
    ).toEqual({ streak: 2, points: [0, 0, 0, 0, 1, 1, 0] });
  });
  it("ends a streak after an inactive day and ignores invalid/future dates", () => {
    expect(
      summarizeStudyActivity([undefined, "bad", "2026-09-12", "2026-09-09"], now).streak
    ).toBe(0);
  });
  it("uses UTC boundaries across months", () => {
    expect(
      summarizeStudyActivity(
        ["2026-08-31T23:00:00Z", "2026-09-01T02:00:00Z"],
        "2026-09-01T12:00:00Z"
      ).streak
    ).toBe(2);
  });
});
