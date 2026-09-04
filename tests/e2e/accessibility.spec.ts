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
  "/lessons/hydraulic-cylinder-force",
  "/lessons/bernoulli-flow-lab",
  "/simulations",
  "/simulations/hydraulic-cylinder-force",
  "/simulations/bernoulli-flow-lab",
  "/simulations/thermal-system-boundary-simulation",
  "/internal/design-system"
];

const overflowRoutes = [
  "/",
  "/learn",
  "/modules/robotics-foundations",
  "/lessons/basic-fluid-pressure",
  "/lessons/hydraulic-cylinder-force",
  "/lessons/bernoulli-flow-lab",
  "/simulations",
  "/simulations/hydraulic-cylinder-force",
  "/simulations/bernoulli-flow-lab",
  "/simulations/thermal-system-boundary-simulation",
  "/internal/design-system"
];

const viewportWidths = [320, 375, 430, 768, 1024, 1366];

const authenticatedRoutes = [
  {
    email: "active.student@example.test",
    path: "/dashboard",
    label: "student dashboard"
  },
  {
    email: "author@example.test",
    path: "/author",
    label: "author workspace"
  },
  {
    email: "reviewer@example.test",
    path: "/review",
    label: "review workspace"
  },
  {
    email: "reviewer@example.test",
    path: "/review/basic-fluid-pressure",
    label: "Basic Fluid Pressure human review"
  },
  {
    email: "owner@example.test",
    path: "/workspace",
    label: "owner workspace portal"
  },
  {
    email: "owner@example.test",
    path: "/owner",
    label: "Platform Owner management"
  },
  {
    email: "owner@example.test",
    path: "/admin/users",
    label: "owner user and role management"
  },
  {
    email: "owner@example.test",
    path: "/preview/lessons/basic-fluid-pressure?version=0.4.0",
    label: "protected exact-version lesson preview"
  },
  {
    email: "active.student@example.test",
    path: "/assessments",
    label: "assessment workspace"
  },
  {
    email: "active.student@example.test",
    path: "/simulations/history",
    label: "simulation history"
  },
  {
    email: "reviewer@example.test",
    path: "/internal/visual-simulation-lab",
    label: "authorised visual simulation review lab"
  }
];

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

  for (const route of authenticatedRoutes) {
    test(`has no critical automated accessibility violations on authenticated ${route.label}`, async ({
      page
    }) => {
      await signIn(page, route.email, route.path);
      await expectNoAxeViolations(page);
    });
  }
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

test("Basic Fluid Pressure visual supports keyboard input, text state, reduced motion, and mobile width", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 900 });
  await signIn(page, "reviewer@example.test", "/review/basic-fluid-pressure");

  const forceSlider = page.getByLabel("Normal force slider");
  await forceSlider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Normal force numeric input")).toHaveValue("1050");
  await expect(page.getByText(/1,050 N acts normally/)).toBeVisible();

  const forceArrow = page.locator('line[marker-end^="url(#normal-force-"]');
  const transitionDurationSeconds = await forceArrow.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration)
  );
  expect(transitionDurationSeconds).toBeLessThanOrEqual(0.00001);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("unpublished lessons expose no equation metadata and internal controls remain labelled", async ({
  page
}) => {
  await page.goto("/lessons/hydraulic-cylinder-force");

  await expect(
    page.getByRole("heading", {
      name: "This part of Industrial Learn is not available yet"
    })
  ).toBeVisible();
  await expect(page.getByLabel(/Equation:/)).toHaveCount(0);
  await expect(page.getByRole("table", { name: "Symbols and SI units" })).toHaveCount(0);

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
  await expect(page).toHaveURL((url) => `${url.pathname}${url.search}` === nextPath);
  await expect(page.locator("main")).toBeVisible();
  await expect(page).toHaveTitle(/Industrial Learn/);
}
