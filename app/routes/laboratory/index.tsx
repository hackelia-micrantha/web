import { Link } from "@remix-run/react"
import { Card, PageTitle } from "~/components"
import {
  MicraIcon,
  CodemuxIcon,
  GardenIcon,
  OutermeshIcon,
  ScouterIcon,
  SandboxIcon,
  VeilIcon,
} from "~/components/icons"

const Laboratory = () => (
  <div>
    <PageTitle
      title="Laboratory"
      subtitle="Projects listed here are still being grown."
    />

    <div className="grid grid-cols-3">
      <Card
        title="Scouter"
        icon={<ScouterIcon />}
        url="https://ryanjennin.gs/posts/scouter-demo/"
      >
        Scouter is a turn based mobile game of "I Spy". The app uses machine
        learning to identify real world things and match them based upon clues.
      </Card>

      <Card
        icon={<SandboxIcon />}
        title="Sandbox"
        url="https://ryanjennin.gs/posts/sandcastle-util-demo/"
      >
        A wrapper around containers to create re-usable development and test
        environments. Developed to isolate system/project dependencies and time
        tracking.
      </Card>

      <Card
        title="Outermesh"
        icon={<OutermeshIcon />}
        url="https://outermesh.micrantha.com"
      >
        An e-book on learning software development that has turned into a
        project in its own right: a multiplayer game about hacking
      </Card>

      <Card title="Micra" icon={<MicraIcon />} url="#">
        A plugin based tool to create development projects and to manage git and
        build versions.
      </Card>

      <Card title="Codemux" icon={<CodemuxIcon />} url="#">
        A secure group coding solution in the terminal. Basically tmux and ssh
        but with a few extras for communication and managing edit control.
      </Card>

      <Card
        title="The Garden"
        icon={<GardenIcon />}
        url="https://nursery.micrantha.com"
      >
        The garden is a lightweight mobile synchronization solution leveraging
        MQTT and native database JSON data types. Currently supports PostgreSQL
        and SQLite.
      </Card>

      <Card title="Veil" icon={<VeilIcon />} url="https://veil.micrantha.com">
        A micro-service to pseudo-randomly obfuscate a profile photo for fun or
        security.
      </Card>
    </div>

    <div className="mt-8 text-center">
      See the <Link to="/laboratory/compost">laboratory compost</Link> for
      projects that did not survive.
    </div>
  </div>
)

export default Laboratory
