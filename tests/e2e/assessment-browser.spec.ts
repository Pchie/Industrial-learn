import { expect, test, type Page } from "@playwright/test";

test.describe("authenticated assessment browser journey", () => {
  test.describe.configure({ mode: "serial" });

  test("student starts, saves, submits, reviews, and sees dashboard result", async ({
    page
  }) => {
    await signIn(page, "assessment.student@example.test");

    await page.goto("/assessments");
    await expect(page.getByRole("heading", { name: "Assessments" })).toBeVisible();
    await page.getByRole("link", { name: "View assessment" }).click();
    await page.getByRole("button", { name: "Start assessment" }).click();

    await expect(
      page.getByRole("heading", { name: "Basic Fluid Pressure Competency Check" })
    ).toBeVisible();
    await expect(page.getByText("The expected result is 10000 N.")).not.toBeVisible();
    await expect(page.getByText("Using p = F / A")).not.toBeVisible();

    await page.getByLabel("Force distributed over an area.").check();
    await page.getByLabel("Value").first().fill("0.4");
    await page.getByLabel("Unit").first().fill("kPa");
    await page.getByRole("button", { name: "Save progress" }).click();
    await expect(page.getByText("Progress saved.")).toBeVisible();

    await page.getByRole("checkbox", { name: "Force", exact: true }).check();
    await page.getByRole("checkbox", { name: "Area", exact: true }).check();
    await page.getByRole("checkbox", { name: "F", exact: true }).check();
    await page.getByRole("checkbox", { name: "A", exact: true }).check();
    await page.getByLabel("Step 1").selectOption("check-units");
    await page.getByLabel("Step 2").selectOption("substitute");
    await page.getByLabel("Step 3").selectOption("interpret");
    await page.getByLabel("Cylinder force").fill("10000");
    await page
      .locator('input[name="answer-Q-FP-SIM-001-measurement-cylinderForce-unit"]')
      .fill("N");
    await page.getByLabel("Seal leak").check();
    await page.getByLabel("Force is below the pressure-area prediction").check();
    await page
      .getByLabel("Response")
      .fill("Do not inspect or operate pressurised equipment from this lesson alone.");
    await page.getByRole("button", { name: "Submit final answers" }).click();

    await expect(page).toHaveURL(/\/review$/);
    await expect(page.getByRole("heading", { name: "Completed attempt" })).toBeVisible();
    await expect(page.getByText("Expected: 400 Pa")).toBeVisible();
    await expect(page.getByText("Your answer: 0.4 kPa")).toBeVisible();

    await page.goto("/dashboard");
    await expect(
      page
        .getByLabel("Recent assessment results")
        .getByRole("heading", { name: "Basic Fluid Pressure Competency Check" })
    ).toBeVisible();
  });

  test("completed attempts cannot be changed or submitted twice", async ({ page }) => {
    await signIn(page, "assessment.student@example.test");
    const attemptUrl = await completeMinimalAttempt(page);

    await page.goto(attemptUrl);
    await expect(
      page.getByRole("heading", { name: "This attempt has already been submitted" })
    ).toBeVisible();
  });

  test("another student cannot review a private completed attempt", async ({ page }) => {
    await signIn(page, "assessment.student@example.test");
    const reviewUrl = `${await completeMinimalAttempt(page)}/review`;
    await page.goto("/auth/sign-out");
    await page.getByRole("button", { name: "Sign out" }).click();

    await signIn(page, "student.b@example.test");
    await page.goto(reviewUrl);

    await expect(page.getByRole("heading", { name: "Review unavailable" })).toBeVisible();
  });
});

async function completeMinimalAttempt(page: Page) {
  await page.goto("/assessments/staging-pressure-check");
  await page.getByRole("button", { name: /Start assessment|Continue attempt/ }).click();
  await expect(page).toHaveURL(/\/assessments\/staging-pressure-check\/attempt\//);
  const attemptUrl = page.url();

  await page.getByLabel("Force distributed over an area.").check();
  await page.getByLabel("Value").first().fill("400");
  await page.getByLabel("Unit").first().fill("Pa");
  await page.getByRole("checkbox", { name: "Force", exact: true }).check();
  await page.getByRole("checkbox", { name: "Area", exact: true }).check();
  await page.getByRole("checkbox", { name: "F", exact: true }).check();
  await page.getByRole("checkbox", { name: "A", exact: true }).check();
  await page.getByLabel("Step 1").selectOption("check-units");
  await page.getByLabel("Step 2").selectOption("substitute");
  await page.getByLabel("Step 3").selectOption("interpret");
  await page.getByLabel("Cylinder force").fill("10000");
  await page
    .locator('input[name="answer-Q-FP-SIM-001-measurement-cylinderForce-unit"]')
    .fill("N");
  await page.getByLabel("Seal leak").check();
  await page.getByLabel("Force is below the pressure-area prediction").check();
  await page
    .getByLabel("Response")
    .fill("Do not use the lesson alone as approval to work on equipment.");
  await page.getByRole("button", { name: "Submit final answers" }).click();
  await expect(page).toHaveURL(/\/review$/);

  return attemptUrl;
}

async function signIn(page: Page, email: string) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
