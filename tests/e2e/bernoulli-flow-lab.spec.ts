import { expect, test } from "@playwright/test";

test("keeps the review-required Bernoulli flagship out of public lesson delivery", async ({
  page
}) => {
  await page.goto("/lessons/bernoulli-flow-lab");

  await expect(
    page.getByRole("heading", {
      name: "This part of Industrial Learn is not available yet"
    })
  ).toBeVisible();
  await expect(page.getByTestId("bernoulli-flow-visual-lesson")).toHaveCount(0);
  await expect(page.getByText("Bernoulli Flow Lab", { exact: true })).toHaveCount(0);
  expect(await page.content()).not.toContain("SIM-FLUID-BERNOULLI-FLOW-001");
});
