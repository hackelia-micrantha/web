import type { MetaFunction } from "@remix-run/node"
import { Card, ExternalLink, PageTitle } from "~/components"
import { cardStyles } from "~/utils/card-styles"
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
      "Micrantha products in active use, including Fortunes Service, Veil, Amaryllis, and Anthesis.",
    path: "/solutions",
  })

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Solutions",
    description:
      "Micrantha products in active use, including Fortunes Service, Veil, Amaryllis, and Anthesis.",
    path: "/solutions",
    items: [
      {
        name: "Amaryllis",
        description: "A React Native SDK for on-device mobile inference.",
        url: "https://amaryllis.micrantha.com",
      },
      {
        name: "Anthesis",
        description: "Agentic SDLC with governed autonomy and auditability.",
        url: "https://anthesis.dev",
      },
      {
        name: "Fortunes Service",
        description: "A microservice and Slack app for UNIX fortunes.",
        url: "https://fortunes.micrantha.com",
      },
      {
        name: "Veil",
        description:
          "A microservice to pseudo-randomly obfuscate a profile photo for fun or security.",
        url: "https://veil.micrantha.com",
      },
    ],
  }),
}

const Solutions = () => (
  <div>
    <PageTitle
      title="Solutions"
      subtitle="Products that have grown into active use."
    />

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Amaryllis"
        url="https://amaryllis.micrantha.com"
        icon={<AmaryllisIcon />}
        headingLevel={2}
        className={cardStyles.neutral}
      >
        A React Native SDK for on-device mobile inference.
      </Card>
      <Card
        title="Anthesis"
        url="https://anthesis.dev"
        icon={<AnthesisIcon />}
        headingLevel={2}
        className={cardStyles.green}
      >
        Agentic SDLC with governed autonomy and auditability.
      </Card>
      <Card
        title="Fortunes Service"
        url="https://fortunes.micrantha.com"
        icon={<FortunesIcon />}
        headingLevel={2}
        className={cardStyles.yellow}
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
        A microservice and Slack app for UNIX fortunes.
      </Card>
      <Card
        title="Veil"
        icon={<VeilIcon />}
        url="https://veil.micrantha.com"
        headingLevel={2}
        className={cardStyles.blue}
      >
        A microservice to pseudo-randomly obfuscate a profile photo for fun or
        security.
      </Card>
    </div>
  </div>
)

export default Solutions
