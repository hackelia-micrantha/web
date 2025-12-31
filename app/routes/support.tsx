import type { MetaFunction } from "@remix-run/node"
import { PageTitle, Card } from "~/components"
import { EmailIcon, SlackIcon, IrcIcon } from "~/components/icons"

export const meta: MetaFunction = () => [
  { title: "Micrantha Software | Support" },
  {
    name: "description",
    content: "Support options for Micrantha products and services.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://micrantha.com/support",
  },
]

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
      >
        Send an email inquiries to{" "}
        <a href="mailto:support@micrantha.com">support@micrantha.com</a>.
      </Card>

      <Card title="IRC" icon={<IrcIcon />} url="https://libera.chat">
        Join <b>#micrantha</b> on IRC via{" "}
        <a href="https://libera.chat">libera.chat</a>.
      </Card>

      <Card
        title="Slack"
        icon={<SlackIcon />}
        url="https://micrantha.slack.com"
      >
        Request to join the{" "}
        <a href="https://micrantha.slack.com">slack workspace</a> and post your
        question in <b>#support</b>.
      </Card>
    </div>
  </div>
)

export default Support
