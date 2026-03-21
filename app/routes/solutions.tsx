import type { MetaFunction } from "@remix-run/node"
import { Card, ExternalLink, PageTitle } from "~/components"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"
import {
  FortunesIcon,
  VeilIcon,
  AmaryllisIcon,
  AnthesisIcon,
} from "~/components/icons"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Solutions",
    description:
      "Mature Micrantha products, including Fortunes Service, Veil, Amaryllis, and Anthesis.",
    path: "/solutions",
  })

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Solutions",
    description:
      "Mature Micrantha products, including Fortunes Service, Veil, Amaryllis, and Anthesis.",
    path: "/solutions",
    items: [
      {
        name: "Amaryllis",
        description: "A react-native SDK for on-device mobile inference.",
        url: "https://amaryllis.micrantha.com",
      },
      {
        name: "Anthesis",
        description: "Agentic SDLC with governed autonomy and auditability.",
        url: "https://anthesis.micrantha.com",
      },
      {
        name: "Fortunes Service",
        description: "A micro-service and Slack app for UNIX fortunes.",
        url: "https://fortunes.micrantha.com",
      },
      {
        name: "Veil",
        description:
          "A micro-service to pseudo-randomly obfuscate a profile photo for fun or security.",
        url: "https://veil.micrantha.com",
      },
    ],
  }),
}

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
        headingLevel={2}
        className="border-slate-300 bg-slate-50"
      >
        A react-native SDK for on-device mobile inference.
      </Card>
      <Card
        title="Anthesis"
        url="https://anthesis.micrantha.com"
        icon={<AnthesisIcon />}
        headingLevel={2}
        className="border-emerald-300 bg-emerald-50"
      >
        Agentic SDLC with governed autonomy and auditability.
      </Card>
      <Card
        title="Fortunes Service"
        url="https://fortunes.micrantha.com"
        icon={<FortunesIcon />}
        headingLevel={2}
        className="border-amber-200 bg-[#fffdf5]"
        actions={[
          <ExternalLink
            key="slack-app"
            href="https://slack.com/apps/A8MAPLX53-fortunes"
            newTab
          >
            Slack App
          </ExternalLink>,
        ]}
      >
        A micro-service and Slack app for UNIX fortunes.
      </Card>
      <Card
        title="Veil"
        icon={<VeilIcon />}
        url="https://veil.micrantha.com"
        headingLevel={2}
        className="border-sky-300 bg-sky-50"
      >
        A micro-service to pseudo-randomly obfuscate a profile photo for fun or
        security.
      </Card>
    </div>
  </div>
)

export default Solutions
