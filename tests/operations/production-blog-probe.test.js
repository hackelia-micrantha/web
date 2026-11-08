import assert from "node:assert/strict"
import test from "node:test"

import { loadBlogContentInventory } from "../../scripts/blog-content-inventory.js"
import {
  buildBlogEdgeContract,
  deriveCanonicalUrlFromRouteSource,
  loadBlogReleaseInventory,
  probeBlogEdge,
} from "../../scripts/probe-production-blog.js"

const first = {
  slug: "first-note",
  status: "published",
  title: "First & Important Note",
  series: { slug: "engineering-notes", order: 1 },
}
const standalone = {
  slug: "standalone-note",
  status: "published",
  title: "Standalone Note",
}
const unpublished = {
  slug: "future-note",
  status: "draft",
  title: "Unpublished Note",
}
const series = {
  slug: "engineering-notes",
  title: "Engineering Notes",
  description: "A source-derived series description",
}

function makeInventory({ extraPost } = {}) {
  const posts = [
    first,
    standalone,
    unpublished,
    ...(extraPost ? [extraPost] : []),
  ]
  const seriesPosts = posts
    .filter(
      (post) =>
        post.status === "published" && post.series?.slug === series.slug,
    )
    .sort((left, right) => left.series.order - right.series.order)
  return {
    posts,
    series: [series],
    seriesPostsBySlug: new Map([[series.slug, seriesPosts]]),
  }
}

function textHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function makeResponse(url, contract, options = {}) {
  const route = contract.find((candidate) => url.endsWith(candidate.path))
  assert.ok(route, "unexpected route " + url)
  const nonce = "test-request-nonce"
  const titleNodes = route.expectedText
    .filter((value) => value !== options.omitText)
    .map((value) => "<h2>" + textHtml(value) + "</h2>")
    .join("")
  const links = route.expectedLinks
    .filter((value) => value !== options.omitLink)
    .map((href) => '<a href="' + href + '">Open</a>')
    .join("")
  const sections = (route.requiredSections ?? [])
    .filter((value) => value !== options.omitSection)
    .map((value) => '<section aria-labelledby="' + value + '"></section>')
    .join("")
  const readingPath =
    route.requiresReadingPath && !options.omitReadingPath
      ? '<ol><li><a href="/blog/standalone-note">Read</a></li></ol>'
      : ""
  const html =
    '<html><head><link rel="canonical" href="' +
    (route.canonicalUrl ?? url) +
    '"/></head><body><script nonce="' +
    nonce +
    '"></script>' +
    titleNodes +
    links +
    sections +
    readingPath +
    (options.trailingHtml ?? "") +
    "</body></html>"
  return new Response(html, {
    status: options.status ?? route.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-security-policy":
        "default-src 'self'; object-src 'none'; script-src 'self' 'nonce-" +
        nonce +
        "'",
      "cache-control":
        options.cacheControl ??
        (route.status === 200 ? "public, max-age=60" : "private, no-store"),
      "x-content-type-options":
        options.missingHeader === "nosniff" ? "invalid" : "nosniff",
      "x-frame-options": "DENY",
      "cf-cache-status": "DYNAMIC",
    },
  })
}

async function probeWith(overrides = {}, inventory = makeInventory()) {
  const contract = buildBlogEdgeContract(inventory)
  return probeBlogEdge({
    inventory,
    fetcher: async (url, options) => {
      assert.equal(options.redirect, "manual")
      assert.equal(options.headers["User-Agent"], "MicranthaReleaseProbe/1.0")
      return makeResponse(
        url,
        contract,
        overrides[url.slice("https://micrantha.com".length)],
      )
    },
  })
}

test("derives routes and full expected navigation from source content", async () => {
  const result = await probeWith()
  assert.equal(result.result, "PASS")
  assert.equal(
    result.scope,
    "source-derived-public-read-only-blog-edge; no-deployment-identity-attestation",
  )
  assert.deepEqual(result.source, {
    publishedPosts: 2,
    series: 1,
    routesChecked: 5,
  })
  assert.deepEqual(result.failures, [])
  assert.equal(result.observations.length, 5)
})

