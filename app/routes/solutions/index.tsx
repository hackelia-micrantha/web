import { Card, PageTitle } from "~/components"
import { FortunesIcon } from "~/components/icons"

const Solutions = () => (
  <div>
    <PageTitle
      title="Solutions"
      subtitle="Projects that have grown enough to be considered matured."
    />

    <div class="grid grid-cols-3">
      <Card
        title="Fortunes Service"
        url="https://fortunes.micrantha.com"
        icon={<FortunesIcon />}
      >
        A micro-service and
        <a href="https://slack.com/apps/A8MAPLX53-fortunes">Slack App</a> for
        UNIX fortunes. Fortunes are witty antidotes that relive project
        tensions. They come in many categories such as technical, poems, quotes,
        and proverbs.
      </Card>
    </div>
  </div>
)

export default Solutions