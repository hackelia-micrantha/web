import assert from "node:assert/strict"
import test from "node:test"

import {
  PRIVATE_NO_STORE_CACHE_CONTROL,
  PUBLIC_DOCUMENT_CACHE_CASES,
  getDocumentCacheControl,
  getDocumentCachePolicy,
  getRequestCacheControl,
} from "../../app/services/cache-policy.js"

const expectedByClass = {
  home: "public, max-age=60, s-maxage=300, stale-while-revalidate=900",
  catalog: "public, max-age=60, s-maxage=600, stale-while-revalidate=1800",
  reference: "public, max-age=60, s-maxage=1800, stale-while-revalidate=3600",
  content: "public, max-age=60, s-maxage=600, stale-while-revalidate=1800",
}

test("assigns every documented public route to an explicit cache class", () => {
  for (const { pathname, className } of PUBLIC_DOCUMENT_CACHE_CASES) {
    assert.deepEqual(getDocumentCachePolicy(pathname), {
      className,
      cacheControl: expectedByClass[className],
    })
    assert.equal(getDocumentCacheControl(pathname), expectedByClass[className])
  }
})

test("recognizes dynamic blog routes without creating a public fallback", () => {
  assert.deepEqual(getDocumentCachePolicy("/blog/series/architecture-notes"), {
    className: "content",
    cacheControl: expectedByClass.content,
  })
  assert.deepEqual(getDocumentCachePolicy("/blog/some-published-article"), {
    className: "content",
    cacheControl: expectedByClass.content,
  })

  for (const pathname of [
    "/new-route-without-a-policy",
    "/blog/series/",
    "/blog/nested/not-supported",
    "/runtime-contract/error",
  ]) {
    assert.deepEqual(getDocumentCachePolicy(pathname), {
      className: "private",
      cacheControl: PRIVATE_NO_STORE_CACHE_CONTROL,
    })
  }
})

test("keeps actions and Remix data requests private", () => {
  assert.equal(
    getRequestCacheControl(new Request("https://micrantha.com/services", { method: "POST" })),
    PRIVATE_NO_STORE_CACHE_CONTROL,
  )
  assert.equal(
    getRequestCacheControl(new Request("https://micrantha.com/?_data=root")),
    PRIVATE_NO_STORE_CACHE_CONTROL,
  )
  assert.equal(
    getRequestCacheControl(
      new Request("https://micrantha.com/blog", { method: "HEAD" }),
    ),
    expectedByClass.content,
  )
  assert.equal(
    getRequestCacheControl(new Request("https://micrantha.com/solutions")),
    expectedByClass.catalog,
  )
})
