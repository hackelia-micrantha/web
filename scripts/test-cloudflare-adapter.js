import assert from "node:assert/strict"

process.env.NODE_ENV = "production"

const { onRequest } = await import("../functions/[[path]].js")

const origin = "https://micrantha.example"
const analyticsId = "adapter-contract-test"
const articlePath = "/blog/ai-pipelines-need-control-boundaries"
const articleUrl = `https://micrantha.com${articlePath}`

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

function assertDocumentHeaders(
  response,
  body,
  { requireNonce = true, cacheControl } = {},
) {
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/)
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

  if (cacheControl) {
    assert.equal(response.headers.get("cache-control"), cacheControl)
  } else {
    assert.ok(response.headers.get("cache-control"), "expected a cache policy")
  }

  const policy = response.headers.get("content-security-policy") ?? ""

  if (!requireNonce && !policy) {
    return
  }

  const nonce = policy.match(/'nonce-([^']+)'/)?.[1]

  assert.ok(nonce, "expected a CSP nonce in the document response")
  assert.ok(
    body.includes(`nonce="${nonce}"`),
    "expected the response body to use the CSP nonce",
  )
}

function assertArticleMetadata(body) {
  assert.match(
    body,
    new RegExp(`rel="canonical" href="${articleUrl.replaceAll("/", "\\/")}"`),
  )
  assert.match(body, /"@type":"Article"/)
  assert.ok(
    body.includes(`"url":"${articleUrl}"`),
    "expected Article JSON-LD to contain the canonical URL",
  )
}

const home = await read("/")
assert.equal(home.response.status, 200)
assert.match(home.body, /<!DOCTYPE html>/i)
assert.match(home.body, /id="content"/)
assert.match(home.body, new RegExp(`data-website-id="${analyticsId}"`))
assertDocumentHeaders(home.response, home.body, {
  cacheControl: "public, max-age=60, s-maxage=300, stale-while-revalidate=900",
})

const contactRedirect = await read("/contact")
assert.equal(contactRedirect.response.status, 301)
assert.equal(contactRedirect.response.headers.get("location"), "/services")

const article = await read(articlePath)
assert.equal(article.response.status, 200)
assert.match(article.body, /AI Pipelines Need Control Boundaries/)
assert.match(
  article.body,
  /AI is not the system of record\. AI is an untrusted reasoning component/,
)
assertArticleMetadata(article.body)
assertDocumentHeaders(article.response, article.body, {
  cacheControl: "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
})

const botArticle = await read(articlePath, {
  userAgent: "Googlebot/2.1",
})
assert.equal(botArticle.response.status, 200)
assert.match(botArticle.body, /AI Pipelines Need Control Boundaries/)
assertArticleMetadata(botArticle.body)
assertDocumentHeaders(botArticle.response, botArticle.body, {
  cacheControl: "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
})

const methodNotAllowed = await read("/services", { method: "POST" })
assert.equal(methodNotAllowed.response.status, 405)
assert.match(methodNotAllowed.body, /405|Method Not Allowed/i)
assertDocumentHeaders(methodNotAllowed.response, methodNotAllowed.body, {
  requireNonce: false,
})

const missing = await read("/this-route-does-not-exist")
assert.equal(missing.response.status, 404)
assert.match(missing.body, /404|Not Found/i)
assertDocumentHeaders(missing.response, missing.body, { requireNonce: false })

console.log("Cloudflare Pages adapter contract passed")
