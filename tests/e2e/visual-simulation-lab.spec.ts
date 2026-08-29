import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/auth/sign-in?next=%2Finternal%2Fvisual-simulation-lab");
  await page.getByLabel("Email address").fill("reviewer@example.test");
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/internal\/visual-simulation-lab/);
  await expect(
    page.getByRole("heading", { name: "Visual simulation lab", level: 1 })
  ).toBeVisible();
});

test("marks the playground private and uses demonstration-only state", async ({
  page
}) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByText("Demonstration state only")).toBeVisible();
  await expect(page.getByText("Not reviewed engineering content")).toBeVisible();
  await expect(page.getByText("Result supplied by")).toBeVisible();
});

test("supports keyboard playback, X-Ray switching, and linked selection", async ({
  page
}) => {
  const step = page.getByRole("button", { name: /Step/ });
  await step.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Frame 1")).toBeVisible();

  const schematicMode = page.getByRole("radio", { name: "Schematic" });
  await schematicMode.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "Schematic view" })).toBeVisible();

  const actuator = page.getByRole("button", { name: /Actuator symbol/ });
  await actuator.click();
  await expect(actuator).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("DEMO-COMPONENT-ACTUATOR")).toBeVisible();

  const externalMode = page.getByRole("radio", { name: "External" });
  await externalMode.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: /Actuator housing/ })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

test("applies reduced-motion and low-data presentation without removing state", async ({
  page
}) => {
  await page.getByRole("checkbox", { name: "Use reduced-motion presentation" }).check();
  await page.getByRole("checkbox", { name: "Use low-data presentation" }).check();

  const root = page.locator('[data-low-data="true"][data-reduced-motion="true"]');
  await expect(root).toBeVisible();
  await expect(page.getByText("Flow →")).toBeVisible();
  await expect(page.locator("animateMotion")).toHaveCount(0);
  await expect(page.getByText(/Supplied force/).first()).toBeVisible();
});

test("uses central mode capabilities for fault and assessment display", async ({
  page
}) => {
  await page.getByLabel("Experience mode").selectOption("fault-diagnosis");
  await expect(page.getByRole("heading", { name: "Fault mode" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Live equation" })).toHaveCount(0);

  await page.getByLabel("Experience mode").selectOption("demonstration");
  await expect(page.getByRole("heading", { name: "Live equation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fault mode" })).toHaveCount(0);
});

test("reflows the workbench without page overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.reload();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const viewportBox = await page
    .getByRole("heading", { name: "External view" })
    .boundingBox();
  const controlsBox = await page
    .getByRole("heading", { name: "Controls", exact: true })
    .boundingBox();
  const measurementsBox = await page
    .getByRole("heading", { name: "Measurements" })
    .boundingBox();

  expect(viewportBox).not.toBeNull();
  expect(controlsBox).not.toBeNull();
  expect(measurementsBox).not.toBeNull();
  expect(controlsBox!.y).toBeGreaterThan(viewportBox!.y);
  expect(measurementsBox!.y).toBeGreaterThan(controlsBox!.y);
});
