import type { MetaFunction } from "@remix-run/node"
import { PageTitle, Card, ExternalLink } from "~/components"
import { EmailIcon, SlackIcon, IrcIcon } from "~/components/icons"
import { cardStyles } from "~/utils/card-styles"
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
      subtitle="Choose the support channel that fits the urgency and shape of the issue."
    />

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card
        title="Email"
        subtitle="Best for detailed support requests"
        icon={<EmailIcon />}
        headingLevel={2}
        className={cardStyles.neutral}
        actions={[
          <a
            key="email-support"
            className="button"
            href="mailto:support@micrantha.com"
          >
            support@micrantha.com
          </a>,
        ]}
      >
        Send support details, screenshots, logs, or reproduction steps by email.
      </Card>

      <Card
        title="IRC"
        subtitle="Best for open technical discussion"
        icon={<IrcIcon />}
        headingLevel={2}
        className={cardStyles.green}
        actions={[
          <ExternalLink
            key="irc-link"
            className="button"
            href="https://libera.chat"
          >
            libera.chat
          </ExternalLink>,
        ]}
      >
        Join <b>#micrantha</b> on IRC for open technical discussion and shared
        troubleshooting.
      </Card>

      <Card
        title="Slack"
        subtitle="Best for team coordination"
        icon={<SlackIcon />}
        headingLevel={2}
        className={cardStyles.blue}
        actions={[
          <ExternalLink
            key="slack-link"
            className="button"
            href="https://micrantha.slack.com"
          >
            Join Slack
          </ExternalLink>,
        ]}
      >
        Request workspace access and post your question in <b>#support</b> for
        team coordination.
      </Card>
    </div>
  </div>
)

export default Support
