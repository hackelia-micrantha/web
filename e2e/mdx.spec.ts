import { expect, test } from "@playwright/test"

const aiArticlePath = "/blog/ai-pipelines-need-control-boundaries"
const integrationArticlePath =
  "/blog/secure-platform-integration-is-not-plumbing"
const softwareLayersArticlePath = "/blog/software-layers-are-risk-boundaries"
const governanceArticlePath =
  "/blog/governance-native-engineering-control-plane"
const legacyArticlePath = "/blog/replayability-is-a-governance-problem"

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

  test("renders software layers article from canonical MDX", async ({
    page,
  }) => {
    await page.goto(softwareLayersArticlePath)

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

    const seriesNavigation = page.getByRole("navigation", {
      name: "Architecture Control Boundaries series navigation",
    })

    await expect(
      seriesNavigation.getByRole("link", {
        name: "Previous: AI Pipelines Need Control Boundaries",
      }),
    ).toHaveAttribute("href", aiArticlePath)
    await expect(
      seriesNavigation.getByRole("link", { name: /^Next:/ }),
    ).toHaveCount(0)

    const mdxContent = page.locator('[data-content-source="mdx"]')

    await expect(mdxContent).toBeVisible()
    await expect(
      mdxContent.getByRole("img", {
        name: /clients flowing into interface and application layers/i,
      }),
    ).toBeVisible()
    await expect(
      mdxContent.getByRole("link", {
        name: "Secure Platform Integration Is Not Plumbing",
        exact: true,
      }),
    ).toHaveAttribute("href", integrationArticlePath)
    await expect(mdxContent).toContainText(
      "Software layers are not only a code-organization preference",
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://micrantha.com/blog/software-layers-are-risk-boundaries",
    )
  })

  test("renders governance control-plane article and Mermaid from canonical MDX", async ({
    page,
  }) => {
    await page.goto(governanceArticlePath)

    await expect(page).toHaveTitle(
      "Micrantha Software | Governance-Native Engineering and the AI Control Plane",
    )
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Governance-Native Engineering and the AI Control Plane",
      }),
    ).toBeVisible()
    await expect(page.getByText("Part 1 of 3", { exact: true })).toBeVisible()

    const seriesNavigation = page.getByRole("navigation", {
      name: "Governance-Native Engineering series navigation",
    })

    await expect(
      seriesNavigation.getByRole("link", {
        name: "Next: Replayability Is a Governance Problem",
      }),
    ).toHaveAttribute("href", legacyArticlePath)
    await expect(
      seriesNavigation.getByRole("link", { name: /^Previous:/ }),
    ).toHaveCount(0)

    const mdxContent = page.locator('[data-content-source="mdx"]')
    const diagram = mdxContent.locator("[data-mermaid-diagram]")

    await expect(mdxContent).toBeVisible()
    await expect(mdxContent.locator(".article-callout")).toContainText(
      "whether organizations can still govern",
    )
    await expect(diagram).toContainText("AI-native engineering control plane")
    await expect(diagram).toHaveAttribute("data-mermaid-status", "rendered", {
      timeout: 15_000,
    })
    await expect(diagram.locator("[data-mermaid-rendered] svg")).toBeVisible()
    await expect(mdxContent).toContainText(
      "AI-native engineering therefore becomes a systems-governance discipline",
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://micrantha.com/blog/governance-native-engineering-control-plane",
    )
  })

  test("supports hydrated client navigation", async ({ page }) => {
    await page.goto(softwareLayersArticlePath)
    await page
      .locator('[data-content-source="mdx"]')
      .getByRole("link", {
        name: "Secure Platform Integration Is Not Plumbing",
        exact: true,
      })
      .click()

    await expect(page).toHaveURL(
      /\/blog\/secure-platform-integration-is-not-plumbing$/,
    )
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Secure Platform Integration Is Not Plumbing",
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
      name: "Replayability Is a Governance Problem",
    }),
  ).toBeVisible()
  await expect(page.locator('[data-content-source="mdx"]')).toHaveCount(0)
  await expect(page.locator("[data-mermaid-diagram]").first()).toBeVisible()
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

  test("returns complete server-rendered software layers content", async ({
    page,
  }) => {
    const response = await page.goto(softwareLayersArticlePath)

    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Software Layers Are Risk Boundaries",
      }),
    ).toBeVisible()

    const mdxContent = page.locator('[data-content-source="mdx"]')

    await expect(mdxContent).toContainText(
      "Software layers are not only a code-organization preference",
    )
    await expect(
      mdxContent.getByRole("img", {
        name: /clients flowing into interface and application layers/i,
      }),
    ).toBeVisible()
    await expect(
      mdxContent.getByRole("link", {
        name: "Secure Platform Integration Is Not Plumbing",
        exact: true,
      }),
    ).toHaveAttribute("href", integrationArticlePath)
  })

  test("returns governance article Mermaid source and complete content", async ({
    page,
  }) => {
    const response = await page.goto(governanceArticlePath)

    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Governance-Native Engineering and the AI Control Plane",
      }),
    ).toBeVisible()

    const mdxContent = page.locator('[data-content-source="mdx"]')
    const diagram = mdxContent.locator("[data-mermaid-diagram]")

    await expect(diagram).toHaveAttribute("data-mermaid-status", "source")
    await expect(diagram.locator("[data-mermaid-source]")).toContainText(
      "Human intent",
    )
    await expect(mdxContent).toContainText(
      "AI-native engineering therefore becomes a systems-governance discipline",
    )
  })
})
