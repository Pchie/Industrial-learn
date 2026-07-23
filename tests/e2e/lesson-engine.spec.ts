import { expect, test } from "@playwright/test";

test("renders the structured fluid pressure pilot lesson", async ({ page }) => {
  await page.goto("/lessons/basic-fluid-pressure");

  await expect(
    page.getByRole("heading", { name: "Basic Fluid Pressure", level: 1 })
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Lesson sections" })).toBeVisible();
  await expect(page.getByText("Progress is not saved in signed-out mode")).toBeVisible();
  await expect(page.getByText("Show calculation steps")).toBeVisible();
  await expect(page.getByText("p = F / A")).toBeVisible();
  await expect(
    page.getByText("SRC-FLUID-PRESSURE-PLACEHOLDER-001").first()
  ).toBeVisible();
});
