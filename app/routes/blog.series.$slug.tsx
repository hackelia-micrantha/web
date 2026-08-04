import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

import { Card, PageTitle } from "~/components"
import { formatBlogDate } from "~/content/blog-format"
import { defineBlogMdxPost } from "~/content/blog-mdx"
import { getBlogSeriesBySlug } from "~/content/blog-series"
import { attributes as aiPipelineAttributes } from "~/content/posts/ai-pipelines-need-control-boundaries.mdx"
import { cardStyles } from "~/utils/card-styles"
import { buildPageMeta } from "~/utils/seo"

const MDX_SLUG = "ai-pipelines-need-control-boundaries"
const aiPipelinePost = defineBlogMdxPost(aiPipelineAttributes, MDX_SLUG)

type LoaderData = {
  series: {
    slug: string
    title: string
    posts: {
      slug: string
      title: string
      excerpt: string
      date: string
      order: number
    }[]
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const series = getBlogSeriesBySlug(params.slug ?? "")

  if (!series) {
    throw new Response("Not Found", { status: 404 })
  }

  const posts = series.posts.map((legacyPost, index) => {
    if (legacyPost.slug !== MDX_SLUG) {
      return {
        slug: legacyPost.slug,
        title: legacyPost.title,
        excerpt: legacyPost.excerpt,
        date: legacyPost.date,
        order: index + 1,
      }
    }

    if (
      !aiPipelinePost.series ||
      aiPipelinePost.series.slug !== series.slug ||
      aiPipelinePost.series.title !== series.title ||
      aiPipelinePost.series.order !== index + 1
    ) {
      throw new Error(`MDX series metadata drifted for ${MDX_SLUG}`)
    }

    return {
      slug: aiPipelinePost.slug,
      title: aiPipelinePost.title,
      excerpt: aiPipelinePost.excerpt,
      date: aiPipelinePost.date,
      order: aiPipelinePost.series.order,
    }
  })

  return json<LoaderData>({
    series: {
      slug: series.slug,
      title: series.title,
      posts,
    },
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "Blog Series" }, { name: "robots", content: "noindex" }]
  }

  return buildPageMeta({
    title: `${data.series.title} Series`,
    description: `Posts in the ${data.series.title} series.`,
    path: `/blog/series/${data.series.slug}`,
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
