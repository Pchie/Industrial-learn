import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/forgot-password",
  "/learn",
  "/learn/core-engineering",
  "/learn/future-engineering",
  "/programmes/mechanical-foundations",
  "/programmes/mechanical-foundations/year/1",
  "/modules/fluid-mechanics-foundations",
  "/lessons/basic-fluid-pressure",
  "/internal/design-system"
];

const overflowRoutes = [
  "/",
  "/learn",
  "/modules/robotics-foundations",
  "/lessons/basic-fluid-pressure",
  "/internal/design-system"
];

const viewportWidths = [320, 375, 430, 768, 1024, 1366];

test.describe("browser accessibility scans", () => {
  for (const route of publicRoutes) {
    test(`has no critical automated accessibility violations on ${route}`, async ({
      page
    }) => {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await expectNoAxeViolations(page);
    });
  }

  test("has no critical automated accessibility violations on authenticated states", async ({
    page
  }) => {
    await signIn(page, "active.student@example.test", "/dashboard");
    await expectNoAxeViolations(page);

    await signIn(page, "author@example.test", "/author");
    await expectNoAxeViolations(page);

    await signIn(page, "reviewer@example.test", "/review");
    await expectNoAxeViolations(page);

    await signIn(page, "active.student@example.test", "/assessments");
    await expectNoAxeViolations(page);

    await signIn(page, "active.student@example.test", "/simulations/history");
    await expectNoAxeViolations(page);
  });
});

test("skip link moves keyboard focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("authentication errors are announced as alerts", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill("student@example.test");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "Authentication error" })
  ).toContainText("The email or password was not accepted.");
});

test("design-system modal and drawer manage keyboard focus", async ({ page }) => {
  await page.goto("/internal/design-system");

  const modalTrigger = page.getByRole("button", { name: "Open modal example" });
  await expect(modalTrigger).toBeVisible();
  await modalTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Modal example" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close modal" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Modal example" })).toBeHidden();
  await expect(modalTrigger).toBeFocused();

  const drawerTrigger = page.getByRole("button", { name: "Open drawer example" });
  await expect(drawerTrigger).toBeVisible();
  await drawerTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Drawer example" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close drawer" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Drawer example" })).toBeHidden();
  await expect(drawerTrigger).toBeFocused();
});

test("tabs support arrow-key navigation", async ({ page }) => {
  await page.goto("/internal/design-system");

  const tokensTab = page.getByRole("tab", { name: "Tokens" });
  const componentsTab = page.getByRole("tab", { name: "Components" });

  await expect(tokensTab).toBeVisible();
  await tokensTab.focus();
  await page.keyboard.press("ArrowRight");

  await expect(componentsTab).toBeFocused();
  await expect(componentsTab).toHaveAttribute("aria-selected", "true");
});

test("reduced-motion preference disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lessons/basic-fluid-pressure");

  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
});

test("lesson equations and simulation controls have accessible labels", async ({
  page
}) => {
  await page.goto("/lessons/basic-fluid-pressure");

  await expect(page.getByLabel(/Equation:/).first()).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Symbols and SI units" }).first()
  ).toBeVisible();

  await page.goto("/internal/design-system");
  await expect(page.getByRole("slider", { name: "Valve position" })).toBeVisible();
});

test("dashboard progress labels expose meaning", async ({ page }) => {
  await signIn(page, "active.student@example.test", "/dashboard");

  await expect(page.getByText("Progress calculation")).toBeVisible();
  await expect(page.getByLabel("Module progress").first()).toBeVisible();
});

for (const width of viewportWidths) {
  test(`does not horizontally overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });

    for (const route of overflowRoutes) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow, `${route} overflowed by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
}

async function signIn(page: Page, email: string, nextPath: string) {
  await page.goto(`/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(nextPath.replaceAll("/", "\\/")));
  await expect(page.locator("main")).toBeVisible();
  await expect(page).toHaveTitle(/Industrial Learn/);
}
