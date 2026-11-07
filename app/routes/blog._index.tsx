import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Card, PageTitle } from "~/components"
import { BLOG_DESCRIPTION, BLOG_TITLE, formatBlogDate } from "~/content/blog"
import { getBlogPostBySlug, getBlogPosts } from "~/content/blog-provider"
import { getBlogSeriesGroups, getSeriesNavigation } from "~/content/blog-series"
import { cardStyles } from "~/utils/card-styles"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"

const posts = getBlogPosts()
const seriesGroups = getBlogSeriesGroups()

// Curated navigation, deliberately independent of series membership metadata.
const readingPaths = [
  {
    title: "For integration and modernization teams",
    description:
      "Follow trust boundaries from enterprise workflows into AI-assisted delivery.",
    steps: [
      "secure-platform-integration-is-not-plumbing",
      "ai-pipelines-need-control-boundaries",
      "governance-native-engineering-control-plane",
      "replayability-is-a-governance-problem",
    ],
  },
  {
    title: "For AI-assisted engineering teams",
    description:
      "Start with assurance, then trace it back to tool and write-back boundaries.",
    steps: [
      "governance-native-engineering-control-plane",
      "replayability-is-a-governance-problem",
      "recursive-governance-and-agent-workflows",
      "ai-pipelines-need-control-boundaries",
    ],
  },
].map(({ title, description, steps }) => ({
  title,
  description,
  posts: steps.map((slug) => {
    const post = getBlogPostBySlug(slug)
    if (!post) {
      throw new Error(
        "Reading path references an unpublished or missing post: " + slug,
      )
    }
    return post
  }),
}))

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

      <section className="space-y-4" aria-labelledby="blog-series-heading">
        <div>
          <h2
            id="blog-series-heading"
            className="text-2xl font-semibold tracking-tight text-slate-900"
          >
            Explore the series
          </h2>
          <p className="page-copy-sm mt-2">
            Ordered architecture notes for two complementary audiences.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {seriesGroups.map((series) => (
            <Card
              key={series.slug}
              title={series.title}
              url={`/blog/series/${series.slug}`}
              headingLevel={3}
              className={cardStyles.neutral}
            >
              <>
                <p>{series.description}</p>
                <p className="meta-kicker mt-3">{series.posts.length} parts</p>
              </>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="reading-paths-heading">
        <h2
          id="reading-paths-heading"
          className="text-2xl font-semibold tracking-tight text-slate-900"
        >
          Recommended reading paths
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {readingPaths.map((path) => (
            <div key={path.title} className="editorial-panel px-6 py-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {path.title}
              </h3>
              <p className="page-copy-sm mt-2">{path.description}</p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
                {path.posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      className="article-meta-link"
                      to={`/blog/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-label="All published notes"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {posts.map((post, index) => {
          const seriesNavigation = getSeriesNavigation(post)

          return (
            <Card
              key={post.slug}
              title={post.title}
              url={`/blog/${post.slug}`}
              headingLevel={2}
              actions={
                seriesNavigation
                  ? [
                      <Link
                        key={seriesNavigation.series.slug}
                        className="article-meta-link inline-flex min-h-11 items-center rounded-lg px-2 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                        to={`/blog/series/${seriesNavigation.series.slug}`}
                        aria-label={`Explore ${seriesNavigation.series.title} series`}
                      >
                        {seriesNavigation.series.title}
                      </Link>,
                    ]
                  : undefined
              }
              className={
                index % 3 === 0
                  ? `${cardStyles.neutral} editorial-card`
                  : index % 3 === 1
                    ? `${cardStyles.blue} editorial-card`
                    : `${cardStyles.green} editorial-card`
              }
            >
              <>
                {seriesNavigation ? (
                  <span className="mb-3 block text-sm font-semibold tracking-wide leading-6 text-slate-600">
                    Part {seriesNavigation.index + 1} of{" "}
                    {seriesNavigation.total}
                  </span>
                ) : null}
                <span className="meta-kicker mb-3 block">
                  {formatBlogDate(post.date)}
                </span>
                <span className="block text-[1.02rem] leading-8 text-slate-700">
                  {post.excerpt}
                </span>
              </>
            </Card>
          )
        })}
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
