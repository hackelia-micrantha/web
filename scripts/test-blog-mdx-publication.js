import assert from "node:assert/strict"

import {
  assertPublishedRegistryPost,
  assertRoutableBlogMdxPublished,
  currentBlogPublicationDate,
  isBlogPublicationAvailable,
  parseBlogMdxPublication,
} from "./blog-mdx-publication.js"

const relativePath = "app/routes/blog.publication-contract/content.mdx"

function source(status, date) {
  return `---
status: ${status}
date: "${date}"
---

Publication contract fixture.
`
}

const published = parseBlogMdxPublication(
  source("published", "2026-08-03"),
  relativePath,
)

assert.deepEqual(published, {
  status: "published",
  date: "2026-08-03",
})
assert.equal(
  isBlogPublicationAvailable(published, "2026-08-03"),
  true,
)
assert.equal(
  isBlogPublicationAvailable(published, "2026-08-02"),
  false,
)
assert.equal(
  isBlogPublicationAvailable(
    parseBlogMdxPublication(source("draft", "2026-08-03"), relativePath),
    "2026-08-03",
  ),
  false,
)

assert.deepEqual(
  assertRoutableBlogMdxPublished({
    asOfDate: "2026-08-03",
    relativePath,
    source: source("published", "2026-08-03"),
  }),
  published,
)

assert.throws(
  () =>
    assertRoutableBlogMdxPublished({
      asOfDate: "2026-08-03",
      relativePath,
      source: source("draft", "2026-08-03"),
    }),
  /drafts must remain outside app\/routes/u,
)
assert.throws(
  () =>
    assertRoutableBlogMdxPublished({
      asOfDate: "2026-08-03",
      relativePath,
      source: source("published", "2026-08-04"),
    }),
  /future posts must remain outside app\/routes/u,
)
assert.throws(
  () => parseBlogMdxPublication(source("scheduled", "2026-08-03"), relativePath),
  /must be draft or published/u,
)
assert.throws(
  () => parseBlogMdxPublication(source("published", "2026-02-30"), relativePath),
  /valid calendar date/u,
)
assert.throws(
  () =>
    parseBlogMdxPublication(
      `---
date: "2026-08-03"
---
`,
      relativePath,
    ),
  /frontmatter.status must be a string/u,
)

assert.doesNotThrow(() =>
  assertPublishedRegistryPost(
    { slug: "published-post", date: "2026-08-03" },
    "2026-08-03",
  ),
)
assert.throws(
  () =>
    assertPublishedRegistryPost(
      { slug: "future-post", date: "2026-08-04" },
      "2026-08-03",
    ),
  /must remain outside the published registry/u,
)

assert.equal(
  currentBlogPublicationDate(new Date("2026-08-03T23:59:59Z")),
  "2026-08-03",
)

console.log(
  "Blog publication policy tests passed: published, draft, future, invalid status/date, registry, and UTC clock contracts",
)
