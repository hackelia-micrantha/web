import { expect, test } from "@playwright/test"

const articlePath = "/blog/ai-pipelines-need-control-boundaries"

test.describe("representative MDX article", () => {
  test("renders canonical content, components, and metadata", async ({
    page,
  }) => {
    await page.goto(articlePath)

    await expect(page).toHaveTitle(
      "Micrantha Software | AI Pipelines Need Control Boundaries",
    )
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "AI Pipelines Need Control Boundaries",
      }),
    ).toBeVisible()

    const mdxContent = page.locator('[data-content-source="mdx"]')

    await expect(mdxContent).toBeVisible()
    await expect(mdxContent.locator(".article-callout")).toContainText(
      "AI is not the system of record",
    )
    await expect(
      mdxContent.getByRole("img", {
        name: /sources flowing through preprocessing/i,
      }),
    ).toBeVisible()
    await expect(
      mdxContent.getByRole("table", { name: "AI pipeline failure modes" }),
    ).toBeVisible()
    await expect(
      mdxContent.getByRole("row", { name: /Unsafe write-back/ }),
    ).toContainText("Require approval gates and controlled adapter writes")
    await expect(
      mdxContent.getByRole("link", {
        name: "Software Layers Are Risk Boundaries",
        exact: true,
      }),
    ).toHaveAttribute("href", "/blog/software-layers-are-risk-boundaries")

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://micrantha.com/blog/ai-pipelines-need-control-boundaries",
    )

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .textContent()

    expect(structuredData).toContain('"@type":"Article"')
  })

  test("supports hydrated client navigation", async ({ page }) => {
    await page.goto(articlePath)
    await page
      .locator('[data-content-source="mdx"]')
      .getByRole("link", {
        name: "Software Layers Are Risk Boundaries",
        exact: true,
      })
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

    const mdxContent = page.locator('[data-content-source="mdx"]')

    await expect(mdxContent).toContainText(
      "The practical goal is not to remove AI from the workflow",
    )
    await expect(mdxContent.locator(".article-callout")).toContainText(
      "untrusted reasoning component",
    )
    await expect(
      mdxContent.getByRole("table", { name: "AI pipeline failure modes" }),
    ).toBeVisible()
  })
})
