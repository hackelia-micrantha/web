import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Card } from "~/components";
import { cardStyles } from "~/utils/card-styles";
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo";
import {
  AnthesisIcon,
  BluebellIcon,
  FortunesIcon,
  HyperionIcon,
  MyotosisIcon,
  AmaryllisIcon,
} from "~/components/icons";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Home",
    description:
      "Micrantha builds secure backend, platform, and AI-governance systems with evidence boundaries, delivery controls, and production-oriented architecture.",
    path: "/",
  });

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Micrantha Software",
    description:
      "Micrantha builds secure backend, platform, and AI-governance systems.",
    path: "/",
    items: [
      {
        name: "Services",
        description:
          "Principal-level engineering support across secure backend systems, platform architecture, AI governance, and production delivery.",
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
          "Projects in active growth, including Hyperion, Anthesis, Dubnium, and Myotosis.",
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
};

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
              Principal backend, platform, and AI-governance engineering.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
              Micrantha builds trust-sensitive software foundations: secure
              backend services, platform control surfaces, agentic workflow
              governance, and delivery systems that remain reviewable after the
              demo.
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Delivery
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Backend services, mobile/client integrations, and production
                  deployment paths.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Governance
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Approval gates, replayability, auditability, and evidence
                  capture for AI-assisted work.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Reliability
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  GitOps, CI/CD, secret boundaries, and failure-aware operating
                  models.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Where Teams Get Stuck
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
            Fragile AI delivery
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Agentic workflows need prompt contracts, execution envelopes,
            approvals, and review traces before they can carry production work.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Where Teams Get Stuck
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
            Platform drift
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Backends, mobile clients, auth boundaries, and deployment paths
            decay when ownership and control surfaces stay implicit.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            What We Bring
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
            Production-minded depth
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Hands-on architecture across backend services, client-server trust,
            platform automation, secure delivery, and AI governance.
          </p>
        </div>
      </section>

      <section
        id="services"
        className="space-y-6 border-t border-gray-200 pt-12"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Services
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Secure platform engineering for trust-sensitive systems.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            We help teams turn fragile workflows, backend boundaries, and
            AI-assisted delivery paths into systems with explicit controls.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card
            title="Backend & Platform Architecture"
            className={cardStyles.neutral}
          >
            Design services, integration boundaries, workflow state, and
            platform capabilities that product teams can safely build on.
          </Card>
          <Card title="AI Governance" className={cardStyles.green}>
            Add approval boundaries, replayability, auditability, and evidence
            capture around AI-assisted development and agentic workflows.
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            How We Work
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Built for teams past the demo stage.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Micrantha works where architecture has to carry risk: AI-assisted
            delivery, verification-adjacent trust paths, backend integration,
            mobile/client platforms, and production operations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
            <p className="text-lg font-semibold tracking-tight text-slate-900">
              Technical depth
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Backend services, API contracts, auth/session paths, mobile
              runtime behavior, CI/CD, Kubernetes/GitOps, and controlled AI tool
              surfaces.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
            <p className="text-lg font-semibold tracking-tight text-slate-900">
              Engagement style
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Hands-on implementation, architecture review, threat-model
              thinking, and decision support for teams carrying platform risk.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 shadow-[0_14px_30px_rgba(31,42,42,0.08)]">
            <p className="text-lg font-semibold tracking-tight text-slate-900">
              Delivery bias
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Work scoped around production realities: correctness, failure
              modes, maintainability, security boundaries, and governance.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6 border-t border-gray-200 pt-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Solutions
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Systems that show the operating thesis.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Products and internal systems that make backend boundaries, client
            platforms, and governed AI execution concrete.
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
            React Native SDK work for on-device inference and reusable
            AI-capable mobile components.
          </Card>
          <Card
            title="Fortunes Service"
            url="https://fortunes.micrantha.com"
            icon={<FortunesIcon />}
            headingLevel={3}
            className={cardStyles.yellow}
          >
            Small backend service with progressive web and Slack integration
            surfaces.
          </Card>
          <Card
            title="Anthesis"
            url="https://anthesis.dev"
            icon={<AnthesisIcon />}
            headingLevel={3}
            className={cardStyles.green}
          >
            Internally used agentic SDLC focused on approvals, replayability,
            auditability, and human authority.
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Laboratory
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Active project evidence.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Laboratory projects ground the positioning in working systems:
            platform automation, repository governance, local AI infrastructure,
            mobile trust, and LLM control surfaces.
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
            Secure, reproducible lab environments with Kubernetes/GitOps,
            migrations, secret management, and deployment paths.
          </Card>
          <Card
            title="Bluebell"
            icon={<BluebellIcon />}
            url="https://github.com/hackelia-micrantha/bluebell"
            headingLevel={3}
            className={cardStyles.blue}
          >
            Multiplatform mobile SDK and template work that keeps AI-capable
            features inside reusable client-platform boundaries.
          </Card>
          <Card
            title="Project Myotosis"
            url="https://myotosis.micrantha.com"
            icon={<MyotosisIcon />}
            headingLevel={3}
            className={cardStyles.green}
          >
            MCP and LLM registry concepts for mobile clients, tool registration,
            and governed agent workflow integration.
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Philosophy
        </p>
        <h2 className="text-2xl tracking-tight md:text-3xl">
          Work that stays reviewable.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          We build iteratively, guided by quality, time, cost, trust boundaries,
          and evidence. The goal is software teams can operate, review, and
          change without losing control of the system.
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
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
  );
}
