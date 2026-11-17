import { expect, test } from "@playwright/test"

const articlePath = "/blog/ai-native-sdlc-governed-software-delivery"
const canonicalUrl =
  "https://ryanjennin.gs/posts/ai-native-sdlc-governed-software-delivery/"
const coverUrl =
  "https://micrantha.com/img/blog/ai-native-sdlc-governed-software-delivery.webp"
const title = "From AI-Native SDLC to Governed Software Delivery"
const coverAlt =
  "Pastel layered software delivery pipeline connecting code, verification, security controls, and organizational governance."

test("AI-Native SDLC crosspost renders with personal canonical, original authorship and cover", async ({
  page,
}) => {
  const response = await page.goto(articlePath)
  expect(response?.status()).toBe(200)

  await expect(
    page.getByRole("heading", { name: title, level: 1 }),
  ).toBeVisible()
  await expect(page.locator('[data-content-source="mdx"]')).toContainText(
    "The scarce resource becomes confidence",
  )
  await expect(page.getByRole("img", { name: coverAlt })).toBeVisible()

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    canonicalUrl,
  )
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    coverUrl,
  )
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    coverAlt,
  )
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    coverUrl,
  )
  await expect(
    page.getByRole("link", { name: "the personal edition" }),
  ).toHaveAttribute("href", canonicalUrl)

  const ldText = await page
    .locator('script[type="application/ld+json"]')
    .textContent()
  expect(ldText).not.toBeNull()
  const ld = JSON.parse(ldText ?? "[]") as Array<Record<string, unknown>>
  const article = ld.find((item) => item["@type"] === "Article")
  expect(article).toBeTruthy()
  expect(article?.author).toEqual({
    "@type": "Person",
    name: "Ryan Jennings",
  })
  expect(article?.isBasedOn).toBe(canonicalUrl)
  expect(article?.image).toEqual([coverUrl])
  expect(article?.url).toBe("https://micrantha.com" + articlePath)
})

test.describe("crosspost server rendering without client JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("preserves body, original attribution, and readable Mermaid source", async ({
    page,
  }) => {
    const response = await page.goto(articlePath)
    expect(response?.status()).toBe(200)

    await expect(
      page.getByRole("heading", { name: title, level: 1 }),
    ).toBeVisible()
    const content = page.locator('[data-content-source="mdx"]')
    await expect(content).toContainText(
      "The scarce resource becomes confidence",
    )
    await expect(content.getByRole("img", { name: coverAlt })).toBeVisible()
    await expect(
      content.getByRole("link", { name: "the personal edition" }),
    ).toHaveAttribute("href", canonicalUrl)

    const mermaid = content.locator("[data-mermaid-diagram]").first()
    await expect(mermaid).toHaveAttribute("data-mermaid-status", "source")
    await expect(mermaid.locator("[data-mermaid-source]")).toContainText(
      "AI-native macro lifecycle",
    )
    await expect(mermaid.locator("[data-mermaid-rendered]")).toHaveCount(0)
  })
})

test("other unapproved crossposts remain inaccessible", async ({ page }) => {
  for (const slug of [
    "threat-modeling-ai-engineering-coprocessor",
    "legacy-system-insights",
    "secure-auth-systems-reference",
    "the-envelope-contract-based-agentic-ai",
    "ai-chat-not-a-database",
  ]) {
    const response = await page.goto("/blog/" + slug)
    expect(response?.status()).toBe(404)
    await expect(page.locator('[data-content-source="mdx"]')).toHaveCount(0)
  }
})
