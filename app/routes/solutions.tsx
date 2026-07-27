import type { MetaFunction } from "@remix-run/node"
import type { ReactNode } from "react"
import { Card, ExternalLink, PageTitle } from "~/components"
import {
  AmaryllisIcon,
  AnthesisIcon,
  DubniumIcon,
  FortunesIcon,
  MobuildIcon,
  VeilIcon,
} from "~/components/icons"
import {
  projectBySlug,
  projectsByClassification,
} from "~/data/project-catalog"
import { cardStyles } from "~/utils/card-styles"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"

const solutionsDescription =
  "Micrantha deployable systems, distributions, tools, and platforms for governed agentic development, mobile engineering, and secure delivery."

const solutionProjects = projectsByClassification("solution")

type ProjectCard = {
  project: ReturnType<typeof projectBySlug>
  icon: ReactNode
  className: string
  actions?: ReactNode[]
}

const solutionCards: ProjectCard[] = [
  {
    project: projectBySlug("amaryllis"),
    icon: <AmaryllisIcon />,
    className: cardStyles.neutral,
  },
  {
    project: projectBySlug("anthesis"),
    icon: <AnthesisIcon />,
    className: cardStyles.green,
  },
  {
    project: projectBySlug("dubnium"),
    icon: <DubniumIcon />,
    className: cardStyles.cyan,
  },
  {
    project: projectBySlug("envuscator"),
    icon: <MobuildIcon />,
    className: cardStyles.yellow,
  },
  {
    project: projectBySlug("fortunes"),
    icon: <FortunesIcon />,
    className: cardStyles.yellow,
    actions: [
      <ExternalLink
        key="slack-app"
        href="https://slack.com/apps/A8MAPLX53-fortunes"
        newTab
      >
        Slack App
      </ExternalLink>,
    ],
  },
  {
    project: projectBySlug("veil"),
    icon: <VeilIcon />,
    className: cardStyles.blue,
  },
]

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Solutions",
    description: solutionsDescription,
    path: "/solutions",
  })

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Solutions",
    description: solutionsDescription,
    path: "/solutions",
    items: solutionProjects.map((project) => ({
      name: project.name,
      description: project.summary,
      url: project.url,
    })),
  }),
}

const Solutions = () => (
  <div>
    <PageTitle
      title="Solutions"
      subtitle="Deployable systems, distributions, tools, and platforms."
    />

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {solutionCards.map(({ project, icon, className, actions }) => (
        <Card
          key={project.slug}
          title={project.name}
          url={project.url}
          icon={icon}
          headingLevel={2}
          className={className}
          actions={actions}
        >
          {project.summary}
        </Card>
      ))}
    </div>

    <section className="mt-10 max-w-3xl space-y-4">
      <h2 className="text-xl">Related architecture notes</h2>
      <p>
        The blog tracks the architectural concerns behind these systems:
        governed AI execution, integration control surfaces, and software
        boundaries that keep platforms replaceable.
      </p>
      <p>
        Start with{" "}
        <a href="/blog/ai-pipelines-need-control-boundaries">
          AI Pipelines Need Control Boundaries
        </a>{" "}
        or{" "}
        <a href="/blog/software-layers-are-risk-boundaries">
          Software Layers Are Risk Boundaries
        </a>
        .
      </p>
    </section>
  </div>
)

export default Solutions
