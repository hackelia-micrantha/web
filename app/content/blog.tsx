import type { ReactNode } from "react"

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
