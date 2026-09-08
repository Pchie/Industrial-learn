import { expect, test, type Page } from "@playwright/test";

async function openDashboard(page: Page) {
  await page.goto("/auth/sign-in?next=%2Fdashboard");
  await page.getByLabel("Email address").fill("active.student@example.test");
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("compact dashboard search submits to the governed learning catalogue", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openDashboard(page);
  const search = page.getByRole("searchbox", { name: "Search published lessons" });
  await expect(search).toBeVisible();
  expect((await page.locator(".site-header").boundingBox())!.height).toBeLessThan(100);
  await search.fill("pressure");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/learn\?q=pressure$/);
  await expect(
    page.getByRole("heading", { name: "Basic Fluid Pressure", exact: true })
  ).toBeVisible();
  await expect(page.locator("[data-student-workspace]")).toHaveCount(0);
  await expect(page.locator(".site-nav--dashboard")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "My Learning", exact: true })
  ).toBeVisible();
});

test("hero illustration loads without advertising unapproved equipment lessons", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openDashboard(page);
  const feature = page.getByRole("region", { name: "Continue learning", exact: true });
  const art = feature.getByRole("img", {
    name: "Concept illustration of a press contact assembly"
  });
  await expect(art).toBeVisible();
  await expect
    .poll(() =>
      art.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
    )
    .toBe(true);
  expect((await art.boundingBox())!.width).toBeGreaterThan(300);
  expect(await art.evaluate((image: HTMLImageElement) => image.currentSrc)).toContain(
    "pressure-scene-v2"
  );
  await expect(feature).toContainText("not a construction drawing or saved state");
  await expect(
    page.getByRole("link", {
      name: /Centrifugal Pump|Hydraulic Cylinder|AI Mentor|Achievement/
    })
  ).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Recorded progress" })).toContainText(
    "Completed in your loaded records"
  );
  await expect(page.getByRole("region", { name: "Current programme" })).toContainText(
    "Year 1, Semester 1"
  );
  await expect(page.locator("canvas")).toHaveCount(0);
  for (const width of [901, 1024, 1200, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    ).toBeLessThanOrEqual(1);
    const bounds = await feature.boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    const snapshot = await page
      .getByRole("complementary", { name: "Study snapshot" })
      .boundingBox();
    if (snapshot!.x > bounds!.x) {
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(snapshot!.x);
    } else {
      expect(snapshot!.y).toBeGreaterThanOrEqual(bounds!.y + bounds!.height);
    }
  }
});

test("mobile study and account navigation work with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await openDashboard(page);
  const compactArt = page.locator("#continue-learning").getByRole("img", {
    name: "Concept illustration of a press contact assembly"
  });
  await expect
    .poll(() =>
      compactArt.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0
      )
    )
    .toBe(true);
  expect(
    await compactArt.evaluate((image: HTMLImageElement) => image.currentSrc)
  ).toContain("pressure-scene-v2.webp");
  expect(
    await page.evaluate(
      () =>
        performance
          .getEntriesByType("resource")
          .filter((entry) => entry.name.includes("pressure-press-feature")).length
    )
  ).toBe(0);
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.focus();
  await page.keyboard.press("Enter");
  const study = page.getByRole("navigation", { name: "Mobile navigation", exact: true });
  const progress = study.getByRole("link", { name: "Progress", exact: true });
  await progress.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/dashboard#results$/);
  await expect(
    page.getByRole("heading", { name: "Results and progress" })
  ).toBeInViewport();
  const account = page.locator(".workspace-menu summary");
  await account.focus();
  await page.keyboard.press("Enter");
  const access = page.getByRole("link", { name: "Account access", exact: true });
  await expect(access).toBeVisible();
  await access.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/account\/access$/);
});

test("dashboard retains usable controls at enlarged text size", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openDashboard(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
  const action = page
    .getByRole("region", { name: "Continue learning", exact: true })
    .getByRole("link", { name: "Return to lesson", exact: true });
  await action.focus();
  await expect(action).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/lessons\/basic-fluid-pressure$/);
});
