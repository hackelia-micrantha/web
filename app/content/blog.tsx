import type { ReactNode } from "react"
import { Link } from "@remix-run/react"

export type BlogSeries = {
  slug: string
  title: string
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
  series?: BlogSeries
  Content: () => ReactNode
}

export type BlogSeriesGroup = {
  slug: string
  title: string
  posts: BlogPost[]
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
    </section>
  </>
)

const aiPipelinesControlBoundariesContent = () => (
  <>
    <section className="space-y-4">
      <h2>Start with the right mental model</h2>
      <p>
        Enterprise AI work becomes risky when the model is treated like an
        authoritative component instead of a fallible part of a larger delivery
        path.
      </p>
    </section>
  </>
)

const softwareLayersRiskBoundariesContent = () => (
  <>
    <section className="space-y-4">
      <h2>Why layers still matter</h2>
      <p>
        Layered architecture matters because it is one of the simplest ways to
        keep risk from collapsing into a single code path.
      </p>
    </section>
  </>
)

const governanceNativeEngineeringContent = () => (
  <>
    <section className="space-y-4">
      <h2>Throughput is rising. Confidence and shared understanding are under pressure.</h2>
      <p>
        AI-native engineering creates a control-plane problem. Generated code
        increases throughput, but without intent capture, evidence, review
        boundaries, replayability guarantees, and human comprehension loops,
        organizations accumulate technical, cognitive, and intent debt faster
        than they can repay it.
      </p>
      <p>
        By governance, I mean the mechanisms that preserve authority, intent,
        evidence, reviewability, accountability, and comprehension as systems
        change.
      </p>
    </section>
    <section className="space-y-4">
      <h2>The bottleneck has moved</h2>
      <p>
        The next bottleneck is not whether agents can write code. It is whether
        organizations can still explain, govern, and trust the systems those
        agents help create.
      </p>
    </section>
  </>
)

const cognitiveDebtContent = () => (
  <>
    <section className="space-y-4">
      <h2>AI-native engineering is changing how organizations think.</h2>
      <p>
        Software engineering has always depended on a hidden organizational
        assumption: the people evolving the system broadly understand the
        system. AI-native engineering weakens that assumption.
      </p>
    </section>
    <section className="space-y-4">
      <h2>Shared understanding was always infrastructure</h2>
      <p>
        Architectural intuition, operational memory, reasoning continuity, and
        context preservation are invisible coordination systems. Traditional
        SDLC practices implicitly depended on them. Many AI-native workflows
        currently do not.
      </p>
    </section>
  </>
)

const distributedInferenceContent = () => (
  <>
    <section className="space-y-4">
      <h2>OpenAI-compatible APIs are not equivalent trust domains.</h2>
      <p>
        A local model running on a developer workstation, a sovereign regional
        inference provider, a public cloud API, and a distributed edge inference
        fabric may all expose nearly identical interfaces. They are not
        governance equivalent.
      </p>
    </section>
    <section className="space-y-4">
      <h2>Provider routing is now part of the SDLC</h2>
      <p>
        Inference-provider selection now affects trust boundary, retention
        behavior, locality, replayability, auditability, evidence quality, and
        policy compliance.
      </p>
    </section>
  </>
)

const governanceNativeSeries = {
  slug: "governance-native-engineering",
  title: "Governance-Native Engineering",
}

export const blogPosts: BlogPost[] = [
  {
    slug: "governance-native-engineering-control-plane",
    title: "AI-Native Engineering Has a Governance Problem",
    description:
      "AI-native engineering shifts the bottleneck from implementation throughput toward governance, replayability, and organizational comprehension.",
    date: "2026-05-18",
    excerpt:
      "The next bottleneck is not whether agents can write code. It is whether organizations can still explain, govern, and trust the systems those agents help create.",
    tags: ["ai-governance", "anthesis", "delivery-governance", "architecture-notes"],
    relatedSlugs: ["cognitive-debt-hidden-cost", "distributed-inference-governance-problem"],
    series: { ...governanceNativeSeries, order: 1 },
    Content: governanceNativeEngineeringContent,
  },
  {
    slug: "cognitive-debt-hidden-cost",
    title: "Cognitive Debt Is the Hidden Cost of AI-Native Engineering",
    description:
      "AI-native engineering changes how organizations preserve shared understanding, architectural intuition, and operational memory.",
    date: "2026-05-18",
    excerpt:
      "The organizations that succeed long-term may not be the ones with the fastest autonomous agents. They will be the ones that preserve understanding.",
    tags: ["ai-governance", "cognitive-debt", "engineering-culture", "architecture-notes"],
    relatedSlugs: ["governance-native-engineering-control-plane", "distributed-inference-governance-problem"],
    series: { ...governanceNativeSeries, order: 2 },
    Content: cognitiveDebtContent,
  },
  {
    slug: "distributed-inference-governance-problem",
    title: "Distributed Inference Creates a Governance Problem",
    description:
      "OpenAI-compatible APIs are not equivalent trust domains. Provider routing is now part of the SDLC governance surface.",
    date: "2026-05-18",
    excerpt:
      "The challenge is not simply making models interchangeable. It is making provider choice governable, reviewable, replayable, and understandable.",
    tags: ["ai-governance", "inference", "platform-engineering", "architecture-notes"],
    relatedSlugs: ["governance-native-engineering-control-plane", "cognitive-debt-hidden-cost"],
    series: { ...governanceNativeSeries, order: 3 },
    Content: distributedInferenceContent,
  },
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
    Content: aiPipelinesControlBoundariesContent,
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

export function getBlogSeriesGroups() {
  const groups = new Map<string, BlogSeriesGroup>()

  for (const post of blogPosts) {
    if (!post.series) continue

    const existing = groups.get(post.series.slug)
    const group = existing ?? {
      slug: post.series.slug,
      title: post.series.title,
      posts: [],
    }

    group.posts.push(post)
    groups.set(post.series.slug, group)
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    posts: [...group.posts].sort(
      (left, right) => (left.series?.order ?? 0) - (right.series?.order ?? 0),
    ),
  }))
}

export function getBlogSeriesBySlug(slug: string) {
  return getBlogSeriesGroups().find((series) => series.slug === slug) ?? null
}

export function getSeriesPosts(post: BlogPost) {
  if (!post.series) return []
  return getBlogSeriesBySlug(post.series.slug)?.posts ?? []
}

export function getSeriesNavigation(post: BlogPost) {
  const seriesPosts = getSeriesPosts(post)
  const index = seriesPosts.findIndex((candidate) => candidate.slug === post.slug)

  if (index === -1) {
    return null
  }

  return {
    series: post.series,
    index,
    total: seriesPosts.length,
    previous: seriesPosts[index - 1] ?? null,
    next: seriesPosts[index + 1] ?? null,
  }
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}
