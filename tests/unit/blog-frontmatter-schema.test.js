import assert from "node:assert/strict"
import test from "node:test"

import {
  assertKnownBlogFrontmatterFields,
  assertKnownBlogSeriesFields,
  getBlogLastModifiedDate,
  parseBlogCalendarDate,
  readOptionalBlogUpdatedAt,
} from "../../scripts/blog-frontmatter-schema.js"

const requiredAttributes = {
  slug: "schema-contract",
  status: "published",
  title: "Schema Contract",
  description: "Strict canonical frontmatter.",
  date: "2026-08-03",
  excerpt: "A focused schema policy.",
  tags: ["testing"],
  relatedSlugs: ["related-contract"],
  series: { slug: "schema-series", order: 1 },
}

test("accepts the documented top-level and series fields", () => {
  assert.doesNotThrow(() =>
    assertKnownBlogFrontmatterFields(requiredAttributes, "post"),
  )
  assert.doesNotThrow(() =>
    assertKnownBlogSeriesFields(requiredAttributes.series, "post"),
  )
})

test("rejects unknown top-level and nested series fields", () => {
  assert.throws(
    () =>
      assertKnownBlogFrontmatterFields(
        { ...requiredAttributes, typoField: "ignored" },
        "post",
      ),
    /unsupported frontmatter field typoField/,
  )
  assert.throws(
    () =>
      assertKnownBlogSeriesFields(
        { ...requiredAttributes.series, title: "Duplicated ownership" },
        "post",
      ),
    /series contains unsupported field title/,
  )
})

test("validates real calendar dates", () => {
  assert.equal(parseBlogCalendarDate("2024-02-29", "date"), "2024-02-29")
  assert.throws(
    () => parseBlogCalendarDate(20260803, "date"),
    /must be a string/,
  )
  assert.throws(() => parseBlogCalendarDate("2026/08/03", "date"), /YYYY-MM-DD/)
  assert.throws(
    () => parseBlogCalendarDate("2026-02-29", "date"),
    /valid calendar date/,
  )
})

test("accepts optional updatedAt on or after publication date", () => {
  assert.equal(
    readOptionalBlogUpdatedAt(
      requiredAttributes,
      requiredAttributes.date,
      "post",
    ),
    null,
  )
  assert.equal(
    readOptionalBlogUpdatedAt(
      { ...requiredAttributes, updatedAt: "2026-08-03" },
      requiredAttributes.date,
      "post",
    ),
    "2026-08-03",
  )
  assert.equal(
    readOptionalBlogUpdatedAt(
      { ...requiredAttributes, updatedAt: "2026-08-04" },
      requiredAttributes.date,
      "post",
    ),
    "2026-08-04",
  )
})

test("rejects malformed or earlier updatedAt values", () => {
  assert.throws(
    () =>
      readOptionalBlogUpdatedAt(
        { ...requiredAttributes, updatedAt: "not-a-date" },
        requiredAttributes.date,
        "post",
      ),
    /YYYY-MM-DD/,
  )
  assert.throws(
    () =>
      readOptionalBlogUpdatedAt(
        { ...requiredAttributes, updatedAt: "2026-08-02" },
        requiredAttributes.date,
        "post",
      ),
    /must not precede date/,
  )
})

test("uses updatedAt as the last-modified date when present", () => {
  assert.equal(getBlogLastModifiedDate(requiredAttributes), "2026-08-03")
  assert.equal(
    getBlogLastModifiedDate({ ...requiredAttributes, updatedAt: "2026-08-04" }),
    "2026-08-04",
  )
})
