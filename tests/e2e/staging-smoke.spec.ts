import { expect, test, type Page } from "@playwright/test";

test.describe("staging smoke checks", () => {
  test("homepage and curriculum render while only the approved lesson is public", async ({
    page
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Industrial Learn" })).toBeVisible();

    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Core Engineering/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Future Engineering/i })).toBeVisible();

    await page.goto("/lessons/basic-fluid-pressure");
    await expect(
      page.getByRole("heading", { name: "Basic Fluid Pressure", level: 1 })
    ).toBeVisible();

    await page.goto("/lessons/hydraulic-cylinder-force");
    await expect(
      page.getByRole("heading", {
        name: "This part of Industrial Learn is not available yet"
      })
    ).toBeVisible();
    await expect(page.getByText("Hydraulic Cylinder Force", { exact: true })).toHaveCount(
      0
    );
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
    await expect(page.getByRole("heading", { name: "Simulation Lab" })).toBeVisible();
    await expect(
      page.getByText("Reviewed simulations are being prepared.")
    ).toBeVisible();
    await expect(
      page.locator('a[href="/simulations/hydraulic-cylinder-force"]')
    ).toHaveCount(0);
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
