import { expect, test } from "@playwright/test"

test("/philosophy exposes the core manifesto and optimized diagram", async ({
  page,
}) => {
  await page.goto("/philosophy")

  await expect(page.getByRole("heading", { name: "Philosophy" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Triangle" })).toBeVisible()
  await expect(page.getByText("project management triangle")).toBeVisible()
  await expect(
    page.locator('picture source[type="image/webp"]'),
  ).toHaveAttribute(
    "srcset",
    "/img/project-management-triangle-venn-diagram.webp",
  )
  await expect(
    page.getByAltText("project management triangle diagram"),
  ).toBeVisible()
})
