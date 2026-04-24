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
              index === 0
                ? `${cardStyles.neutral} editorial-card`
                : index === 1
                  ? `${cardStyles.blue} editorial-card`
                  : `${cardStyles.green} editorial-card`
            }
          >
            <>
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
