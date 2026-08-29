import { expect, test, type Page } from "@playwright/test";

test("a student cannot start a review-required simulation by direct URL", async ({
  page
}) => {
  await signIn(page, "simulation.student@example.test");

  await page.goto("/simulations/hydraulic-cylinder-force");
  await expect(
    page.getByRole("heading", {
      name: "This part of Industrial Learn is not available yet"
    })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Start simulation" })).toHaveCount(0);
  expect(await page.content()).not.toContain("SIM-HYD-CYL-FORCE-001");
});

test("a guessed attempt URL cannot bypass simulation publication", async ({ page }) => {
  await signIn(page, "simulation.private@example.test");

  await page.goto("/simulations/hydraulic-cylinder-force/attempt/attempt-local-guessed");
  await expect(
    page.getByRole("heading", {
      name: "This part of Industrial Learn is not available yet"
    })
  ).toBeVisible();
  await expect(
    page.getByLabel("Hydraulic Cylinder Force simulation attempt")
  ).toHaveCount(0);
});

test("student history filters attempts for simulations that are no longer public", async ({
  page
}) => {
  await signIn(page, "active.student@example.test");
  await page.goto("/simulations/history");

  await expect(page.getByRole("heading", { name: "Simulation history" })).toBeVisible();
  await expect(page.getByText("Hydraulic Cylinder Force", { exact: true })).toHaveCount(
    0
  );
});

test("reviewer-only visual tooling rejects a student and accepts a reviewer", async ({
  page
}) => {
  await signIn(page, "student@example.test");
  await page.goto("/internal/visual-simulation-lab");
  await expect(page).toHaveURL(/\/auth\/error/);

  await page.goto("/auth/sign-out");
  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, "reviewer@example.test", /\/dashboard|\/auth\/error/);
  await page.goto("/internal/visual-simulation-lab");
  await expect(
    page.getByRole("heading", { name: "Visual simulation lab", level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Not reviewed engineering content")).toBeVisible();
});

async function signIn(page: Page, email: string, expectedUrl: RegExp = /\/dashboard/) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(expectedUrl);
}
