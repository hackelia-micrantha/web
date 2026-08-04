import {
  AI_PIPELINE_POST_SLUG,
  aiPipelinePost,
} from "~/content/ai-pipeline-post.server"
import type { BlogArticleSeriesNavigation } from "~/components/blog-article-layout"
import type { BlogPostMetadata } from "~/content/blog-mdx"
import { getBlogPostBySlug } from "~/content/blog-provider"
import { getSeriesNavigation } from "~/content/blog-series"

export type AiPipelineRouteData = {
  post: BlogPostMetadata
  relatedPosts: BlogPostMetadata[]
  seriesNavigation: BlogArticleSeriesNavigation
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

function comparableMetadata(candidate: BlogPostMetadata) {
  const metadata = toMetadata(candidate)

  delete metadata.series

  return metadata
}

function assertLegacyMetadataMatchesMdx(legacyPost: BlogPostMetadata) {
  if (
    JSON.stringify(comparableMetadata(legacyPost)) !==
    JSON.stringify(comparableMetadata(aiPipelinePost))
  ) {
    throw new Error(
      `Legacy metadata drifted from MDX frontmatter for ${AI_PIPELINE_POST_SLUG}`,
    )
  }
}

function resolveRelatedPosts() {
  return aiPipelinePost.relatedSlugs.map((slug) => {
    const relatedPost = getBlogPostBySlug(slug)

    if (!relatedPost) {
      throw new Error(`MDX related post does not exist: ${slug}`)
    }

    return toMetadata(relatedPost)
  })
}

export function getAiPipelineRouteData(): AiPipelineRouteData {
  const legacyPost = getBlogPostBySlug(AI_PIPELINE_POST_SLUG)

  if (!legacyPost) {
    throw new Error("MDX compatibility metadata is missing")
  }

  assertLegacyMetadataMatchesMdx(legacyPost)

  const series = getSeriesNavigation(legacyPost)

  if (!series || !aiPipelinePost.series) {
    throw new Error(
      `MDX series metadata is missing for ${AI_PIPELINE_POST_SLUG}`,
    )
  }

  if (
    aiPipelinePost.series.slug !== series.series.slug ||
    aiPipelinePost.series.title !== series.series.title ||
    aiPipelinePost.series.order !== series.index + 1
  ) {
    throw new Error(
      `MDX series metadata drifted for ${AI_PIPELINE_POST_SLUG}`,
    )
  }

  return {
    post: aiPipelinePost,
    relatedPosts: resolveRelatedPosts(),
    seriesNavigation: {
      series: {
        slug: aiPipelinePost.series.slug,
        title: aiPipelinePost.series.title,
      },
      index: aiPipelinePost.series.order - 1,
      total: series.total,
      previous: series.previous ? toMetadata(series.previous) : null,
      next: series.next ? toMetadata(series.next) : null,
      posts: series.posts.map((seriesPost) =>
        seriesPost.slug === AI_PIPELINE_POST_SLUG
          ? aiPipelinePost
          : toMetadata(seriesPost),
      ),
    },
  }
}
