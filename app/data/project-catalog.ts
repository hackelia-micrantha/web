export type ProjectClassification = "solution" | "laboratory"

export type ProjectMaturity =
  | "prototype"
  | "incubating"
  | "stable"
  | "maintained"

export type ProjectDefinition = {
  slug: string
  name: string
  classification: ProjectClassification
  maturity: ProjectMaturity
  summary: string
  url: string
  sourceUrl?: string
  architectureRole: string
}

export const projectCollectionDescriptions = {
  solution:
    "Micrantha deployable systems, distributions, tools, and platforms for governed agentic development, mobile engineering, and secure delivery.",
  laboratory:
    "Micrantha testbeds and experimental projects that validate contracts, integrations, and emerging engineering capabilities.",
} as const satisfies Record<ProjectClassification, string>

export const projectCatalog = [
  {
    slug: "amaryllis",
    name: "Amaryllis",
    classification: "solution",
    maturity: "prototype",
    summary:
      "A React Native and mobile inference toolkit for privacy-conscious on-device ML and AI-enabled components.",
    url: "https://amaryllis.micrantha.com",
    architectureRole: "Mobile inference SDK and component toolkit",
  },
  {
    slug: "anthesis",
    name: "Anthesis",
    classification: "solution",
    maturity: "incubating",
    summary:
      "A deterministic governance and provenance platform for evaluating agent actions, approvals, and evidence.",
    url: "https://anthesis.micrantha.com",
    architectureRole: "Governance decision and provenance authority",
  },
  {
    slug: "dubnium",
    name: "Dubnium",
    classification: "solution",
    maturity: "incubating",
    summary:
      "Micrantha's reproducible, local-first distribution for agentic software development and operations.",
    url: "https://github.com/hackelia-micrantha/dubnium-community",
    sourceUrl: "https://github.com/ryjen/dubnium",
    architectureRole:
      "Agentic development distribution and bounded execution environment",
  },
  {
    slug: "envuscator",
    name: "Envuscator",
    classification: "solution",
    maturity: "incubating",
    summary:
      "A mobile build-time obfuscation layer delivered through a local CLI and licensed GitHub Actions and GitLab CI/CD adapters.",
    url: "https://envuscator.micrantha.com",
    sourceUrl: "https://github.com/hackelia-micrantha/envuscator-community",
    architectureRole: "Customer-runner mobile build protection",
  },
  {
    slug: "fortunes",
    name: "Fortunes Service",
    classification: "solution",
    maturity: "stable",
    summary:
      "A microservice, progressive web app, and Slack integration for UNIX fortunes.",
    url: "https://fortunes.micrantha.com",
    architectureRole: "Service and delivery-pattern reference implementation",
  },
  {
    slug: "veil",
    name: "Veil",
    classification: "solution",
    maturity: "prototype",
    summary: "An image-obfuscation and privacy utility service.",
    url: "https://veil.micrantha.com",
    architectureRole: "Image concealment and privacy utility",
  },
  {
    slug: "anthesis-governance-lab",
    name: "Anthesis Governance Lab",
    classification: "laboratory",
    maturity: "incubating",
    summary:
      "A public executable testbed for Anthesis contracts, canonical policy scenarios, adversarial cases, and integration compatibility.",
    url: "https://github.com/ryjen/anthesis-governance-lab",
    architectureRole: "Governance contract and evaluator testbed",
  },
  {
    slug: "dubnium-governed-agent-demo",
    name: "Dubnium Governed Agent Demo",
    classification: "laboratory",
    maturity: "prototype",
    summary:
      "A vertical integration testbed placing Anthesis decisions and approvals in front of Dubnium's bounded executor.",
    url: "https://github.com/hackelia-micrantha/dubnium-community",
    architectureRole: "Governed-agent vertical integration testbed",
  },
  {
    slug: "hyperion",
    name: "Project Hyperion",
    classification: "laboratory",
    maturity: "incubating",
    summary:
      "Infrastructure for secure, reproducible laboratory environments, migrations, and deployments.",
    url: "https://hyperion.micrantha.com",
    architectureRole: "Reproducible infrastructure and deployment patterns",
  },
  {
    slug: "calathea",
    name: "Project Calathea",
    classification: "laboratory",
    maturity: "prototype",
    summary:
      "A CLI-first, AI-assisted system for deciding what work deserves focus and correcting that decision from operational evidence.",
    url: "https://calathea.micrantha.com",
    architectureRole: "Work prioritization and feedback experimentation",
  },
  {
    slug: "repora",
    name: "Repora",
    classification: "laboratory",
    maturity: "incubating",
    summary:
      "A deterministic, policy-driven repository control plane for defining and enforcing desired codebase state.",
    url: "https://github.com/hackelia-micrantha/repora",
    architectureRole: "Repository reconciliation and policy control plane",
  },
  {
    slug: "bluebell",
    name: "Bluebell",
    classification: "laboratory",
    maturity: "stable",
    summary:
      "A Kotlin Multiplatform SDK and project template for reusable cross-platform build and library patterns.",
    url: "https://github.com/hackelia-micrantha/bluebell",
    architectureRole: "Mobile SDK template and build patterns",
  },
  {
    slug: "achillea",
    name: "Achillea",
    classification: "laboratory",
    maturity: "prototype",
    summary:
      "A dynamic feature platform for interactive React Native applications.",
    url: "https://achillea.micrantha.com",
    architectureRole: "Dynamic application feature experimentation",
  },
  {
    slug: "digitalis",
    name: "Digitalis",
    classification: "laboratory",
    maturity: "prototype",
    summary:
      "A mobile attestation and secure runtime configuration delivery system.",
    url: "https://digitalis.micrantha.com",
    sourceUrl: "https://github.com/hackelia-micrantha/digitalis-community",
    architectureRole: "Device attestation and secure configuration delivery",
  },
  {
    slug: "myosotis",
    name: "Myosotis",
    classification: "laboratory",
    maturity: "prototype",
    summary:
      "An MCP and LLM registry for mobile clients, tool discovery, and agentic workflows.",
    url: "https://github.com/hackelia-micrantha/myosotis-community",
    architectureRole: "MCP and LLM tool registry",
  },
  {
    slug: "eyespie",
    name: "Eyespie",
    classification: "laboratory",
    maturity: "prototype",
    summary:
      "A computer-vision-driven mobile gameplay and inference experiment built with Bluebell patterns.",
    url: "https://github.com/ryjen/eyespie",
    architectureRole: "Computer vision and mobile inference testbed",
  },
  {
    slug: "compost",
    name: "Compost",
    classification: "laboratory",
    maturity: "maintained",
    summary:
      "A collection of recycled projects retained for reusable parts and future laboratory work.",
    url: "/compost",
    architectureRole: "Archived and reusable project inventory",
  },
] as const satisfies readonly ProjectDefinition[]

export type ProjectSlug = (typeof projectCatalog)[number]["slug"]

export const featuredHomepageProjectSlugs = {
  solution: ["dubnium", "anthesis", "envuscator"],
  laboratory: [
    "anthesis-governance-lab",
    "dubnium-governed-agent-demo",
    "myosotis",
  ],
} as const satisfies Record<ProjectClassification, readonly ProjectSlug[]>

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
