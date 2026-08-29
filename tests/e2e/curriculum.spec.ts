import { expect, test } from "@playwright/test";

test("browses the main curriculum catalogue", async ({ page }) => {
  await page.goto("/learn");

  await expect(
    page.getByRole("heading", { name: "Browse Industrial Learn" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse CORE ENGINEERING" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Browse FUTURE ENGINEERING" })
  ).toBeVisible();
  await expect(page.getByText("Progress appears after sign in")).toBeVisible();
});

test("keeps unpublished modules out of programme-year listings", async ({ page }) => {
  await page.goto("/programmes/mechanical-foundations/year/1");

  await expect(page.getByRole("heading", { name: "Academic Year 1" })).toBeVisible();
  await expect(
    page.getByText("No modules are available for this semester yet.")
  ).toHaveCount(2);
  await expect(page.getByText("Strength of Materials Foundations")).toHaveCount(0);
  await expect(page.getByText("Fluid Mechanics Foundations")).toHaveCount(0);
});

test("denies a guessed unpublished module URL", async ({ page }) => {
  await page.goto("/modules/robotics-foundations");

  await expect(
    page.getByRole("heading", {
      name: "This part of Industrial Learn is not available yet"
    })
  ).toBeVisible();
  await expect(page.getByText("Robotics Foundations", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Control Systems Foundations")).toHaveCount(0);
});

test("denies a guessed unpublished pathway URL", async ({ page }) => {
  await page.goto("/pathways/industrial-monitoring");

  await expect(
    page.getByRole("heading", {
      name: "This part of Industrial Learn is not available yet"
    })
  ).toBeVisible();
  await expect(page.getByText("Industrial Monitoring", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Smart Pump Monitoring", { exact: true })).toHaveCount(0);
});
