import { Link } from "@remix-run/react";
import { Card, PageTitle } from "~/components";
import {
  HyperionIcon,
  GardenIcon,
  OutermeshIcon,
  ScouterIcon,
} from "~/components/icons";

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

      <Card title="Scouter" icon={<ScouterIcon />}>
        Scouter is a turn based mobile game using machine learning to identify
        real world things and match them based upon clues.
      </Card>

      <Card title="Outermesh" icon={<OutermeshIcon />}>
        An e-book on learning software development that has turned into a
        project in its own right: a multiplayer TUI game about hacking
      </Card>

      <Card title="The Garden" icon={<GardenIcon />}>
        The garden is a lightweight data layer and mobile synchronization
        solution leveraging open source and algorithms.
      </Card>
    </div>

    <div className="mt-8 text-center">
      See the <Link to="/laboratory/compost">laboratory compost</Link> for
      projects that did not survive.
    </div>
  </div>
);

export default Laboratory;
