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
      "Micrantha products in active use, including Fortunes Service, Veil, Amaryllis, and internally used Anthesis.",
    path: "/solutions",
  })

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Solutions",
    description:
      "Micrantha products in active use, including Fortunes Service, Veil, Amaryllis, and internally used Anthesis.",
    path: "/solutions",
    items: [
      {
        name: "Amaryllis",
        description:
          "A React Native SDK for on-device mobile inference and ai-enabled components.",
        url: "https://amaryllis.micrantha.com",
      },
      {
        name: "Anthesis",
        description:
          "Internally used agentic SDLC with governed autonomy, auditability and replayability.",
        url: "https://anthesis.dev",
      },
      {
        name: "Fortunes Service",
        description:
          "A microservice, progressive web and Slack app for UNIX fortunes.",
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
      subtitle="Products that have grown into active use, including internal use."
    />

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card
        title="Amaryllis"
        url="https://amaryllis.micrantha.com"
        icon={<AmaryllisIcon />}
        headingLevel={2}
        className={cardStyles.neutral}
      >
        A React Native SDK for on-device mobile inference and ai-enabled
        components.
      </Card>
      <Card
        title="Anthesis"
        url="https://anthesis.dev"
        icon={<AnthesisIcon />}
        headingLevel={2}
        className={cardStyles.green}
      >
        Internally used agentic SDLC with governed autonomy, auditability and
        replayability.
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
        A microservice, progressive web and Slack app for UNIX fortunes.
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

    <section className="mt-10 max-w-3xl space-y-4">
      <h2 className="text-xl">Related architecture notes</h2>
      <p>
        The blog tracks the architectural concerns behind these systems:
        governed AI execution, integration control surfaces, and software
        boundaries that keep platforms replaceable.
      </p>
      <p>
        Start with{" "}
        <a href="/blog/ai-pipelines-need-control-boundaries">
          AI Pipelines Need Control Boundaries
        </a>{" "}
        or{" "}
        <a href="/blog/software-layers-are-risk-boundaries">
          Software Layers Are Risk Boundaries
        </a>
        .
      </p>
    </section>
  </div>
)

export default Solutions
