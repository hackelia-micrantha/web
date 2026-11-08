import assert from "node:assert/strict"
import test from "node:test"
import {
  BLOG_EDGE_ROUTES,
  probeBlogEdge,
} from "../../scripts/probe-production-blog.js"

const makeResponse = (
  url,
  { omit, missingHeader, status, cacheControl } = {},
) => {
  const route = BLOG_EDGE_ROUTES.find((entry) => url.endsWith(entry.path))
  assert.ok(route, url)
  const nonce = "fixed-test-nonce"
  const body =
    '<link rel="canonical" href="' +
    url +
    '"/><script nonce="' +
    nonce +
    '"></script>' +
    route.expected.filter((marker) => marker !== omit).join(" ")
  return new Response(body, {
    status: status ?? route.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-security-policy":
        "default-src 'self'; object-src 'none'; script-src 'self' 'nonce-" +
        nonce +
        "'",
      "cache-control":
        cacheControl ??
        (route.status === 200 ? "public, max-age=60" : "private, no-store"),
      "x-content-type-options":
        missingHeader === "nosniff" ? "invalid" : "nosniff",
      "x-frame-options": "DENY",
      "cf-cache-status": "DYNAMIC",
    },
  })
}

test("every public blog SSR and failure contract passes with expected content", async () => {
  const queries = []
  const result = await probeBlogEdge({
    fetcher: async (url, options) => {
      queries.push(url)
      assert.equal(options.redirect, "manual")
      assert.equal(options.headers["User-Agent"], "MicranthaReleaseProbe/1.0")
      return makeResponse(url)
    },
  })
  assert.equal(result.result, "PASS")
  assert.deepEqual(result.failures, [])
  assert.equal(result.observations.length, BLOG_EDGE_ROUTES.length)
  assert.equal(queries.length, BLOG_EDGE_ROUTES.length)
  assert.equal(
    result.scope,
    "public-read-only-blog-edge; no-deployment-identity-attestation",
  )
})

test("missing new blog index SSR fails, even if legacy routes remain healthy", async () => {
  const result = await probeBlogEdge({
    fetcher: async (url) =>
      makeResponse(url, {
        omit: url.endsWith("/blog") ? "Recommended reading paths" : undefined,
      }),
  })
  assert.equal(result.result, "FAIL")
  assert.ok(
    result.failures.some(
      (failure) =>
        failure.path === "/blog" &&
        failure.check === "missing:Recommended reading paths",
    ),
  )
})

test("missing CSP pairing, security headers, or 404 isolation fails closed", async () => {
  const result = await probeBlogEdge({
    fetcher: async (url) => {
      if (url.endsWith("/blog"))
        return makeResponse(url, { missingHeader: "nosniff" })
      if (url.includes("governance-native-engineering")) {
        const body = await makeResponse(url).text()
        return new Response(
          body.replaceAll(
            'nonce="fixed-test-nonce"',
            'nonce="wrong-html-nonce"',
          ),
          { status: 200, headers: makeResponse(url).headers },
        )
      }
      if (url.includes("__release_probe_")) {
        return makeResponse(url, { cacheControl: "public" })
      }
      return makeResponse(url)
    },
  })
  assert.equal(result.result, "FAIL")
  assert.ok(result.failures.some((failure) => failure.check === "nosniff"))
  assert.ok(result.failures.some((failure) => failure.check === "nonce-pair"))
  assert.ok(result.failures.some((failure) => failure.check === "404-no-store"))
})

test("network or unexpected status failure is evidence, never treated as success", async () => {
  const result = await probeBlogEdge({
    fetcher: async (url) => {
      if (url.endsWith("/blog"))
        throw Object.assign(new Error("unreachable"), { name: "TimeoutError" })
      if (url.includes("governance-native-engineering")) {
        return makeResponse(url, { status: 503 })
      }
      return makeResponse(url)
    },
  })
  assert.equal(result.result, "FAIL")
  assert.ok(result.failures.some((failure) => failure.check === "request"))
  assert.ok(result.failures.some((failure) => failure.check === "status"))
  assert.equal(result.observations.length, BLOG_EDGE_ROUTES.length - 1)
})

test("staged editorial source path must never appear in public HTML", async () => {
  const result = await probeBlogEdge({
    fetcher: async (url) => {
      const normal = await makeResponse(url).text()
      const route = BLOG_EDGE_ROUTES.find((entry) => url.endsWith(entry.path))
      return new Response(normal + " editorial/staged/unpublished/ ", {
        status: route.status,
        headers: makeResponse(url).headers,
      })
    },
  })
  assert.equal(result.result, "FAIL")
  assert.equal(
    result.failures.filter(
      (failure) => failure.check === "staged-content-exposure",
    ).length,
    BLOG_EDGE_ROUTES.length,
  )
})

test("CSP pairing requires script nonce, not arbitrary HTML nonce text", async () => {
  const result = await probeBlogEdge({
    fetcher: async (url) => {
      const response = makeResponse(url)
      if (!url.endsWith("/blog")) return response
      const body = await response.text()
      return new Response(
        body.replace(
          '<script nonce="fixed-test-nonce"></script>',
          '<div nonce="fixed-test-nonce"></div><script></script>',
        ),
        { status: 200, headers: response.headers },
      )
    },
  })
  assert.equal(result.result, "FAIL")
  assert.ok(result.failures.some((failure) => failure.check === "nonce-pair"))
})

test("public pages and 404s reject contradictory cache directives", async () => {
  const result = await probeBlogEdge({
    fetcher: async (url) => {
      if (url.endsWith("/blog")) {
        return makeResponse(url, {
          cacheControl: "private, public, max-age=60",
        })
      }
      if (url.includes("__release_probe_")) {
        return makeResponse(url, { cacheControl: "public, private, no-store" })
      }
      return makeResponse(url)
    },
  })
  assert.equal(result.result, "FAIL")
  assert.ok(
    result.failures.some(
      (failure) => failure.path === "/blog" && failure.check === "cache-public",
    ),
  )
  assert.ok(result.failures.some((failure) => failure.check === "404-no-store"))
})
