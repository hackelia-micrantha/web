import type { MetaFunction } from "@remix-run/node"
import { Card, PageTitle } from "~/components"
import {
  FortunesIcon,
  VeilIcon,
  AmaryllisIcon,
  AnthesisIcon,
} from "~/components/icons"

export const meta: MetaFunction = () => [
  { title: "Micrantha Software | Solutions" },
  {
    name: "description",
    content:
      "Mature Micrantha products, including Fortunes Service, Veil, Amaryllis, and Anthesis.",
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
        title="Amaryllis"
        url="https://amaryllis.micrantha.com"
        icon={<AmaryllisIcon />}
      >
        A react-native SDK for on-device mobile inference.
      </Card>
      <Card
        title="Anthesis"
        url="https://anthesis.micrantha.com"
        icon={<AnthesisIcon />}
      >
        Agentic SDLC with governed autonomy and auditability.
      </Card>
      <Card
        title="Fortunes Service"
        url="https://fortunes.micrantha.com"
        icon={<FortunesIcon />}
        actions={[
          <a
            key="slack-app"
            href="https://slack.com/apps/A8MAPLX53-fortunes"
            rel="noopener noreferrer"
            target="_blank"
          >
            Slack App
          </a>,
        ]}
      >
        A micro-service and Slack app for UNIX fortunes.
      </Card>
      <Card title="Veil" icon={<VeilIcon />} url="https://veil.micrantha.com">
        A micro-service to pseudo-randomly obfuscate a profile photo for fun or
        security.
      </Card>
    </div>
  </div>
)

export default Solutions
