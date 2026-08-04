import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

type ArticleContract = {
  callout?: string
  finalText: string
  imageAlt?: RegExp
  mermaidSource?: string
  mermaidTitle?: string
  next?: string
  part: number
  previous?: string
  relatedLink?: {
    slug: string
    title: string
  }
  series: string
  slug: string
  structuredData?: boolean
  tableName?: string
  tableRow?: {
    name: RegExp
    text: string
  }
  title: string
}

const articles: ArticleContract[] = [
  {
    slug: "secure-platform-integration-is-not-plumbing",
    title: "Secure Platform Integration Is Not Plumbing",
    series: "Architecture Control Boundaries",
    part: 1,
    next: "AI Pipelines Need Control Boundaries",
    callout: "Secure platform integration is not plumbing",
    imageAlt: /channels and source systems flowing through an API gateway/i,
    relatedLink: {
      slug: "ai-pipelines-need-control-boundaries",
      title: "AI Pipelines Need Control Boundaries",
    },
    finalText: "Integration layers deserve architectural attention",
  },
  {
    slug: "ai-pipelines-need-control-boundaries",
    title: "AI Pipelines Need Control Boundaries",
    series: "Architecture Control Boundaries",
    part: 2,
    previous: "Secure Platform Integration Is Not Plumbing",
    next: "Software Layers Are Risk Boundaries",
    callout: "AI is not the system of record",
    imageAlt: /sources flowing through preprocessing/i,
    relatedLink: {
      slug: "software-layers-are-risk-boundaries",
      title: "Software Layers Are Risk Boundaries",
    },
    structuredData: true,
    tableName: "AI pipeline failure modes",
    tableRow: {
      name: /Unsafe write-back/,
      text: "Require approval gates and controlled adapter writes",
    },
    finalText: "The practical goal is not to remove AI from the workflow",
  },
  {
    slug: "software-layers-are-risk-boundaries",
    title: "Software Layers Are Risk Boundaries",
    series: "Architecture Control Boundaries",
    part: 3,
    previous: "AI Pipelines Need Control Boundaries",
    imageAlt: /clients flowing into interface and application layers/i,
    relatedLink: {
      slug: "secure-platform-integration-is-not-plumbing",
      title: "Secure Platform Integration Is Not Plumbing",
    },
    finalText: "Software layers are not only a code-organization preference",
  },
  {
    slug: "governance-native-engineering-control-plane",
    title: "Governance-Native Engineering and the AI Control Plane",
    series: "Governance-Native Engineering",
    part: 1,
    next: "Replayability Is a Governance Problem",
    callout: "whether organizations can still govern",
    mermaidTitle: "AI-native engineering control plane",
    mermaidSource: "Human intent",
    finalText:
      "AI-native engineering therefore becomes a systems-governance discipline",
  },
  {
    slug: "replayability-is-a-governance-problem",
    title: "Replayability Is a Governance Problem",
    series: "Governance-Native Engineering",
    part: 2,
    previous: "Governance-Native Engineering and the AI Control Plane",
    next: "Recursive Governance and Agent Workflows",
    callout: "not just reproducibility engineering",
    mermaidTitle: "Replayability as evidence lifecycle",
    mermaidSource: "Replay claim still valid?",
    finalText: "The goal is bounded explainability and attributable execution",
  },
  {
    slug: "recursive-governance-and-agent-workflows",
    title: "Recursive Governance and Agent Workflows",
    series: "Governance-Native Engineering",
    part: 3,
    previous: "Replayability Is a Governance Problem",
    callout: "weakest materially contributing execution boundary",
    mermaidTitle: "Governed recursive execution",
    mermaidSource: "Workflow request",
    finalText:
      "ensuring humans remain capable of comprehension, intervention, replay, audit, and authority governance",
  },
]

function articlePath(article: ArticleContract) {
  return `/blog/${article.slug}`
}

function articleByTitle(title: string) {
  const article = articles.find((candidate) => candidate.title === title)

  if (!article) {
    throw new Error(`Missing article fixture: ${title}`)
  }

  return article
}

async function assertSeriesNavigation(page: Page, article: ArticleContract) {
  const navigation = page.getByRole("navigation", {
    name: `${article.series} series navigation`,
  })

  if (article.previous) {
    await expect(
      navigation.getByRole("link", {
        name: `Previous: ${article.previous}`,
      }),
    ).toHaveAttribute("href", articlePath(articleByTitle(article.previous)))
  } else {
    await expect(
      navigation.getByRole("link", { name: /^Previous:/ }),
    ).toHaveCount(0)
  }

  if (article.next) {
    await expect(
      navigation.getByRole("link", { name: `Next: ${article.next}` }),
    ).toHaveAttribute("href", articlePath(articleByTitle(article.next)))
  } else {
    await expect(
      navigation.getByRole("link", { name: /^Next:/ }),
    ).toHaveCount(0)
  }
}

