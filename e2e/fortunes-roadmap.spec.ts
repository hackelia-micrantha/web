import { expect, test } from "@playwright/test"

test("Fortunes public roadmap is linked from Solutions", async ({ page }) => {
  await page.goto("/solutions")

  await expect(
    page.getByRole("link", { name: "Roadmap", exact: true }),
  ).toHaveAttribute("href", "/solutions/fortunes")
})

test("Fortunes public roadmap distinguishes planned capabilities", async ({
  page,
}) => {
  await page.goto("/solutions/fortunes")

  await expect(
    page.getByRole("heading", { name: "Fortunes & Quotes", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("Roadmap · Planned and experimental"),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Discover by meaning" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Write and contribute" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Generate original fortunes with AI" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", {
      name: "Explore specialist small language models",
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "From an idea to a published fortune" }),
  ).toBeVisible()
  await expect(
    page.getByText(/This page describes proposals and experiments/),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Back to Solutions" }),
  ).toHaveAttribute("href", "/solutions")
})
