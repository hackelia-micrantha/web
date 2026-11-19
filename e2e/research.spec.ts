import { expect, test } from "@playwright/test"
import { researchIndex } from "../app/data/research-index.generated.js"

test("research index preserves the edition totals, ranks and source links", async ({
  page,
}) => {
  await page.goto("/blog")
  await page.getByRole("link", { name: "Research index", exact: true }).click()
  await expect(page).toHaveURL(/\/research$/u)
  await expect(
    page.getByRole("heading", { name: "Research", level: 1 }),
  ).toBeVisible()

  const coverage = page.getByRole("region", { name: "Research coverage" })
  for (const [label, value] of [
    ["Tracked records", researchIndex.coverage.tracked],
    ["Marked reviewed", researchIndex.coverage.marked_reviewed],
    [
      "Editorial candidates screened",
      researchIndex.ranking.screened_candidates,
    ],
    ["Featured selections", researchIndex.featured.length],
  ] as const) {
    const metric = coverage.getByText(label, { exact: true }).locator("..")
    await expect(metric.locator("dd")).toHaveText(String(value))
  }
  await expect(
    coverage.getByText(researchIndex.coverage.definition),
  ).toBeVisible()
  const entries = page.locator("[data-research-entry]")
  await expect(entries).toHaveCount(researchIndex.featured.length)
  for (const [i, entry] of researchIndex.featured.entries()) {
    const card = entries.nth(i)
    await expect(card).toHaveAttribute("data-research-entry", entry.id)
    await expect(card).toHaveAttribute("data-rank", String(entry.rank))
    await expect(card.getByRole("link", { name: entry.title })).toHaveAttribute(
      "href",
      entry.source_url,
    )
    await expect(
      card.getByText(entry.limitation, { exact: false }),
    ).toBeVisible()
    await expect(
      card.getByText(entry.review_basis, { exact: false }),
    ).toBeVisible()
  }
  const topic = researchIndex.featured[0].theme
  await page.getByLabel("Filter by topic").selectOption(topic)
  const matching = researchIndex.featured.filter(
    (entry) => entry.theme === topic,
  )
  await expect(entries).toHaveCount(matching.length)
  await expect(entries.first()).toHaveAttribute(
    "data-rank",
    String(matching[0].rank),
  )
  await page.getByLabel("Filter by topic").selectOption("")
  await expect(entries).toHaveCount(researchIndex.featured.length)
  await expect(page.getByRole("link", { name: "CC-BY-4.0" })).toHaveAttribute(
    "href",
    researchIndex.license_url,
  )
})

test("research index is server-rendered without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto("/research")
    await expect(
      page.getByRole("heading", { name: "Ranked editorial selections" }),
    ).toBeVisible()
    await expect(page.locator("[data-research-entry]")).toHaveCount(
      researchIndex.featured.length,
    )
  } finally {
    await context.close()
  }
})
