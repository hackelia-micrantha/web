import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Card } from "~/components"
import { cardStyles } from "~/utils/card-styles"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"
import {
  AnthesisIcon,
  BluebellIcon,
  FortunesIcon,
  HyperionIcon,
  MyotosisIcon,
  AmaryllisIcon,
} from "~/components/icons"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Home",
    description:
      "Micrantha helps teams build, govern, and ship software that can survive production, with depth in AI, mobile platforms, secure systems, and deployments.",
    path: "/",
  })

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Micrantha Software",
    description:
      "Micrantha helps teams build, govern, and ship software that can survive production.",
    path: "/",
    items: [
      {
        name: "Services",
        description:
          "Engineering support across AI development, AI governance, mobile platforms, secure systems, and production delivery.",
        url: "https://micrantha.com/services",
      },
      {
        name: "Solutions",
        description:
          "Products in active use, including Amaryllis, Fortunes Service, and internally used Anthesis.",
        url: "https://micrantha.com/solutions",
      },
      {
        name: "Laboratory",
        description:
          "Projects in active growth, including Hyperion, Bluebell, and Myotosis.",
        url: "https://micrantha.com/laboratory",
      },
      {
        name: "Philosophy",
        description: "Micrantha's approach to building work that compounds.",
        url: "https://micrantha.com/philosophy",
      },
      {
        name: "Blog",
        description:
          "Architecture notes on secure platform integration, delivery governance, AI-assisted systems, and long-lived software design.",
        url: "https://micrantha.com/blog",
      },
    ],
  }),
}

