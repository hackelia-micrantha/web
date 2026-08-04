import {
  AI_PIPELINE_POST_SLUG,
  aiPipelinePost,
} from "~/content/ai-pipeline-post.server"
import type { BlogPostMetadata } from "~/content/blog-mdx"
import { getBlogPosts } from "~/content/blog-provider"
import { getSeriesNavigation } from "~/content/blog-series"

export type BlogIndexPost = BlogPostMetadata & {
  series?: {
    slug: string
    title: string
    order: number
  }
}

function toMetadata(candidate: BlogPostMetadata): BlogPostMetadata {
  return {
    slug: candidate.slug,
    title: candidate.title,
    description: candidate.description,
    date: candidate.date,
    excerpt: candidate.excerpt,
    tags: [...candidate.tags],
    relatedSlugs: [...candidate.relatedSlugs],
    series: candidate.series ? { ...candidate.series } : undefined,
  }
}

export function getBlogIndexPosts(): BlogIndexPost[] {
  return getBlogPosts().map((legacyPost) => {
    if (legacyPost.slug === AI_PIPELINE_POST_SLUG) {
      return aiPipelinePost
    }

    const series = getSeriesNavigation(legacyPost)

    return {
      ...toMetadata(legacyPost),
      series: series
        ? {
            slug: series.series.slug,
            title: series.series.title,
            order: series.index + 1,
          }
        : undefined,
    }
  })
}
