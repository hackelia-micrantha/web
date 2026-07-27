import type { MetaFunction } from "@remix-run/node"
import type { ReactNode } from "react"
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
  projectCollectionDescriptions,
  projectsByClassification,
} from "~/data/project-catalog"
import { cardStyles } from "~/utils/card-styles"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"

const laboratoryDescription = projectCollectionDescriptions.laboratory

const laboratoryProjects = projectsByClassification("laboratory")

type ProjectCardPresentation = {
  icon: ReactNode
  className: string
  actions?: ReactNode[]
}

const laboratoryCardPresentation: Record<string, ProjectCardPresentation> = {
  "anthesis-governance-lab": {
    icon: <AnthesisIcon />,
    className: cardStyles.green,
  },
  "dubnium-governed-agent-demo": {
    icon: <DubniumIcon />,
    className: cardStyles.cyan,
  },
  hyperion: {
    icon: <HyperionIcon />,
    className: cardStyles.neutral,
  },
  calathea: {
    icon: <CalatheaIcon />,
    className: cardStyles.purple,
  },
  repora: {
    icon: <ReporaIcon />,
    className: cardStyles.cyan,
  },
  bluebell: {
    icon: <BluebellIcon />,
    className: cardStyles.blue,
  },
  achillea: {
    icon: <AchilleaIcon />,
    className: cardStyles.red,
    actions: [<span key="achillea-demo">Asterwild Demo Game</span>],
  },
  digitalis: {
    icon: <MobuildIcon />,
    className: cardStyles.purple,
  },
  myosotis: {
    icon: <MyosotisIcon />,
    className: cardStyles.cyan,
  },
  eyespie: {
    icon: <BluebellIcon />,
    className: cardStyles.blue,
  },
  compost: {
    icon: <GardenIcon />,
    className: cardStyles.lime,
  },
}

const presentationFor = (slug: string) => {
  const presentation = laboratoryCardPresentation[slug]

  if (!presentation) {
    throw new Error(`Missing Laboratory card presentation for project: ${slug}`)
  }

  return presentation
}

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
      {laboratoryProjects.map((project) => {
        const { icon, className, actions } = presentationFor(project.slug)

        return (
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
        )
      })}
    </div>
  </div>
)

export default Laboratory
