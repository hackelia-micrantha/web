import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { BlogArticleLayout } from "~/components/blog-article-layout"
import { getBlogPostBySlug } from "~/content/blog-provider"
import { buildArticleMeta, buildArticleStructuredData } from "~/utils/seo"

type LoaderData = {
  post: {
    slug: string
    title: string
    description: string
    date: string
    excerpt: string
    tags: string[]
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const post = getBlogPostBySlug(params.slug ?? "")

  if (!post) {
    throw new Response("Not Found", { status: 404 })
  }

  return json<LoaderData>({
    post: {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      excerpt: post.excerpt,
      tags: post.tags,
    },
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
  structuredData: (data: LoaderData | undefined) => {
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
  const { post: postMeta } = useLoaderData<typeof loader>()
  const post = getBlogPostBySlug(postMeta.slug)

  if (!post) {
    throw new Error(`Missing blog post for slug: ${postMeta.slug}`)
  }

  return (
    <BlogArticleLayout post={post}>
      <post.Content />
    </BlogArticleLayout>
  )
}
