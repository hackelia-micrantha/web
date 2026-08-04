export type BlogSeriesMetadata = {
  slug: string
  title: string
  order: number
}

export type BlogPostMetadata = {
  slug: string
  title: string
  description: string
  date: string
  excerpt: string
  tags: string[]
  relatedSlugs: string[]
  series?: BlogSeriesMetadata
}

type UnknownRecord = Record<string, unknown>

function assertRecord(value: unknown, label: string): asserts value is UnknownRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
}

function readString(record: UnknownRecord, key: string): string {
  const value = record[key]

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`MDX frontmatter ${key} must be a non-empty string`)
  }

  return value
}

function readStringArray(record: UnknownRecord, key: string): string[] {
  const value = record[key]

  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((entry) => typeof entry !== "string" || entry.trim().length === 0)
  ) {
    throw new Error(`MDX frontmatter ${key} must be a non-empty string array`)
  }

  return [...value]
}

function readSeries(record: UnknownRecord): BlogSeriesMetadata | undefined {
  const value = record.series

  if (value === undefined) return undefined

  assertRecord(value, "MDX frontmatter series")

  const order = value.order

  if (!Number.isInteger(order) || Number(order) <= 0) {
    throw new Error("MDX frontmatter series.order must be a positive integer")
  }

  return {
    slug: readString(value, "slug"),
    title: readString(value, "title"),
    order: Number(order),
  }
}

export function defineBlogMdxPost(
  attributes: unknown,
  expectedSlug: string,
): BlogPostMetadata {
  assertRecord(attributes, "MDX frontmatter")

  const post: BlogPostMetadata = {
    slug: readString(attributes, "slug"),
    title: readString(attributes, "title"),
    description: readString(attributes, "description"),
    date: readString(attributes, "date"),
    excerpt: readString(attributes, "excerpt"),
    tags: readStringArray(attributes, "tags"),
    relatedSlugs: readStringArray(attributes, "relatedSlugs"),
    series: readSeries(attributes),
  }

  if (post.slug !== expectedSlug) {
    throw new Error(
      `MDX slug ${post.slug} does not match route slug ${expectedSlug}`,
    )
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
    throw new Error(`MDX frontmatter date must use YYYY-MM-DD: ${post.date}`)
  }

  if (new Set(post.tags).size !== post.tags.length) {
    throw new Error(`MDX frontmatter tags must be unique: ${post.slug}`)
  }

  if (new Set(post.relatedSlugs).size !== post.relatedSlugs.length) {
    throw new Error(`MDX frontmatter relatedSlugs must be unique: ${post.slug}`)
  }

  if (post.relatedSlugs.includes(post.slug)) {
    throw new Error(`MDX post cannot relate to itself: ${post.slug}`)
  }

  return post
}
