import { Link } from "@remix-run/react"
import { Card, PageTitle } from "~/components"
import {
  HyperionIcon,
  GardenIcon,
  OutermeshIcon,
  ScouterIcon,
  MusingsIcon,
} from "~/components/icons"

const Laboratory = () => (
  <div>
    <PageTitle
      title="Laboratory"
      subtitle="Projects listed here are still being grown."
    />

    <div className="grid grid-cols-3">
      <Card title="Project Hyperion" icon={<HyperionIcon />}>
        Infrastructure for secure, reproducible laboratory environments,
        migrations and deploys.
      </Card>

      <Card
        title="Scouter"
        icon={<ScouterIcon />}
        url="https://github.com/hackelia-micrantha/skouter"
      >
        Scouter is a turn based mobile game using machine learning to identify
        real world things with clues and guess them with proofs.
      </Card>

      <Card title="Outermesh" icon={<OutermeshIcon />}>
        An e-book on learning software development that has turned into a
        project in its own right: a multiplayer TUI game about hacking
      </Card>

      <Card title="The Garden" icon={<GardenIcon />}>
        The garden is a lightweight addition to turn a relational database into
        a hybrid nosql mesh network for decentralized efficient data sync.
      </Card>

      <Card title="Musings" icon={<MusingsIcon />}>
        A social network inside sanity and in sanity's side. Where negative
        sentiment is turned into a poem by AI and toxic positivity has to fight
        its own shadow with an advanced chatbot.
      </Card>
    </div>

    <div className="mt-8 text-center">
      See the <Link to="/laboratory/compost">laboratory compost</Link> for
      recycled projects.
    </div>
  </div>
)

export default Laboratory
