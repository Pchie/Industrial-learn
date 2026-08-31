import { expect, test, type Page } from "@playwright/test";

test("student cannot access authoring or review routes", async ({ page }) => {
  await signIn(page, "student@example.test", /\/dashboard/, "/dashboard");

  await page.goto("/author");
  await expect(page).toHaveURL(/\/auth\/error/);

  await page.goto("/review");
  await expect(page).toHaveURL(/\/auth\/error/);

  await page.goto("/review/basic-fluid-pressure");
  await expect(page).toHaveURL(/\/auth\/error/);

  await page.goto("/preview/lessons/basic-fluid-pressure?version=0.4.0");
  await expect(page).toHaveURL(/\/auth\/error/);
  await expect(page.getByText(/signed in as Student/)).toBeVisible();
});

test("content author sees the secure draft workspace", async ({ page }) => {
  await signIn(page, "author@example.test", /\/author/, "/author");

  await expect(page.getByRole("heading", { name: "Author workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "My drafts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Basic Fluid Pressure" })).toBeVisible();
  await expect(page.getByText("Structured draft editor")).toBeVisible();
  await expect(page.getByText("Published versions are not overwritten")).toBeVisible();
});

test("engineering reviewer sees the exact lesson, evidence, and secure gate controls", async ({
  page
}) => {
  await signIn(page, "reviewer@example.test", /\/review/, "/review");

  await expect(
    page.getByRole("heading", { name: "Engineering Review Workspace" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Awaiting review" })).toBeVisible();
  await expect(page.getByText("Publication gate")).toBeVisible();
  await expect(page.getByText("Source evidence attached")).toBeVisible();
  await page.getByRole("link", { name: "Open review package" }).click();

  await expect(page).toHaveURL(/\/review\/basic-fluid-pressure/);
  await expect(page.getByText("Content version", { exact: true })).toBeVisible();
  await expect(page.getByText("0.4.0", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Source evidence" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Equation and model review" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Protected answer review" })
  ).toBeVisible();
  await expect(page.getByText("Exact lesson preview")).toBeVisible();
  await expect(page.getByLabel("Normal force slider")).toBeVisible();
  await expect(page.getByLabel("Contact area numeric input")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Request changes" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Approve" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Reject" })).toBeVisible();

  await page.getByRole("radio", { name: "Request changes" }).check();
  await page.getByLabel("Safety and limitations outcome").selectOption("not_applicable");
  await page
    .getByLabel("Review comment or attestation")
    .fill("Please clarify one visual label before the independent approval decision.");
  await page.getByLabel(/I confirm that I reviewed/).check();
  await page.getByRole("button", { name: "Submit review decision" }).click();
  await expect(page.getByText("Review decision accepted")).toBeVisible();
});

test("Platform Owner can inspect and preview but cannot record engineering approval", async ({
  page
}) => {
  await signIn(page, "owner@example.test", /\/workspace/, "/workspace");

  await expect(page.getByRole("link", { name: /Open Student workspace/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Author workspace/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Reviewer workspace/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Lecturer workspace/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Owner workspace/ })).toBeVisible();

  for (const route of ["/dashboard", "/author", "/review", "/lecturer", "/owner"]) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(route));
  }

  await page.goto("/review/basic-fluid-pressure");
  await expect(page.getByText("Inspection access only")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Approve" })).toHaveCount(0);
  await page.getByRole("link", { name: "Preview as Student" }).click();
  await expect(page).toHaveURL(/\/preview\/lessons\/basic-fluid-pressure\?version=0.4.0/);
  await expect(page.getByText("PREVIEW — NOT PUBLISHED")).toBeVisible();
  await expect(page.getByLabel("Normal force slider")).toBeVisible();
});

test("workspace switcher is keyboard accessible and exposes owner role state", async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 820 });
  await signIn(page, "owner@example.test", /\/workspace/, "/workspace");

  const switcher = page.locator("summary").filter({ hasText: "Workspace:" });
  await switcher.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Platform Owner", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Reviewer", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Account access" })).toBeVisible();
});

test("role-based workspace choices remain least privilege", async ({ page }) => {
  await signIn(page, "author-reviewer@example.test", /\/workspace/, "/workspace");

  await expect(page.getByRole("link", { name: /Open Student workspace/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Author workspace/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Reviewer workspace/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Owner workspace/ })).toHaveCount(0);
});

async function signIn(page: Page, email: string, expectedUrl: RegExp, nextPath: string) {
  await page.goto(`/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(expectedUrl);
}
