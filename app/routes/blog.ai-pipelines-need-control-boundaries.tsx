import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import {
  BlogArticleLayout,
  type BlogArticleSeriesNavigation,
} from "~/components/blog-article-layout"
import { blogMdxComponents } from "~/components/blog-mdx-components"
import {
  defineBlogMdxPost,
  type BlogPostMetadata,
} from "~/content/blog-mdx"
import { getBlogPostBySlug, getRelatedPosts } from "~/content/blog-provider"
import { getSeriesNavigation } from "~/content/blog-series"
import ArticleContent, {
  attributes,
} from "~/content/posts/ai-pipelines-need-control-boundaries.mdx"
import { buildArticleMeta, buildArticleStructuredData } from "~/utils/seo"

const SLUG = "ai-pipelines-need-control-boundaries"
const post = defineBlogMdxPost(attributes, SLUG)

type LoaderData = {
  post: BlogPostMetadata
  relatedPosts: BlogPostMetadata[]
  seriesNavigation: BlogArticleSeriesNavigation | null
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
  }
}

function assertLegacyMetadataMatchesMdx(legacyPost: BlogPostMetadata) {
  const comparableLegacy = toMetadata(legacyPost)

  if (JSON.stringify(comparableLegacy) !== JSON.stringify(post)) {
    throw new Error(`Legacy metadata drifted from MDX frontmatter for ${SLUG}`)
  }
}

export async function loader(_args: LoaderFunctionArgs) {
  const legacyPost = getBlogPostBySlug(SLUG)

  if (!legacyPost) {
    throw new Response("MDX compatibility metadata is missing", { status: 500 })
  }

  assertLegacyMetadataMatchesMdx(legacyPost)

  const series = getSeriesNavigation(legacyPost)
  const seriesNavigation = series
    ? {
        series: {
          slug: series.series.slug,
          title: series.series.title,
        },
        index: series.index,
        total: series.total,
        previous: series.previous ? toMetadata(series.previous) : null,
        next: series.next ? toMetadata(series.next) : null,
        posts: series.posts.map(toMetadata),
      }
    : null

  return json<LoaderData>({
    post,
    relatedPosts: getRelatedPosts(legacyPost).map(toMetadata),
    seriesNavigation,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "Blog post not found" },
      { name: "robots", content: "noindex" },
    ]
  }

  return buildArticleMeta({
    title: data.post.title,
    description: data.post.description,
    path: `/blog/${data.post.slug}`,
    publishedTime: data.post.date,
    tags: data.post.tags,
  })
}

export const handle = {
  structuredData(data: LoaderData | undefined) {
    if (!data) return null

    return buildArticleStructuredData({
      title: data.post.title,
      description: data.post.description,
      path: `/blog/${data.post.slug}`,
      datePublished: data.post.date,
      keywords: data.post.tags,
    })
  },
}

export default function AiPipelinesNeedControlBoundariesRoute() {
  const data = useLoaderData<typeof loader>()

  return (
    <BlogArticleLayout
      post={data.post}
      relatedPosts={data.relatedPosts}
      seriesNavigation={data.seriesNavigation}
    >
      <ArticleContent components={blogMdxComponents} />
    </BlogArticleLayout>
  )
}
