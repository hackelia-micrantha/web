import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const allowedClassifications = new Set(["solution", "laboratory", null])
const allowedPortfolio = new Set(["featured", "supporting", false, null])
const allowedSurfaces = new Set(["catalog", "homepage"])
const canonicalFields = ["name", "portfolio", "classification", "role", "lifecycle"]
const publicSnapshotFields = new Set([
  "id",
  "name",
  "classification",
  "portfolio",
  "role",
  "lifecycle",
])
const snapshotTopLevelFields = new Set([
  "schemaVersion",
  "source",
  "excludedPortfolioFamilies",
  "projects",
])
const snapshotSourceFields = new Set([
  "repository",
  "registryPath",
  "inventoryPath",
  "commit",
])
const canonicalSnapshotSource = {
  repository: "hackelia-micrantha/hackelia-micrantha",
  registryPath: "registry/projects.yaml",
  inventoryPath: "registry/inventory.md",
}

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const unique = (values) => new Set(values).size === values.length

const assertOnlyFields = (value, allowed, label) => {
  for (const field of Object.keys(value)) {
    assert(allowed.has(field), `${label} contains non-public field ${field}`)
  }
}

const excludedFamilyFor = (slug, families) =>
  families.find((family) => slug === family || slug.startsWith(`${family}-`))

export const normalizeProjectRegistryProjection = (snapshot, presentation) => ({
  source: snapshot.source,
  excludedPortfolioFamilies: [...snapshot.excludedPortfolioFamilies].sort(),
  projects: [...snapshot.projects].sort((a, b) => a.id.localeCompare(b.id)),
  presentationProjects: [...presentation.projects].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  ),
  portfolioDispositions: [...presentation.portfolioDispositions].sort((a, b) =>
    a.canonicalId.localeCompare(b.canonicalId),
  ),
})

