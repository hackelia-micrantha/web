import { expect, test } from "@playwright/test"

const aiArticlePath = "/blog/ai-pipelines-need-control-boundaries"
const integrationArticlePath =
  "/blog/secure-platform-integration-is-not-plumbing"
const legacyArticlePath = "/blog/software-layers-are-risk-boundaries"

const unpublishedArticlePaths = [
  "/blog/draft-publication-fixture",
  "/blog/future-publication-fixture",
]

test.describe("MDX articles", () => {
  test("renders AI article content, components, metadata, and series navigation", async ({
    page,
  }) => {
    await page.goto(aiArticlePath)

    await expect(page).toHaveTitle(
      "Micrantha Software | AI Pipelines Need Control Boundaries",
    )
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "AI Pipelines Need Control Boundaries",
      }),
    ).toBeVisible()
    await expect(page.getByText("Part 2 of 3", { exact: true })).toBeVisible()

    const seriesNavigation = page.getByRole("navigation", {
      name: "Architecture Control Boundaries series navigation",
    })

    await expect(
      seriesNavigation.getByRole("link", {
        name: "Previous: Secure Platform Integration Is Not Plumbing",
      }),
    ).toHaveAttribute("href", integrationArticlePath)
    await expect(
      seriesNavigation.getByRole("link", {
        name: "Next: Software Layers Are Risk Boundaries",
      }),
    ).toHaveAttribute("href", legacyArticlePath)

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
    ).toHaveAttribute("href", legacyArticlePath)

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://micrantha.com/blog/ai-pipelines-need-control-boundaries",
    )

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .textContent()

    expect(structuredData).toContain('"@type":"Article"')
  })

  test("renders secure integration article from canonical MDX", async ({
    page,
  }) => {
    await page.goto(integrationArticlePath)

    await expect(page).toHaveTitle(
      "Micrantha Software | Secure Platform Integration Is Not Plumbing",
    )
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Secure Platform Integration Is Not Plumbing",
      }),
    ).toBeVisible()
    await expect(page.getByText("Part 1 of 3", { exact: true })).toBeVisible()

    const seriesNavigation = page.getByRole("navigation", {
      name: "Architecture Control Boundaries series navigation",
    })

    await expect(
      seriesNavigation.getByRole("link", {
        name: "Next: AI Pipelines Need Control Boundaries",
      }),
    ).toHaveAttribute("href", aiArticlePath)
    await expect(
      seriesNavigation.getByRole("link", { name: /^Previous:/ }),
    ).toHaveCount(0)

    const mdxContent = page.locator('[data-content-source="mdx"]')

    await expect(mdxContent).toBeVisible()
    await expect(mdxContent.locator(".article-callout")).toContainText(
      "Secure platform integration is not plumbing",
    )
    await expect(
      mdxContent.getByRole("img", {
        name: /channels and source systems flowing through an API gateway/i,
      }),
    ).toBeVisible()
    await expect(
      mdxContent.getByRole("link", {
        name: "AI Pipelines Need Control Boundaries",
        exact: true,
      }),
    ).toHaveAttribute("href", aiArticlePath)
    await expect(mdxContent).toContainText(
      "Integration layers deserve architectural attention",
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://micrantha.com/blog/secure-platform-integration-is-not-plumbing",
    )
  })

  test("supports hydrated client navigation", async ({ page }) => {
    await page.goto(integrationArticlePath)
    await page
      .locator('[data-content-source="mdx"]')
      .getByRole("link", {
        name: "AI Pipelines Need Control Boundaries",
        exact: true,
      })
      .click()

    await expect(page).toHaveURL(
      /\/blog\/ai-pipelines-need-control-boundaries$/,
    )
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "AI Pipelines Need Control Boundaries",
      }),
    ).toBeVisible()
  })
})

test("remaining legacy TSX article continues through the dynamic route", async ({
  page,
}) => {
  const response = await page.goto(legacyArticlePath)

  expect(response?.status()).toBe(200)
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Software Layers Are Risk Boundaries",
    }),
  ).toBeVisible()
  await expect(page.locator('[data-content-source="mdx"]')).toHaveCount(0)
  await expect(page.locator("main")).toContainText(
    "Software layers are not only a code-organization preference",
  )
})

test("draft and future blog URLs remain unavailable", async ({ page }) => {
  for (const pathname of unpublishedArticlePaths) {
    const response = await page.goto(pathname)

    expect(response?.status()).toBe(404)
    await expect(page.getByText("Not Found", { exact: true })).toBeVisible()
  }
})

test.describe("MDX articles without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("returns complete server-rendered AI article content", async ({
    page,
  }) => {
    const response = await page.goto(aiArticlePath)

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

  test("returns complete server-rendered integration article content", async ({
    page,
  }) => {
    const response = await page.goto(integrationArticlePath)

    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Secure Platform Integration Is Not Plumbing",
      }),
    ).toBeVisible()

    const mdxContent = page.locator('[data-content-source="mdx"]')

    await expect(mdxContent).toContainText(
      "Integration layers deserve architectural attention",
    )
    await expect(mdxContent.locator(".article-callout")).toContainText(
      "data contracts, trust boundaries, workflow semantics",
    )
    await expect(
      mdxContent.getByRole("img", {
        name: /channels and source systems flowing through an API gateway/i,
      }),
    ).toBeVisible()
  })
})