test("a newly published article automatically expands index and route acceptance", async () => {
  const newPost = {
    slug: "newly-published-note",
    status: "published",
    title: "Newly Published Note",
    series: { slug: series.slug, order: 2 },
  }
  const inventory = makeInventory({ extraPost: newPost })
  const routes = buildBlogEdgeContract(inventory)
  assert.ok(routes.some((route) => route.path === "/blog/newly-published-note"))
  assert.ok(
    routes
      .find((route) => route.path === "/blog")
      .expectedLinks.includes("/blog/newly-published-note"),
  )
  assert.ok(
    routes
      .find((route) => route.path === "/blog/series/engineering-notes")
      .expectedLinks.includes("/blog/newly-published-note"),
  )
  assert.equal((await probeWith({}, inventory)).result, "PASS")
})

test("unpublished posts must not be expected or exposed as source-derived routes", () => {
  const routes = buildBlogEdgeContract(makeInventory())
  assert.equal(
    routes.some((route) => route.path.includes("future-note")),
    false,
  )
  assert.ok(
    routes.every(
      (route) =>
        !(route.expectedLinks ?? []).some((url) => url.includes("future-note")),
    ),
  )
})

test("missing source-derived article links and series titles fail", async () => {
  const result = await probeWith({
    "/blog": { omitLink: "/blog/first-note" },
    "/blog/series/engineering-notes": { omitText: series.title },
  })
  assert.equal(result.result, "FAIL")
  assert.ok(
    result.failures.some(
      (failure) => failure.check === "missing-link:/blog/first-note",
    ),
  )
  assert.ok(
    result.failures.some(
      (failure) => failure.check === "missing-text:Engineering Notes",
    ),
  )
})

test("blog series discovery and reading paths remain stable structural contracts", async () => {
  const result = await probeWith({
    "/blog": {
      omitSection: "blog-series-heading",
      omitReadingPath: true,
    },
  })
  assert.equal(result.result, "FAIL")
  assert.ok(
    result.failures.some(
      (failure) => failure.check === "missing-section:blog-series-heading",
    ),
  )
  assert.ok(
    result.failures.some(
      (failure) => failure.check === "reading-path-navigation",
    ),
  )
})

test("hydration JSON cannot satisfy visible source-derived titles or links", async () => {
  const result = await probeWith({
    "/blog": {
      omitText: first.title,
      omitLink: "/blog/first-note",
      trailingHtml:
        '<script type="application/json">' +
        JSON.stringify({ title: first.title, href: "/blog/first-note" }) +
        "</script>",
    },
  })
  assert.equal(result.result, "FAIL")
  assert.ok(
    result.failures.some(
      (failure) => failure.check === "missing-text:" + first.title,
    ),
  )
  assert.ok(
    result.failures.some(
      (failure) => failure.check === "missing-link:/blog/first-note",
    ),
  )
})

test("security headers, contradictory cache directives, and nonce mismatch fail closed", async () => {
  const result = await probeWith({
    "/blog": {
      missingHeader: "nosniff",
      cacheControl: "public, private",
      trailingHtml: '<script nonce="wrong-nonce"></script>',
    },
    "/blog/__release_probe_not_a_route__": {
      cacheControl: "public, private, no-store",
    },
  })
  assert.equal(result.result, "FAIL")
  for (const check of [
    "nosniff",
    "cache-public",
    "nonce-pair",
    "404-no-store",
  ]) {
    assert.ok(
      result.failures.some((failure) => failure.check === check),
      check,
    )
  }
})

test("network failure and unexpected response status are never successes", async () => {
  const inventory = makeInventory()
  const contract = buildBlogEdgeContract(inventory)
  const result = await probeBlogEdge({
    inventory,
    fetcher: async (url) => {
      if (url.endsWith("/blog"))
        throw Object.assign(new Error("unreachable"), { name: "TimeoutError" })
      return makeResponse(url, contract, {
        status: url.endsWith("/blog/first-note") ? 503 : undefined,
      })
    },
  })
  assert.equal(result.result, "FAIL")
  assert.ok(result.failures.some((failure) => failure.check === "request"))
  assert.ok(result.failures.some((failure) => failure.check === "status"))
  assert.equal(result.observations.length, contract.length - 1)
})

