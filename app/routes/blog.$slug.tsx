import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { PageTitle } from "~/components"
import {
  formatBlogDate,
  getBlogPostBySlug,
  getRelatedPosts,
} from "~/content/blog"
import { getSeriesNavigation } from "~/content/blog-series"
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

  const relatedPosts = getRelatedPosts(post)
  const seriesNavigation = getSeriesNavigation(post)

  return (
    <article className="space-y-10">
      <div className="space-y-5">
        <Link className="article-meta-link inline-flex text-sm" to="/blog">
          Back to blog
        </Link>
        <PageTitle title={post.title} subtitle={post.description} />
        <div className="article-meta-row flex flex-wrap items-center gap-x-4 gap-y-2">
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
          <span aria-hidden="true">/</span>
          <span>{post.tags.join(", ")}</span>
        </div>
        <p className="article-lead">{post.excerpt}</p>
      </div>

      {seriesNavigation ? (
        <section className="max-w-3xl rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5 shadow-[0_10px_24px_rgba(31,42,42,0.05)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="meta-kicker">Series</p>
              <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em] text-slate-900">
                <Link to={`/blog/series/${seriesNavigation.series.slug}`}>
                  {seriesNavigation.series.title}
                </Link>
              </h2>
              <p className="page-copy-sm">
                Part {seriesNavigation.index + 1} of {seriesNavigation.total}
              </p>
            </div>
            <nav
              className="grid gap-2 text-sm md:min-w-[16rem]"
              aria-label={`${seriesNavigation.series.title} series navigation`}
            >
              {seriesNavigation.previous ? (
                <Link
                  className="article-meta-link"
                  to={`/blog/${seriesNavigation.previous.slug}`}
                >
                  Previous: {seriesNavigation.previous.title}
                </Link>
              ) : null}
              {seriesNavigation.next ? (
                <Link
                  className="article-meta-link"
                  to={`/blog/${seriesNavigation.next.slug}`}
                >
                  Next: {seriesNavigation.next.title}
                </Link>
              ) : null}
            </nav>
          </div>
        </section>
      ) : null}

      <div className="article-prose">
        <post.Content />
      </div>

      {seriesNavigation ? (
        <section className="max-w-3xl space-y-4 border-t border-gray-200 pt-8">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-900">
            In this series
          </h2>
          <div className="grid gap-3">
            {seriesNavigation.posts.map((seriesPost, index) => {
              const isCurrent = seriesPost.slug === post.slug

              return (
                <Link
                  key={seriesPost.slug}
                  to={`/blog/${seriesPost.slug}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={
                    isCurrent
                      ? "rounded-2xl border border-slate-300 bg-white px-4 py-4 text-left text-base shadow-[0_10px_24px_rgba(31,42,42,0.08)]"
                      : "rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left text-base shadow-[0_10px_24px_rgba(31,42,42,0.05)] transition-colors hover:bg-white"
                  }
                >
                  <span className="meta-kicker mb-1 block">
                    Part {index + 1}
                  </span>
                  <span className="block text-[1.02rem] font-semibold leading-7 tracking-[-0.015em] text-slate-900">
                    {seriesPost.title}
                  </span>
                  <span className="mt-2 block text-sm leading-7 text-slate-600">
                    {seriesPost.excerpt}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {relatedPosts.length > 0 ? (
        <section className="max-w-3xl space-y-4 border-t border-gray-200 pt-8">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-900">
            Related notes
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                to={`/blog/${relatedPost.slug}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left text-base shadow-[0_10px_24px_rgba(31,42,42,0.05)] transition-colors hover:bg-white"
              >
                <span className="block text-[1.02rem] font-semibold leading-7 tracking-[-0.015em] text-slate-900">
                  {relatedPost.title}
                </span>
                <span className="mt-2 block text-sm leading-7 text-slate-600">
                  {relatedPost.excerpt}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
