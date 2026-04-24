import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Card, PageTitle } from "~/components"
import {
  BLOG_DESCRIPTION,
  BLOG_TITLE,
  formatBlogDate,
  getBlogPosts,
} from "~/content/blog"
import { cardStyles } from "~/utils/card-styles"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"

const posts = getBlogPosts()

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Blog",
    description: BLOG_DESCRIPTION,
    path: "/blog",
  })

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Blog",
    description: BLOG_DESCRIPTION,
    path: "/blog",
    items: posts.map((post) => ({
      name: post.title,
      description: post.description,
      url: `https://micrantha.com/blog/${post.slug}`,
    })),
  }),
}

export default function BlogIndexRoute() {
  return (
    <div className="space-y-8">
      <PageTitle title="Blog" subtitle={BLOG_DESCRIPTION} />

      <section className="max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white/80 px-6 py-6 shadow-[0_18px_36px_rgba(31,42,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {BLOG_TITLE}
        </p>
        <h2 className="mt-2 text-2xl tracking-tight text-slate-900">
          Durable technical writing for proposals, partnerships, and delivery
          decisions.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
          These notes are written as architecture guidance rather than campaign
          copy: secure platform integration, delivery governance, AI-assisted
          workflows, and long-lived software boundaries.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {posts.map((post, index) => (
          <Card
            key={post.slug}
            title={post.title}
            url={`/blog/${post.slug}`}
            headingLevel={2}
            className={
              index === 0
                ? cardStyles.neutral
                : index === 1
                  ? cardStyles.blue
                  : cardStyles.green
            }
          >
            <>
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {formatBlogDate(post.date)}
              </span>
              {post.excerpt}
            </>
          </Card>
        ))}
      </section>

      <section className="max-w-3xl space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 px-6 py-6">
        <h2 className="text-xl tracking-tight">Series use</h2>
        <p className="text-base leading-7 text-slate-700">
          Each post includes a short teaser and two LinkedIn variants. That
          material is kept with the post source so the writing and outreach copy
          stay aligned.
        </p>
        <p className="text-sm text-slate-600">
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
