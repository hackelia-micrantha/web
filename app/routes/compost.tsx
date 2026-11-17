import type { MetaFunction } from "@remix-run/node"
import { Card, PageTitle } from "~/components"
import { buildPageMeta } from "~/utils/seo"
import {
  SandboxIcon,
  MicraIcon,
  CodemuxIcon,
  GardenIcon,
  SolidagoIcon,
} from "~/components/icons"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Laboratory Compost",
    description:
      "Earlier experiments, retired implementations, and reusable ideas from the Micrantha laboratory.",
    path: "/compost",
  })

const Compost = () => (
  <div>
    <PageTitle
      title="Laboratory Compost"
      subtitle="Earlier experiments, retired implementations, and ideas that continue to inform new work."
    />

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card
        title="😉 Emotext"
        url="https://emotext.micrantha.com"
        headingLevel={2}
      >
        An experiment in expressive chat using predefined emotional phrases
        adapted to the speaker and recipient. The original application is no
        longer actively maintained.
      </Card>

      <Card title="🐞 Testmanship" headingLevel={2}>
        Earlier research into combining test automation, fuzz testing, security,
        and machine learning.
      </Card>

      <Card title="🥠 Fortunes Mobile" headingLevel={2}>
        An earlier mobile companion to Fortunes Service, exploring playful
        characters, additional content, and user-submitted fortunes.
      </Card>

      <Card title="The Garden" icon={<GardenIcon />} headingLevel={2}>
        A historical experiment in hybrid relational and document-oriented data
        storage and synchronization.
      </Card>

      <Card icon={<SandboxIcon />} title="Sandbox" headingLevel={2}>
        An early utility for reusable, isolated development environments. Its
        ideas helped shape the later Sandcastle project.
      </Card>

      <Card title="Micra" icon={<MicraIcon />} headingLevel={2}>
        An early plugin-based approach to project scaffolding, Git workflows,
        and build-version management.
      </Card>

      <Card title="Codemux" icon={<CodemuxIcon />} headingLevel={2}>
        An experiment in collaborative terminal-based development using tmux,
        SSH, communication, and editing controls.
      </Card>

      <Card title="Solidago" icon={<SolidagoIcon />} headingLevel={2}>
        An early administrative API experiment for invoicing and payroll.
      </Card>
    </div>
  </div>
)

export default Compost
