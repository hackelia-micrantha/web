import type { MetaFunction } from "@remix-run/node"
import type { ElementType } from "react"

import { BlogArticleLayout } from "~/components/blog-article-layout"
import { blogMdxComponents } from "~/components/blog-mdx-components"
import type { BlogPost } from "~/content/blog"
import { getBlogPostBySlug } from "~/content/blog-provider"
import { buildArticleMeta, buildArticleStructuredData } from "~/utils/seo"

export function createBlogMdxRoute(slug: string, Content: ElementType) {
  const resolvedPost = getBlogPostBySlug(slug)

  if (!resolvedPost) {
    throw new Error(`Missing generated metadata for MDX route: ${slug}`)
  }

  const post: BlogPost = resolvedPost

  const meta: MetaFunction = () =>
    buildArticleMeta({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      publishedTime: `${post.date}T00:00:00Z`,
      modifiedTime: post.updatedAt ? `${post.updatedAt}T00:00:00Z` : undefined,
      tags: post.tags,
    })

  const handle = {
    structuredData: buildArticleStructuredData({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      datePublished: `${post.date}T00:00:00Z`,
      dateModified: post.updatedAt ? `${post.updatedAt}T00:00:00Z` : undefined,
      keywords: post.tags,
    }),
  }

  function BlogMdxRoute() {
    return (
      <BlogArticleLayout post={post}>
        <div data-content-source="mdx">
          <Content components={blogMdxComponents} />
        </div>
      </BlogArticleLayout>
    )
  }

  return { Component: BlogMdxRoute, handle, meta }
}
