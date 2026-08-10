import { expect, test, type Page } from "@playwright/test";

test.describe("authenticated simulation browser journey", () => {
  test.describe.configure({ mode: "serial" });

  test("student completes learn, guided, explore, fault, and assessment modes", async ({
    page
  }) => {
    await signIn(page, "simulation.student@example.test");

    await completeMode(page, "Learn", async () => {
      await expect(page.getByText("Equation ID:")).toBeVisible();
    });
    await completeMode(page, "Guided", async () => {
      await page.getByLabel("Cylinder pressure (Pa)").fill("2000000");
      await expect(page.getByText("20,000 N")).toBeVisible();
    });
    await completeMode(page, "Explore", async () => {
      await page.getByLabel("Piston area (m^2)").fill("0.02");
      await expect(page.getByText("20,000 N")).toBeVisible();
    });
    await completeMode(page, "Fault Diagnosis", async () => {
      await page.getByLabel("Fault selection").selectOption("pressure-loss");
      await page.getByRole("button", { name: "Introduce fault" }).click();
      await expect(page.getByText("Pressure loss fault active")).toBeVisible();
    });
    await completeMode(page, "Assessment", async () => {
      await page.getByLabel("Submitted cylinder force answer (N)").fill("10000");
    });

    await page.goto("/simulations/history");
    await expect(page.getByRole("heading", { name: "Simulation history" })).toBeVisible();
    await expect(page.getByText("Assessment")).toBeVisible();

    await page.goto("/dashboard");
    await expect(
      page
        .getByLabel("Simulation activity")
        .getByRole("heading", { name: "Hydraulic Cylinder Force" })
        .first()
    ).toBeVisible();
  });

  test("reset and pause are keyboard-operable and reset does not complete", async ({
    page
  }) => {
    await signIn(page, "simulation.keyboard@example.test");
    await page.goto("/simulations/hydraulic-cylinder-force");
    await page.getByRole("button", { name: "Guided" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/attempt\//);

    await page.getByLabel("Cylinder pressure (Pa)").fill("2000000");
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByText("paused", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByLabel("Cylinder pressure (Pa)")).toHaveValue("1000000");
    await expect(page).not.toHaveURL(/\/review$/);
  });

  test("completed attempts cannot be changed or completed twice", async ({ page }) => {
    await signIn(page, "simulation.duplicate@example.test");
    const attemptUrl = await completeMode(page, "Guided");

    await page.goto(attemptUrl);
    await expect(
      page.getByRole("heading", { name: "This attempt has already been completed" })
    ).toBeVisible();
  });

  test("another student cannot review private simulation attempt", async ({ page }) => {
    await signIn(page, "simulation.private@example.test");
    const reviewUrl = `${await completeMode(page, "Fault Diagnosis", async () => {
      await page.getByRole("button", { name: "Introduce fault" }).click();
    })}/review`;

    await page.goto("/auth/sign-out");
    await page.getByRole("button", { name: "Sign out" }).click();
    await signIn(page, "student.b@example.test");
    await page.goto(reviewUrl);

    await expect(
      page.getByRole("heading", {
        name: "This part of Industrial Learn is not available yet"
      })
    ).toBeVisible();
  });

  test("mobile and reduced-motion users can operate the simulation", async ({
    browser
  }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce"
    });
    const page = await context.newPage();
    await signIn(page, "simulation.mobile@example.test");
    await page.goto("/simulations/hydraulic-cylinder-force");
    await page.getByRole("button", { name: "Explore" }).click();
    await expect(page.getByLabel("Hydraulic simulation attempt")).toBeVisible();
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: "Complete attempt" }).click();
    await expect(page).toHaveURL(/\/review$/, { timeout: 15_000 });
    await context.close();
  });
});

async function completeMode(page: Page, modeName: string, operate?: () => Promise<void>) {
  await page.goto("/simulations/hydraulic-cylinder-force");
  await expect(
    page.getByRole("heading", { name: "Hydraulic Cylinder Force" })
  ).toBeVisible();
  await page.getByRole("button", { name: modeName }).click();
  await expect(page).toHaveURL(/\/simulations\/hydraulic-cylinder-force\/attempt\//);
  const attemptUrl = page.url();
  await page.getByRole("button", { name: "Start" }).click();
  if (operate) {
    await operate();
  }
  await page.getByRole("button", { name: "Complete attempt" }).click();
  await expect(page).toHaveURL(/\/review$/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "Completed simulation attempt" })
  ).toBeVisible();
  return attemptUrl;
}

async function signIn(page: Page, email: string) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
