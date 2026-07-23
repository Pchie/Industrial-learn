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

test("shows real programme year and module data", async ({ page }) => {
  await page.goto("/programmes/mechanical-foundations/year/1");

  await expect(page.getByRole("heading", { name: "Academic Year 1" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Strength of Materials Foundations" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Fluid Mechanics Foundations" })
  ).toBeVisible();
});

test("shows locked prerequisites on future modules", async ({ page }) => {
  await page.goto("/modules/robotics-foundations");

  await expect(page.getByRole("heading", { name: "Robotics Foundations" })).toBeVisible();
  await expect(page.getByText("Control Systems Foundations")).toBeVisible();
  await expect(page.getByText("Programming For Engineers Foundations")).toBeVisible();
  await expect(page.getByText("Locked lesson", { exact: true })).toBeVisible();
});

test("shows career pathway module sequence", async ({ page }) => {
  await page.goto("/pathways/industrial-monitoring");

  await expect(
    page.getByRole("heading", { name: "Industrial Monitoring" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Core Engineering foundations" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Future Engineering modules" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Smart Pump Monitoring" })
  ).toBeVisible();
});
