import { expect, test } from "@playwright/test"
import {
  featuredHomepageProjectSlugs,
  projectBySlug,
  projectCollectionDescriptions,
} from "../app/data/project-catalog"

for (const classification of ["solution", "laboratory"] as const) {
  test(`homepage ${classification} features retain their catalog classification`, () => {
    for (const slug of featuredHomepageProjectSlugs[classification]) {
      expect(projectBySlug(slug).classification).toBe(classification)
    }
  })
}

test("homepage project cards resolve identity and copy from the catalog", async ({
  page,
}) => {
  await page.goto("/")

  for (const [classification, sectionId] of [
    ["solution", "solutions"],
    ["laboratory", "laboratory"],
  ] as const) {
    const section = page.locator(`#${sectionId}`)

    for (const slug of featuredHomepageProjectSlugs[classification]) {
      const project = projectBySlug(slug)
      const projectLink = section.locator("a", {
        has: section.getByRole("heading", {
          name: project.name,
          exact: true,
        }),
      })

      await expect(projectLink).toHaveAttribute("href", project.url)
      await expect(section.getByText(project.summary, { exact: true })).toBeVisible()
    }
  }
})

test("homepage JSON-LD uses shared collection taxonomy descriptions", async ({
  page,
}) => {
  await page.goto("/")

  const jsonLdText = await page
    .locator('script[type="application/ld+json"]')
    .textContent()
  const structuredData = JSON.parse(jsonLdText ?? "[]") as Array<{
    "@type"?: string
    url?: string
    mainEntity?: {
      itemListElement?: Array<{
        item?: {
          name?: string
          description?: string
        }
      }>
    }
  }>
  const homepage = structuredData.find(
    (entry) =>
      entry["@type"] === "CollectionPage" &&
      entry.url === "https://micrantha.com/",
  )
  const items = homepage?.mainEntity?.itemListElement ?? []
  const descriptionFor = (name: string) =>
    items.find((entry) => entry.item?.name === name)?.item?.description

  expect(descriptionFor("Solutions")).toBe(
    projectCollectionDescriptions.solution,
  )
  expect(descriptionFor("Laboratory")).toBe(
    projectCollectionDescriptions.laboratory,
  )
})
