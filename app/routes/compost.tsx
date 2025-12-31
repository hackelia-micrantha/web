import type { MetaFunction } from "@remix-run/node"
import { Card, PageTitle } from "~/components"
import {
  SandboxIcon,
  MicraIcon,
  CodemuxIcon,
  OutermeshIcon,
  GardenIcon,
  MusingsIcon,
  SolidagoIcon,
} from "~/components/icons"

export const meta: MetaFunction = () => [
  { title: "Micrantha Software | Laboratory Compost" },
  {
    name: "description",
    content: "Recycled or paused projects from the Micrantha laboratory.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://micrantha.com/compost",
  },
]

const Compost = () => (
  <div>
    <PageTitle
      title="Laboratory Compost"
      subtitle="Projects listed here were neglected and recycled."
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="😉 Emotext" url="https://emotext.micrantha.com">
        A scalable chat app that has predefined textual representations of
        emotions. Emotext's are displayed for first, second and third persons,
        leading to a more rich and humorous expression context. Got too far
        behind on elixir/phoenix major version, upgrades and not worth
        maintaining
      </Card>

      <Card title="🐞 Testmanship">
        Research on test automation, fuzz testing, security and machine learning
        and how to bring them all together.
      </Card>

      <Card title="🥠 Fortunes Mobile">
        A mobile app for the fortunes service. Fortunes are told with a variety
        of extra cute characters like cows and androids. Extra fortune content
        and redesigned categories with the ability for users to submit their
        own.
      </Card>

      <Card title="The Garden" icon={<GardenIcon />}>
        The garden is a lightweight extension to turn any relational database
        with native JSON support into a hybrid nosql mesh network for efficient
        data sync.
      </Card>

      <Card icon={<SandboxIcon />} title="Sandbox">
        Development environments reused as sandcastles. Project specific
        bastions with hooks. Requires mouseless editing skill.
      </Card>

      <Card title="Micra" icon={<MicraIcon />}>
        A plugin based tool to create development projects and to manage git and
        build versions. Plugin/templating system for new projects needs better
        design.
      </Card>

      <Card title="Outermesh" icon={<OutermeshIcon />} url="https://outermesh.micrantha.com">
        An e-book on learning software development that has turned into a
        project in its own right: a multiplayer TUI game about hacking
      </Card>

      <Card title="Codemux" icon={<CodemuxIcon />}>
        A secure group coding solution in the terminal. Basically tmux and ssh
        but with a few extras for communication and managing edit control.
        Requires mouseless editing skill.
      </Card>

      <Card title="Musings" icon={<MusingsIcon />}>
        A social network inside sanity and in sanity's side. Where negative
        sentiment is turned into a poem by AI and toxic positivity has to fight
        its own shadow with an advanced chatbot.
      </Card>

      <Card title="Solidago" icon={<SolidagoIcon />}>
        An internal API to manage invoicing and/or payroll (scientific flower
        name for the 'Goldenrod').
      </Card>
    </div>
  </div>
)

export default Compost
