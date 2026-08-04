import assert from "node:assert/strict"
import test from "node:test"

import {
  assertRoutableBlogPublication,
  assertRoutableMdxPublication,
  filterPublishedBlogPosts,
  getBlogPublicationStatus,
  isCalendarDate,
  isPublishedBlogPost,
  resolvePublicationCutoff,
} from "../../app/content/blog-publication.js"

const publishedPost = {
  slug: "published-post",
  status: "published",
  date: "2026-08-03",
}

const draftPost = {
  slug: "draft-post",
  status: "draft",
  date: "2026-08-03",
}

test("validates strict calendar dates", () => {
  assert.equal(isCalendarDate("2026-08-03"), true)
  assert.equal(isCalendarDate("2026-02-29"), false)
  assert.equal(isCalendarDate("2026-8-3"), false)
  assert.equal(isCalendarDate(null), false)
})

test("resolves explicit and current UTC publication cutoffs", () => {
  assert.equal(resolvePublicationCutoff("2026-08-03"), "2026-08-03")
  assert.equal(
    resolvePublicationCutoff(undefined, new Date("2026-08-04T23:59:59Z")),
    "2026-08-04",
  )
  assert.throws(
    () => resolvePublicationCutoff("2026-02-29"),
    /valid YYYY-MM-DD/,
  )
})

test("filters frontmatter publication metadata without exposing drafts", () => {
  assert.equal(getBlogPublicationStatus(publishedPost), "published")
  assert.equal(getBlogPublicationStatus(null), null)
  assert.equal(isPublishedBlogPost(publishedPost), true)
  assert.equal(isPublishedBlogPost(draftPost), false)
  assert.deepEqual(filterPublishedBlogPosts([publishedPost, draftPost]), [
    publishedPost,
  ])
})

test("accepts published routable metadata at the cutoff", () => {
  assert.deepEqual(
    assertRoutableBlogPublication([publishedPost], {
      cutoff: "2026-08-03",
    }),
    [publishedPost],
  )
})

test("rejects invalid explicit publication cutoffs", () => {
  assert.throws(
    () =>
      assertRoutableBlogPublication([publishedPost], {
        cutoff: "2026-02-29",
      }),
    /valid YYYY-MM-DD/,
  )
})

test("rejects missing, draft, future, and duplicate publication metadata", () => {
  assert.throws(
    () =>
      assertRoutableBlogPublication(
        [{ slug: "missing-status", date: "2026-08-03" }],
        { cutoff: "2026-08-03" },
      ),
    /missing publication metadata/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication([draftPost], {
        cutoff: "2026-08-03",
      }),
    /draft but remains routable/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication(
        [{ ...publishedPost, date: "2026-08-04" }],
        { cutoff: "2026-08-03" },
      ),
    /after publication cutoff/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication([publishedPost, publishedPost], {
        cutoff: "2026-08-03",
      }),
    /Duplicate routable blog slug/,
  )
})

test("rejects malformed records and unsupported statuses", () => {
  assert.throws(
    () =>
      assertRoutableBlogPublication(
        [{ slug: "", status: "published", date: "2026-08-03" }],
        { cutoff: "2026-08-03" },
      ),
    /non-empty slug/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication(
        [{ slug: "published-post", status: "published", date: "August 3" }],
        { cutoff: "2026-08-03" },
      ),
    /valid YYYY-MM-DD date/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication(
        [{ ...publishedPost, status: "scheduled" }],
        { cutoff: "2026-08-03" },
      ),
    /unsupported publication status/,
  )
})

test("enforces the same publication contract for MDX routes", () => {
  assert.deepEqual(
    assertRoutableMdxPublication(publishedPost, {
      cutoff: "2026-08-03",
    }),
    publishedPost,
  )
  assert.throws(
    () =>
      assertRoutableMdxPublication(draftPost, {
        cutoff: "2026-08-03",
      }),
    /draft but remains routable/,
  )
})
