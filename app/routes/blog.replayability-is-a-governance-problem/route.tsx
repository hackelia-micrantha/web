import type { MetaFunction } from "@remix-run/node"

import { BlogArticleLayout } from "~/components/blog-article-layout"
import { blogMdxComponents } from "~/components/blog-mdx-components"
import type { BlogPost } from "~/content/blog"
import { getBlogPostBySlug } from "~/content/blog-provider"
import { assertRoutableMdxPublication } from "~/content/blog-publication.js"
import { buildArticleMeta, buildArticleStructuredData } from "~/utils/seo"

import Content, { attributes } from "./content.mdx"

const EXPECTED_SLUG = "replayability-is-a-governance-problem"

function requiredString(name: string) {
  const value = attributes[name]

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid MDX frontmatter field: ${name}`)
  }

  return value
}

function requiredStringArray(name: string) {
  const value = attributes[name]

  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string" || item.trim() === "")
  ) {
    throw new Error(`Invalid MDX frontmatter field: ${name}`)
  }

  const normalized = value.map((item) => item.trim())

  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`Duplicate values in MDX frontmatter field: ${name}`)
  }

  return normalized
}

function requiredSeries() {
  const value = attributes.series

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid MDX frontmatter field: series")
  }

  const series = value as Record<string, unknown>
  const slug = series.slug
  const order = series.order

  if (typeof slug !== "string" || slug.trim() === "") {
    throw new Error("Invalid MDX frontmatter field: series.slug")
  }

  if (typeof order !== "number" || !Number.isInteger(order) || order < 1) {
    throw new Error("Invalid MDX frontmatter field: series.order")
  }

  return {
    slug: slug.trim(),
    order,
  }
}

const slug = requiredString("slug")
const date = requiredString("date")
const status = requiredString("status")

if (slug !== EXPECTED_SLUG) {
  throw new Error(`MDX slug ${slug} does not match route ${EXPECTED_SLUG}`)
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
  throw new Error(`Invalid MDX publication date: ${date}`)
}

assertRoutableMdxPublication({ slug, date, status }, { cutoff: date })

const post: BlogPost = {
  slug,
  title: requiredString("title"),
  description: requiredString("description"),
  date,
  excerpt: requiredString("excerpt"),
  tags: requiredStringArray("tags"),
  relatedSlugs: requiredStringArray("relatedSlugs"),
  series: requiredSeries(),
}

const registryPost = getBlogPostBySlug(post.slug)

if (!registryPost) {
  throw new Error(`Missing registry metadata for MDX post: ${post.slug}`)
}

for (const field of ["title", "description", "date", "excerpt"] as const) {
  if (registryPost[field] !== post[field]) {
    throw new Error(`MDX frontmatter differs from registry field: ${field}`)
  }
}

for (const field of ["tags", "relatedSlugs", "series"] as const) {
  if (JSON.stringify(registryPost[field]) !== JSON.stringify(post[field])) {
    throw new Error(`MDX frontmatter differs from registry field: ${field}`)
  }
}

export const meta: MetaFunction = () =>
  buildArticleMeta({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    publishedTime: `${post.date}T00:00:00Z`,
    tags: post.tags,
  })

export const handle = {
  structuredData: buildArticleStructuredData({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    datePublished: `${post.date}T00:00:00Z`,
    keywords: post.tags,
  }),
}

export default function ReplayabilityGovernanceRoute() {
  return (
    <BlogArticleLayout post={post}>
      <div data-content-source="mdx">
        <Content components={blogMdxComponents} />
      </div>
    </BlogArticleLayout>
  )
}
