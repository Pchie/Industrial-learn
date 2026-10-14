import type { DashboardExperience } from "./experience";
import { dashboardDate } from "./experience";
import type { frontendAssets } from "../app-shell/assets";

export type OverviewAsset = keyof typeof frontendAssets;
export type OverviewCard = {
  title: string;
  kind: string;
  detail: string;
  asset: OverviewAsset;
  href: string;
  progress?: number;
  status?: string;
};
export type DashboardOverviewModel = {
  demo: boolean;
  name: string;
  returning: boolean;
  warning: boolean;
  lessonProgressUnavailable: boolean;
  previousUnavailable: boolean;
  hero: (OverviewCard & { description: string; action: string; resumed: boolean }) | null;
  cards: OverviewCard[];
  recommendation: (OverviewCard & { description: string; duration: string }) | null;
  metric: { title: string; value: string; unit: string; note: string; points: number[] };
  progress: {
    title: string;
    completed: number;
    inProgress: number;
    notStarted: number;
    percent: number | null;
  };
  awards: { label: string; awarded: boolean }[];
  activity: {
    title: string;
    description: string;
    date: string;
    kind: "lesson" | "simulation" | "assessment" | "award";
  }[];
};

export function visibleProgress(states: string[], unavailable: boolean) {
  const completed = states.filter((state) => state === "Completed").length;
  const inProgress = states.filter((state) => state === "In progress").length;
  const notStarted = states.filter((state) => state === "Available").length;
  return {
    completed,
    inProgress,
    notStarted,
    percent:
      unavailable ||
      states.length === 0 ||
      completed + inProgress + notStarted !== states.length
        ? null
        : Math.round((completed / states.length) * 100)
  };
}

export function buildDashboardOverview(
  model: DashboardExperience
): DashboardOverviewModel {
  const next = model.next;
  const cards: OverviewCard[] = model.learning.slice(0, 4).map((lesson) => ({
    title: lesson.title,
    kind: "Lesson",
    detail: `${lesson.difficulty} · ${lesson.estimatedCompletionTime}`,
    asset: lesson.slug === "basic-fluid-pressure" ? "pressureWater" : "pressureDetail",
    href: `/lessons/${lesson.slug}`,
    status: lesson.state,
    ...(lesson.state === "Completed" ? { progress: 100 } : {})
  }));
  // These are entry points into one published lesson, not new curriculum records.
  if (cards.length === 1 && next?.slug === "basic-fluid-pressure") {
    cards.push(
      {
        title: "Explore pressure",
        kind: "Activity",
        detail: "Force and contact area",
        asset: "pressureDetail",
        href: "/lessons/basic-fluid-pressure",
        status: "In your lesson"
      },
      {
        title: "Pressure challenge",
        kind: "Challenge",
        detail: "Apply the reviewed model",
        asset: "pressureScene",
        href: "/lessons/basic-fluid-pressure#pressure-challenge-title",
        status: "In your lesson"
      },
      {
        title: "Explain & calculate",
        kind: "Practice",
        detail: "Units and worked calculations",
        asset: "pressureCompact",
        href: "/lessons/basic-fluid-pressure#pressure-explain-title",
        status: "In your lesson"
      }
    );
  }
  const nextState = model.learning.find((lesson) => lesson.slug === next?.slug)?.state;
  const progress = visibleProgress(
    model.learning.map((lesson) => lesson.state),
    model.unavailable.includes("lessons") || model.completedLessonCount === undefined
  );
  return {
    demo: false,
    name: model.displayName,
    returning: model.hasRecords,
    warning: model.warnings.length > 0 || model.unavailable.length > 0,
    lessonProgressUnavailable: model.unavailable.includes("lessons"),
    previousUnavailable: model.previousUnavailable,
    hero: next
      ? {
          title: next.title,
          kind: "Continue learning",
          detail: next.estimatedCompletionTime,
          asset: "pressureScene",
          href: `/lessons/${next.slug}`,
          description: next.description,
          action: model.nextAction,
          resumed: Boolean(model.lastActivityAt),
          ...(nextState === "Completed" ? { progress: 100 } : {}),
          ...(nextState ? { status: nextState } : {})
        }
      : null,
    cards,
    recommendation: next
      ? {
          title: next.title,
          kind: "Introductory",
          detail: next.estimatedCompletionTime,
          asset: "pressureWater",
          href: `/lessons/${next.slug}`,
          description: "Continue with the available lesson and its visual activities.",
          duration: next.estimatedCompletionTime
        }
      : null,
    metric: {
      title: "Learning Streak",
      value: model.studyActivity ? String(model.studyActivity.streak) : "--",
      unit: model.studyActivity?.streak === 1 ? "day" : "days",
      note: model.studyActivity
        ? model.studyActivity.streak > 0
          ? "Keep your momentum going."
          : "A little learning goes a long way."
        : "Activity data is incomplete",
      points: model.studyActivity?.points ?? []
    },
    progress: { title: "Visible lesson progress", ...progress },
    awards: ["Introduced", "Understood", "Calculated"].map((label) => ({
      label,
      awarded: (model.awards[label as keyof typeof model.awards] ?? 0) > 0
    })),
    activity: [
      ...model.lessonActivity.map((record) => ({
        title: record.title,
        description: record.summary,
        date: record.occurredAt,
        kind: "lesson" as const
      })),
      ...model.results.map((record) => ({
        title: record.title,
        description:
          record.score === undefined || record.maxScore === undefined
            ? "Assessment result available"
            : `Assessment result: ${record.score} / ${record.maxScore}`,
        date: record.submittedAt,
        kind: "assessment" as const
      })),
      ...model.simulationActivity.map((record) => ({
        title: record.title,
        description: record.resultSummary,
        date: record.lastRunAt,
        kind: "simulation" as const
      }))
    ]
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, 4)
      .map((record) => ({ ...record, date: dashboardDate(record.date) }))
  };
}
