import { expect, test, type Page } from "@playwright/test";

async function openDashboard(page: Page) {
  await page.goto("/auth/sign-in?next=%2Fdashboard");
  await page.getByLabel("Email address").fill("active.student@example.test");
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByLabel("Appearance").selectOption("light");
}

test("reference-led foundation keeps a blue visual anchor and stable interaction states", async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "light" });
  await openDashboard(page);
  const feature = page.getByRole("region", { name: "Continue learning", exact: true });
  await expect(feature).toHaveCSS("background-color", "rgb(14, 67, 186)");
  await expect(feature.getByRole("img")).toHaveAccessibleName(/press contact assembly/);
  await expect(feature).toContainText(
    "Concept illustration, not a construction drawing or saved state."
  );
  const action = feature.getByRole("link", { name: "Return to lesson", exact: true });
  await expect(action).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const size = await action.boundingBox();
  await action.hover();
  await expect(action).toHaveCSS("background-color", "rgb(232, 240, 255)");
  const hoverSize = await action.boundingBox();
  expect(hoverSize!.width).toBeCloseTo(size!.width, 1);
  expect(hoverSize!.height).toBeCloseTo(size!.height, 1);
  const activeNavigation = page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Dashboard", exact: true });
  expect(
    await activeNavigation.evaluate((el) => getComputedStyle(el, "::before").width)
  ).toBe("3px");
  await expect(activeNavigation).toHaveCSS("background-color", "rgb(232, 240, 255)");
  await action.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS("outline-style", "solid");
  await expect(action).toHaveCSS("outline-width", "3px");
  await expect(action).toHaveCSS("outline-color", "rgb(255, 255, 255)");
  await expect(
    page.getByText(
      /Learning Streak|72% Complete|Centrifugal Pump Fundamentals|Chat with AI Mentor/
    )
  ).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("foundation-light.png"),
    fullPage: true
  });
  await page.getByLabel("Appearance").selectOption("dark");
  await expect(feature).toHaveCSS("background-color", "rgb(14, 67, 186)");
  await page.screenshot({
    path: testInfo.outputPath("foundation-dark.png"),
    fullPage: true
  });
});

test("reduced motion removes entrance, hover travel and tab animation without hiding content", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openDashboard(page);
  const feature = page.getByRole("region", { name: "Continue learning", exact: true });
  await expect(feature).toHaveCSS("animation-name", "none");
  await expect(feature).toHaveCSS("opacity", "1");
  const action = feature.getByRole("link", { name: "Return to lesson", exact: true });
  await action.hover();
  await expect(action.locator("svg").last()).toHaveCSS("transform", "none");
  const lesson = page
    .getByRole("region", { name: "My learning", exact: true })
    .locator("ol > li")
    .first();
  await lesson.hover();
  await expect(lesson).toHaveCSS("transform", "none");
  await page.goto("/internal/design-system");
  const tab = page.getByRole("tab").first();
  const seconds = await tab.evaluate((element) =>
    parseFloat(getComputedStyle(element).transitionDuration)
  );
  expect(seconds).toBeLessThanOrEqual(0.00001);
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab").nth(1)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
});
