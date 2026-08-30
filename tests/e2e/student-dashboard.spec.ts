import { expect, test, type Page } from "@playwright/test";

test("denies dashboard access without an authenticated student", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("shows honest empty states for a new authenticated student", async ({ page }) => {
  await signIn(page, "student@example.test");

  await expect(
    page.getByRole("heading", { name: "Industrial Student", level: 1 })
  ).toBeVisible();
  await expect(page.getByText("No current enrolment")).toBeVisible();
  await expect(page.getByText("No enrolment or learning evidence")).toBeVisible();
  await expect(page.getByText("No in-progress lesson yet")).toBeVisible();
  await expect(
    page.getByText("No module completion evidence has been recorded yet")
  ).toBeVisible();
  await expect(
    page.getByText("Portfolio progress starts when a project requires evidence")
  ).toBeVisible();
});

test("shows active private records without linking to unpublished lessons or simulations", async ({
  page
}) => {
  await signIn(page, "active.student@example.test");

  await expect(
    page.getByRole("heading", { name: "Active Industrial Student", level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Mechanical Engineering Foundations")).toBeVisible();
  await expect(page.getByText("Year 1, Semester 1")).toBeVisible();
  await expect(page.getByText("Fluid Mechanics Foundations")).toHaveCount(0);
  await expect(
    page
      .getByLabel("Recent assessment results")
      .getByRole("heading", { name: "Fluid pressure knowledge check" })
  ).toBeVisible();
  await expect(page.getByLabel("Simulation activity")).toContainText(
    "Simulation runs will appear after a student submits activity evidence."
  );
  await expect(page.getByText("Hydraulic cylinder force simulation")).toHaveCount(0);
  await expect(
    page
      .getByLabel("Active projects")
      .getByRole("heading", { name: "Fluid pressure observation project" })
  ).toBeVisible();
  await expect(page.getByText("Pressure from force and area")).toHaveCount(0);
  await expect(page.getByText("SI unit handling")).toHaveCount(0);
});

test("dashboard URL query parameter cannot impersonate another student", async ({
  page
}) => {
  await signIn(page, "active.student@example.test");
  await page.goto("/dashboard?studentId=profile-local-student-b-example-test");

  await expect(
    page.getByRole("heading", { name: "Active Industrial Student", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Second Industrial Student", level: 1 })
  ).not.toBeVisible();
});

test("lecturer and reviewer student workspaces remain scoped to their own records", async ({
  page
}) => {
  await signIn(page, "lecturer@example.test");

  await expect(
    page.getByRole("heading", { name: "Industrial Lecturer", level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Active Industrial Student")).toHaveCount(0);

  await page.goto("/auth/sign-out");
  await signIn(page, "reviewer@example.test");

  await expect(
    page.getByRole("heading", { name: "Engineering Reviewer", level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Active Industrial Student")).toHaveCount(0);
});

test("shows no recent activity without leaking another student's data", async ({
  page
}) => {
  await signIn(page, "quiet.student@example.test");

  await expect(
    page.getByRole("heading", { name: "Quiet Industrial Student", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByText("No recent learning activity has been recorded")
  ).toBeVisible();
  await expect(page.getByText("Active Industrial Student")).not.toBeVisible();
});

test("recommendations targeting unpublished modules are excluded", async ({ page }) => {
  await signIn(page, "recommendation.student@example.test");

  await expect(
    page.getByText("No weak-topic recommendations are available yet")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Dismiss" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open recommended activity" })).toHaveCount(
    0
  );
});

test("database failure shows a safe dashboard error", async ({ page }) => {
  await signIn(page, "database.failure@example.test");

  await expect(
    page.getByRole("heading", { name: "Dashboard unavailable" })
  ).toBeVisible();
  await expect(page.getByText("public.")).not.toBeVisible();
});

test("private dashboard responses are not publicly cached", async ({ page }) => {
  await signIn(page, "active.student@example.test");
  const response = await page.goto("/dashboard");

  expect(response?.headers()["cache-control"] ?? "").not.toContain("public");
});

test("allows optional recommendations to be hidden for the current view", async ({
  page
}) => {
  await signIn(page, "active.student@example.test");
  await page.goto("/dashboard?hideRecommendations=1");

  await expect(
    page.getByText("Optional recommendations are hidden for this view.")
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Show recommendations" })).toBeVisible();
});

async function signIn(page: Page, email: string, expectedUrl: RegExp = /\/dashboard/) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(expectedUrl);
}
