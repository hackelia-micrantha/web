import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"

import ts from "typescript"

import { loadBlogContentInventory } from "./blog-content-inventory.js"

const BASE_URL = "https://micrantha.com"
const MISSING_ROUTE = "/blog/__release_probe_not_a_route__"
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateSlug(value) {
  assert.match(
    value,
    SAFE_SLUG,
    "Release probe discovered an invalid blog slug",
  )
  return value
}

export function deriveCanonicalUrlFromRouteSource(source, slug) {
  const file = ts.createSourceFile(
    "route.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  assert.equal(file.parseDiagnostics.length, 0, "Invalid blog route source")
  let canonicalUrl = null
  let crosspostFound = false
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "createBlogCrosspostRoute"
    ) {
      assert.equal(crosspostFound, false, "Multiple crosspost declarations")
      crosspostFound = true
      const [routeSlug, , canonical] = node.arguments
      assert.ok(
        ts.isStringLiteral(routeSlug),
        "Crosspost slug must be a literal",
      )
      assert.equal(routeSlug.text, slug, "Crosspost slug mismatch")
      assert.ok(
        ts.isStringLiteral(canonical),
        "Crosspost canonical must be a literal",
      )
      const url = new URL(canonical.text)
      assert.equal(url.protocol, "https:", "Crosspost canonical must use HTTPS")
      assert.equal(
        url.username,
        "",
        "Crosspost canonical must not contain credentials",
      )
      assert.equal(
        url.password,
        "",
        "Crosspost canonical must not contain credentials",
      )
      assert.equal(
        url.hash,
        "",
        "Crosspost canonical must not contain a fragment",
      )
      canonicalUrl = url.toString()
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  if (source.includes("createBlogCrosspostRoute")) {
    assert.ok(
      crosspostFound,
      "Cannot resolve crosspost canonical from route source",
    )
  }
  return canonicalUrl
}

export async function loadBlogReleaseInventory() {
  const inventory = await loadBlogContentInventory()
  const posts = await Promise.all(
    inventory.posts.map(async (post) => {
      const slug = validateSlug(post.slug)
      const source = await readFile(
        path.join(process.cwd(), "app/routes", "blog." + slug, "route.tsx"),
        "utf8",
      )
      const canonicalUrl = deriveCanonicalUrlFromRouteSource(source, slug)
      return { ...post, ...(canonicalUrl ? { canonicalUrl } : {}) }
    }),
  )
  return { ...inventory, posts }
}

export function buildBlogEdgeContract(inventory) {
  assert.ok(Array.isArray(inventory?.posts), "Missing canonical blog inventory")
  assert.ok(Array.isArray(inventory?.series), "Missing canonical blog series")
  assert.ok(
    inventory.seriesPostsBySlug instanceof Map,
    "Missing series membership",
  )

  const posts = inventory.posts.filter((post) => post.status === "published")
  assert.ok(posts.length > 0, "No published blog articles to verify")
  const postPaths = posts.map((post) => "/blog/" + validateSlug(post.slug))
  assert.equal(
    new Set(postPaths).size,
    postPaths.length,
    "Duplicate article slugs",
  )

  const series = inventory.series.map((definition) => {
    const slug = validateSlug(definition.slug)
    const seriesPosts = (inventory.seriesPostsBySlug.get(slug) ?? []).filter(
      (post) => post.status === "published",
    )
    assert.ok(seriesPosts.length > 0, "Published series has no published posts")
    assert.ok(
      seriesPosts.every((post) =>
        posts.some((published) => published.slug === post.slug),
      ),
      "Series references unpublished or unknown article",
    )
    return { ...definition, slug, posts: seriesPosts }
  })

  const seriesPaths = series.map((item) => "/blog/series/" + item.slug)
  assert.equal(
    new Set(seriesPaths).size,
    seriesPaths.length,
    "Duplicate series slugs",
  )

  return [
    {
      path: "/blog",
      status: 200,
      expectedText: posts.map((post) => post.title),
      expectedLinks: [...seriesPaths, ...postPaths],
      requiredSections: ["blog-series-heading", "reading-paths-heading"],
      requiresReadingPath: true,
    },
    ...series.map((item) => ({
      path: "/blog/series/" + item.slug,
      status: 200,
      expectedText: [
        item.title,
        item.description,
        ...item.posts.map((post) => post.title),
      ],
      expectedLinks: item.posts.map((post) => "/blog/" + post.slug),
      expectedOrderedLinks: item.posts.map((post) => "/blog/" + post.slug),
    })),
    ...posts.map((post) => ({
      path: "/blog/" + post.slug,
      status: 200,
      expectedText: [post.title],
      expectedLinks: [],
      canonicalUrl: post.canonicalUrl ?? BASE_URL + "/blog/" + post.slug,
    })),
    { path: MISSING_ROUTE, status: 404, expectedText: [], expectedLinks: [] },
  ]
}

function decodeHtmlText(value) {
  return value
    .replace(
      /&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);/gi,
      (original, entity) => {
        const named = {
          amp: "&",
          lt: "<",
          gt: ">",
          quot: '"',
          apos: "'",
          nbsp: " ",
        }
        const key = entity.toLowerCase()
        if (Object.hasOwn(named, key)) return named[key]
        const hex = key.startsWith("#x")
        const number = Number.parseInt(key.slice(hex ? 2 : 1), hex ? 16 : 10)
        return Number.isInteger(number) && number > 0 && number <= 0x10ffff
          ? String.fromCodePoint(number)
          : original
      },
    )
    .replace(/\s+/g, " ")
    .trim()
}

