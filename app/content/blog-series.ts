import type { BlogPost } from "~/content/blog"
import { getBlogPosts } from "~/content/blog-provider"

export type BlogSeriesDefinition = {
  slug: string
  title: string
  description: string
}

export type BlogSeriesGroup = BlogSeriesDefinition & {
  posts: BlogPost[]
}

const blogSeriesDefinitions: BlogSeriesDefinition[] = [
  {
    slug: "governance-native-engineering",
    title: "Governance-Native Engineering",
    description:
      "Essays exploring governance, replayability, recursive execution, and organizational comprehension in AI-native engineering systems.",
  },
  {
    slug: "architecture-control-boundaries",
    title: "Architecture Control Boundaries",
    description:
      "Architecture notes on integration, AI workflow boundaries, and layered software design as delivery-governance surfaces.",
  },
]

function resolveSeriesPosts(series: BlogSeriesDefinition) {
  return getBlogPosts()
    .filter((post) => post.series?.slug === series.slug)
    .sort(
      (left, right) =>
        (left.series?.order ?? Number.MAX_SAFE_INTEGER) -
        (right.series?.order ?? Number.MAX_SAFE_INTEGER),
    )
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

export function getSeriesForPost(post: BlogPost) {
  if (!post.series) {
    return null
  }

  return getBlogSeriesBySlug(post.series.slug)
}

export function getSeriesNavigation(post: BlogPost) {
  const series = getSeriesForPost(post)

  if (!series || !post.series) {
    return null
  }

  const index = series.posts.findIndex(
    (seriesPost) => seriesPost.slug === post.slug,
  )

  if (index === -1) {
    return null
  }

  return {
    series: {
      slug: series.slug,
      title: series.title,
      order: post.series.order,
    },
    index,
    total: series.posts.length,
    previous: series.posts[index - 1] ?? null,
    next: series.posts[index + 1] ?? null,
    posts: series.posts,
  }
}

export function getNonSeriesBlogPosts() {
  return getBlogPosts().filter((post) => !post.series)
}
