import { describe, expect, it, vi } from "vitest";
import {
  DashboardSessionError,
  dashboardQueries,
  readDashboardSummaries
} from "./summary-queries";

describe("bounded private dashboard reads", () => {
  it("scopes every query to the resolved owner with minimal fields and bounded limits", async () => {
    const get = vi.fn<
      (
        table: string,
        params: Record<string, string>
      ) => Promise<Record<string, unknown>[]>
    >(() => Promise.resolve([]));
    await readDashboardSummaries(get, "student-a");
    expect(get).toHaveBeenCalledTimes(7);
    for (const query of dashboardQueries) {
      expect(get).toHaveBeenCalledWith(
        query.table,
        expect.objectContaining({
          ...(query.key === "saved" ? {} : { student_profile_id: "eq.student-a" }),
          limit: String(query.limit),
          select: query.select
        })
      );
      expect(query.select).not.toMatch(
        /\*|answers|scoring_summary|input_summary|output_summary/
      );
    }
    expect(
      get.mock.calls.find(([table]) => table === "rpc/list_saved_lessons")?.[1]
    ).not.toHaveProperty("student_profile_id");
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

describe("53E-F07 complete library reads", () => {
  it("includes old progress and bookmarks beyond all dashboard limits", async () => {
    const records = Array.from({ length: 135 }, (_, i) => ({
      id: String(i).padStart(4, "0")
    }));
    const get = vi.fn((table: string, params: Record<string, string>) => {
      if (!["lesson_progress", "rpc/list_saved_lessons"].includes(table))
        return Promise.resolve([]);
      return Promise.resolve(
        records
          .filter((row) => !params.id || row.id > params.id.slice(3))
          .slice(0, Number(params.limit))
      );
    });
    const result = await readDashboardSummaries(get, "student-a", true);
    expect(result.rows.lessons).toEqual(records);
    expect(result.rows.saved).toEqual(records);
    expect(result.limitedSections).toEqual([]);
    expect(result.unavailableSections).toEqual([]);
  });
  it("does not turn a later-page failure into empty or partial saved state", async () => {
    const result = await readDashboardSummaries(
      (table, params) => {
        if (table !== "rpc/list_saved_lessons") return Promise.resolve([]);
        if (params.id) return Promise.reject(new Error("offline"));
        return Promise.resolve(
          Array.from({ length: 100 }, (_, i) => ({ id: String(i).padStart(4, "0") }))
        );
      },
      "student-a",
      true
    );
    expect(result.rows.saved).toEqual([]);
    expect(result.unavailableSections).toContain("saved");
  });
});
