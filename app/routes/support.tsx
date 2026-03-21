import type { MetaFunction } from "@remix-run/node"
import { PageTitle, Card, ExternalLink } from "~/components"
import { EmailIcon, SlackIcon, IrcIcon } from "~/components/icons"
import { buildPageMeta } from "~/utils/seo"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Support",
    description: "Support options for Micrantha products and services.",
    path: "/support",
  })

const Support = () => (
  <div>
    <PageTitle
      title="Support"
      subtitle="Encountering problems or need assistance?"
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        title="Email"
        icon={<EmailIcon />}
        url="mailto:support@micrantha.com"
        headingLevel={2}
      >
        Send an email inquiries to{" "}
        <a href="mailto:support@micrantha.com">support@micrantha.com</a>.
      </Card>

      <Card
        title="IRC"
        icon={<IrcIcon />}
        url="https://libera.chat"
        headingLevel={2}
      >
        Join <b>#micrantha</b> on IRC via{" "}
        <ExternalLink href="https://libera.chat">libera.chat</ExternalLink>.
      </Card>

      <Card
        title="Slack"
        icon={<SlackIcon />}
        url="https://micrantha.slack.com"
        headingLevel={2}
      >
        Request to join the{" "}
        <ExternalLink href="https://micrantha.slack.com">
          slack workspace
        </ExternalLink>{" "}
        and post your question in <b>#support</b>.
      </Card>
    </div>
  </div>
)

export default Support
