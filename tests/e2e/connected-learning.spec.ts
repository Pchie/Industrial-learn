import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function register(page: Page) {
  const email = `library-${Date.now()}@example.test`;
  await page.goto("/auth/sign-up");
  await page.getByLabel("Display name").fill("Connected Student");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator(".shell-profile")).toBeVisible();
  return email;
}

test("lesson saves persist across the library, dashboard and sign-in without awarding progress", async ({
  page
}) => {
  const email = await register(page);
  const nav = page.getByRole("navigation", { name: "Primary navigation", exact: true });
  await nav.getByRole("link", { name: "My Learning", exact: true }).click();
  await expect(page).toHaveURL(/\/my-learning$/);
  await page.getByRole("link", { name: "Open lesson", exact: true }).click();
  await expect(
    nav.getByRole("link", { name: "My Learning", exact: true })
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Save lesson", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saved lesson", exact: true })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("status").filter({ hasText: "Lesson saved to My Learning." })
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to My Learning", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Filter your learning" })
    .getByRole("link", { name: "Saved 1", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Basic Fluid Pressure", level: 3 })
  ).toBeVisible();
  await page.goto("/dashboard#saved");
  await expect(
    page
      .getByRole("region", { name: "Saved content" })
      .getByRole("link", { name: "Open saved lesson" })
  ).toBeVisible();
  await expect(page.getByText("No recorded lesson completion yet.")).toBeVisible();
  await page.goto("/auth/sign-out");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/status=signed_out/);
  await page.goto("/auth/sign-in?next=%2Fmy-learning");
  await page.getByLabel("Email address").fill("student.b@example.test");
  await page.getByLabel("Password", { exact: true }).fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/my-learning$/);
  await page.goto("/my-learning?view=saved");
  await expect(page.getByRole("heading", { name: "No saved lessons yet" })).toBeVisible();
  await page.goto("/auth/sign-out");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/status=signed_out/);
  await page.goto("/auth/sign-in?next=%2Fmy-learning");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/my-learning$/);
  await page.getByRole("button", { name: "Saved lesson", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save lesson", exact: true })
  ).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Save lesson", exact: true })
  ).toBeVisible();
});

test("library filters and search keep usable URLs on mobile and tablet", async ({
  page
}) => {
  await register(page);
  await page.goto("/my-learning?view=completed&q=pressure");
  await expect(page.getByRole("heading", { name: "No matching lessons" })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Filter your learning" })
    .getByRole("link", { name: "All learning 1", exact: true })
    .click();
  await expect(page).toHaveURL(/view=all&q=pressure/);
  await expect(
    page.getByRole("heading", { name: "Basic Fluid Pressure", level: 3 })
  ).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Search your learning", exact: true })
    .fill("no such lesson");
  await page.getByRole("button", { name: "Search your learning", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No matching lessons" })).toBeVisible();
  await page.goto("/my-learning");
  for (const width of [320, 768, 1536]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByLabel("Appearance").selectOption(width === 768 ? "light" : "dark");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    ).toBeLessThanOrEqual(1);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations
    ).toEqual([]);
  }
});

test("assessment links return to the lesson and personal learning", async ({ page }) => {
  await register(page);
  await page.goto("/assessments/basic-fluid-pressure-check");
  await page.getByRole("link", { name: "Basic Fluid Pressure", exact: true }).click();
  await expect(page).toHaveURL(/\/lessons\/basic-fluid-pressure$/);
  await page.getByRole("link", { name: "Back to My Learning", exact: true }).click();
  await expect(page).toHaveURL(/\/my-learning$/);
});
