import type { BlogPost } from "~/content/blog"
import { assertRoutableMdxPublication } from "~/content/blog-publication.js"

function requiredString(attributes: Record<string, unknown>, name: string) {
  const value = attributes[name]

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid MDX frontmatter field: ${name}`)
  }

  return value.trim()
}

function requiredStringArray(
  attributes: Record<string, unknown>,
  name: string,
) {
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

function requiredSeries(attributes: Record<string, unknown>) {
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

export function readBlogPostMdxMetadata(
  attributes: Record<string, unknown>,
  expectedSlug: string,
): BlogPost {
  const slug = requiredString(attributes, "slug")
  const date = requiredString(attributes, "date")
  const status = requiredString(attributes, "status")

  if (slug !== expectedSlug) {
    throw new Error(`MDX slug ${slug} does not match route ${expectedSlug}`)
  }

  // The build validator owns the target-date cutoff. Route modules validate
  // status and manifest parity without consulting a browser wall clock.
  assertRoutableMdxPublication({ slug, date, status }, { cutoff: date })

  return {
    slug,
    title: requiredString(attributes, "title"),
    description: requiredString(attributes, "description"),
    date,
    excerpt: requiredString(attributes, "excerpt"),
    tags: requiredStringArray(attributes, "tags"),
    relatedSlugs: requiredStringArray(attributes, "relatedSlugs"),
    series: requiredSeries(attributes),
  }
}

export function assertBlogPostRegistryParity(
  post: BlogPost,
  registryPost: BlogPost | null,
) {
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
}