test("staged editorial path exposure fails for any public response", async () => {
  const result = await probeWith({
    "/blog": { trailingHtml: " editorial/staged/private-note/ " },
  })
  assert.equal(result.result, "FAIL")
  assert.ok(
    result.failures.some(
      (failure) => failure.check === "staged-content-exposure",
    ),
  )
})

test("invalid or empty source inventories fail instead of silently passing", () => {
  assert.throws(() =>
    buildBlogEdgeContract({
      posts: [],
      series: [],
      seriesPostsBySlug: new Map(),
    }),
  )
  assert.throws(() =>
    buildBlogEdgeContract({
      posts: [{ slug: "../not-safe", status: "published" }],
      series: [],
      seriesPostsBySlug: new Map(),
    }),
  )
  assert.throws(() =>
    buildBlogEdgeContract({
      posts: [first],
      series: [series],
      seriesPostsBySlug: new Map(),
    }),
  )
})

test("repository parser supplies real expected routes without a second slug list", async () => {
  const inventory = await loadBlogContentInventory()
  const routes = buildBlogEdgeContract(inventory)
  const posts = inventory.posts.filter((post) => post.status === "published")
  assert.equal(routes.length, 2 + inventory.series.length + posts.length)
  assert.ok(routes.some((route) => route.path === "/blog"))
  for (const post of posts) {
    assert.ok(routes.some((route) => route.path === "/blog/" + post.slug))
  }
  for (const series of inventory.series) {
    assert.ok(
      routes.some((route) => route.path === "/blog/series/" + series.slug),
    )
  }
})

test("external crosspost canonical is derived from checked-in route source", () => {
  const source = [
    'import { createBlogCrosspostRoute } from "~/content/blog-crosspost-route";',
    "const route = createBlogCrosspostRoute(",
    '  "first-note", Content, "https://ryanjennin.gs/posts/first-note/",',
    '  "/img/blog/first.webp", "cover",',
    ")",
  ].join("\n")
  assert.equal(
    deriveCanonicalUrlFromRouteSource(source, "first-note"),
    "https://ryanjennin.gs/posts/first-note/",
  )
  assert.equal(
    deriveCanonicalUrlFromRouteSource(
      'createBlogMdxRoute("first-note", Content)',
      "first-note",
    ),
    null,
  )
  assert.throws(() =>
    deriveCanonicalUrlFromRouteSource(source, "different-slug"),
  )
  assert.throws(() =>
    deriveCanonicalUrlFromRouteSource(
      'createBlogCrosspostRoute("first-note", Content, canonicalUrl)',
      "first-note",
    ),
  )
})

test("external canonical follows source, not a self-canonical assumption", async () => {
  const inventory = makeInventory()
  inventory.posts = inventory.posts.map((post) =>
    post.slug === first.slug
      ? { ...post, canonicalUrl: "https://ryanjennin.gs/posts/first-note/" }
      : post,
  )
  assert.equal((await probeWith({}, inventory)).result, "PASS")
  const wrongContract = buildBlogEdgeContract(makeInventory())
  const result = await probeBlogEdge({
    inventory,
    fetcher: async (url) => makeResponse(url, wrongContract),
  })
  assert.equal(result.result, "FAIL")
  assert.ok(
    result.failures.some(
      (failure) =>
        failure.path === "/blog/first-note" && failure.check === "canonical",
    ),
  )
})

test("real source canonical projection matches each route implementation", async () => {
  const inventory = await loadBlogReleaseInventory()
  const routes = buildBlogEdgeContract(inventory)
  for (const post of inventory.posts.filter(
    (candidate) => candidate.status === "published",
  )) {
    const route = routes.find((entry) => entry.path === "/blog/" + post.slug)
    assert.equal(
      route.canonicalUrl,
      post.canonicalUrl ?? "https://micrantha.com/blog/" + post.slug,
    )
  }
})
