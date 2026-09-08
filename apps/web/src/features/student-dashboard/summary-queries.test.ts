import { describe, expect, it, vi } from "vitest";
import {
  DashboardSessionError,
  dashboardQueries,
  readDashboardSummaries
} from "./summary-queries";

describe("bounded private dashboard reads", () => {
  it("scopes every query to the resolved owner with minimal fields and bounded limits", async () => {
    const get = vi.fn(() => Promise.resolve([]));
    await readDashboardSummaries(get, "student-a");
    expect(get).toHaveBeenCalledTimes(7);
    for (const query of dashboardQueries) {
      expect(get).toHaveBeenCalledWith(
        query.table,
        expect.objectContaining({
          student_profile_id: "eq.student-a",
          limit: String(query.limit),
          select: query.select
        })
      );
      expect(query.select).not.toMatch(
        /\*|answers|scoring_summary|input_summary|output_summary/
      );
    }
    expect(get).toHaveBeenCalledWith(
      "enrolments",
      expect.objectContaining({ withdrawn_at: "is.null" })
    );
  });
  it("keeps successful records while explicitly reporting partial unavailability", async () => {
    const result = await readDashboardSummaries((table) => {
      if (table === "assessment_attempts") return Promise.reject(new Error("offline"));
      return Promise.resolve(table === "lesson_progress" ? [{ id: "mine" }] : []);
    }, "student-a");
    expect(result.rows.lessons).toEqual([{ id: "mine" }]);
    expect(result.rows.assessments).toEqual([]);
    expect(result.unavailableSections).toEqual(["assessments"]);
  });
  it("identifies truncated histories instead of presenting an overall percentage", async () => {
    const result = await readDashboardSummaries(
      (table) =>
        Promise.resolve(
          table === "lesson_progress"
            ? Array.from({ length: 25 }, (_, id) => ({ id }))
            : []
        ),
      "student-a"
    );
    expect(result.limitedSections).toEqual(["lessons"]);
  });
  it("fails closed on session rejection even when other queries succeed", async () => {
    await expect(
      readDashboardSummaries((table) => {
        if (table === "lesson_progress")
          return Promise.reject(new DashboardSessionError("denied"));
        return Promise.resolve([]);
      }, "student-a")
    ).rejects.toThrow(DashboardSessionError);
  });
  it("reports complete service failure rather than an empty successful dashboard", async () => {
    await expect(
      readDashboardSummaries(() => Promise.reject(new Error("offline")), "student-a")
    ).rejects.toThrow("Dashboard services are unavailable");
  });
});