test.describe("canonical MDX articles", () => {
  for (const article of articles) {
    test(`renders ${article.title}`, async ({ page }) => {
      const response = await page.goto(articlePath(article))

      expect(response?.status()).toBe(200)
      await expect(page).toHaveTitle(`Micrantha Software | ${article.title}`)
      await expect(
        page.getByRole("heading", { level: 1, name: article.title }),
      ).toBeVisible()
      await expect(
        page.getByText(`Part ${article.part} of 3`, { exact: true }),
      ).toBeVisible()

      const content = page.locator('[data-content-source="mdx"]')

      await expect(content).toBeVisible()
      await expect(content).toContainText(article.finalText)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://micrantha.com${articlePath(article)}`,
      )
      await assertSeriesNavigation(page, article)

      if (article.callout) {
        await expect(content.locator(".article-callout")).toContainText(
          article.callout,
        )
      }

      if (article.imageAlt) {
        await expect(
          content.getByRole("img", { name: article.imageAlt }),
        ).toBeVisible()
      }

      if (article.relatedLink) {
        await expect(
          content.getByRole("link", {
            name: article.relatedLink.title,
            exact: true,
          }),
        ).toHaveAttribute("href", `/blog/${article.relatedLink.slug}`)
      }

      if (article.tableName) {
        await expect(
          content.getByRole("table", { name: article.tableName }),
        ).toBeVisible()
      }

      if (article.tableRow) {
        await expect(
          content.getByRole("row", { name: article.tableRow.name }),
        ).toContainText(article.tableRow.text)
      }

      if (article.structuredData) {
        const structuredData = await page
          .locator('script[type="application/ld+json"]')
          .textContent()

        expect(structuredData).toContain('"@type":"Article"')
      }

      if (article.mermaidTitle) {
        const diagram = content.locator("[data-mermaid-diagram]")

        await expect(diagram).toContainText(article.mermaidTitle)
        await expect(diagram).toHaveAttribute(
          "data-mermaid-status",
          "rendered",
          {
            timeout: 15_000,
          },
        )
        await expect(
          diagram.locator("[data-mermaid-rendered] svg"),
        ).toBeVisible()
      }
    })
  }

  test("navigates through the governance series without replacing the document", async ({
    page,
  }) => {
    await page.goto(articlePath(articles[3]))
    await page.evaluate(() => {
      document.documentElement.dataset.navigationMarker = "preserved"
    })

    for (const target of [articles[4], articles[5]]) {
      await page
        .getByRole("navigation", {
          name: "Governance-Native Engineering series navigation",
        })
        .getByRole("link", { name: `Next: ${target.title}` })
        .click()

      await expect(page).toHaveURL(new RegExp(`${articlePath(target)}$`))
      await expect(page.locator("html")).toHaveAttribute(
        "data-navigation-marker",
        "preserved",
      )
      await expect(
        page.getByRole("heading", { level: 1, name: target.title }),
      ).toBeVisible()
      await expect(
        page
          .locator('[data-content-source="mdx"]')
          .locator("[data-mermaid-diagram]"),
      ).toHaveAttribute("data-mermaid-status", "rendered", {
        timeout: 15_000,
      })
    }
  })
})

test("unpublished and unknown blog URLs remain unavailable", async ({
  page,
}) => {
  for (const pathname of [
    "/blog/draft-publication-fixture",
    "/blog/future-publication-fixture",
    "/blog/unknown-article",
  ]) {
    const response = await page.goto(pathname)

    expect(response?.status()).toBe(404)
    await expect(page.getByText("Not Found", { exact: true })).toBeVisible()
    await expect(page.locator('[data-content-source="mdx"]')).toHaveCount(0)
  }
})

test.describe("canonical MDX articles without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  for (const article of articles) {
    test(`server-renders complete ${article.title} content`, async ({
      page,
    }) => {
      const response = await page.goto(articlePath(article))

      expect(response?.status()).toBe(200)
      await expect(
        page.getByRole("heading", { level: 1, name: article.title }),
      ).toBeVisible()

      const content = page.locator('[data-content-source="mdx"]')

      await expect(content).toContainText(article.finalText)

      if (article.imageAlt) {
        await expect(
          content.getByRole("img", { name: article.imageAlt }),
        ).toBeVisible()
      }

      if (article.tableName) {
        await expect(
          content.getByRole("table", { name: article.tableName }),
        ).toBeVisible()
      }

      if (article.mermaidSource) {
        const diagram = content.locator("[data-mermaid-diagram]")

        await expect(diagram).toHaveAttribute("data-mermaid-status", "source")
        await expect(diagram.locator("[data-mermaid-source]")).toContainText(
          article.mermaidSource,
        )
        await expect(diagram.locator("[data-mermaid-rendered]")).toHaveCount(0)
      }
    })
  }
})
