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
  expect(collectionPage?.mainEntity?.numberOfItems).toBe(6)
  expect(collectionPage?.mainEntity?.itemListElement?.[0]?.item?.name).toBe(
    "Governance-Native Engineering and the AI Control Plane",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[1]?.item?.name).toBe(
    "Replayability Is a Governance Problem",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[2]?.item?.name).toBe(
    "Recursive Governance and Agent Workflows",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[3]?.item?.name).toBe(
    "Secure Platform Integration Is Not Plumbing",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[4]?.item?.name).toBe(
    "AI Pipelines Need Control Boundaries",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[5]?.item?.name).toBe(
    "Software Layers Are Risk Boundaries",
  )
})
