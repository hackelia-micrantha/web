import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import {
  BlogArticleLayout,
  type BlogArticleSeriesNavigation,
} from "~/components/blog-article-layout"
import type { BlogPostMetadata } from "~/content/blog-mdx"
import { getBlogPostBySlug, getRelatedPosts } from "~/content/blog-provider"
import { getSeriesNavigation } from "~/content/blog-series"
import { buildArticleMeta, buildArticleStructuredData } from "~/utils/seo"

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

export async function loader({ params }: LoaderFunctionArgs) {
  const post = getBlogPostBySlug(params.slug ?? "")

  if (!post) {
    throw new Response("Not Found", { status: 404 })
  }

  const series = getSeriesNavigation(post)
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
    post: toMetadata(post),
    relatedPosts: getRelatedPosts(post).map(toMetadata),
    seriesNavigation,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "Micrantha Software | Blog" },
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

export default function BlogPostRoute() {
  const data = useLoaderData<typeof loader>()
  const legacyPost = getBlogPostBySlug(data.post.slug)

  if (!legacyPost) {
    throw new Error(`Legacy blog content is missing for ${data.post.slug}`)
  }

  const Content = legacyPost.Content

  return (
    <BlogArticleLayout
      post={data.post}
      relatedPosts={data.relatedPosts}
      seriesNavigation={data.seriesNavigation}
    >
      <Content />
    </BlogArticleLayout>
  )
}
