import assert from "node:assert/strict"
import test from "node:test"

import { validateBlogSeriesMembership } from "../../scripts/blog-series-validation.js"

const primary = {
  slug: "assurance",
  title: "The Assurance Stack",
  description: "AI delivery evidence and authority",
}

const integration = {
  slug: "integration",
  title: "Architecture Control Boundaries",
  description: "Enterprise integration controls",
}

function post(slug, order, series = "assurance") {
  return { slug, series: { slug: series, order } }
}

test("derives one ordered membership projection from post metadata", () => {
  const result = validateBlogSeriesMembership(
    [post("second", 2), post("first", 1), post("one", 1, "integration")],
    [primary, integration],
  )
  assert.deepEqual(
    result.seriesPostsBySlug.get("assurance").map((item) => item.slug),
    ["first", "second"],
  )
  assert.deepEqual(
    result.seriesPostsBySlug.get("integration").map((item) => item.slug),
    ["one"],
  )
})

test("rejects references to undefined series", () => {
  assert.throws(
    () =>
      validateBlogSeriesMembership([post("unknown", 1, "missing")], [primary]),
    /references unknown series missing/,
  )
})

test("rejects competing definitions for the same series slug", () => {
  assert.throws(
    () => validateBlogSeriesMembership([post("first", 1)], [primary, primary]),
    /Blog series definitions contains duplicate values/,
  )
})

test("rejects duplicate part orders", () => {
  assert.throws(
    () =>
      validateBlogSeriesMembership([post("one", 1), post("two", 1)], [primary]),
    /Series assurance order values contains duplicate values/,
  )
})

test("rejects gaps in part order and ordering that does not begin at one", () => {
  assert.throws(
    () =>
      validateBlogSeriesMembership(
        [post("one", 1), post("three", 3)],
        [primary],
      ),
    /must be contiguous from 1/,
  )
  assert.throws(
    () => validateBlogSeriesMembership([post("two", 2)], [primary]),
    /must be contiguous from 1/,
  )
})

test("rejects declared series with no corresponding post", () => {
  assert.throws(
    () =>
      validateBlogSeriesMembership([post("one", 1)], [primary, integration]),
    /Series integration has no posts/,
  )
})
