import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Card, PageTitle } from "~/components"
import { formatBlogDate, getBlogSeriesBySlug } from "~/content/blog"
import { cardStyles } from "~/utils/card-styles"
import { buildPageMeta } from "~/utils/seo"

type LoaderData = {
  series: {
    slug: string
    title: string
    posts: {
      slug: string
      title: string
      excerpt: string
      date: string
      order?: number
    }[]
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const series = getBlogSeriesBySlug(params.slug ?? "")

  if (!series) {
    throw new Response("Not Found", { status: 404 })
  }

  return json<LoaderData>({
    series: {
      slug: series.slug,
      title: series.title,
      posts: series.posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        order: post.series?.order,
      })),
    },
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "Blog Series" },
      { name: "robots", content: "noindex" },
    ]
  }

  return buildPageMeta({
    title: data.series.title + " Series",
    description: "Posts in the " + data.series.title + " series.",
    path: "/blog/series/" + data.series.slug,
  })
}

export default function BlogSeriesRoute() {
  const { series } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-10">
      <div className="space-y-5">
        <Link className="article-meta-link inline-flex text-sm" to="/blog">
          Back to blog
        </Link>
        <PageTitle
          title={series.title}
          subtitle="Ordered notes and essays grouped as a connected series."
        />
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {series.posts.map((post, index) => (
          <Card
            key={post.slug}
            title={post.title}
            url={"/blog/" + post.slug}
            headingLevel={2}
            className={
              index % 3 === 0
                ? cardStyles.neutral + " editorial-card"
                : index % 3 === 1
                  ? cardStyles.blue + " editorial-card"
                  : cardStyles.green + " editorial-card"
            }
          >
            <>
              <span className="meta-kicker mb-3 block">
                Part {post.order} / {formatBlogDate(post.date)}
              </span>
              <span className="block text-[1.02rem] leading-8 text-slate-700">
                {post.excerpt}
              </span>
            </>
          </Card>
        ))}
      </section>
    </div>
  )
}
