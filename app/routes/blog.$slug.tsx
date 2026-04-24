import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { PageTitle } from "~/components"
import {
  formatBlogDate,
  getBlogPostBySlug,
  getRelatedPosts,
} from "~/content/blog"
import { buildArticleMeta, buildArticleStructuredData } from "~/utils/seo"

type LoaderData = {
  post: {
    slug: string
    title: string
    description: string
    date: string
    excerpt: string
    tags: string[]
    teaser: string
    linkedinShort: string
    linkedinTechnical: string
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
      teaser: post.teaser,
      linkedinShort: post.linkedinShort,
      linkedinTechnical: post.linkedinTechnical,
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

  return (
    <article className="space-y-8">
      <div className="space-y-4">
        <Link className="article-meta-link text-sm" to="/blog">
          Back to blog
        </Link>
        <PageTitle title={post.title} subtitle={post.description} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
          <span aria-hidden="true">/</span>
          <span>{post.tags.join(", ")}</span>
        </div>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">
          {post.excerpt}
        </p>
      </div>

      <div className="article-prose">
        <post.Content />
      </div>

      <section className="max-w-3xl space-y-4 rounded-[1.5rem] border border-slate-200 bg-white/80 px-6 py-6 shadow-[0_18px_36px_rgba(31,42,42,0.06)]">
        <h2 className="text-xl tracking-tight">LinkedIn and teaser copy</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Short LinkedIn
            </p>
            <p className="mt-1 text-base leading-7 text-slate-700">
              {post.linkedinShort}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Technical LinkedIn
            </p>
            <p className="mt-1 text-base leading-7 text-slate-700">
              {post.linkedinTechnical}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Teaser
            </p>
            <p className="mt-1 text-base leading-7 text-slate-700">
              {post.teaser}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Suggested tags
            </p>
            <p className="mt-1 text-base leading-7 text-slate-700">
              {post.tags.join(", ")}
            </p>
          </div>
        </div>
      </section>

      {relatedPosts.length > 0 ? (
        <section className="max-w-3xl space-y-4 border-t border-gray-200 pt-8">
          <h2 className="text-xl tracking-tight">Related notes</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                to={`/blog/${relatedPost.slug}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left text-base shadow-[0_10px_24px_rgba(31,42,42,0.05)] transition-colors hover:bg-white"
              >
                <span className="block font-semibold text-slate-900">
                  {relatedPost.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">
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
