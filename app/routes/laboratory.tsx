import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Card, PageTitle } from "~/components"
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
        url: "https://anthesis.micrantha.com",
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
        className="border-slate-300 bg-slate-50"
      >
        Infrastructure for secure, reproducible laboratory environments,
        migrations and deploys. Hyperion is the worlds tallest living tree.
      </Card>

      <Card
        title="Project Anthesis"
        url="https://anthesis.micrantha.com"
        icon={<AnthesisIcon />}
        headingLevel={2}
        className="border-emerald-300 bg-emerald-50"
      >
        Agentic SDLC with principles: Governed Autonomy, Human Authority First,
        Deterministic Execution, Auditability, and a Living Architecture.
      </Card>

      <Card
        title="Bluebell"
        url="https://github.com/hackelia-micrantha/bluebell"
        icon={<BluebellIcon />}
        headingLevel={2}
        className="border-sky-300 bg-sky-50"
      >
        A multiplatform mobile SDK and project template using AI to generate
        features. Scientific name is 'Hyacinthoides non-scripta'.
      </Card>

      <Card
        title="Eyespie"
        icon={<EyespieIcon />}
        url="https://github.com/hackelia-micrantha/eyespie"
        headingLevel={2}
        className="border-rose-200 bg-rose-50"
      >
        Eyespie is a turn based mobile game using machine learning to identify
        real world things with clues and guess them with proofs. Bluebell use
        case.
      </Card>

      <Card
        title="Mobuild Envuscator"
        url="https://github.com/hackelia-micrantha/mobuild"
        icon={<MobuildIcon />}
        headingLevel={2}
        className="border-amber-200 bg-[#fffdf5]"
      >
        A mobile SDK to randomly obfuscate environment variables on mobile
        clients per build. An extra small security layer with a Github action to
        update.
      </Card>

      <Card
        title="Mobuild Digitalis"
        icon={<MobuildIcon />}
        headingLevel={2}
        className="border-violet-300 bg-violet-50"
      >
        A backend and mobile SDK to attest for mobile clients. Once attested,
        provides mobile configuration that is stored in secure enclave, such as
        APIs and secrets. Scientific name is 'Digitalis Obscura'.
      </Card>

      <Card
        title="Project Mysotosis"
        icon={<MysotosisIcon />}
        headingLevel={2}
        className="border-cyan-300 bg-cyan-50"
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
        className="border-lime-300 bg-lime-50"
      >
        A list of recycled projects that may be useful for parts. Sometimes they
        are returned to the laboratory.
      </Card>
    </div>
  </div>
)

export default Laboratory
