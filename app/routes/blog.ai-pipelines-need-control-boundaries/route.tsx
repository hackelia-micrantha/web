import type { MetaFunction } from "@remix-run/node"

import { BlogArticleLayout } from "~/components/blog-article-layout"
import { blogMdxComponents } from "~/components/blog-mdx-components"
import { getBlogPostBySlug } from "~/content/blog-provider"
import {
  assertBlogPostRegistryParity,
  readBlogPostMdxMetadata,
} from "~/content/blog-mdx-metadata"
import { buildArticleMeta, buildArticleStructuredData } from "~/utils/seo"

import Content, { attributes } from "./content.mdx"

const post = readBlogPostMdxMetadata(
  attributes,
  "ai-pipelines-need-control-boundaries",
)

assertBlogPostRegistryParity(post, getBlogPostBySlug(post.slug))

export const meta: MetaFunction = () =>
  buildArticleMeta({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    publishedTime: `${post.date}T00:00:00Z`,
    tags: post.tags,
  })

export const handle = {
  structuredData: buildArticleStructuredData({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    datePublished: `${post.date}T00:00:00Z`,
    keywords: post.tags,
  }),
}

export default function AiPipelinesNeedControlBoundariesRoute() {
  return (
    <BlogArticleLayout post={post}>
      <div data-content-source="mdx">
        <Content components={blogMdxComponents} />
      </div>
    </BlogArticleLayout>
  )
}
