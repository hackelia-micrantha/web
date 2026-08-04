import { expect, test } from "@playwright/test"

const articlePath = "/blog/ai-pipelines-need-control-boundaries"

test.describe("representative MDX article", () => {
  test("renders canonical content, components, and metadata", async ({ page }) => {
    await page.goto(articlePath)

    await expect(page).toHaveTitle(
      /AI Pipelines Need Control Boundaries.*Micrantha Software/,
    )
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "AI Pipelines Need Control Boundaries",
      }),
    ).toBeVisible()
    await expect(page.locator('[data-content-source="mdx"]')).toBeVisible()
    await expect(page.locator(".article-callout")).toContainText(
      "AI is not the system of record",
    )
    await expect(
      page.getByRole("img", { name: /sources flowing through preprocessing/i }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Software Layers Are Risk Boundaries" }),
    ).toHaveAttribute("href", "/blog/software-layers-are-risk-boundaries")

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://micrantha.com/blog/ai-pipelines-need-control-boundaries",
    )
    await expect(page.locator('script[type="application/ld+json"]')).toContainText(
      '"@type":"Article"',
    )
  })

  test("supports hydrated client navigation", async ({ page }) => {
    await page.goto(articlePath)
    await page
      .getByRole("link", { name: "Software Layers Are Risk Boundaries" })
      .click()

    await expect(page).toHaveURL(/\/blog\/software-layers-are-risk-boundaries$/)
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Software Layers Are Risk Boundaries",
      }),
    ).toBeVisible()
  })
})

test.describe("representative MDX article without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("returns complete server-rendered article content", async ({ page }) => {
    const response = await page.goto(articlePath)

    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "AI Pipelines Need Control Boundaries",
      }),
    ).toBeVisible()
    await expect(page.locator('[data-content-source="mdx"]')).toContainText(
      "The practical goal is not to remove AI from the workflow",
    )
    await expect(page.locator(".article-callout")).toContainText(
      "untrusted reasoning component",
    )
  })
})