export default function Index() {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(250,248,242,0.96),rgba(236,243,238,0.94)_52%,rgba(226,235,244,0.94))] px-6 py-10 shadow-[0_24px_60px_rgba(31,42,42,0.10)] backdrop-blur-sm md:px-10 md:py-12">
        <div className="relative flex flex-col items-start justify-center gap-8 md:flex-row md:items-center">
          <div className="flex w-full justify-center md:w-auto md:shrink-0">
            <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(219,234,247,0.85),rgba(255,255,255,0.96))] p-5 shadow-[0_18px_40px_rgba(31,42,42,0.10)]">
              <img
                src="/img/logo.svg"
                width="168"
                height="168"
                alt="Micrantha"
                className="h-32 w-32 md:h-40 md:w-40"
              />
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-800">
              Micrantha Software
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-tight tracking-tight text-slate-900 md:text-5xl">
              Software that grows with you.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
              Broad engineering support across AI development, AI governance,
              mobile platforms, secure authentication, and deployment systems
              for teams turning fragile software into production systems.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="button" to="/services">
                Request a consultation
              </Link>
              <Link className="button button-outline" to="/solutions">
                View active solutions
              </Link>
              <Link className="button button-outline" to="/blog">
                Read architecture notes
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Delivery
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  AI systems, mobile platforms, and deployment foundations.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Governance
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Auditability, policy, and operational control for durable
                  teams.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Reliability
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Architecture that keeps working after the demo is over.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
            Where Teams Get Stuck
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
            Fragile AI delivery
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            We help teams move from isolated demos and brittle workflows to
            systems that fit real engineering environments.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
            Where Teams Get Stuck
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
            Platform drift
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Mobile foundations, auth boundaries, and deployment paths tend to
            decay unless someone restores structure and operational discipline.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
            What We Bring
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
            Production-minded depth
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Clear tradeoffs, governed delivery, and systems thinking across AI,
            mobile, security, and release engineering.
          </p>
        </div>
      </section>

      <section
        id="services"
        className="space-y-6 border-t border-gray-200 pt-12"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            Services
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Broad engineering with depth in AI, mobile platforms, secure
            systems, and production delivery.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            We help teams turn fragile products, platforms, and workflows into
            production systems.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card title="AI Development" className={cardStyles.neutral}>
            Build AI-enabled products, internal tools, and workflows that
            integrate with real software systems instead of living as isolated
            demos.
          </Card>
          <Card title="AI Governance" className={cardStyles.green}>
            Add policy, review, auditability, and operational controls around
            AI-assisted development and AI-enabled systems.
          </Card>
          <Card title="Mobile Platforms" className={cardStyles.blue}>
            Modernize mobile foundations, untangle platform architecture, and
            support secure, maintainable client delivery.
          </Card>
          <Card title="Secure Systems" className={cardStyles.red}>
            Harden authentication, authorization, and access boundaries for
            systems where trust, compliance, and risk matter.
          </Card>
          <Card title="Production Deployments" className={cardStyles.yellow}>
            Design the environments, rollout paths, and operational foundations
            needed to ship reliably and keep systems stable after release.
          </Card>
        </div>
        <Link className="inline-block text-sm" to="/services">
          Explore services
        </Link>
      </section>

      <section className="space-y-6 border-t border-gray-200 pt-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            How We Work
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Built for teams past the demo stage.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Micrantha works where software gets fragile: AI delivery that needs
            governance, mobile platforms that need structure, and systems that
            need to survive production.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
            <p className="text-lg font-semibold tracking-tight text-slate-900">
              Technical depth
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              AI product work, mobile foundations, secure authentication,
              deployment systems, and operational cleanup.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
            <p className="text-lg font-semibold tracking-tight text-slate-900">
              Engagement style
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Hands-on implementation, technical review, and decision support
              for teams that need forward motion without extra noise.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
            <p className="text-lg font-semibold tracking-tight text-slate-900">
              Delivery bias
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Work scoped around production realities: constraints, failure
              modes, maintainability, and governance.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6 border-t border-gray-200 pt-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            Architecture Notes
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Technical writing for teams dealing with real delivery constraints.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Architecture notes on secure platform integration, delivery
            governance, AI-assisted systems, and long-lived software design.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            title="Secure Platform Integration Is Not Plumbing"
            url="/blog/secure-platform-integration-is-not-plumbing"
            className={cardStyles.neutral}
          >
            Integration layers are operational control surfaces, not just pipes
            between systems.
          </Card>
          <Card
            title="AI Pipelines Need Control Boundaries"
            url="/blog/ai-pipelines-need-control-boundaries"
            className={cardStyles.blue}
          >
            Treat AI as an untrusted reasoning component inside a governed
            integration path.
          </Card>
          <Card
            title="Software Layers Are Risk Boundaries"
            url="/blog/software-layers-are-risk-boundaries"
            className={cardStyles.green}
          >
            Layering is how business rules, integrations, and security decisions
            stay replaceable.
          </Card>
        </div>

        <Link className="inline-block text-sm" to="/blog">
          Browse the full series
        </Link>
      </section>

      <section
        id="solutions"
        className="space-y-6 border-t border-gray-200 pt-12"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            Solutions
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Products in active use, including internal use.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Products that teams can adopt directly, or internally used systems
            that show the direction of durable delivery.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            title="Amaryllis"
            url="https://amaryllis.micrantha.com"
            icon={<AmaryllisIcon />}
            headingLevel={3}
            className={cardStyles.neutral}
          >
            A React Native SDK for on-device mobile inference.
          </Card>
          <Card
            title="Fortunes Service"
            url="https://fortunes.micrantha.com"
            icon={<FortunesIcon />}
            headingLevel={3}
            className={cardStyles.yellow}
          >
            A microservice and Slack app for UNIX fortunes.
          </Card>
          <Card
            title="Anthesis"
            url="https://anthesis.dev"
            icon={<AnthesisIcon />}
            headingLevel={3}
            className={cardStyles.green}
          >
            Internally used agentic SDLC with governed autonomy and
            auditability.
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
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            Laboratory
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Projects in active growth.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Experimental systems, SDKs, and infrastructure work still being
            refined in public.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            title="Project Hyperion"
            icon={<HyperionIcon />}
            url="https://hyperion.micrantha.com"
            headingLevel={3}
            className={cardStyles.neutral}
          >
            Secure, reproducible lab environments, migrations, and deploys.
          </Card>
          <Card
            title="Bluebell"
            icon={<BluebellIcon />}
            url="https://github.com/hackelia-micrantha/bluebell"
            headingLevel={3}
            className={cardStyles.blue}
          >
            Multiplatform mobile SDK with AI-capable features.
          </Card>
          <Card
            title="Project Myotosis"
            url="https://myotosis.micrantha.com"
            icon={<MyotosisIcon />}
            headingLevel={3}
            className={cardStyles.green}
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
          Philosophy
        </p>
        <h2 className="text-2xl tracking-tight md:text-3xl">
          Work that compounds.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          We build iteratively, guided by quality, time, and cost. Gardening is
          our metaphor: tend the soil, grow the seeds, cultivate the garden.
        </p>
        <Link className="inline-block text-sm" to="/philosophy">
          Read the full philosophy
        </Link>
      </section>

      <section
        id="contact"
        className="rounded-[2rem] border border-slate-200 bg-white/80 px-6 py-8 shadow-[0_20px_45px_rgba(31,42,42,0.08)]"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Contact
            </p>
            <h2 className="text-2xl tracking-tight md:text-3xl">
              Start the conversation.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-slate-700">
              For consultations or operational support, reach us directly.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="mailto:services@micrantha.com">services@micrantha.com</a>
              <Link to="/support">Support options</Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="button" to="/services">
              Request a consultation
            </Link>
            <Link className="button button-outline" to="/support">
              View support options
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
