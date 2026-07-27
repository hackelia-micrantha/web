import { expect, test } from "@playwright/test"
import {
  projectCatalog,
  projectsByClassification,
} from "../app/data/project-catalog"

const expectedCoreTaxonomy = {
  solution: ["anthesis", "dubnium", "envuscator"],
  laboratory: [
    "anthesis-governance-lab",
    "dubnium-governed-agent-demo",
    "eyespie",
  ],
} as const

test("core ecosystem projects retain their intended classifications", () => {
  for (const [classification, expectedSlugs] of Object.entries(
    expectedCoreTaxonomy,
  )) {
    const actualSlugs = projectsByClassification(
      classification as "solution" | "laboratory",
    ).map((project) => project.slug)

    for (const slug of expectedSlugs) {
      expect(actualSlugs).toContain(slug)
    }
  }
})

test("project catalog identifiers and public URLs are valid", () => {
  const slugs = projectCatalog.map((project) => project.slug)
  const names = projectCatalog.map((project) => project.name)

  expect(new Set(slugs).size).toBe(slugs.length)
  expect(new Set(names).size).toBe(names.length)

  for (const project of projectCatalog) {
    expect(project.summary.trim().length).toBeGreaterThan(0)
    expect(project.architectureRole.trim().length).toBeGreaterThan(0)
    expect(
      project.url.startsWith("https://") || project.url.startsWith("/"),
    ).toBe(true)

    if (project.sourceUrl) {
      expect(project.sourceUrl.startsWith("https://")).toBe(true)
    }
  }
})
