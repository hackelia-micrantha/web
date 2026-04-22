import { expect, test } from "@playwright/test"

test("homepage exposes primary marketing content", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", {
      name: "Software that grows with you.",
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Request a consultation" }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Request a consultation" }).first(),
  ).toHaveAttribute("href", "/services")
  await expect(
    page.getByRole("heading", {
      name: "Broad engineering with depth in AI, mobile platforms, secure systems, and production delivery.",
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: "View active solutions",
    }),
  ).toBeVisible()
  await expect(
    page.getByText(
      "Broad engineering support across AI development, AI governance, mobile platforms, secure authentication, and deployment systems for teams turning fragile software into production systems.",
    ),
  ).toBeVisible()
})

test("primary navigation reaches key sections and routes", async ({ page }) => {
  await page.goto("/")

  const navigation = page.getByRole("navigation")

  await navigation.getByRole("link", { name: "Solutions", exact: true }).click()
  await expect(page).toHaveURL(/\/solutions$/)
  await expect(page.getByRole("heading", { name: "Solutions" })).toBeVisible()
  await expect(
    page.getByText(
      "Products that have grown into active use, including internal use.",
    ),
  ).toBeVisible()

  await navigation.getByRole("link", { name: "Support", exact: true }).click()
  await expect(page).toHaveURL(/\/support$/)
  await expect(page.getByRole("heading", { name: "Support" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "support@micrantha.com" }),
  ).toHaveAttribute("href", "mailto:support@micrantha.com")
  await expect(
    page.getByText(
      "Choose the support channel that fits the urgency and shape of the issue.",
    ),
  ).toBeVisible()
})
