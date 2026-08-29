import { expect, test, type Page } from "@playwright/test";

const hiddenSimulations = [
  { slug: "hydraulic-cylinder-force", title: "Hydraulic Cylinder Force" },
  { slug: "bernoulli-flow-lab", title: "Bernoulli Flow Lab" },
  {
    slug: "thermal-system-boundary-simulation",
    title: "Thermal System Boundary Simulation"
  }
];

test("renders an honest empty public engineering laboratory", async ({ page }) => {
  await page.goto("/simulations");

  await expect(page.getByRole("heading", { name: "Simulation Lab" })).toBeVisible();
  await expect(page.getByLabel("Search simulations")).toBeVisible();
  await expect(page.getByText("Reviewed simulations are being prepared.")).toBeVisible();
  await expect(page.getByLabel("Simulation catalogue")).toHaveCount(0);
  await expect(page.getByText("Continue recent simulation")).toHaveCount(0);

  for (const simulation of hiddenSimulations) {
    await expect(page.getByText(simulation.title, { exact: true })).toHaveCount(0);
  }
});

test("search and filters cannot reveal review-required simulations", async ({ page }) => {
  await page.goto("/simulations");

  const search = page.getByLabel("Search simulations");
  await search.fill("pressure");
  await expect(page.getByText("Hydraulic Cylinder Force", { exact: true })).toHaveCount(
    0
  );
  await search.fill("Bernoulli");
  await expect(page.getByText("Bernoulli Flow Lab", { exact: true })).toHaveCount(0);

  await page.getByLabel("Simulation type").selectOption("Component");
  await page.getByLabel("Interaction mode").selectOption("guided");
  await expect(page.getByLabel("Simulation catalogue")).toHaveCount(0);
});

for (const simulation of hiddenSimulations) {
  test(`denies direct simulation slug guessing for ${simulation.slug}`, async ({
    page
  }) => {
    await page.goto(`/simulations/${simulation.slug}`);

    await expect(
      page.getByRole("heading", {
        name: "This part of Industrial Learn is not available yet"
      })
    ).toBeVisible();
    await expect(page.getByText(simulation.title, { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Start simulation" })).toHaveCount(0);
    await expect(page.getByText("Engineering review required")).toHaveCount(0);
  });
}

test("authenticated activity does not reintroduce hidden simulations", async ({
  page
}) => {
  await signIn(page, "active.student@example.test");
  await page.goto("/simulations");

  await expect(page.getByText("Reviewed simulations are being prepared.")).toBeVisible();
  await expect(page.getByText("Hydraulic Cylinder Force", { exact: true })).toHaveCount(
    0
  );
  await expect(page.getByText("No recent simulations")).toBeVisible();
});

test("keeps the empty laboratory keyboard accessible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/simulations");

  const search = page.getByLabel("Search simulations");
  await expect(search).toBeEnabled();
  await search.focus();
  await page.keyboard.type("cylinder");
  await expect(search).toHaveValue("cylinder");
  await expect(page.getByText("Hydraulic Cylinder Force", { exact: true })).toHaveCount(
    0
  );

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("does not render or preload hidden simulation workspaces", async ({ page }) => {
  const scriptBodies: string[] = [];
  page.on("response", async (response) => {
    if (response.request().resourceType() === "script") {
      scriptBodies.push(await response.text().catch(() => ""));
    }
  });

  await page.goto("/simulations");
  await page.waitForLoadState("networkidle");

  await expect(page.locator("[aria-label$='simulation attempt']")).toHaveCount(0);
  expect(scriptBodies.join("\n")).not.toContain("Submitted cylinder force answer");
});

async function signIn(page: Page, email: string) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
