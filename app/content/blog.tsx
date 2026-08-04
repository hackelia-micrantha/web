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

const securePlatformIntegrationContent = () => (
  <>
    <section className="space-y-4">
      <h2>Problem statement</h2>
      <p>
        Integration work is often treated like a narrow technical chore: map a
        few fields, move some records, and declare the systems connected. That
        view is too small. The integration layer is where identity gets
        translated, workflow state changes hands, upstream data quality becomes
        visible, and recovery paths either exist or do not.
      </p>
      <p>
        In modernization programs, this layer is also where operating risk
        accumulates. The moment multiple systems share responsibility for a
        process, the integration path becomes a control surface for correctness,
        observability, and operational recovery.
      </p>
      <div className="article-callout">
        <p>
          Secure platform integration is not plumbing. It is the place where
          data contracts, trust boundaries, workflow semantics, and failure
          handling must become explicit.
        </p>
      </div>
    </section>

    <section className="space-y-4">
      <h2>Why integration fails in modernization programs</h2>
      <p>
        Programs usually fail here for ordinary reasons, not exotic ones. Teams
        assume the source systems are better defined than they are. A delivery
        plan focuses on feature parity while leaving state reconciliation,
        retries, identity mapping, and operator visibility for later. The result
        is an integration layer that moves data but cannot explain whether the
        business process is actually healthy.
      </p>
      <p>
        This gets worse when the integration path is built inside a single
        vendor implementation mindset. Once orchestration rules, security
        decisions, and business corrections collapse into one integration path,
        replacement gets more expensive and defects get harder to isolate.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Layered control model</h2>
      <p>
        The useful pattern is a layered one: contract and identity at the
        ingress boundary, workflow mediation in the application layer, durable
        event and observability records around the transaction, and explicit
        recovery tooling for operators.
      </p>
      <DiagramFrame
        title="Integration control path"
        caption="Contracts and trust enter at the edge; recovery and observability stay explicit instead of incidental."
      >
        <img
          className="article-diagram-image"
          src="/img/blog/erp_integration_diagram.svg"
          alt="Diagram showing channels and source systems flowing through an API gateway, identity and validation controls into ERP core, then outward to workflows, reporting, and CI/CD."
        />
      </DiagramFrame>
      <p>
        The diagram forces the questions that matter: where is identity
        asserted, where is state normalized, where are business decisions made,
        and where do operators go when a transaction is partial?
      </p>
    </section>

    <section className="space-y-4">
      <h2>Common failure modes</h2>
      <ul>
        <li>
          Field mapping succeeds while workflow semantics drift, so records
          exist in both systems but represent different business states.
        </li>
        <li>
          Retry logic duplicates side effects because idempotency and replay
          keys were never designed into the path.
        </li>
        <li>
          Identity and entitlement assumptions leak across systems, creating
          authorization gaps that are hard to audit later.
        </li>
        <li>
          Monitoring focuses on transport errors while silent data-quality
          failures continue downstream.
        </li>
        <li>
          Recovery depends on ad hoc scripts and institutional memory instead of
          designed operator workflows.
        </li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2>Practical controls</h2>
      <ul>
        <li>
          Define versioned interface contracts and keep contract validation at
          the edge rather than distributing it across consumers.
        </li>
        <li>
          Separate transport adapters from business workflow rules so the
          integration layer can survive vendor or platform change.
        </li>
        <li>
          Carry correlation IDs, provenance markers, and actor identity across
          every transaction boundary.
        </li>
        <li>
          Make idempotency, replay, and compensating actions explicit design
          features rather than operational folklore.
        </li>
        <li>
          Give operators first-class recovery tools and clear state models for
          partial failure.
        </li>
      </ul>
      <p>
        The follow-on concern is how new AI-assisted paths fit inside those same
        controls. That is the subject of{" "}
        <PostLink slug="ai-pipelines-need-control-boundaries">
          AI Pipelines Need Control Boundaries
        </PostLink>
        .
      </p>
    </section>

    <section className="space-y-4">
      <h2>Conclusion</h2>
      <p>
        Integration layers deserve architectural attention because they decide
        whether modernization produces a governable system or just a more
        complicated failure surface. When teams treat integration as a control
        boundary instead of a wiring task, they get clearer workflow behavior,
        better recovery, and more realistic options for later change.
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
    Content: securePlatformIntegrationContent,
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
