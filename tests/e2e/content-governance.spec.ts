import { expect, test, type Page } from "@playwright/test";

test("student cannot access authoring or review routes", async ({ page }) => {
  await signIn(page, "student@example.test", /\/dashboard/, "/dashboard");

  await page.goto("/author");
  await expect(page).toHaveURL(/\/auth\/error/);

  await page.goto("/review");
  await expect(page).toHaveURL(/\/auth\/error/);
});

test("content author sees the secure draft workspace", async ({ page }) => {
  await signIn(page, "author@example.test", /\/author/, "/author");

  await expect(page.getByRole("heading", { name: "Author workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Draft list" })).toBeVisible();
  await expect(
    page.getByLabel("Draft list").getByRole("heading", { name: "Basic Fluid Pressure" })
  ).toBeVisible();
  await expect(page.getByText("Structured draft editor")).toBeVisible();
  await expect(page.getByText("Published versions are not overwritten")).toBeVisible();
});

test("engineering reviewer sees queue, evidence, comments, and gate controls", async ({
  page
}) => {
  await signIn(page, "reviewer@example.test", /\/review/, "/review");

  await expect(page.getByRole("heading", { name: "Engineering review" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review queue" })).toBeVisible();
  await expect(page.getByText("Publication gate")).toBeVisible();
  await expect(page.getByText("Required reviews: source, equation")).toBeVisible();
  await expect(page.getByText("Clarify the SI unit assumption")).toBeVisible();
  await expect(page.getByRole("button", { name: "Request changes" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Roll back" })).toBeVisible();
});

async function signIn(page: Page, email: string, expectedUrl: RegExp, nextPath: string) {
  await page.goto(`/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(expectedUrl);
}
