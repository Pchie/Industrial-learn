import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

async function register(page: Page, label: string) {
  await page.goto("/auth/sign-up?next=%2Fmy-learning");
  await page.getByLabel("Display name").fill(label);
  await page.getByLabel("Email address").fill(`${randomUUID()}@example.test`);
  await page
    .getByLabel("Password", { exact: true })
    .fill(`Synthetic-${randomUUID()}aA1!`);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/my-learning$/);
  await expect(page.locator(".protected-identity")).toContainText(label);
}

test("53E-F10 cross-tab account changes discard delayed private state and history", async ({
  page,
  context
}) => {
  await register(page, "Synthetic Library A");
  await page.getByRole("button", { name: "Save lesson", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saved lesson", exact: true })
  ).toBeVisible();
  let finish: (() => void) | undefined;
  let started: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route(
    "**/api/account/access",
    async (route) => {
      const response = await route.fetch();
      started?.();
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      await route.fulfill({ response }).catch(() => {});
    },
    { times: 1 }
  );
  // Simulate a transport which ignores AbortSignal: generation/document guards
  // must still prevent the old response from restoring the previous account.
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    let ignoreNextSignal = true;
    window.fetch = (input, init) => {
      const url = input instanceof Request ? input.url : input.toString();
      if (url.includes("/api/account/access") && ignoreNextSignal) {
        ignoreNextSignal = false;
        return original(input, { ...init, signal: null });
      }
      return original(input, init);
    };
  });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await pending;
  await expect(page.locator(".protected-identity")).not.toBeVisible();
  // Start the delayed request while A is foregrounded; opening another tab can
  // make A hidden, in which case its privacy boundary intentionally does not fetch.
  const other = await context.newPage();
  await other.goto("/auth/sign-out");
  await other.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(other).toHaveURL(/status=signed_out/);
  await register(other, "Synthetic Library B");
  finish?.();
  await page.bringToFront();
  // Real foreground/focus events trigger verification and may replace the
  // document. Locator assertions wait across that intentional navigation.
  await expect(page.locator(".protected-identity")).toContainText("Synthetic Library B");
  await expect(page.getByText("Synthetic Library A", { exact: true })).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Saved lesson", exact: true })
  ).toHaveCount(0);
  await page.goto("/dashboard");
  await page.goBack();
  await expect(page.locator(".protected-identity")).toContainText("Synthetic Library B");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Save lesson", exact: true })
  ).toBeVisible();
});

test("53E-F10 failed identity checks hide private content until verified again", async ({
  page
}) => {
  await register(page, "Synthetic Offline Student");
  await page.route("**/api/account/access", (route) => route.abort());
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("button", { name: "Retry account check" })).toBeVisible();
  await expect(page.locator(".protected-identity")).not.toBeVisible();
  await page.unroute("**/api/account/access");
  await page.getByRole("button", { name: "Retry account check" }).click();
  await expect(page.locator(".protected-identity")).toContainText(
    "Synthetic Offline Student"
  );
});

test("53E-F10 a delayed private library navigation cannot restore the previous account", async ({
  page,
  context
}) => {
  let delayNext = false;
  let release: (() => void) | undefined;
  let started: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route("**/my-learning?**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.headers()["next-router-prefetch"] === "1") {
      await route.abort();
      return;
    }
    if (
      delayNext &&
      request.method() === "GET" &&
      request.headers().rsc === "1" &&
      url.searchParams.get("view") === "saved"
    ) {
      delayNext = false;
      // This is the actual A-owned library payload, captured before sign-out.
      const response = await route.fetch();
      started?.();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({ response }).catch(() => {});
      return;
    }
    await route.continue();
  });
  await register(page, "Synthetic Payload A");
  await page.getByRole("button", { name: "Save lesson", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saved lesson", exact: true })
  ).toBeVisible();
  delayNext = true;
  await page
    .getByRole("navigation", { name: "Filter your learning" })
    .getByRole("link", { name: /^Saved/ })
    .click();
  await pending;
  const other = await context.newPage();
  await other.goto("/auth/sign-out");
  await other.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(other).toHaveURL(/status=signed_out/);
  await register(other, "Synthetic Payload B");
  await expect(page.locator("[data-account-boundary]")).not.toBeVisible();
  release?.();
  await page.bringToFront();
  await expect(page.locator(".protected-identity")).toContainText("Synthetic Payload B");
  await expect(page.getByText("Synthetic Payload A", { exact: true })).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Saved lesson", exact: true })
  ).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".protected-identity")).toContainText("Synthetic Payload B");
  await expect(
    page.getByRole("button", { name: "Saved lesson", exact: true })
  ).toHaveCount(0);
});
