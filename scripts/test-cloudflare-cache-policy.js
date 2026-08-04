import assert from "node:assert/strict"

process.env.NODE_ENV = "production"

const { onRequest } = await import("../functions/[[path]].js")

const origin = "https://micrantha.example"
const analyticsId = "cache-policy-contract"
const cacheControls = {
  home: "public, max-age=60, s-maxage=300, stale-while-revalidate=900",
  catalog: "public, max-age=60, s-maxage=600, stale-while-revalidate=1800",
  reference: "public, max-age=60, s-maxage=1800, stale-while-revalidate=3600",
  content: "public, max-age=60, s-maxage=600, stale-while-revalidate=1800",
  private: "private, no-store",
}

async function request(pathname, { method = "GET" } = {}) {
  return onRequest({
    request: new Request(new URL(pathname, origin), {
      method,
      headers: { "User-Agent": "cache-policy-contract" },
    }),
    env: { MICRANTHA_ANALYTICS_ID: analyticsId },
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

function assertCacheControl(response, expected) {
  assert.equal(response.headers.get("cache-control"), expected)
}

function assertNoncePair(response, body) {
  const policy = response.headers.get("content-security-policy") ?? ""
  const nonce = policy.match(/'nonce-([^']+)'/)?.[1]

  assert.ok(nonce, "expected a CSP nonce")
  assert.ok(
    body.includes(`nonce="${nonce}"`),
    "expected body/header nonce parity",
  )

  return nonce
}

for (const [pathname, cacheClass] of [
  ["/", "home"],
  ["/solutions", "catalog"],
  ["/privacy", "reference"],
  ["/blog", "content"],
  ["/blog/governance-native-engineering-control-plane", "content"],
]) {
  const document = await read(pathname)

  assert.equal(document.response.status, 200, pathname)
  assertCacheControl(document.response, cacheControls[cacheClass])
  assertNoncePair(document.response, document.body)
}

const firstHome = await read("/")
const secondHome = await read("/")
const firstNonce = assertNoncePair(firstHome.response, firstHome.body)
const secondNonce = assertNoncePair(secondHome.response, secondHome.body)

assert.notEqual(
  firstNonce,
  secondNonce,
  "each rendered document needs a fresh nonce",
)

const dataResponse = await read("/?_data=root")
assert.equal(dataResponse.response.status, 200)
assert.match(
  dataResponse.response.headers.get("content-type") ?? "",
  /^application\/json\b/i,
)
assertCacheControl(dataResponse.response, cacheControls.private)
const dataNonce = dataResponse.response.headers.get("x-csp-nonce")
assert.ok(dataNonce, "expected data response nonce header")
assert.ok(
  dataResponse.body.includes(dataNonce),
  "expected data response body/header nonce parity",
)

for (const pathname of [
  "/this-route-does-not-exist",
  "/blog/unknown-article",
  "/runtime-contract/error",
]) {
  const missing = await read(pathname)

  assert.equal(missing.response.status, 404, pathname)
  assertCacheControl(missing.response, cacheControls.private)
}

const action = await read("/services", { method: "POST" })
assert.equal(action.response.status, 405)
assertCacheControl(action.response, cacheControls.private)

console.log("Cloudflare cache policy and CSP nonce contract passed")
