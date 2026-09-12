import presentationJson from "./project-presentation.json"
import registrySnapshotJson from "./project-registry.snapshot.json"

export type ProjectClassification = "solution" | "laboratory"
export type ProjectPortfolio = "featured" | "supporting" | false | null

export type ProjectDefinition = {
  slug: string
  canonicalId?: string
  source: "canonical" | "presentation-only"
  name: string
  classification: ProjectClassification
  lifecycle: string | null
  portfolio: ProjectPortfolio
  role: string | null
  summary: string
  url: string
  sourceUrl?: string
  architectureRole: string
}

type CanonicalProject = {
  id: string
  name: string
  classification: ProjectClassification | null
  portfolio: ProjectPortfolio
  role: string
  lifecycle: string
}

type CanonicalPresentation = {
  kind: "canonical"
  canonicalId: string
  slug: string
  summary: string
  url: string
  sourceUrl?: string
  architectureRole: string
}

type PresentationOnlyProject = {
  kind: "presentation-only"
  slug: string
  name: string
  collection: ProjectClassification
  summary: string
  url: string
  sourceUrl?: string
  architectureRole: string
}

type PortfolioDisposition = {
  canonicalId: string
  disposition: "shown" | "hidden"
  surfaces?: Array<"catalog" | "homepage">
  rationale?: string
}

type ProjectPresentationConfig = {
  schemaVersion: number
  projects: Array<CanonicalPresentation | PresentationOnlyProject>
  portfolioDispositions: PortfolioDisposition[]
}

type ProjectRegistrySnapshot = {
  schemaVersion: number
  source: {
    repository: string
    registryPath: string
    inventoryPath: string
    commit: string
  }
  excludedPortfolioFamilies: string[]
  projects: CanonicalProject[]
}

const presentation = presentationJson as unknown as ProjectPresentationConfig
const registrySnapshot = registrySnapshotJson as unknown as ProjectRegistrySnapshot

const canonicalById = new Map(
  registrySnapshot.projects.map((project) => [project.id, project]),
)

export const projectRegistrySource = registrySnapshot.source
export const excludedPortfolioFamilies =
  registrySnapshot.excludedPortfolioFamilies
export const canonicalProjects = registrySnapshot.projects
export const portfolioDispositions = presentation.portfolioDispositions

export const projectCollectionDescriptions = {
  solution:
    "Micrantha deployable systems, distributions, tools, and platforms for governed agentic development, mobile engineering, and secure delivery.",
  laboratory:
    "Micrantha testbeds and experimental projects that validate contracts, integrations, and emerging engineering capabilities.",
} as const satisfies Record<ProjectClassification, string>

export const projectCatalog: readonly ProjectDefinition[] =
  presentation.projects.map((project) => {
    if (project.kind === "presentation-only") {
      return {
        slug: project.slug,
        source: "presentation-only" as const,
        name: project.name,
        classification: project.collection,
        lifecycle: null,
        portfolio: null,
        role: null,
        summary: project.summary,
        url: project.url,
        sourceUrl: project.sourceUrl,
        architectureRole: project.architectureRole,
      }
    }

    const canonical = canonicalById.get(project.canonicalId)

    if (!canonical) {
      throw new Error(
        `Unknown canonical project in presentation config: ${project.canonicalId}`,
      )
    }

    if (!canonical.classification) {
      throw new Error(
        `Canonical project ${project.canonicalId} cannot be placed in the solution/laboratory catalog without a classification`,
      )
    }

    return {
      slug: project.slug,
      canonicalId: canonical.id,
      source: "canonical" as const,
      name: canonical.name,
      classification: canonical.classification,
      lifecycle: canonical.lifecycle,
      portfolio: canonical.portfolio,
      role: canonical.role,
      summary: project.summary,
      url: project.url,
      sourceUrl: project.sourceUrl,
      architectureRole: project.architectureRole,
    }
  })

export type ProjectSlug = string

const homepageCanonicalIds = new Set(
  portfolioDispositions
    .filter(
      (entry) =>
        entry.disposition === "shown" && entry.surfaces?.includes("homepage"),
    )
    .map((entry) => entry.canonicalId),
)

const homepageProjects = projectCatalog.filter(
  (project) =>
    project.source === "canonical" &&
    project.canonicalId &&
    project.portfolio === "featured" &&
    homepageCanonicalIds.has(project.canonicalId),
)

export const featuredHomepageProjectSlugs = {
  solution: homepageProjects
    .filter((project) => project.classification === "solution")
    .map((project) => project.slug),
  laboratory: homepageProjects
    .filter((project) => project.classification === "laboratory")
    .map((project) => project.slug),
} satisfies Record<ProjectClassification, readonly ProjectSlug[]>

export const projectsByClassification = (
  classification: ProjectClassification,
) =>
  projectCatalog.filter((project) => project.classification === classification)

export const projectBySlug = (slug: ProjectSlug) => {
  const project = projectCatalog.find((candidate) => candidate.slug === slug)

  if (!project) {
    throw new Error(`Unknown project slug: ${slug}`)
  }

  return project
}
