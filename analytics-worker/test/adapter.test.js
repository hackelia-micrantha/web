import assert from "node:assert/strict"
import test from "node:test"
import { runInNewContext } from "node:vm"

import worker from "../src/index.js"
import { createClientScript } from "../src/client-source.js"

function browser(config, pathname = "/") {
  const scripts = []
  const window = { location: { origin: "https://micrantha.com", pathname } }
  const document = {
    querySelector: () => null,
    createElement: () => ({}),
    head: {
      appendChild(node) {
        scripts.push(node)
      },
    },
  }

  runInNewContext(createClientScript(config), { window, document })
  return { window, scripts }
}

const disabled = { provider: "none", paths: [], titles: {}, events: {} }
const ga4 = {
  provider: "ga4",
  measurementId: "G-TEST1234",
  paths: ["/", "/about"],
  titles: { "/": "Home", "/about": "About" },
  events: { cta_click: { placement: ["hero", "footer"] } },
}

test("Worker serves only explicit sites, versions, and health", async () => {
  const origin = "https://analytics.micrantha.com"
  const get = (path, method = "GET") =>
    worker.fetch(new Request(origin + path, { method }))

  const live = get("/healthz")
  assert.equal(live.status, 200)
  assert.deepEqual(await live.json(), {
    status: "ok",
    service: "lenticel",
  })
  assert.equal(live.headers.get("cache-control"), "no-store")

  const js = get("/v1/sites/micrantha-web.js")
  assert.equal(js.status, 200)
  assert.match(js.headers.get("content-type"), /^application\/javascript/)
  assert.equal(js.headers.get("x-content-type-options"), "nosniff")
  assert.equal(js.headers.get("access-control-allow-origin"), "*")
  assert.equal(
    js.headers.get("cache-control"),
    "public, max-age=300, must-revalidate",
  )
  assert.match(await js.text(), /"provider":"none"/)

  for (const path of [
    "/",
    "/count.js",
    "/count",
    "/api/send",
    "/v1/client.js",
    "/v1/sites/unknown.js",
    "/v2/sites/micrantha-web.js",
    "/v1/sites/%2e%2e.js",
  ]) {
    assert.equal(get(path).status, 404, path)
  }

  const head = get("/v1/sites/micrantha-web.js", "HEAD")
  assert.equal(head.status, 200)
  assert.equal(await head.text(), "")

  const invalid = get("/v1/sites/micrantha-web.js", "POST")
  assert.equal(invalid.status, 405)
  assert.equal(invalid.headers.get("allow"), "GET, HEAD")
})

test("disabled site exposes inert API without vendor egress", () => {
  const { window, scripts } = browser(disabled)
  assert.equal(typeof window.lenticel.page, "function")
  assert.equal(typeof window.lenticel.track, "function")
  window.lenticel.page("/")
  window.lenticel.track("cta_click", { placement: "hero" })
  window.lenticel.setConsent("granted")
  window.lenticel.page("/")
  window.lenticel.track("cta_click", { placement: "hero" })
  assert.equal(scripts.length, 0)
  assert.equal(window.gtag, undefined)
  assert.equal(window.dataLayer, undefined)
})

test("GA4 is gated by explicit consent and existing SDK ownership", () => {
  const { window, scripts } = browser(ga4)
  const api = window.lenticel
  api.page("/")
  api.track("cta_click", { placement: "hero" })
  assert.equal(scripts.length, 0)
  assert.equal(window.dataLayer, undefined)

  api.setConsent("granted")
  assert.equal(scripts.length, 1)
  assert.match(
    scripts[0].src,
    /^https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-TEST1234$/,
  )
  api.setConsent("granted")
  assert.equal(scripts.length, 1)

  const entries = () => Array.from(window.dataLayer, (args) => Array.from(args))
  assert.equal(entries()[1][0], "config")
  assert.equal(entries()[1][2].send_page_view, false)

  const initialCount = entries().length
  api.page("/about")
  api.page("/about?email=private@example.com")
  api.track("cta_click", { placement: "hero" })
  api.track("cta_click", { placement: "email@example.com" })
  api.track("cta_click", { email: "private@example.com" })
  api.track("unknown_event")
  assert.equal(entries().length, initialCount + 2)
  assert.deepEqual(
    entries()
      .slice(-2)
      .map((event) => event[1]),
    ["page_view", "cta_click"],
  )
  assert.equal(
    entries()[initialCount][2].page_location,
    "https://micrantha.com/about",
  )
  assert.equal(entries()[initialCount + 1][2].placement, "hero")

  api.setConsent("denied")
  const stoppedCount = entries().length
  api.page("/")
  api.track("cta_click", { placement: "footer" })
  assert.equal(entries().length, stoppedCount)
  assert.equal(scripts.length, 1)
})

test("loading twice does not register another adapter or vendor", () => {
  const { window, scripts } = browser(disabled)
  const api = window.lenticel
  runInNewContext(createClientScript(disabled), { window, document: {} })
  assert.equal(window.lenticel, api)
  assert.equal(scripts.length, 0)
})
