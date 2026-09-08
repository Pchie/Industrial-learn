import "server-only";
import type { DashboardOverviewModel } from "./overview-model";

// Fictional presentation data. Only the guarded, non-production reference route imports this.
export const referenceDashboardDemo: DashboardOverviewModel = {
  demo: true,
  name: "Tebogo",
  returning: true,
  warning: false,
  lessonProgressUnavailable: false,
  previousUnavailable: false,
  hero: {
    title: "Centrifugal Pump Fundamentals",
    kind: "Continue learning",
    detail: "Demo lesson",
    description:
      "Explore how centrifugal pumps work, learn about head, flow rate, and efficiency through interactive simulation.",
    asset: "pumpHero",
    href: "#reference-demo-notice",
    progress: 72,
    action: "Continue Lesson",
    resumed: false
  },
  cards: [
    {
      title: "Basic Fluid Pressure",
      kind: "Lesson",
      detail: "Lesson 3 of 5",
      asset: "pressureWater",
      href: "#reference-demo-notice",
      progress: 60
    },
    {
      title: "Hydraulic Cylinder",
      kind: "Simulation",
      detail: "Exploring Force & Motion",
      asset: "cylinder",
      href: "#reference-demo-notice",
      progress: 45
    },
    {
      title: "Bernoulli's Principle",
      kind: "Lesson",
      detail: "Lesson 4 of 6",
      asset: "venturi",
      href: "#reference-demo-notice",
      progress: 80
    },
    {
      title: "Heat Exchanger",
      kind: "Simulation",
      detail: "Thermal Systems",
      asset: "thermal",
      href: "#reference-demo-notice",
      progress: 30
    }
  ],
  recommendation: {
    title: "Pipe Flow & Losses",
    kind: "Intermediate",
    detail: "Demo recommendation",
    description: "Learn about friction losses, minor losses, and pipe system analysis.",
    asset: "pipeSystem",
    href: "#reference-demo-notice",
    duration: "45 min"
  },
  metric: {
    title: "Learning Streak",
    value: "12",
    unit: "days",
    note: "Keep it up!",
    points: [12, 14, 25, 13, 45, 46]
  },
  progress: {
    title: "Overall Progress",
    completed: 24,
    inProgress: 12,
    notStarted: 8,
    percent: 68
  },
  awards: ["Pressure Pro", "System Explorer", "Problem Solver"].map((label) => ({
    label,
    awarded: true
  })),
  activity: [
    {
      title: "Bernoulli Equation Quiz",
      description: "Completed assessment",
      date: "2h ago",
      kind: "assessment"
    },
    {
      title: "Hydraulic Cylinder",
      description: "Explored simulation",
      date: "5h ago",
      kind: "simulation"
    },
    {
      title: "Fluid Pressure Basics",
      description: "Completed lesson",
      date: "1 day ago",
      kind: "lesson"
    },
    {
      title: "Pressure Pro",
      description: "Earned achievement",
      date: "2 days ago",
      kind: "award"
    }
  ]
};
