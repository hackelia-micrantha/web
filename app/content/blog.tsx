import type { ReactNode } from "react"
import { Link } from "@remix-run/react"

export type BlogSeriesMembership = {
  slug: string
  order: number
}

export type BlogPost = {
  slug: string
  title: string
  description: string
  date: string
  excerpt: string
  tags: string[]
  relatedSlugs: string[]
  series?: BlogSeriesMembership
  Content?: () => ReactNode
}
export const BLOG_TITLE = "Architecture Notes"
export const BLOG_DESCRIPTION =
  "Architecture notes on secure platform integration, delivery governance, AI-assisted systems, and long-lived software design."

const PostLink = ({
  slug,
  children,
}: {
  slug: string
  children: ReactNode
}) => <Link to={`/blog/${slug}`}>{children}</Link>

const DiagramFrame = ({
  title,
  caption,
  children,
}: {
  title: string
  caption: string
  children: ReactNode
}) => (
  <figure className="article-diagram">
    <figcaption className="article-diagram-caption">
      <span className="article-diagram-title">{title}</span>
      <span className="article-diagram-note">{caption}</span>
    </figcaption>
    {children}
  </figure>
)

const softwareLayersRiskBoundariesContent = () => (
  <>
    <section className="space-y-4">
      <h2>Why layers still matter</h2>
      <p>
        Layered architecture matters because it is one of the simplest ways to
        keep risk from collapsing into a single code path. Without layers,
        interface concerns, business rules, integration behavior, and
        infrastructure choices drift together until every change becomes a
        coupled change.
      </p>
      <p>
        The useful question is not whether the layers are academically pure. It
        is whether they preserve replaceability and make failure easier to
        localize.
      </p>
      <DiagramFrame
        title="Software layers as risk boundaries"
        caption="Each layer contains a different kind of change so clients, policy, and vendor concerns do not collapse into one code path."
      >
        <img
          className="article-diagram-image"
          src="/img/blog/software_layers_diagram.svg"
          alt="Diagram showing clients flowing into interface and application layers, with the application layer connected to both domain and infrastructure."
        />
      </DiagramFrame>
    </section>

    <section className="space-y-4">
      <h2>Clients and channels</h2>
      <p>
        Mobile apps, browser clients, partner interfaces, background jobs, and
        operator tools all enter the system from different conditions. Their job
        is to collect intent and present results. They should not become the
        place where core workflow rules are defined.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Interface layer</h2>
      <p>
        The interface layer translates between external protocols and internal
        use cases. It handles transport concerns such as request validation,
        authentication context, response shaping, and correlation identifiers.
        It should not be the home of domain policy.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Application layer</h2>
      <p>
        The application layer coordinates workflows. It decides what needs to
        happen in what order, which policies apply, and which collaborators need
        to be invoked. This is where enterprise process shape belongs, including
        AI-assisted steps, approval gates, and integration sequencing.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Domain layer</h2>
      <p>
        The domain layer protects business meaning: state transitions,
        invariants, eligibility rules, and the definitions that make the system
        more than a collection of endpoints. It should remain understandable
        without reference to a UI framework, ERP connector, or model provider.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Infrastructure and adapters</h2>
      <p>
        Infrastructure is where databases, queues, vendor SDKs, ERP connectors,
        mobile platform services, and model providers live. These adapters are
        necessary, but they should remain replaceable. When they leak upward
        into policy code, vendor replacement becomes a rewrite instead of an
        integration task.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Why each layer exists</h2>
      <ul>
        <li>
          Clients and channels isolate user-facing behavior and device-specific
          constraints.
        </li>
        <li>
          The interface layer protects the system from protocol churn and input
          ambiguity.
        </li>
        <li>
          The application layer governs workflow sequencing and approvals.
        </li>
        <li>
          The domain layer preserves business rules independent of tools and
          vendors.
        </li>
        <li>
          Infrastructure and adapters keep external systems attached without
          turning them into the center of the design.
        </li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2>Why this helps in real programs</h2>
      <p>
        On mobile programs, it keeps device and channel concerns from taking
        over core business logic. In system integration and enterprise
        modernization work, it prevents a vendor interface from becoming the
        architecture. In AI-enabled workflows, it creates a safe place for
        retrieval, reasoning, and validation without promoting the model to
        system authority.
      </p>
      <p>
        It also supports replacement. A mobile client can be rebuilt, an ERP
        connector can be swapped, or an AI provider can change without forcing a
        redesign of the domain. That is the point of keeping the boundaries
        clear.
      </p>
      <p>
        The operational side of that same argument shows up in{" "}
        <PostLink slug="secure-platform-integration-is-not-plumbing">
          Secure Platform Integration Is Not Plumbing
        </PostLink>
        , where the integration layer is treated as a control surface rather
        than a transport detail.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Conclusion</h2>
      <p>
        Software layers are not only a code-organization preference. They are
        risk boundaries. They decide whether business rules stay durable,
        whether integrations remain replaceable, and whether runtime concerns
        can change without pulling the whole system apart.
      </p>
    </section>
  </>
)

export const blogPosts: BlogPost[] = [
  {
    slug: "secure-platform-integration-is-not-plumbing",
    title: "Secure Platform Integration Is Not Plumbing",
    description:
      "Why enterprise integration layers are control surfaces for workflow correctness, identity, observability, and recovery.",
    date: "2026-04-24",
    excerpt:
      "Integration layers are where identity, data quality, workflow semantics, and recovery become explicit. Treating them as plumbing is how modernization programs lose control.",
    tags: [
      "architecture-notes",
      "platform-integration",
      "delivery-governance",
      "enterprise-modernization",
    ],
    relatedSlugs: [
      "ai-pipelines-need-control-boundaries",
      "software-layers-are-risk-boundaries",
    ],
    series: {
      slug: "architecture-control-boundaries",
      order: 1,
    },
  },
  {
    slug: "ai-pipelines-need-control-boundaries",
    title: "AI Pipelines Need Control Boundaries",
    description:
      "Enterprise AI should be treated as an untrusted reasoning component inside a governed integration path.",
    date: "2026-04-24",
    excerpt:
      "Enterprise AI becomes safer and more useful when normalization, authorization, validation, and write-back controls are explicit around it.",
    tags: [
      "architecture-notes",
      "ai-governance",
      "workflow-validation",
      "secure-integration",
    ],
    relatedSlugs: [
      "secure-platform-integration-is-not-plumbing",
      "software-layers-are-risk-boundaries",
    ],
    series: {
      slug: "architecture-control-boundaries",
      order: 2,
    },
  },
  {
    slug: "software-layers-are-risk-boundaries",
    title: "Software Layers Are Risk Boundaries",
    description:
      "Why layered architecture keeps business rules, integration boundaries, security decisions, and runtime concerns from collapsing into each other.",
    date: "2026-04-24",
    excerpt:
      "Layering is how mobile, integration, and AI-enabled systems stay governable when vendors, channels, and runtime concerns change around them.",
    tags: [
      "architecture-notes",
      "layered-architecture",
      "mobile-systems",
      "enterprise-architecture",
    ],
    relatedSlugs: [
      "secure-platform-integration-is-not-plumbing",
      "ai-pipelines-need-control-boundaries",
    ],
    series: {
      slug: "architecture-control-boundaries",
      order: 3,
    },
    Content: softwareLayersRiskBoundariesContent,
  },
]

export function getBlogPosts() {
  return blogPosts
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null
}

export function getRelatedPosts(post: BlogPost) {
  return post.relatedSlugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((candidate): candidate is BlogPost => candidate !== null)
}
export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}
