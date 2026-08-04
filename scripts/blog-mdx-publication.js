import assert from "node:assert/strict"

import { parseDocument } from "yaml"

export const blogPublicationStatuses = new Set(["draft", "published"])

function extractFrontmatter(source, relativePath) {
  const normalized = source.replaceAll("\r\n", "\n")

  assert.ok(
    normalized.startsWith("---\n"),
    `${relativePath} must begin with YAML frontmatter`,
  )

  const closingDelimiter = normalized.indexOf("\n---\n", 4)

  assert.notEqual(
    closingDelimiter,
    -1,
    `${relativePath} is missing its closing frontmatter delimiter`,
  )

  return normalized.slice(4, closingDelimiter)
}

export function validateBlogPublicationDate(value, context) {
  assert.equal(typeof value, "string", `${context} must be a string`)
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/u, `${context} must be YYYY-MM-DD`)

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

export function currentBlogPublicationDate(now = new Date()) {
  assert.ok(now instanceof Date, "Publication clock must be a Date")
  assert.equal(
    Number.isNaN(now.valueOf()),
    false,
    "Publication clock must be valid",
  )

  return now.toISOString().slice(0, 10)
}

export function parseBlogMdxPublication(source, relativePath) {
  const document = parseDocument(extractFrontmatter(source, relativePath), {
    strict: true,
    uniqueKeys: true,
  })

  assert.equal(
    document.errors.length,
    0,
    `${relativePath} has invalid YAML frontmatter: ${document.errors
      .map((error) => error.message)
      .join("; ")}`,
  )

  const frontmatter = document.toJS({ maxAliasCount: 0 })

  assert.ok(
    frontmatter &&
      typeof frontmatter === "object" &&
      !Array.isArray(frontmatter),
    `${relativePath} frontmatter must be a mapping`,
  )

  const status = frontmatter.status

  assert.equal(
    typeof status,
    "string",
    `${relativePath} frontmatter.status must be a string`,
  )
  assert.ok(
    blogPublicationStatuses.has(status),
    `${relativePath} frontmatter.status must be draft or published`,
  )

  return {
    status,
    date: validateBlogPublicationDate(
      frontmatter.date,
      `${relativePath} frontmatter.date`,
    ),
  }
}

export function isBlogPublicationAvailable(publication, asOfDate) {
  const cutoff = validateBlogPublicationDate(asOfDate, "Publication cutoff")

  return publication.status === "published" && publication.date <= cutoff
}

export function assertRoutableBlogMdxPublished({
  asOfDate = currentBlogPublicationDate(),
  relativePath,
  source,
}) {
  const publication = parseBlogMdxPublication(source, relativePath)

  assert.equal(
    publication.status,
    "published",
    `${relativePath} is routable but has status ${publication.status}; drafts must remain outside app/routes`,
  )
  assert.equal(
    publication.date <=
      validateBlogPublicationDate(asOfDate, "Publication cutoff"),
    true,
    `${relativePath} is routable before publication date ${publication.date}; future posts must remain outside app/routes`,
  )

  return publication
}

export function assertPublishedRegistryPost(post, asOfDate) {
  const cutoff = validateBlogPublicationDate(asOfDate, "Publication cutoff")
  const date = validateBlogPublicationDate(
    post.date,
    `Registry post ${post.slug} date`,
  )

  assert.equal(
    date <= cutoff,
    true,
    `Registry post ${post.slug} is future-dated (${date}); unpublished posts must remain outside the published registry`,
  )
}
