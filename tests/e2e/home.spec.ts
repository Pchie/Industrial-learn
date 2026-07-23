import { expect, test } from "@playwright/test";

test("renders the temporary Industrial Learn product shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Industrial Learn", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" })
  ).toBeVisible();
  await expect(page.getByText("Next.js App Router")).toBeVisible();
});
