import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import { projectsByClassification } from "../app/data/project-catalog"

type StructuredDataEntry = {
  "@type"?: string
  url?: string
  name?: string
  mainEntity?: {
    "@type"?: string
    numberOfItems?: number
    itemListElement?: Array<{
      position?: number
      url?: string
      item?: {
        name?: string
      }
    }>
  }
}

async function getStructuredData(page: Page) {
  const jsonLdText = await page
    .locator('script[type="application/ld+json"]')
    .textContent()

  expect(jsonLdText).not.toBeNull()

  return JSON.parse(jsonLdText ?? "[]") as StructuredDataEntry[]
}

for (const collection of [
  {
    path: "/solutions",
    name: "Solutions",
    classification: "solution" as const,
  },
  {
    path: "/laboratory",
    name: "Laboratory",
    classification: "laboratory" as const,
  },
]) {
  test(`${collection.path} exposes catalog-backed CollectionPage structured data`, async ({
    page,
  }) => {
    await page.goto(collection.path)

    await expect(
      page.getByRole("heading", { name: collection.name }),
    ).toBeVisible()

    const expectedProjects = projectsByClassification(collection.classification)
    const structuredData = await getStructuredData(page)
    const collectionPage = structuredData.find(
      (entry) =>
        entry["@type"] === "CollectionPage" &&
        entry.url === `https://micrantha.com${collection.path}`,
    )

    expect(collectionPage).toBeTruthy()
    expect(collectionPage?.name).toBe(collection.name)
    expect(collectionPage?.mainEntity?.["@type"]).toBe("ItemList")
    expect(collectionPage?.mainEntity?.numberOfItems).toBe(
      expectedProjects.length,
    )
    expect(
      collectionPage?.mainEntity?.itemListElement?.map(
        (entry) => entry.item?.name,
      ),
    ).toEqual(expectedProjects.map((project) => project.name))
    expect(
      collectionPage?.mainEntity?.itemListElement?.map(
        (entry) => entry.position,
      ),
    ).toEqual(expectedProjects.map((_, index) => index + 1))
    expect(
      collectionPage?.mainEntity?.itemListElement?.map((entry) => entry.url),
    ).toEqual(
      expectedProjects.map((project) =>
        new URL(project.url, "https://micrantha.com").toString(),
      ),
    )
  })
}

test("/blog exposes CollectionPage structured data", async ({ page }) => {
  await page.goto("/blog")

  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible()

  const structuredData = await getStructuredData(page)
  const collectionPage = structuredData.find(
    (entry) =>
      entry["@type"] === "CollectionPage" &&
      entry.url === "https://micrantha.com/blog",
  )

  expect(collectionPage).toBeTruthy()
  expect(collectionPage?.name).toBe("Blog")
  expect(collectionPage?.mainEntity?.["@type"]).toBe("ItemList")

  // Compare structured data with rendered cards instead of a fixed publication count.
  const cards = await page
    .getByRole("region", { name: "All published notes" })
    .locator("a:has(h2)")
    .evaluateAll((anchors) =>
      anchors.map((anchor) => ({
        name: anchor.querySelector("h2")?.textContent?.trim(),
        url: (anchor as HTMLAnchorElement).href,
      })),
    )
  expect(cards.length).toBeGreaterThan(0)

  const list = collectionPage?.mainEntity?.itemListElement ?? []
  expect(collectionPage?.mainEntity?.numberOfItems).toBe(cards.length)
  expect(list.map((entry) => entry.item?.name)).toEqual(
    cards.map((card) => card.name),
  )
  expect(list.map((entry) => entry.url)).toEqual(cards.map((card) => card.url))
  expect(list.map((entry) => entry.position)).toEqual(
    cards.map((_, index) => index + 1),
  )
})
