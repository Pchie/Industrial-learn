export const PRODUCT_NAME = "Industrial Learn";

export const SCHOOLS = [
  {
    id: "core-engineering",
    title: "Core Engineering",
    description:
      "Foundational theory, disciplined calculations, diagnosis, assessments, and projects."
  },
  {
    id: "future-engineering",
    title: "Future Engineering",
    description:
      "Emerging technologies connected back to core engineering fundamentals and review."
  }
] as const;

export type SchoolId = (typeof SCHOOLS)[number]["id"];
