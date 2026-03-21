import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

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

test("/solutions exposes CollectionPage structured data", async ({ page }) => {
  await page.goto("/solutions")

  await expect(page.getByRole("heading", { name: "Solutions" })).toBeVisible()

  const structuredData = await getStructuredData(page)
  const collectionPage = structuredData.find(
    (entry) =>
      entry["@type"] === "CollectionPage" &&
      entry.url === "https://micrantha.com/solutions",
  )

  expect(collectionPage).toBeTruthy()
  expect(collectionPage?.name).toBe("Solutions")
  expect(collectionPage?.mainEntity?.["@type"]).toBe("ItemList")
  expect(collectionPage?.mainEntity?.numberOfItems).toBe(4)
  expect(collectionPage?.mainEntity?.itemListElement?.[0]?.position).toBe(1)
  expect(collectionPage?.mainEntity?.itemListElement?.[0]?.item?.name).toBe(
    "Amaryllis",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[1]?.item?.name).toBe(
    "Anthesis",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[2]?.item?.name).toBe(
    "Fortunes Service",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[3]?.item?.name).toBe(
    "Veil",
  )
})

test("/laboratory exposes CollectionPage structured data", async ({ page }) => {
  await page.goto("/laboratory")

  await expect(page.getByRole("heading", { name: "Laboratory" })).toBeVisible()

  const structuredData = await getStructuredData(page)
  const collectionPage = structuredData.find(
    (entry) =>
      entry["@type"] === "CollectionPage" &&
      entry.url === "https://micrantha.com/laboratory",
  )

  expect(collectionPage).toBeTruthy()
  expect(collectionPage?.name).toBe("Laboratory")
  expect(collectionPage?.mainEntity?.["@type"]).toBe("ItemList")
  expect(collectionPage?.mainEntity?.numberOfItems).toBe(8)
  expect(collectionPage?.mainEntity?.itemListElement?.[0]?.position).toBe(1)
  expect(collectionPage?.mainEntity?.itemListElement?.[0]?.item?.name).toBe(
    "Project Hyperion",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[1]?.item?.name).toBe(
    "Project Anthesis",
  )
  expect(collectionPage?.mainEntity?.itemListElement?.[7]?.item?.name).toBe(
    "Compost",
  )
})
