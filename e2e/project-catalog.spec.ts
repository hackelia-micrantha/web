import { expect, test } from "@playwright/test"
import {
  projectCatalog,
  projectBySlug,
  projectRegistrySource,
  projectsByClassification,
} from "../app/data/project-catalog"

const expectedCoreTaxonomy = {
  solution: ["anthesis", "dubnium", "envuscator"],
  laboratory: ["achillea", "myosotis", "repora"],
} as const

test("core ecosystem projects retain canonical classifications", () => {
  for (const [classification, expectedSlugs] of Object.entries(
    expectedCoreTaxonomy,
  )) {
    const actualSlugs = projectsByClassification(
      classification as "solution" | "laboratory",
    ).map((project) => project.slug)

    for (const slug of expectedSlugs) {
      expect(actualSlugs).toContain(slug)
      expect(projectBySlug(slug).source).toBe("canonical")
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

    if (project.source === "presentation-only") {
      expect(project.canonicalId).toBeUndefined()
      expect(project.portfolio).toBeNull()
      expect(project.role).toBeNull()
      expect(project.lifecycle).toBeNull()
    }
  }
})

test("canonical project semantics come from the reviewed registry snapshot", () => {
  expect(projectRegistrySource.repository).toBe(
    "hackelia-micrantha/hackelia-micrantha",
  )
  expect(projectRegistrySource.commit).toMatch(/^[0-9a-f]{40}$/)

  expect(projectBySlug("dubnium")).toMatchObject({
    canonicalId: "dubnium",
    lifecycle: "active",
    portfolio: "featured",
    role: "infrastructure",
  })

  expect(projectBySlug("myosotis")).toMatchObject({
    canonicalId: "myosotis",
    lifecycle: "experimental",
    portfolio: "featured",
    role: "platform",
  })
  expect(projectBySlug("myosotis").summary).toContain("field-operated AI")
})
