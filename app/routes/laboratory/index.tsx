import { Link } from "@remix-run/react";
import { Card, PageTitle } from "~/components";
import { GardenIcon, OutermeshIcon, ScouterIcon } from "~/components/icons";

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
        <p className="mt-4 text-base text-xs text-gray-700">
          <b className="text-red">Status:</b> kotlin multiplatform refactor
        </p>
      </Card>

      <Card
        title="Outermesh"
        icon={<OutermeshIcon />}
        url="https://outermesh.micrantha.com"
      >
        An e-book on learning software development that has turned into a
        project in its own right: a multiplayer game about hacking
        <p className="mt-4 text-base text-xs text-gray-700">
          <b className="text-orange">Status:</b> finishing book chapters as
          prototype
        </p>
      </Card>

      <Card
        title="The Garden"
        icon={<GardenIcon />}
        url="https://nursery.micrantha.com"
      >
        The garden is a lightweight mobile synchronization solution leveraging
        MQTT and native database JSON data types. Currently supports PostgreSQL
        and SQLite via extensions.
        <p className="mt-4 text-base text-xs text-gray-700">
          <b className="text-orange">Status:</b> developing protocol over MQTT,
          testing change synchronization
        </p>
      </Card>
    </div>

    <div className="mt-8 text-center">
      See the <Link to="/laboratory/compost">laboratory compost</Link> for
      projects that did not survive.
    </div>
  </div>
);

export default Laboratory;
