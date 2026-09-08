import { expect, test } from "@playwright/test";

test("renders the governed Industrial Learn learning workspace", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Industrial Learn", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" })
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Start learning" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Student lessons" })).toBeVisible();
  await expect(page.getByText("Application foundation", { exact: true })).toHaveCount(0);
});
