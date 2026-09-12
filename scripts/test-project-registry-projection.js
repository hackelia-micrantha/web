import assert from "node:assert/strict"
import {
  loadProjectRegistryProjection,
  normalizeProjectRegistryProjection,
  validateProjectRegistryProjection,
} from "./project-registry-projection.js"

const clone = (value) => structuredClone(value)
const { snapshot, presentation } = loadProjectRegistryProjection()

assert.doesNotThrow(() =>
  validateProjectRegistryProjection(clone(snapshot), clone(presentation)),
)

const reversedSnapshot = clone(snapshot)
reversedSnapshot.projects.reverse()
reversedSnapshot.excludedPortfolioFamilies.reverse()
const reversedPresentation = clone(presentation)
reversedPresentation.projects.reverse()
reversedPresentation.portfolioDispositions.reverse()

assert.deepEqual(
  normalizeProjectRegistryProjection(snapshot, presentation),
  normalizeProjectRegistryProjection(reversedSnapshot, reversedPresentation),
)

{
  const broken = clone(presentation)
  broken.projects.find((project) => project.kind === "canonical").canonicalId =
    "missing-project"
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    /unknown canonical project/,
  )
}

{
  const broken = clone(presentation)
  broken.projects.find((project) => project.kind === "canonical").lifecycle = "stable"
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    /must not override canonical field lifecycle/,
  )
}

{
  const brokenSnapshot = clone(snapshot)
  brokenSnapshot.projects[0].repository = "private-owner/private-repo"
  assert.throws(
    () => validateProjectRegistryProjection(brokenSnapshot, clone(presentation)),
    /contains non-public field repository/,
  )
}

{
  const brokenSnapshot = clone(snapshot)
  brokenSnapshot.source.repository = "other-owner/other-registry"
  assert.throws(
    () => validateProjectRegistryProjection(brokenSnapshot, clone(presentation)),
    /must use canonical source repository hackelia-micrantha\/hackelia-micrantha/,
  )
}

{
  const broken = clone(presentation)
  broken.projects.push({
    ...broken.projects.find(
      (project) =>
        project.kind === "canonical" && project.canonicalId === "anthesis",
    ),
    slug: "anthesis-duplicate",
  })
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    /canonical project anthesis has multiple presentation entries/,
  )
}

{
  const broken = clone(presentation)
  broken.projects.push({
    kind: "canonical",
    canonicalId: "invokrum",
    slug: "invokrum",
    summary: "Unclassified canonical projects cannot enter the current catalogue.",
    url: "/invokrum",
    architectureRole: "Invalid unclassified catalogue entry",
  })
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    /canonical presentation project invokrum requires a solution\/laboratory classification/,
  )
}

{
  const broken = clone(presentation)
  broken.projects.push({
    kind: "canonical",
    canonicalId: "phyllotaxis",
    slug: "phyllotaxis",
    summary: "Hidden portfolio projects must not leak into the catalogue.",
    url: "/phyllotaxis",
    architectureRole: "Invalid hidden catalogue entry",
  })
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    /hidden portfolio project phyllotaxis must not have a canonical presentation entry/,
  )
}

{
  const broken = clone(presentation)
  broken.projects.push({
    kind: "presentation-only",
    slug: "phyllotaxis",
    name: "Phyllotaxis Override",
    collection: "laboratory",
    summary: "Must use canonical identity instead of presentation-only bypass.",
    url: "/phyllotaxis",
    architectureRole: "Invalid canonical bypass",
  })
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    /presentation-only project phyllotaxis collides with a canonical project id/,
  )
}

for (const slug of ["garden", "garden-library", "scouter-backend"]) {
  const broken = clone(presentation)
  broken.projects.push({
    kind: "presentation-only",
    slug,
    name: `Excluded ${slug}`,
    collection: "solution",
    summary: "Should remain outside portfolio and public project scope.",
    url: `/${slug}`,
    architectureRole: "Excluded historical project family",
  })
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    new RegExp(`presentation project ${slug} belongs to explicitly excluded portfolio family`),
  )
}

{
  const brokenSnapshot = clone(snapshot)
  brokenSnapshot.projects.push({
    id: "scouter-revival",
    name: "Scouter Revival",
    classification: "solution",
    portfolio: "featured",
    role: "solution",
    lifecycle: "experimental",
  })
  assert.throws(
    () => validateProjectRegistryProjection(brokenSnapshot, clone(presentation)),
    /canonical project scouter-revival belongs to explicitly excluded portfolio family scouter/,
  )
}

{
  const broken = clone(presentation)
  broken.portfolioDispositions = broken.portfolioDispositions.filter(
    (entry) => entry.canonicalId !== "anthesis",
  )
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    /anthesis is missing an explicit web disposition/,
  )
}

{
  const broken = clone(presentation)
  broken.portfolioDispositions.find(
    (entry) => entry.canonicalId === "anthesis",
  ).surfaces = ["homepage"]
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    /shown portfolio project anthesis must include the catalog surface/,
  )
}

{
  const broken = clone(presentation)
  broken.portfolioDispositions.push({
    canonicalId: "envuscator",
    disposition: "shown",
    surfaces: ["catalog", "homepage"],
  })
  assert.throws(
    () => validateProjectRegistryProjection(clone(snapshot), broken),
    /envuscator does not have a portfolio tier/,
  )
}

console.log("project registry projection drift tests passed")
