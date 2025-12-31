import type { MetaFunction } from "@remix-run/node"
import { Card, PageTitle } from "~/components"
import { FortunesIcon, VeilIcon } from "~/components/icons"
import { Link } from "@remix-run/react"

export const meta: MetaFunction = () => [
  { title: "Micrantha Software | Solutions" },
  {
    name: "description",
    content:
      "Mature Micrantha products, including Fortunes Service and Veil.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://micrantha.com/solutions",
  },
]

const Solutions = () => (
  <div>
    <PageTitle
      title="Solutions"
      subtitle="Projects that have grown enough to be considered matured."
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        title="Fortunes Service"
        url="https://fortunes.micrantha.com"
        icon={<FortunesIcon />}
      >
        A micro-service and{" "}
        <Link to="https://slack.com/apps/A8MAPLX53-fortunes">Slack App</Link>{" "}
        for UNIX fortunes. Fortunes are witty antidotes that come in many
        categories such as technical, poems, quotes, and proverbs.
      </Card>
      <Card title="Veil" icon={<VeilIcon />} url="https://veil.micrantha.com">
        A micro-service to pseudo-randomly obfuscate a profile photo for fun or
        security.
      </Card>
    </div>
  </div>
)

export default Solutions
