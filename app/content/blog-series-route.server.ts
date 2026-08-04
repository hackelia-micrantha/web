import {
  AI_PIPELINE_POST_SLUG,
  aiPipelinePost,
} from "~/content/ai-pipeline-post.server"
import { getBlogSeriesBySlug } from "~/content/blog-series"

export type BlogSeriesRouteData = {
  series: {
    slug: string
    title: string
    posts: {
      slug: string
      title: string
      excerpt: string
      date: string
      order: number
    }[]
  }
}

export function getBlogSeriesRouteData(
  slug: string,
): BlogSeriesRouteData | null {
  const series = getBlogSeriesBySlug(slug)

  if (!series) return null

  const posts = series.posts.map((legacyPost, index) => {
    if (legacyPost.slug !== AI_PIPELINE_POST_SLUG) {
      return {
        slug: legacyPost.slug,
        title: legacyPost.title,
        excerpt: legacyPost.excerpt,
        date: legacyPost.date,
        order: index + 1,
      }
    }

    if (
      !aiPipelinePost.series ||
      aiPipelinePost.series.slug !== series.slug ||
      aiPipelinePost.series.title !== series.title ||
      aiPipelinePost.series.order !== index + 1
    ) {
      throw new Error(
        `MDX series metadata drifted for ${AI_PIPELINE_POST_SLUG}`,
      )
    }

    return {
      slug: aiPipelinePost.slug,
      title: aiPipelinePost.title,
      excerpt: aiPipelinePost.excerpt,
      date: aiPipelinePost.date,
      order: aiPipelinePost.series.order,
    }
  })

  return {
    series: {
      slug: series.slug,
      title: series.title,
      posts,
    },
  }
}
