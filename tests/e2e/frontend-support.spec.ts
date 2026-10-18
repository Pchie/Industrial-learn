import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("study support works on mobile with keyboard, search and accessible dialog", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const trigger = page
    .locator(".app-topbar")
    .getByRole("button", { name: "Open study support" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Study support", exact: true });
  await expect(dialog).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze())
      .violations
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await dialog.getByLabel("What would you like to understand?").fill("pressure");
  await dialog.getByRole("button", { name: "Find learning resources" }).click();
  await expect(page).toHaveURL(/\/learn\?q=pressure/);
  await expect(
    page.getByRole("heading", { name: "Basic Fluid Pressure", exact: true })
  ).toBeVisible();
});

test("dashboard refresh reads authenticated activity and reports completion", async ({
  page
}) => {
  await page.goto("/auth/sign-in?next=%2Fdashboard");
  await page.getByLabel("Email address").fill("student@example.test");
  await page.getByLabel("Password", { exact: true }).fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button", { name: "Refresh activity", exact: true }).click();
  await expect(page.locator(".dashboard-sync")).toContainText(
    "Showing the latest available activity."
  );
  await expect(page.getByRole("region", { name: "Learning Streak" })).toContainText("0");
});