export const validateProjectRegistryProjection = (snapshot, presentation) => {
  assert(snapshot.schemaVersion === 1, "unsupported project-registry snapshot schema")
  assert(presentation.schemaVersion === 1, "unsupported project-presentation schema")
  assertOnlyFields(snapshot, snapshotTopLevelFields, "project-registry snapshot")
  assertOnlyFields(snapshot.source, snapshotSourceFields, "project-registry source")
  assert(
    snapshot.source?.repository === canonicalSnapshotSource.repository,
    `project-registry snapshot must use canonical source repository ${canonicalSnapshotSource.repository}`,
  )
  assert(
    snapshot.source?.registryPath === canonicalSnapshotSource.registryPath,
    `project-registry snapshot must use canonical registry path ${canonicalSnapshotSource.registryPath}`,
  )
  assert(
    snapshot.source?.inventoryPath === canonicalSnapshotSource.inventoryPath,
    `project-registry snapshot must use canonical inventory path ${canonicalSnapshotSource.inventoryPath}`,
  )
  assert(
    /^[0-9a-f]{40}$/.test(snapshot.source?.commit ?? ""),
    "project-registry snapshot must pin a canonical 40-character commit",
  )

  const ids = snapshot.projects.map((project) => project.id)
  assert(unique(ids), "canonical project ids must be unique")

  const canonicalById = new Map(snapshot.projects.map((project) => [project.id, project]))
  for (const project of snapshot.projects) {
    assertOnlyFields(
      project,
      publicSnapshotFields,
      `canonical project ${project.id ?? "<missing>"}`,
    )
    assert(project.id?.trim(), "canonical project id must be non-empty")
    assert(project.name?.trim(), `canonical project ${project.id} must have a name`)
    assert(project.role?.trim(), `canonical project ${project.id} must have a role`)
    assert(
      project.lifecycle?.trim(),
      `canonical project ${project.id} must have a lifecycle`,
    )
    assert(
      allowedClassifications.has(project.classification),
      `canonical project ${project.id} has unsupported classification`,
    )
    assert(
      allowedPortfolio.has(project.portfolio),
      `canonical project ${project.id} has unsupported portfolio tier`,
    )
  }

  assert(
    unique(snapshot.excludedPortfolioFamilies),
    "excluded portfolio families must be unique",
  )
  for (const project of snapshot.projects) {
    const excludedFamily = excludedFamilyFor(
      project.id,
      snapshot.excludedPortfolioFamilies,
    )
    assert(
      !excludedFamily,
      `canonical project ${project.id} belongs to explicitly excluded portfolio family ${excludedFamily}`,
    )
  }

  const slugs = presentation.projects.map((project) => project.slug)
  assert(unique(slugs), "presentation project slugs must be unique")

  const canonicalPresentationIds = new Set()
  for (const project of presentation.projects) {
    assert(project.slug?.trim(), "presentation project slug must be non-empty")
    assert(project.summary?.trim(), `presentation project ${project.slug} needs summary`)
    assert(
      project.architectureRole?.trim(),
      `presentation project ${project.slug} needs architectureRole`,
    )
    assert(
      project.url?.startsWith("https://") || project.url?.startsWith("/"),
      `presentation project ${project.slug} has invalid url`,
    )

    if (project.kind === "canonical") {
      const canonical = canonicalById.get(project.canonicalId)
      assert(
        canonical,
        `presentation project ${project.slug} references unknown canonical project ${project.canonicalId}`,
      )
      assert(
        canonical.classification === "solution" ||
          canonical.classification === "laboratory",
        `canonical presentation project ${project.canonicalId} requires a solution/laboratory classification`,
      )
      assert(
        !canonicalPresentationIds.has(project.canonicalId),
        `canonical project ${project.canonicalId} has multiple presentation entries`,
      )
      for (const field of canonicalFields) {
        assert(
          !(field in project),
          `presentation project ${project.slug} must not override canonical field ${field}`,
        )
      }
      canonicalPresentationIds.add(project.canonicalId)
      continue
    }

    assert(
      project.kind === "presentation-only",
      `presentation project ${project.slug} has unsupported kind`,
    )
    assert(project.name?.trim(), `presentation-only project ${project.slug} needs name`)
    assert(
      allowedClassifications.has(project.collection) && project.collection !== null,
      `presentation-only project ${project.slug} needs solution/laboratory collection`,
    )
    assert(
      !canonicalById.has(project.slug),
      `presentation-only project ${project.slug} collides with a canonical project id`,
    )
    const excludedFamily = excludedFamilyFor(
      project.slug,
      snapshot.excludedPortfolioFamilies,
    )
    assert(
      !excludedFamily,
      `presentation project ${project.slug} belongs to explicitly excluded portfolio family ${excludedFamily}`,
    )
    for (const field of ["portfolio", "classification", "role", "lifecycle", "canonicalId"]) {
      assert(
        !(field in project),
        `presentation-only project ${project.slug} must not declare canonical field ${field}`,
      )
    }
  }

  const dispositionIds = presentation.portfolioDispositions.map(
    (entry) => entry.canonicalId,
  )
  assert(unique(dispositionIds), "portfolio dispositions must be unique by canonicalId")

  const dispositionById = new Map(
    presentation.portfolioDispositions.map((entry) => [entry.canonicalId, entry]),
  )
  const portfolioProjects = snapshot.projects.filter(
    (project) => project.portfolio === "featured" || project.portfolio === "supporting",
  )

  for (const project of portfolioProjects) {
    assert(
      dispositionById.has(project.id),
      `portfolio project ${project.id} is missing an explicit web disposition`,
    )
  }

  for (const disposition of presentation.portfolioDispositions) {
    const canonical = canonicalById.get(disposition.canonicalId)
    assert(
      canonical,
      `portfolio disposition references unknown canonical project ${disposition.canonicalId}`,
    )
    assert(
      canonical.portfolio === "featured" || canonical.portfolio === "supporting",
      `canonical project ${disposition.canonicalId} does not have a portfolio tier`,
    )

    if (disposition.disposition === "hidden") {
      assert(
        disposition.rationale?.trim(),
        `hidden portfolio project ${disposition.canonicalId} requires rationale`,
      )
      assert(
        !disposition.surfaces || disposition.surfaces.length === 0,
        `hidden portfolio project ${disposition.canonicalId} must not declare surfaces`,
      )
      assert(
        !canonicalPresentationIds.has(disposition.canonicalId),
        `hidden portfolio project ${disposition.canonicalId} must not have a canonical presentation entry`,
      )
      continue
    }

    assert(
      disposition.disposition === "shown",
      `portfolio project ${disposition.canonicalId} has unsupported disposition`,
    )
    assert(
      Array.isArray(disposition.surfaces) && disposition.surfaces.length > 0,
      `shown portfolio project ${disposition.canonicalId} requires surfaces`,
    )
    assert(
      unique(disposition.surfaces),
      `portfolio project ${disposition.canonicalId} must not repeat surfaces`,
    )
    assert(
      disposition.surfaces.every((surface) => allowedSurfaces.has(surface)),
      `portfolio project ${disposition.canonicalId} has unsupported surface`,
    )
    assert(
      disposition.surfaces.includes("catalog"),
      `shown portfolio project ${disposition.canonicalId} must include the catalog surface`,
    )
    assert(
      canonicalPresentationIds.has(disposition.canonicalId),
      `shown portfolio project ${disposition.canonicalId} requires a canonical presentation entry`,
    )

    if (disposition.surfaces.includes("homepage")) {
      assert(
        canonical.portfolio === "featured",
        `homepage project ${disposition.canonicalId} must be canonical featured`,
      )
      assert(
        canonical.classification === "solution" ||
          canonical.classification === "laboratory",
        `homepage project ${disposition.canonicalId} requires a canonical classification`,
      )
    }
  }

  return normalizeProjectRegistryProjection(snapshot, presentation)
}

export const loadProjectRegistryProjection = () => {
  const snapshot = JSON.parse(
    fs.readFileSync(path.join(root, "app/data/project-registry.snapshot.json"), "utf8"),
  )
  const presentation = JSON.parse(
    fs.readFileSync(path.join(root, "app/data/project-presentation.json"), "utf8"),
  )

  return { snapshot, presentation }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { snapshot, presentation } = loadProjectRegistryProjection()
  validateProjectRegistryProjection(snapshot, presentation)
  console.log(
    `project registry projection valid: ${snapshot.projects.length} canonical projects, ${presentation.portfolioDispositions.length} portfolio dispositions`,
  )
}
