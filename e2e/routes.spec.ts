import { expect, test } from "@playwright/test"

test("/services exposes the consultation path", async ({ page }) => {
  await page.goto("/services")

  await expect(page.getByRole("heading", { name: "Services" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Request a consultation" }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Email services@micrantha.com" }),
  ).toHaveAttribute(
    "href",
    "mailto:services@micrantha.com?subject=Consultation",
  )
  await expect(
    page.getByRole("heading", { name: "What to include" }),
  ).toBeVisible()
  await expect(page.getByText("the problem or project")).toBeVisible()
  await expect(page.getByText("what we can help with")).toBeVisible()
  await expect(page.getByText("how and when to contact you")).toBeVisible()
})

test("/laboratory exposes key collection content", async ({ page }) => {
  await page.goto("/laboratory")

  await expect(page.getByRole("heading", { name: "Laboratory" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: /laboratory compost/i }),
  ).toHaveAttribute("href", "/compost")
  await expect(
    page.getByRole("heading", { name: "Project Hyperion" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Project Anthesis" }),
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: "Compost" })).toBeVisible()
})

test("/privacy retains the tailored long-form policy copy", async ({
  page,
}) => {
  await page.goto("/privacy")

  await expect(
    page.getByRole("heading", { name: "Privacy Policy" }),
  ).toBeVisible()
  await expect(page.getByText("Information Collection and Use")).toBeVisible()
  await expect(page.getByText("Cookies", { exact: true })).toBeVisible()
  await expect(page.getByText("Contact Us", { exact: true })).toBeVisible()
  await expect(page.getByText("fortunes.micrantha.com")).toHaveCount(0)
})
