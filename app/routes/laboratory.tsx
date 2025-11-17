import { Link } from "@remix-run/react"
import { Card, PageTitle } from "~/components"
import {
  HyperionIcon,
  EyespieIcon,
  BluebellIcon,
  MobuildIcon,
  MysotosisIcon,
} from "~/components/icons"

const Laboratory = () => (
  <div>
    <PageTitle
      title="Laboratory"
      subtitle={
        <div>
          Projects listed here are still being grown. Recycled projects go to
          the <Link to="/compost">laboratory compost</Link> for
          reuse.
        </div>
      }
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Project Hyperion" icon={<HyperionIcon />}>
        Infrastructure for secure, reproducible laboratory environments,
        migrations and deploys. Hyperion is the worlds tallest living tree.
      </Card>

      <Card
        title="Bluebell"
        url="https://github.com/hackelia-micrantha/bluebell"
        icon={<BluebellIcon />}
      >
        A multiplatform mobile SDK and project template using AI to generate
        features. Scientific name is 'Hyacinthoides non-scripta'.
      </Card>

      <Card
        title="Eyespie"
        icon={<EyespieIcon />}
        url="https://github.com/hackelia-micrantha/eyespie"
      >
        Eyespie is a turn based mobile game using machine learning to identify
        real world things with clues and guess them with proofs. Bluebell use
        case.
      </Card>

      <Card
        title="Mobuild Envuscator"
        url="https://github.com/hackelia-micrantha/mobuild"
        icon={<MobuildIcon />}
      >
        A mobile SDK to randomly obfuscate environment variables on mobile
        clients per build. An extra small security layer with a Github action to
        update.
      </Card>

      <Card title="Mobuild Digitalis" icon={<MobuildIcon />}>
        A backend and mobile SDK to attest for mobile clients. Once attested,
        provides mobile configuration that is stored in secure enclave, such as
        APIs and secrets. Scientific name is 'Digitalis Obscura'.
      </Card>

      <Card title="Project Mysotosis" icon={<MysotosisIcon />}>
        An MCP and LLM registry for mobile clients. Mobile SDK registers and
        provides tools that can be incorporated into LLM results and Agentic
        workflows. Scientific name is 'Mysotosis Sylvatica'.
      </Card>
    </div>
  </div>
)

export default Laboratory
