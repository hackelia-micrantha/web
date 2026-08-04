import assert from "node:assert/strict"

export const BLOG_FRONTMATTER_FIELDS = Object.freeze([
  "slug",
  "status",
  "title",
  "description",
  "date",
  "updatedAt",
  "excerpt",
  "tags",
  "relatedSlugs",
  "series",
])

export const BLOG_SERIES_FIELDS = Object.freeze(["slug", "order"])

const frontmatterFields = new Set(BLOG_FRONTMATTER_FIELDS)
const seriesFields = new Set(BLOG_SERIES_FIELDS)
const calendarDatePattern = /^\d{4}-\d{2}-\d{2}$/u

export function assertKnownBlogFrontmatterFields(attributes, context) {
  for (const field of Object.keys(attributes)) {
    assert.ok(
      frontmatterFields.has(field),
      `${context} contains unsupported frontmatter field ${field}`,
    )
  }
}

export function assertKnownBlogSeriesFields(series, context) {
  for (const field of Object.keys(series)) {
    assert.ok(
      seriesFields.has(field),
      `${context}.series contains unsupported field ${field}`,
    )
  }
}

export function parseBlogCalendarDate(value, context) {
  assert.equal(typeof value, "string", `${context} must be a string`)
  assert.match(value, calendarDatePattern, `${context} must be YYYY-MM-DD`)

  const parsed = new Date(`${value}T00:00:00Z`)
  assert.equal(
    Number.isNaN(parsed.valueOf()),
    false,
    `${context} must be a valid calendar date`,
  )
  assert.equal(
    parsed.toISOString().slice(0, 10),
    value,
    `${context} must be a valid calendar date`,
  )

  return value
}

export function readOptionalBlogUpdatedAt(attributes, date, context) {
  if (attributes.updatedAt === undefined) return null

  const updatedAt = parseBlogCalendarDate(
    attributes.updatedAt,
    `${context}.updatedAt`,
  )

  assert.ok(
    updatedAt >= date,
    `${context}.updatedAt must not precede date`,
  )

  return updatedAt
}

export function getBlogLastModifiedDate(post) {
  return post.updatedAt ?? post.date
}
