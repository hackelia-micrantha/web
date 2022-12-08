import { Card, PageTitle } from "~/components";
import { SandboxIcon, MicraIcon, CodemuxIcon } from "~/components/icons";

const Compost = () => (
  <div>
    <PageTitle
      title="Laboratory Compost"
      subtitle="Projects listed here were neglected and recycled."
    />

    <div className="grid grid-cols-3">
      <Card title="😉 Emotext" url="https://emotext.micrantha.com">
        A scalable chat app that has predefined textual representations of
        emotions. Emotext's are displayed for first, second and third persons,
        leading to a more rich and humorous expression context.
        <p className="mt-4 text-base text-xs text-gray-700">
          <b>Reason</b>: The project got too far behind on some elixir/phoenix
          major version upgrades and was not worth maintaining
        </p>
      </Card>

      <Card title="🐞 Testmanship" url="https://testmanship.micrantha.com">
        Research on test automation, fuzz testing, security and machine learning
        and how to bring them all together.
        <p className="mt-4 text-base text-xs text-gray-700">
          <b>Reason</b>: The project was too big in scope, and a little boring
        </p>
      </Card>

      <Card title="🥠 Fortunes Mobile" url="https://fortunes.micrantha.com">
        A mobile app for the fortunes service. Fortunes are told with a variety
        of extra cute characters like cows and androids. Extra fortune content
        and redesigned categories with the ability for users to submit their
        own.
        <p className="mt-4 text-base text-xs text-gray-700">
          <b>Reason</b>: The project required too much backend changes to move
          forward. Backend upgrades remain ongoing.
        </p>
      </Card>

      <Card
        icon={<SandboxIcon />}
        title="Sandbox"
        url="https://ryanjennin.gs/posts/sandcastle-util-demo/"
      >
        Secure development environments that are saved and reused as
        sandcastles. Project specific bastions with hooks (for example, time
        tracking).
        <p className="mt-4 text-base text-xs text-gray-700">
          <b>Reason</b>: Better off using <b>Nix</b> environments.
        </p>
      </Card>

      <Card title="Micra" icon={<MicraIcon />} url="#">
        A plugin based tool to create development projects and to manage git and
        build versions.
        <p className="mt-4 text-base text-xs text-gray-700">
          <b>Reason</b>: The plugin system and makefile integration became to
          cumbersome to maintain. Project needed better cross-plugin templating
          and a temp filesystem overlay
        </p>
      </Card>

      <Card title="Codemux" icon={<CodemuxIcon />} url="#">
        A secure group coding solution in the terminal. Basically tmux and ssh
        but with a few extras for communication and managing edit control.
        <p className="mt-4 text-base text-xs text-gray-700">
          <b>Reason</b>: While a CLI option is nice, the demand with web
          versions is minimal.
        </p>
      </Card>
    </div>
  </div>
);

export default Compost;
