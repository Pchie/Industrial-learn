import { expect, test, type Page } from "@playwright/test";

test.describe("staging smoke checks", () => {
  test("homepage, curriculum, and published lesson routes render", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Industrial Learn" })).toBeVisible();

    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Core Engineering/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Future Engineering/ })).toBeVisible();

    await page.goto("/lessons/basic-fluid-pressure");
    await expect(
      page.getByRole("heading", { name: "Basic Fluid Pressure" })
    ).toBeVisible();
    await expect(page.getByText("Source required").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Source records" })).toBeVisible();
  });

  test("protected dashboard requires authentication and protects student ownership", async ({
    page
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/sign-in/);

    await signIn(page, "active.student@example.test");
    await page.goto("/dashboard?studentId=profile-local-student-b-example-test");

    await expect(
      page.getByRole("heading", { name: "Active Industrial Student", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Second Industrial Student", level: 1 })
    ).not.toBeVisible();
  });

  test("assessment and simulation attempt areas are authenticated", async ({ page }) => {
    await signIn(page, "active.student@example.test");

    await page.goto("/assessments");
    await expect(page.getByRole("heading", { name: "Assessments" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View assessment" }).first()
    ).toBeVisible();

    await page.goto("/simulations");
    await expect(page.getByRole("heading", { name: "Simulations" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View simulation" })).toBeVisible();
    await page.getByRole("link", { name: "View simulation" }).click();
    await expect(page.getByText("Source required", { exact: true })).toBeVisible();
  });

  test("reviewer can access review workspace and student cannot access draft tools", async ({
    page
  }) => {
    await signIn(page, "reviewer@example.test", /\/auth\/error|\/dashboard/);
    await page.goto("/review");
    await expect(page.getByRole("heading", { name: "Engineering review" })).toBeVisible();

    await page.goto("/auth/sign-out");
    await signIn(page, "student@example.test");
    await page.goto("/author");
    await expect(page).toHaveURL(/\/auth\/error/);
    await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  });

  test("student can sign out", async ({ page }) => {
    await signIn(page, "student@example.test");

    await page.goto("/auth/sign-out");
    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});

async function signIn(page: Page, email: string, expectedUrl: RegExp = /\/dashboard/) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(expectedUrl);
}
