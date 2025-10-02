import { Link } from "@remix-run/react"
import { Card, PageTitle } from "~/components"
import {
  HyperionIcon,
  GardenIcon,
  EyespieIcon,
  SolidagoIcon,
  BluebellIcon,
  MusingsIcon,
  MobuildIcon,
} from "~/components/icons"

const Laboratory = () => (
  <div>
    <PageTitle
      title="Laboratory"
      subtitle="Projects listed here are still being grown."
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Project Hyperion" icon={<HyperionIcon />}>
        Infrastructure for secure, reproducible laboratory environments,
        migrations and deploys. Hyperion is the worlds tallest living tree.
      </Card>

      <Card
        title="Bluebell"
	url="https://github.com/hackelia-micrantha/bluebell"
	icon={<BluebellIcon />}>
	A multiplatform mobile SDK and project template using AI to generate features.
	  Scientific name is 'Hyacinthoides non-scripta'.
      </Card>

      <Card
        title="Eyespie"
        icon={<EyespieIcon />}
        url="https://github.com/hackelia-micrantha/eyespie"
      >
        Eyespie is a turn based mobile game using machine learning to identify
        real world things with clues and guess them with proofs.  Bluebell use case.
      </Card>

      <Card title="Mobuild Envuscator"
	url="https://github.com/hackelia-micrantha/mobuild"
	icon={<MobuildIcon />}>
        A mobile SDK to randomly obfuscate environment variables on mobile clients per build. An extra security layer with a Github action to update.
      </Card>

      <Card title="The Garden" icon={<GardenIcon />}>
        The garden is a lightweight extension to turn any relational database with native JSON support into
        a hybrid nosql mesh network for efficient data sync.
      </Card>

      <Card title="Solidago" icon={<SolidagoIcon />}>
        An internal API to manage invoicing and/or payroll (scientific flower name for the 'Goldenrod').
      </Card>

    </div>

    <div className="mt-8 text-center">
      See the <Link to="/laboratory/compost">laboratory compost</Link> for
      recycled projects.
    </div>
  </div>
)

export default Laboratory