function inspectHtml(body) {
  const renderedBody = body
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
  const readableText = decodeHtmlText(renderedBody.replace(/<[^>]+>/g, " "))
  const links = Array.from(
    renderedBody.matchAll(/<a\b[^>]*\bhref=(["'])([^"']+)\1/gi),
    (match) => match[2],
  )
  const sections = Array.from(
    renderedBody.matchAll(
      /<section\b[^>]*\baria-labelledby=(["'])([^"']+)\1/gi,
    ),
    (match) => match[2],
  )
  const orderedLists = [...renderedBody.matchAll(/<ol\b[^>]*>[\s\S]*?<\/ol>/gi)]
    .map((match) => match[0])
    .filter((list) => /<a\b[^>]*\bhref=(["'])\/blog\/[^"']+\1/i.test(list))

  return {
    text: readableText,
    links: new Set(links),
    linkSequence: links,
    sections: new Set(sections),
    readingPathLists: orderedLists.length,
  }
}

export async function probeBlogEdge({ fetcher = fetch, inventory } = {}) {
  // Expectations come from the candidate source tree, NEVER from the live site's
  // sitemap or navigation (which would let a stale deploy validate itself).
  const sourceInventory = inventory ?? (await loadBlogReleaseInventory())
  const routes = buildBlogEdgeContract(sourceInventory)
  const observations = []
  const failures = []

  for (const route of routes) {
    const { path, status, expectedText, expectedLinks } = route
    const url = BASE_URL + path
    let response
    let bytes
    try {
      response = await fetcher(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(12000),
        headers: { "User-Agent": "MicranthaReleaseProbe/1.0" },
      })
      bytes = Buffer.from(await response.arrayBuffer())
    } catch (error) {
      failures.push({
        path,
        check: "request",
        reason: error?.name ?? "unknown",
      })
      continue
    }

    const body = bytes.toString("utf8")
    const headers = response.headers
    const csp = headers.get("content-security-policy") ?? ""
    const cacheControl = headers.get("cache-control") ?? ""
    const contentType = headers.get("content-type") ?? ""
    const nonce = /'nonce-([^']+)'/.exec(csp)?.[1]
    const scriptTags = body.match(/<script\b[^>]*>/gi) ?? []
    const scriptNonces = scriptTags
      .map((tag) => /\bnonce=(["'])([^"']+)\1/i.exec(tag)?.[2])
      .filter(Boolean)
    const noncePaired = Boolean(
      nonce &&
      scriptNonces.length > 0 &&
      scriptNonces.every((scriptNonce) => scriptNonce === nonce),
    )
    const cacheDirectives = new Set(
      cacheControl
        .split(",")
        .map((part) => part.trim().split("=")[0].toLowerCase())
        .filter(Boolean),
    )
    const html = inspectHtml(body)

    observations.push({
      path,
      status: response.status,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      cacheControl,
      cfCacheStatus: headers.get("cf-cache-status"),
      contentType,
      noncePaired: status === 200 ? noncePaired : null,
    })

    const fail = (check) => failures.push({ path, check })
    if (response.status !== status) fail("status")
    if (!contentType.toLowerCase().includes("text/html")) fail("content-type")
    if (headers.get("x-content-type-options") !== "nosniff") fail("nosniff")
    if (headers.get("x-frame-options") !== "DENY")
      fail("frame-ancestors-fallback")
    if (!csp.includes("object-src 'none'")) fail("csp")
    if (body.includes("editorial/staged/")) fail("staged-content-exposure")

    if (status === 200) {
      if (
        !cacheDirectives.has("public") ||
        cacheDirectives.has("private") ||
        cacheDirectives.has("no-store")
      ) {
        fail("cache-public")
      }
      if (!noncePaired) fail("nonce-pair")
      const canonicalUrl = route.canonicalUrl ?? url
      if (!body.includes('<link rel="canonical" href="' + canonicalUrl + '"')) {
        fail("canonical")
      }

      for (const title of expectedText) {
        if (!html.text.includes(decodeHtmlText(title)))
          fail("missing-text:" + title)
      }
      for (const link of expectedLinks) {
        if (!html.links.has(link)) fail("missing-link:" + link)
      }
      if (route.expectedOrderedLinks) {
        const indices = route.expectedOrderedLinks.map((link) =>
          html.linkSequence.indexOf(link),
        )
        if (
          indices.some((index) => index < 0) ||
          indices.some(
            (index, position) => position > 0 && index <= indices[position - 1],
          )
        ) {
          fail("series-order")
        }
      }
      for (const section of route.requiredSections ?? []) {
        if (!html.sections.has(section)) fail("missing-section:" + section)
      }
      if (route.requiresReadingPath && html.readingPathLists === 0) {
        fail("reading-path-navigation")
      }
    } else if (
      !cacheDirectives.has("private") ||
      !cacheDirectives.has("no-store") ||
      cacheDirectives.has("public")
    ) {
      fail("404-no-store")
    }
  }

  return {
    result: failures.length === 0 ? "PASS" : "FAIL",
    scope:
      "source-derived-public-read-only-blog-edge; no-deployment-identity-attestation",
    source: {
      publishedPosts: sourceInventory.posts.filter(
        (post) => post.status === "published",
      ).length,
      series: sourceInventory.series.length,
      routesChecked: routes.length,
    },
    observations,
    failures,
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    assert.deepEqual(process.argv.slice(2), [])
    const evidence = await probeBlogEdge()
    console.log(JSON.stringify(evidence, null, 2))
    if (evidence.result !== "PASS") process.exitCode = 1
  } catch (error) {
    console.error("PUBLIC_BLOG_PROBE=FAIL reason=" + (error?.name ?? "unknown"))
    process.exitCode = 1
  }
}
