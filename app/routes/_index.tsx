import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Card } from "~/components"
import {
  AnthesisIcon,
  BluebellIcon,
  FortunesIcon,
  HyperionIcon,
  MysotosisIcon,
  AmaryllisIcon,
} from "~/components/icons"

export const meta: MetaFunction = () => [
  { title: "Micrantha Software | Home" },
  {
    name: "description",
    content:
      "Micrantha builds resilient software systems from discovery to production. Explore services, solutions, and the laboratory.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://micrantha.com/",
  },
]

export default function Index() {
  return (
    <div className="space-y-20">
      <section className="flex flex-col items-center justify-center gap-8 md:flex-row">
        <div className="md:shrink-0">
          <img src="/img/logo.svg" width="160" height="160" alt="Micrantha" />
        </div>

        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Micrantha Software
          </p>
          <h1 className="text-4xl">Software that grows with you.</h1>
          <p className="mt-4 text-base text-gray-700">
            Design and delivery of resilient systems from discovery to
            production.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              className="button"
              href="mailto:services@micrantha.com?subject=Consultation"
            >
              Request a consultation
            </a>
            <Link className="button button-outline" to="/#solutions">
              See solutions
            </Link>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="space-y-6 border-t border-gray-200 pt-12"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Services
          </p>
          <h2 className="text-2xl">Focused, end-to-end work.</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card title="Product strategy and architecture">
            Clarify scope, constraints, and outcomes.
          </Card>
          <Card title="Full-stack delivery">
            Web, mobile, infrastructure, and integration.
          </Card>
          <Card title="Reliability and maintenance">
            Hardening, monitoring, and iteration.
          </Card>
          <Card title="AI-assisted development">
            Accelerated delivery with governance.
          </Card>
        </div>
      </section>

      <section
        id="solutions"
        className="space-y-6 border-t border-gray-200 pt-12"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Solutions
          </p>
          <h2 className="text-2xl">Products in active use.</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            title="Amaryllis"
            url="https://amaryllis.micrantha.com"
            icon={<AmaryllisIcon />}
          >
            A react-native SDK for on-device mobile inference.
          </Card>
          <Card
            title="Fortunes Service"
            url="https://fortunes.micrantha.com"
            icon={<FortunesIcon />}
          >
            A micro-service and Slack app for UNIX fortunes.
          </Card>
          <Card
            title="Anthesis"
            url="https://anthesis.micrantha.com"
            icon={<AnthesisIcon />}
          >
            Agentic SDLC with governed autonomy and auditability.
          </Card>
        </div>
        <Link className="inline-block text-sm" to="/solutions">
          View all solutions
        </Link>
      </section>

      <section
        id="laboratory"
        className="space-y-6 border-t border-gray-200 pt-12"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Laboratory
          </p>
          <h2 className="text-2xl">Projects in active growth.</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card title="Project Hyperion" icon={<HyperionIcon />}>
            Secure, reproducible lab environments, migrations, and deploys.
          </Card>
          <Card title="Bluebell" icon={<BluebellIcon />}>
            Multiplatform mobile SDK with AI-generated features.
          </Card>
          <Card title="Project Mysotosis" icon={<MysotosisIcon />}>
            MCP and LLM registry for mobile clients.
          </Card>
        </div>
        <Link className="inline-block text-sm" to="/laboratory">
          Explore the lab
        </Link>
      </section>

      <section
        id="philosophy"
        className="space-y-4 border-t border-gray-200 pt-12"
      >
        <p className="text-xs uppercase tracking-widest text-gray-500">
          Philosophy
        </p>
        <h2 className="text-2xl">Work that compounds.</h2>
        <p className="text-gray-700">
          We build iteratively, guided by quality, time, and cost. Gardening is
          our metaphor: tend the soil, grow the seeds, cultivate the garden.
        </p>
        <Link className="inline-block text-sm" to="/philosophy">
          Read the full philosophy
        </Link>
      </section>

      <section
        id="contact"
        className="space-y-4 border-t border-gray-200 pt-12"
      >
        <p className="text-xs uppercase tracking-widest text-gray-500">
          Contact
        </p>
        <h2 className="text-2xl">Start the conversation.</h2>
        <p className="text-gray-700">
          For consultations or support, reach us directly.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="mailto:services@micrantha.com">services@micrantha.com</a>
          <Link to="/support">Support options</Link>
        </div>
      </section>

      <section className="rounded border border-gray-200 p-6 text-center">
        <p className="text-lg">Let us grow something durable.</p>
        <a
          className="button mt-4"
          href="mailto:services@micrantha.com?subject=Consultation"
        >
          Start a conversation
        </a>
      </section>
    </div>
  )
}
