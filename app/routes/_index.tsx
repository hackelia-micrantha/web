import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Card } from "~/components"
import { AnthesisIcon, DubniumIcon } from "~/components/icons"
import {
  featuredHomepageProjectSlugs,
  projectBySlug,
  projectCollectionDescriptions,
} from "~/data/project-catalog"
import { cardStyles } from "~/utils/card-styles"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"

const homepageProjectPresentation = {
  dubnium: {
    icon: <DubniumIcon />,
    className: cardStyles.cyan,
  },
  anthesis: {
    icon: <AnthesisIcon />,
    className: cardStyles.green,
  },
} as const

const homepagePresentationFor = (slug: string) => {
  const presentation =
    homepageProjectPresentation[
      slug as keyof typeof homepageProjectPresentation
    ]

  if (!presentation) {
    throw new Error(`Missing homepage presentation for project: ${slug}`)
  }

  return presentation
}

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Secure AI, Mobile & Platform Engineering",
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
        description: projectCollectionDescriptions.solution,
        url: "https://micrantha.com/solutions",
      },
      {
        name: "Laboratory",
        description: projectCollectionDescriptions.laboratory,
        url: "https://micrantha.com/laboratory",
      },
      {
        name: "Collaborate",
        description:
          "Ways to contribute to Micrantha projects, partner strategically, provide infrastructure, or help validate projects in real environments.",
        url: "https://micrantha.com/#collaborate",
      },
      {
        name: "Philosophy",
        description: "Micrantha's approach to building work that compounds.",
        url: "https://micrantha.com/philosophy",
      },
      {
        name: "Research",
        description:
          "Research papers and technical analysis informing Micrantha.",
        url: "https://micrantha.com/research",
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
    <div className="space-y-12">
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
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link className="button" to="/services">
                Request a consultation
              </Link>
              <a className="button button-outline" href="#solutions">
                See the work
              </a>
              <Link className="text-sm font-medium" to="/blog">
                Read architecture notes
              </Link>
              <a className="text-sm font-medium" href="#collaborate">
                Collaborate
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="solutions"
        className="space-y-6 border-t border-gray-200 pt-12"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            Featured technology
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Systems for governed delivery.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            {projectCollectionDescriptions.solution}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {featuredHomepageProjectSlugs.solution.map((slug) => {
            const project = projectBySlug(slug)
            const presentation = homepagePresentationFor(slug)

            return (
              <Card
                key={project.slug}
                title={project.name}
                url={project.url}
                icon={presentation.icon}
                headingLevel={3}
                className={presentation.className}
              >
                {project.summary}
              </Card>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/solutions">View all solutions</Link>
          <Link to="/laboratory">Explore the lab</Link>
        </div>
      </section>

      <section
        id="services"
        className="space-y-4 border-t border-gray-200 pt-12"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
          Services
        </p>
        <h2 className="text-2xl tracking-tight md:text-3xl">
          Engineering support for systems that need to survive production.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          AI development and governance, mobile platforms, secure systems, and
          production deployments. Help for teams moving from fragile prototypes
          to maintainable systems.
        </p>
        <Link className="inline-block text-sm" to="/services">
          Explore services
        </Link>
      </section>

      <section
        id="laboratory"
        className="space-y-4 border-t border-gray-200 pt-12"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
          Laboratory
        </p>
        <h2 className="text-2xl tracking-tight md:text-3xl">
          Testbeds that validate the architecture.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          {projectCollectionDescriptions.laboratory}
        </p>
        <Link className="inline-block text-sm" to="/laboratory">
          Browse experiments
        </Link>
      </section>

      <section
        id="insights"
        className="space-y-4 border-t border-gray-200 pt-12"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
          Research and insights
        </p>
        <h2 className="text-2xl tracking-tight md:text-3xl">
          Research and architecture notes.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Research papers and technical writing on secure platform integration,
          delivery governance, AI-assisted systems, and long-lived software
          design.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/research">Explore research</Link>
          <Link to="/blog">Browse architecture notes</Link>
        </div>
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
          Work develops iteratively, guided by quality, time, and cost.
          Gardening is the metaphor: tend the soil, grow the seeds, cultivate
          the garden.
        </p>
        <Link className="inline-block text-sm" to="/philosophy">
          Read the full philosophy
        </Link>
      </section>

      <section
        id="collaborate"
        className="space-y-6 border-t border-gray-200 pt-12"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            Collaborate
          </p>
          <h2 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Help build, validate, and grow the Micrantha ecosystem.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Micrantha is looking for project contributors, strategic partners, a
            co-founder or long-term operating partner, hardware and
            infrastructure resources, and teams willing to exercise projects
            against real-world requirements.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <a href="mailto:services@micrantha.com?subject=Micrantha%20collaboration">
            Discuss a partnership
          </a>
          <a href="https://github.com/hackelia-micrantha/.github/blob/main/CONTRIBUTING.md">
            Contribute to a public project
          </a>
          <a href="https://anthesis.micrantha.com/#collaborate">
            Anthesis agentic-system trials
          </a>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Collaboration does not bypass project governance, security review,
          publication boundaries, or repository trust controls.
        </p>
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
              For consultations or operational support, contact Micrantha
              directly.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="mailto:services@micrantha.com">services@micrantha.com</a>
              <Link to="/support">Support options</Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link className="button" to="/services">
              Request a consultation
            </Link>
            <Link className="text-sm font-medium" to="/support">
              View support options
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
