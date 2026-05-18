import type { BlogPost } from "~/content/blog"
import { getBlogPosts, getBlogPostBySlug } from "~/content/blog"

export type BlogSeriesDefinition = {
  slug: string
  title: string
  description: string
  postSlugs: string[]
}

export type BlogSeriesGroup = BlogSeriesDefinition & {
  posts: BlogPost[]
}

const blogSeriesDefinitions: BlogSeriesDefinition[] = [
  {
    slug: "architecture-control-boundaries",
    title: "Architecture Control Boundaries",
    description:
      "Architecture notes on integration, AI workflow boundaries, and layered software design as delivery-governance surfaces.",
    postSlugs: [
      "secure-platform-integration-is-not-plumbing",
      "ai-pipelines-need-control-boundaries",
      "software-layers-are-risk-boundaries",
    ],
  },
]

function resolveSeriesPosts(series: BlogSeriesDefinition) {
  return series.postSlugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
}

export function getBlogSeriesGroups(): BlogSeriesGroup[] {
  return blogSeriesDefinitions.map((series) => ({
    ...series,
    posts: resolveSeriesPosts(series),
  }))
}

export function getBlogSeriesBySlug(slug: string) {
  return getBlogSeriesGroups().find((series) => series.slug === slug) ?? null
}

export function getSeriesNavigation(post: BlogPost) {
  const series = getBlogSeriesGroups().find((candidate) =>
    candidate.posts.some((seriesPost) => seriesPost.slug === post.slug),
  )

  if (!series) {
    return null
  }

  const index = series.posts.findIndex((seriesPost) => seriesPost.slug === post.slug)

  if (index === -1) {
    return null
  }

  return {
    series: {
      slug: series.slug,
      title: series.title,
      order: index + 1,
    },
    index,
    total: series.posts.length,
    previous: series.posts[index - 1] ?? null,
    next: series.posts[index + 1] ?? null,
    posts: series.posts,
  }
}

export function getNonSeriesBlogPosts() {
  const seriesSlugs = new Set(
    blogSeriesDefinitions.flatMap((series) => series.postSlugs),
  )

  return getBlogPosts().filter((post) => !seriesSlugs.has(post.slug))
}
