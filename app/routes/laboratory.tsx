import type { MetaFunction } from "@remix-run/node"
import { Card, PageTitle } from "~/components"
import {
  AchilleaIcon,
  AnthesisIcon,
  BluebellIcon,
  CalatheaIcon,
  DubniumIcon,
  GardenIcon,
  HyperionIcon,
  MobuildIcon,
  MyosotisIcon,
  ReporaIcon,
} from "~/components/icons"
import {
  projectBySlug,
  projectsByClassification,
} from "~/data/project-catalog"
import { cardStyles } from "~/utils/card-styles"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"

const laboratoryDescription =
  "Micrantha testbeds and experimental projects that validate contracts, integrations, and emerging engineering capabilities."

const laboratoryProjects = projectsByClassification("laboratory")

const laboratoryCards = [
  {
    project: projectBySlug("anthesis-governance-lab"),
    icon: <AnthesisIcon />,
    className: cardStyles.green,
  },
  {
    project: projectBySlug("dubnium-governed-agent-demo"),
    icon: <DubniumIcon />,
    className: cardStyles.cyan,
  },
  {
    project: projectBySlug("hyperion"),
    icon: <HyperionIcon />,
    className: cardStyles.neutral,
  },
  {
    project: projectBySlug("calathea"),
    icon: <CalatheaIcon />,
    className: cardStyles.purple,
  },
  {
    project: projectBySlug("repora"),
    icon: <ReporaIcon />,
    className: cardStyles.cyan,
  },
  {
    project: projectBySlug("bluebell"),
    icon: <BluebellIcon />,
    className: cardStyles.blue,
  },
  {
    project: projectBySlug("achillea"),
    icon: <AchilleaIcon />,
    className: cardStyles.red,
    actions: [<span key="achillea-demo">Asterwild Demo Game</span>],
  },
  {
    project: projectBySlug("digitalis"),
    icon: <MobuildIcon />,
    className: cardStyles.purple,
  },
  {
    project: projectBySlug("myosotis"),
    icon: <MyosotisIcon />,
    className: cardStyles.cyan,
  },
  {
    project: projectBySlug("eyespie"),
    icon: <BluebellIcon />,
    className: cardStyles.blue,
  },
  {
    project: projectBySlug("compost"),
    icon: <GardenIcon />,
    className: cardStyles.lime,
  },
]

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Laboratory",
    description: laboratoryDescription,
    path: "/laboratory",
  })

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Laboratory",
    description: laboratoryDescription,
    path: "/laboratory",
    items: laboratoryProjects.map((project) => ({
      name: project.name,
      description: project.summary,
      url: project.url,
    })),
  }),
}

const Laboratory = () => (
  <div>
    <PageTitle
      title="Laboratory"
      subtitle="Testbeds and experiments that validate contracts, integrations, and emerging capabilities."
    />

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {laboratoryCards.map(({ project, icon, className, actions }) => (
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
  </div>
)

export default Laboratory
