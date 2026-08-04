import assert from "node:assert/strict"

process.env.NODE_ENV = "production"

const { onRequest } = await import("../functions/[[path]].js")

const origin = "https://micrantha.example"
const analyticsId = "adapter-contract-test"

async function request(
  pathname,
  { userAgent = "adapter-contract", method = "GET" } = {},
) {
  const request = new Request(new URL(pathname, origin), {
    method,
    headers: {
      "User-Agent": userAgent,
    },
  })

  return onRequest({
    request,
    env: {
      MICRANTHA_ANALYTICS_ID: analyticsId,
    },
    params: {},
    data: {},
    functionPath: "[[path]]",
    waitUntil() {},
    passThroughOnException() {},
    next() {
      throw new Error("Unexpected Pages Functions next() call")
    },
  })
}

async function read(pathname, options) {
  const response = await request(pathname, options)
  const body = await response.text()

  return { response, body }
}

function assertDocumentHeaders(response, body, { requireNonce = true } = {}) {
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html;\s*charset=utf-8$/i,
  )
  assert.equal(response.headers.get("x-content-type-options"), "nosniff")
  assert.equal(response.headers.get("x-frame-options"), "DENY")
  assert.equal(
    response.headers.get("permissions-policy"),
    "camera=(), geolocation=(), microphone=()",
  )
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  )
  assert.equal(
    response.headers.get("strict-transport-security"),
    "max-age=31536000",
  )
  assert.ok(response.headers.get("cache-control"), "expected a cache policy")

  if (!requireNonce) {
    return
  }

  const policy = response.headers.get("content-security-policy") ?? ""
  const nonce = policy.match(/'nonce-([^']+)'/)?.[1]

  assert.ok(nonce, "expected a CSP nonce in the document response")
  assert.ok(
    body.includes(`nonce="${nonce}"`),
    "expected the response body to use the CSP nonce",
  )
}

const home = await read("/")
assert.equal(home.response.status, 200)
assert.match(home.body, /<!DOCTYPE html>/i)
assert.match(home.body, /id="content"/)
assert.match(home.body, new RegExp(`data-website-id="${analyticsId}"`))
assertDocumentHeaders(home.response, home.body)

const contactRedirect = await read("/contact")
assert.equal(contactRedirect.response.status, 301)
assert.equal(contactRedirect.response.headers.get("location"), "/services")
assert.equal(contactRedirect.body, "")

const article = await read("/blog/ai-pipelines-need-control-boundaries")
assert.equal(article.response.status, 200)
assert.match(article.body, /AI Pipelines Need Control Boundaries/)
assert.match(
  article.body,
  /AI is not the system of record\. AI is an untrusted reasoning component/,
)
assertDocumentHeaders(article.response, article.body)

const integrationArticle = await read(
  "/blog/secure-platform-integration-is-not-plumbing",
)
assert.equal(integrationArticle.response.status, 200)
assert.match(
  integrationArticle.body,
  /Secure Platform Integration Is Not Plumbing/,
)
assert.match(
  integrationArticle.body,
  /Secure platform integration is not plumbing\. It is the place where/,
)
assert.match(integrationArticle.body, /data-content-source="mdx"/)
assertDocumentHeaders(integrationArticle.response, integrationArticle.body)

const botArticle = await read("/blog/ai-pipelines-need-control-boundaries", {
  userAgent: "Googlebot/2.1",
})
assert.equal(botArticle.response.status, 200)
assert.match(botArticle.body, /AI Pipelines Need Control Boundaries/)
assertDocumentHeaders(botArticle.response, botArticle.body)

for (const pathname of [
  "/blog/draft-publication-fixture",
  "/blog/future-publication-fixture",
]) {
  const unpublished = await read(pathname)

  assert.equal(unpublished.response.status, 404)
  assert.match(unpublished.body, /404|Not Found/i)
  assertDocumentHeaders(unpublished.response, unpublished.body, {
    requireNonce: false,
  })
}

const methodNotAllowed = await read("/services", { method: "POST" })
assert.equal(methodNotAllowed.response.status, 405)
assert.match(methodNotAllowed.body, /405|Method Not Allowed/i)
assertDocumentHeaders(methodNotAllowed.response, methodNotAllowed.body, {
  requireNonce: false,
})

const disabledErrorContract = await read("/runtime-contract/error")
assert.equal(disabledErrorContract.response.status, 404)
assert.match(disabledErrorContract.body, /404|Not Found/i)
assert.equal(
  disabledErrorContract.response.headers.get("cache-control"),
  "private, no-store",
)
assertDocumentHeaders(
  disabledErrorContract.response,
  disabledErrorContract.body,
  { requireNonce: false },
)

const missing = await read("/this-route-does-not-exist")
assert.equal(missing.response.status, 404)
assert.match(missing.body, /404|Not Found/i)
assertDocumentHeaders(missing.response, missing.body, { requireNonce: false })

console.log("Cloudflare Pages adapter contract passed")
