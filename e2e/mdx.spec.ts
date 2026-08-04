import { expect, test } from "@playwright/test"

const aiArticlePath = "/blog/ai-pipelines-need-control-boundaries"
const softwareLayersArticlePath = "/blog/software-layers-are-risk-boundaries"
const legacyArticlePath = "/blog/secure-platform-integration-is-not-plumbing"

const unpublishedArticlePaths = [
  "/blog/draft-publication-fixture",
  "/blog/future-publication-fixture",
]

test.describe("representative MDX articles", () => {
  test("renders AI content, components, metadata, and series navigation", async ({
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
    ).toHaveAttribute(
      "href",
      "/blog/secure-platform-integration-is-not-plumbing",
    )
    await expect(
      seriesNavigation.getByRole("link", {
        name: "Next: Software Layers Are Risk Boundaries",
      }),
    ).toHaveAttribute("href", softwareLayersArticlePath)

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
    ).toHaveAttribute("href", softwareLayersArticlePath)

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://micrantha.com/blog/ai-pipelines-need-control-boundaries",
    )

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .textContent()

    expect(structuredData).toContain('"@type":"Article"')
  })

  test("renders software layers from its static MDX route", async ({ page }) => {
    const response = await page.goto(softwareLayersArticlePath)

    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(
      "Micrantha Software | Software Layers Are Risk Boundaries",
    )
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Software Layers Are Risk Boundaries",
      }),
    ).toBeVisible()
    await expect(page.getByText("Part 3 of 3", { exact: true })).toBeVisible()
    await expect(page.locator('[data-content-source="mdx"]')).toContainText(
      "Software layers are not only a code-organization preference",
    )
    await expect(
      page.getByRole("img", {
        name: /clients flowing into interface and application layers/i,
      }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", {
        name: "Secure Platform Integration Is Not Plumbing",
        exact: true,
      }),
    ).toHaveAttribute("href", legacyArticlePath)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://micrantha.com/blog/software-layers-are-risk-boundaries",
    )
  })

  test("supports hydrated navigation between separate MDX routes", async ({
    page,
  }) => {
    await page.goto(aiArticlePath)

    const documentIdentity = await page.evaluate(() => {
      const identity = globalThis.crypto.randomUUID()
      Object.defineProperty(globalThis, "__mdxRouteDocumentIdentity", {
        configurable: true,
        value: identity,
      })
      return identity
    })

    await page
      .locator('[data-content-source="mdx"]')
      .getByRole("link", {
        name: "Software Layers Are Risk Boundaries",
        exact: true,
      })
      .click()

    await expect(page).toHaveURL(
      new RegExp(`${softwareLayersArticlePath.replaceAll("/", "\\/")}$`),
    )
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Software Layers Are Risk Boundaries",
      }),
    ).toBeVisible()
    expect(
      await page.evaluate(() =>
        Reflect.get(globalThis, "__mdxRouteDocumentIdentity"),
      ),
    ).toBe(documentIdentity)
  })
})

test("legacy TSX articles continue through the dynamic route", async ({
  page,
}) => {
  const response = await page.goto(legacyArticlePath)

  expect(response?.status()).toBe(200)
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Secure Platform Integration Is Not Plumbing",
    }),
  ).toBeVisible()
  await expect(page.locator('[data-content-source="mdx"]')).toHaveCount(0)
  await expect(page.locator("main")).toContainText(
    "Secure platform integration is not plumbing",
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

  for (const article of [
    {
      path: aiArticlePath,
      heading: "AI Pipelines Need Control Boundaries",
      conclusion: "The practical goal is not to remove AI from the workflow",
    },
    {
      path: softwareLayersArticlePath,
      heading: "Software Layers Are Risk Boundaries",
      conclusion:
        "Software layers are not only a code-organization preference",
    },
  ]) {
    test(`returns complete server-rendered content for ${article.heading}`, async ({
      page,
    }) => {
      const response = await page.goto(article.path)

      expect(response?.status()).toBe(200)
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: article.heading,
        }),
      ).toBeVisible()
      await expect(page.locator('[data-content-source="mdx"]')).toContainText(
        article.conclusion,
      )
    })
  }
})
