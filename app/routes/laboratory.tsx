import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Card, PageTitle } from "~/components"
import { cardStyles } from "~/utils/card-styles"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"
import {
  HyperionIcon,
  EyespieIcon,
  BluebellIcon,
  MobuildIcon,
  MysotosisIcon,
  AnthesisIcon,
  GardenIcon,
} from "~/components/icons"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Laboratory",
    description: "Projects in active growth from the Micrantha laboratory.",
    path: "/laboratory",
  })

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Laboratory",
    description: "Projects in active growth from the Micrantha laboratory.",
    path: "/laboratory",
    items: [
      {
        name: "Project Hyperion",
        description:
          "Infrastructure for secure, reproducible laboratory environments, migrations and deploys. Hyperion is the worlds tallest living tree.",
        url: "https://hyperion.micrantha.com",
      },
      {
        name: "Project Anthesis",
        description:
          "Agentic SDLC with principles: Governed Autonomy, Human Authority First, Deterministic Execution, Auditability, and a Living Architecture.",
        url: "https://anthesis.dev",
      },
      {
        name: "Bluebell",
        description:
          "A multiplatform mobile SDK and project template using AI to generate features. Scientific name is 'Hyacinthoides non-scripta'.",
        url: "https://github.com/hackelia-micrantha/bluebell",
      },
      {
        name: "Eyespie",
        description:
          "Eyespie is a turn based mobile game using machine learning to identify real world things with clues and guess them with proofs. Bluebell use case.",
        url: "https://github.com/hackelia-micrantha/eyespie",
      },
      {
        name: "Mobuild Envuscator",
        description:
          "A mobile SDK to randomly obfuscate environment variables on mobile clients per build. An extra small security layer with a Github action to update.",
        url: "https://github.com/hackelia-micrantha/mobuild",
      },
      {
        name: "Mobuild Digitalis",
        description:
          "A backend and mobile SDK to attest for mobile clients. Once attested, provides mobile configuration that is stored in secure enclave, such as APIs and secrets. Scientific name is 'Digitalis Obscura'.",
      },
      {
        name: "Project Mysotosis",
        description:
          "An MCP and LLM registry for mobile clients. Mobile SDK registers and provides tools that can be incorporated into LLM results and Agentic workflows. Scientific name is 'Mysotosis Sylvatica'.",
	url: "https://mysotosis.micrantha.com",
      },
      {
        name: "Compost",
        description:
          "A list of recycled projects that may be useful for parts. Sometimes they are returned to the laboratory.",
        url: "https://micrantha.com/compost",
      },
    ],
  }),
}

const Laboratory = () => (
  <div>
    <PageTitle
      title="Laboratory"
      subtitle={
        <div>
          Projects listed here are still being grown. Recycled projects go to
          the <Link to="/compost">laboratory compost</Link> for reuse.
        </div>
      }
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        title="Project Hyperion"
        icon={<HyperionIcon />}
        url="https://hyperion.micrantha.com"
        headingLevel={2}
        className={cardStyles.neutral}
      >
        Infrastructure for secure, reproducible laboratory environments,
        migrations and deploys. Hyperion is the worlds tallest living tree.
      </Card>

      <Card
        title="Project Anthesis"
        url="https://anthesis.dev"
        icon={<AnthesisIcon />}
        headingLevel={2}
        className={cardStyles.green}
      >
        Agentic SDLC with principles: Governed Autonomy, Human Authority First,
        Deterministic Execution, Auditability, and a Living Architecture.
      </Card>

      <Card
        title="Bluebell"
        url="https://github.com/hackelia-micrantha/bluebell"
        icon={<BluebellIcon />}
        headingLevel={2}
        className={cardStyles.blue}
      >
        A multiplatform mobile SDK and project template using AI to generate
        features. Scientific name is 'Hyacinthoides non-scripta'.
      </Card>

      <Card
        title="Eyespie"
        icon={<EyespieIcon />}
        url="https://github.com/hackelia-micrantha/eyespie"
        headingLevel={2}
        className={cardStyles.red}
      >
        Eyespie is a turn based mobile game using machine learning to identify
        real world things with clues and guess them with proofs. Bluebell use
        case.
      </Card>

      <Card
        title="Mobuild Envuscator"
        url="https://envuscator.com"
        icon={<MobuildIcon />}
        headingLevel={2}
        className={cardStyles.yellow}
      >
        A mobile SDK to randomly obfuscate environment variables on mobile
        clients per build. An extra small security layer with a Github action to
        update.
      </Card>

      <Card
        title="Mobuild Digitalis"
        icon={<MobuildIcon />}
        headingLevel={2}
        className={cardStyles.purple}
      >
        A backend and mobile SDK to attest for mobile clients. Once attested,
        provides mobile configuration that is stored in secure enclave, such as
        APIs and secrets. Scientific name is 'Digitalis Obscura'.
      </Card>

      <Card
        title="Project Mysotosis"
	url="https://mysotosis.micrantha.com"
        icon={<MysotosisIcon />}
        headingLevel={2}
        className={cardStyles.cyan}
      >
        An MCP and LLM registry for mobile clients. Mobile SDK registers and
        provides tools that can be incorporated into LLM results and Agentic
        workflows. Scientific name is 'Mysotosis Sylvatica'.
      </Card>

      <Card
        title="Compost"
        icon={<GardenIcon />}
        url="/compost"
        headingLevel={2}
        className={cardStyles.lime}
      >
        A list of recycled projects that may be useful for parts. Sometimes they
        are returned to the laboratory.
      </Card>
    </div>
  </div>
)

export default Laboratory
