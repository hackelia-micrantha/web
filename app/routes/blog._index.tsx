import type { MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

import { Card, PageTitle } from "~/components"
import {
  BLOG_DESCRIPTION,
  BLOG_TITLE,
  formatBlogDate,
} from "~/content/blog-format"
import { defineBlogMdxPost, type BlogPostMetadata } from "~/content/blog-mdx"
import { getBlogPosts } from "~/content/blog-provider"
import { getSeriesNavigation } from "~/content/blog-series"
import { attributes as aiPipelineAttributes } from "~/content/posts/ai-pipelines-need-control-boundaries.mdx"
import { cardStyles } from "~/utils/card-styles"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"

const MDX_SLUG = "ai-pipelines-need-control-boundaries"
const aiPipelinePost = defineBlogMdxPost(aiPipelineAttributes, MDX_SLUG)

type BlogIndexPost = BlogPostMetadata & {
  series?: {
    slug: string
    title: string
    order: number
  }
}

type LoaderData = {
  posts: BlogIndexPost[]
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

export async function loader() {
  const posts = getBlogPosts().map((legacyPost) => {
    if (legacyPost.slug === MDX_SLUG) {
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

  return json<LoaderData>({ posts })
}

export const meta: MetaFunction<typeof loader> = () =>
  buildPageMeta({
    title: "Blog",
    description: BLOG_DESCRIPTION,
    path: "/blog",
  })

export const handle = {
  structuredData(data: LoaderData | undefined) {
    if (!data) return null

    return buildCollectionPageStructuredData({
      name: "Blog",
      description: BLOG_DESCRIPTION,
      path: "/blog",
      items: data.posts.map((post) => ({
        name: post.title,
        description: post.description,
        url: `https://micrantha.com/blog/${post.slug}`,
      })),
    })
  },
}

export default function BlogIndexRoute() {
  const { posts } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-10">
      <PageTitle title="Blog" subtitle={BLOG_DESCRIPTION} />

      <section className="editorial-panel max-w-4xl px-6 py-7 md:px-8 md:py-8">
        <p className="meta-kicker">{BLOG_TITLE}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-slate-900 md:text-[2.15rem] md:leading-[1.08]">
          Durable technical writing for proposals, partnerships, and delivery
          decisions.
        </h2>
        <p className="page-copy mt-4 max-w-3xl">
          These notes are written as architecture guidance rather than campaign
          copy: secure platform integration, delivery governance, AI-assisted
          workflows, and long-lived software boundaries.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <Card
            key={post.slug}
            title={post.title}
            url={`/blog/${post.slug}`}
            headingLevel={2}
            className={
              index % 3 === 0
                ? `${cardStyles.neutral} editorial-card`
                : index % 3 === 1
                  ? `${cardStyles.blue} editorial-card`
                  : `${cardStyles.green} editorial-card`
            }
          >
            <>
              {post.series ? (
                <div className="meta-kicker mb-3 flex flex-wrap items-center gap-1.5">
                  <span
                    className="rounded-full border border-slate-300 bg-white text-slate-600"
                    style={{
                      fontSize: "0.58rem",
                      letterSpacing: "0.14em",
                      lineHeight: 1,
                      padding: "0.14rem 0.38rem",
                    }}
                  >
                    Part {post.series.order}
                  </span>
                  <span>{post.series.title}</span>
                </div>
              ) : null}
              <span className="meta-kicker mb-3 block">
                {formatBlogDate(post.date)}
              </span>
              <span className="block text-[1.02rem] leading-8 text-slate-700">
                {post.excerpt}
              </span>
            </>
          </Card>
        ))}
      </section>

      <section className="editorial-panel max-w-3xl space-y-4 bg-slate-50/80 px-6 py-6">
        <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-900">
          Editorial use
        </h2>
        <p className="page-copy">
          These notes are written to stand on their own as durable technical
          pieces. Outreach drafts and posting variants are kept separately so
          the public articles stay focused.
        </p>
        <p className="page-copy-sm">
          Looking for a starting point? Begin with{" "}
          <Link to="/blog/secure-platform-integration-is-not-plumbing">
            Secure Platform Integration Is Not Plumbing
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
