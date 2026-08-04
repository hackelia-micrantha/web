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
  date: "2026-08-03",
}

const manifest = {
  "published-post": { status: "published" },
  "draft-post": { status: "draft" },
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

test("filters publication metadata without exposing drafts", () => {
  const posts = [publishedPost, { slug: "draft-post", date: "2026-08-03" }]

  assert.equal(
    getBlogPublicationStatus("published-post", manifest),
    "published",
  )
  assert.equal(getBlogPublicationStatus("missing-post", manifest), null)
  assert.equal(isPublishedBlogPost(publishedPost, manifest), true)
  assert.equal(isPublishedBlogPost(posts[1], manifest), false)
  assert.deepEqual(filterPublishedBlogPosts(posts, manifest), [publishedPost])
})

test("accepts published routable metadata at the cutoff", () => {
  assert.deepEqual(
    assertRoutableBlogPublication([publishedPost], {
      manifest: { "published-post": { status: "published" } },
      cutoff: "2026-08-03",
    }),
    [publishedPost],
  )
})

test("rejects missing, draft, future, duplicate, and stale publication metadata", () => {
  assert.throws(
    () =>
      assertRoutableBlogPublication([publishedPost], {
        manifest: {},
        cutoff: "2026-08-03",
      }),
    /missing publication metadata/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication([publishedPost], {
        manifest: { "published-post": { status: "draft" } },
        cutoff: "2026-08-03",
      }),
    /draft but remains routable/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication(
        [{ ...publishedPost, date: "2026-08-04" }],
        {
          manifest: { "published-post": { status: "published" } },
          cutoff: "2026-08-03",
        },
      ),
    /after publication cutoff/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication([publishedPost, publishedPost], {
        manifest: { "published-post": { status: "published" } },
        cutoff: "2026-08-03",
      }),
    /Duplicate routable blog slug/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication([publishedPost], {
        manifest: {
          "published-post": { status: "published" },
          "stale-post": { status: "published" },
        },
        cutoff: "2026-08-03",
      }),
    /missing routable metadata/,
  )
})

test("rejects malformed records and unsupported statuses", () => {
  assert.throws(
    () =>
      assertRoutableBlogPublication([{ slug: "", date: "2026-08-03" }], {
        manifest: {},
        cutoff: "2026-08-03",
      }),
    /non-empty slug/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication(
        [{ slug: "published-post", date: "August 3" }],
        {
          manifest: { "published-post": { status: "published" } },
          cutoff: "2026-08-03",
        },
      ),
    /valid YYYY-MM-DD date/,
  )
  assert.throws(
    () =>
      assertRoutableBlogPublication([publishedPost], {
        manifest: { "published-post": { status: "scheduled" } },
        cutoff: "2026-08-03",
      }),
    /unsupported publication status/,
  )
})

test("allows non-routable draft manifest entries", () => {
  assert.doesNotThrow(() =>
    assertRoutableBlogPublication([publishedPost], {
      manifest,
      cutoff: "2026-08-03",
    }),
  )
})

test("enforces published MDX frontmatter and manifest parity", () => {
  const mdxPost = { ...publishedPost, status: "published" }

  assert.deepEqual(
    assertRoutableMdxPublication(mdxPost, {
      manifest: { "published-post": { status: "published" } },
      cutoff: "2026-08-03",
    }),
    mdxPost,
  )
  assert.throws(
    () =>
      assertRoutableMdxPublication(
        { ...mdxPost, status: "draft" },
        {
          manifest: { "published-post": { status: "published" } },
          cutoff: "2026-08-03",
        },
      ),
    /must declare status published/,
  )
  assert.throws(
    () =>
      assertRoutableMdxPublication(mdxPost, {
        manifest: { "published-post": { status: "draft" } },
        cutoff: "2026-08-03",
      }),
    /draft but remains routable/,
  )
})
