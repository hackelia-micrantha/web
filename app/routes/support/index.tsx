import { PageTitle, Card } from "~/components"
import { EmailIcon, SlackIcon, IrcIcon } from "~/components/icons"

const Support = () => (
  <div>
    <PageTitle
      title="Support"
      subtitle="Encountering problems or need assistance?"
    />

    <div className="grid grid-cols-3">
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
        <a href="https://micrantha.slack.com">slack workspace</a>
        and post your question in <b>#support</b>.
      </Card>
    </div>
  </div>
)

export default Support
