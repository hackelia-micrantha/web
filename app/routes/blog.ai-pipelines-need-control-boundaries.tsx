import type { MetaFunction } from "@remix-run/node"
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
import { getBlogPostBySlug } from "~/content/blog-provider"
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
    JSON.stringify(comparableMetadata(post))
  ) {
    throw new Error(`Legacy metadata drifted from MDX frontmatter for ${SLUG}`)
  }
}

function resolveRelatedPosts() {
  return post.relatedSlugs.map((slug) => {
    const relatedPost = getBlogPostBySlug(slug)

    if (!relatedPost) {
      throw new Error(`MDX related post does not exist: ${slug}`)
    }

    return toMetadata(relatedPost)
  })
}

export async function loader() {
  const legacyPost = getBlogPostBySlug(SLUG)

  if (!legacyPost) {
    throw new Response("MDX compatibility metadata is missing", { status: 500 })
  }

  assertLegacyMetadataMatchesMdx(legacyPost)

  const series = getSeriesNavigation(legacyPost)

  if (!series || !post.series) {
    throw new Error(`MDX series metadata is missing for ${SLUG}`)
  }

  if (
    post.series.slug !== series.series.slug ||
    post.series.title !== series.series.title ||
    post.series.order !== series.index + 1
  ) {
    throw new Error(`MDX series metadata drifted for ${SLUG}`)
  }

  return json<LoaderData>({
    post,
    relatedPosts: resolveRelatedPosts(),
    seriesNavigation: {
      series: {
        slug: post.series.slug,
        title: post.series.title,
      },
      index: post.series.order - 1,
      total: series.total,
      previous: series.previous ? toMetadata(series.previous) : null,
      next: series.next ? toMetadata(series.next) : null,
      posts: series.posts.map((seriesPost) =>
        seriesPost.slug === SLUG ? post : toMetadata(seriesPost),
      ),
    },
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
    publishedTime: `${data.post.date}T00:00:00Z`,
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
      datePublished: `${data.post.date}T00:00:00Z`,
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
