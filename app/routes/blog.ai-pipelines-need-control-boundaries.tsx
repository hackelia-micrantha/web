import type { MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { BlogArticleLayout } from "~/components/blog-article-layout"
import { blogMdxComponents } from "~/components/blog-mdx-components"
import {
  getAiPipelineRouteData,
  type AiPipelineRouteData,
} from "~/content/ai-pipeline-route.server"
import ArticleContent from "~/content/posts/ai-pipelines-need-control-boundaries.mdx"
import { buildArticleMeta, buildArticleStructuredData } from "~/utils/seo"

type LoaderData = AiPipelineRouteData

export async function loader() {
  return json<LoaderData>(getAiPipelineRouteData())
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
