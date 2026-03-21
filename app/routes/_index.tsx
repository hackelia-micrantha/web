import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Card } from "~/components"
import { buildPageMeta } from "~/utils/seo"
import {
  AnthesisIcon,
  BluebellIcon,
  FortunesIcon,
  HyperionIcon,
  MysotosisIcon,
  AmaryllisIcon,
} from "~/components/icons"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Home",
    description:
      "Micrantha helps teams build, govern, and ship software that can survive production, with depth in AI, mobile platforms, secure systems, and deployments.",
    path: "/",
  })

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
          <h1 className="text-4xl">
            Build, govern, and ship software that can survive production.
          </h1>
          <p className="mt-4 text-base text-gray-700">
            Broad engineering support across AI development, AI governance,
            mobile platforms, secure authentication, and deployment systems for
            teams turning fragile software into production systems.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link className="button" to="/services">
              Request a consultation
            </Link>
            <Link className="button button-outline" to="/services">
              Explore services
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
          <h2 className="text-2xl">
            Broad engineering with depth in AI, mobile platforms, secure
            systems, and production delivery.
          </h2>
          <p className="mt-3 text-gray-700">
            We help teams turn fragile products, platforms, and workflows into
            production systems.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card title="AI Development">
            Build AI-enabled products, internal tools, and workflows that
            integrate with real software systems instead of living as isolated
            demos.
          </Card>
          <Card title="AI Governance">
            Add policy, review, auditability, and operational controls around
            AI-assisted development and AI-enabled systems.
          </Card>
          <Card title="Mobile Platforms">
            Modernize mobile foundations, untangle platform architecture, and
            support secure, maintainable client delivery.
          </Card>
          <Card title="Secure Systems">
            Harden authentication, authorization, and access boundaries for
            systems where trust, compliance, and risk matter.
          </Card>
          <Card title="Production Deployments">
            Design the environments, rollout paths, and operational foundations
            needed to ship reliably and keep systems stable after release.
          </Card>
        </div>
        <Link className="inline-block text-sm" to="/services">
          Explore services
        </Link>
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
            headingLevel={3}
          >
            A react-native SDK for on-device mobile inference.
          </Card>
          <Card
            title="Fortunes Service"
            url="https://fortunes.micrantha.com"
            icon={<FortunesIcon />}
            headingLevel={3}
          >
            A micro-service and Slack app for UNIX fortunes.
          </Card>
          <Card
            title="Anthesis"
            url="https://anthesis.micrantha.com"
            icon={<AnthesisIcon />}
            headingLevel={3}
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
          <Card
            title="Project Hyperion"
            icon={<HyperionIcon />}
            headingLevel={3}
          >
            Secure, reproducible lab environments, migrations, and deploys.
          </Card>
          <Card title="Bluebell" icon={<BluebellIcon />} headingLevel={3}>
            Multiplatform mobile SDK with AI capable features.
          </Card>
          <Card
            title="Project Mysotosis"
            icon={<MysotosisIcon />}
            headingLevel={3}
          >
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
