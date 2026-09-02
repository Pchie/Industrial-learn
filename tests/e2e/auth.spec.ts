import { expect, test, type Page } from "@playwright/test";

test("new-user registration creates a student session", async ({ page }) => {
  const email = `new-${Date.now()}@example.test`;

  await page.goto("/auth/sign-up");
  await page.getByLabel("Display name").fill("New Auth Student");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "New Auth Student", level: 1 })
  ).toBeVisible();
});

test("signup next route cannot grant reviewer access", async ({ page }) => {
  const email = `review-next-${Date.now()}@example.test`;

  await page.goto("/auth/sign-up?next=%2Freview%2Fbasic-fluid-pressure");
  await page.getByLabel("Display name").fill("Student Review Request");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/auth\/error/);
  await expect(page.getByText(/signed in as Student/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to my workspace" })).toBeVisible();
});

test("sign-in restores a server session for protected routes", async ({ page }) => {
  await signInAsStudent(page);

  await page.goto("/my-learning");
  await expect(page.getByRole("heading", { name: "My learning" })).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Server session resolved" })
  ).toContainText("Industrial Student");
});

test("sign-out clears the session", async ({ page }) => {
  await signInAsStudent(page);

  await page.goto("/auth/sign-out");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in/);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("invalid credentials show a safe error", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill("student@example.test");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/error=invalid_credentials/);
  await expect(page.getByText("The email or password was not accepted.")).toBeVisible();
});

test("password-reset request does not disclose whether an email exists", async ({
  page
}) => {
  await page.goto("/auth/forgot-password");
  await page.getByLabel("Email address").fill("missing@example.test");
  await page.getByRole("button", { name: "Request reset link" }).click();

  await expect(page).toHaveURL(/status=reset_requested/);
  await expect(
    page.getByText("If that account can receive password reset email")
  ).toBeVisible();
});

test("protected route without authentication redirects to sign-in", async ({ page }) => {
  await page.goto("/projects");

  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("student is denied access to admin routes", async ({ page }) => {
  await signInAsStudent(page);
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/auth\/error/);
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  await expect(page.getByText(/signed in as Student/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to my workspace" })).toBeVisible();
});

test("student is denied access to reviewer routes", async ({ page }) => {
  await signInAsStudent(page);
  await page.goto("/review");

  await expect(page).toHaveURL(/\/auth\/error/);
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
});

async function signInAsStudent(page: Page) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill("student@example.test");
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
