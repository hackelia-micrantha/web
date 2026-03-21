import { expect, test } from "@playwright/test"

test("homepage exposes primary marketing content", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "Software that grows with you." }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Request a consultation" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", {
      name: "Specialized consulting for hard systems.",
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "View all solutions" }),
  ).toBeVisible()
})

test("primary navigation reaches key sections and routes", async ({ page }) => {
  await page.goto("/")

  const navigation = page.getByRole("navigation")

  await navigation.getByRole("link", { name: "Solutions", exact: true }).click()
  await expect(page).toHaveURL(/\/solutions$/)
  await expect(page.getByRole("heading", { name: "Solutions" })).toBeVisible()
  await expect(page.getByText("Fortunes Service")).toBeVisible()

  await navigation.getByRole("link", { name: "Support", exact: true }).click()
  await expect(page).toHaveURL(/\/support$/)
  await expect(page.getByRole("heading", { name: "Support" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "support@micrantha.com" }),
  ).toHaveAttribute("href", "mailto:support@micrantha.com")
})
