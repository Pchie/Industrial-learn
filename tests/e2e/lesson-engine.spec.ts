import { expect, test } from "@playwright/test";

const hiddenLessons = [
  {
    slug: "pump-system-units-and-measurements",
    title: "Pump-System Units And Measurements",
    sourceId: "SRC-NIST-SP330-2019"
  },
  {
    slug: "hydraulic-cylinder-force",
    title: "Hydraulic Cylinder Force",
    sourceId: "SRC-PARKER-140H8-CYLINDER-2024"
  },
  {
    slug: "bernoulli-flow-lab",
    title: "Bernoulli Flow Lab",
    sourceId: "SRC-NASA-GLENN-BERNOULLI"
  },
  {
    slug: "systems-surroundings-boundaries",
    title: "Thermodynamic Systems, Surroundings And Boundaries",
    sourceId: "SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021"
  }
];

test("delivers the exact approved Basic Fluid Pressure lesson without private review data", async ({
  page
}) => {
  await page.goto("/lessons/basic-fluid-pressure");

  await expect(
    page.getByRole("heading", { name: "Basic Fluid Pressure", level: 1 })
  ).toBeVisible();
  await expect(page.getByLabel("Normal force slider")).toBeVisible();
  await expect(
    page.getByRole("region", {
      name: "Live equation: Pressure from normal force and area"
    })
  ).toBeVisible();
  await expect(page.getByText("Approved for student use", { exact: true })).toBeVisible();
  await page.locator("details.lesson-section--sources > summary").click();
  await expect(page.getByText("College Physics", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Introduction to Pressure in Fluid Mechanics", { exact: true })
  ).toBeVisible();
  await expect(page.getByText(/private reviewer/i)).toHaveCount(0);
  await expect(page.getByText(/approvalRecordIds/i)).toHaveCount(0);
});

for (const lesson of hiddenLessons) {
  test(`denies direct public access to ${lesson.slug} without leaking metadata`, async ({
    page
  }) => {
    await page.goto(`/lessons/${lesson.slug}`);

    await expect(
      page.getByRole("heading", {
        name: "This part of Industrial Learn is not available yet"
      })
    ).toBeVisible();
    await expect(page.getByText(lesson.title, { exact: true })).toHaveCount(0);
    await expect(page.getByText(lesson.sourceId, { exact: true })).toHaveCount(0);
    await expect(page.getByText("Engineering review required")).toHaveCount(0);
  });
}
