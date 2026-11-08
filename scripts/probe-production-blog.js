import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { pathToFileURL } from "node:url"

const BASE_URL = "https://micrantha.com"

export const BLOG_EDGE_ROUTES = [
  {
    path: "/blog",
    status: 200,
    expected: [
      "Explore the series",
      "Recommended reading paths",
      "For integration and modernization teams",
      "For AI-assisted engineering teams",
      "/blog/series/governance-native-engineering",
      "/blog/series/architecture-control-boundaries",
    ],
  },
  {
    path: "/blog/series/governance-native-engineering",
    status: 200,
    expected: ["The Assurance Stack", "For AI-assisted engineering teams"],
  },
  {
    path: "/blog/series/architecture-control-boundaries",
    status: 200,
    expected: [
      "Architecture Control Boundaries",
      "For integration and modernization delivery",
    ],
  },
  {
    path: "/blog/secure-platform-integration-is-not-plumbing",
    status: 200,
    expected: ["Secure Platform Integration Is Not Plumbing"],
  },
  { path: "/blog/__release_probe_not_a_route__", status: 404, expected: [] },
]

export async function probeBlogEdge({ fetcher = fetch } = {}) {
  const observations = []
  const failures = []

  for (const { path, status, expected } of BLOG_EDGE_ROUTES) {
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

    const observation = {
      path,
      status: response.status,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      cacheControl,
      cfCacheStatus: headers.get("cf-cache-status"),
      contentType,
      noncePaired:
        status === 200
          ? Boolean(nonce && body.includes('nonce="' + nonce + '"'))
          : null,
    }
    observations.push(observation)

    const fail = (check) => failures.push({ path, check })
    if (response.status !== status) fail("status")
    if (!contentType.toLowerCase().includes("text/html")) fail("content-type")
    if (headers.get("x-content-type-options") !== "nosniff") fail("nosniff")
    if (headers.get("x-frame-options") !== "DENY")
      fail("frame-ancestors-fallback")
    if (!csp.includes("object-src 'none'")) fail("csp")
    if (body.includes("editorial/staged/")) fail("staged-content-exposure")
    if (status === 200) {
      if (!cacheControl.includes("public")) fail("cache-public")
      if (!observation.noncePaired) fail("nonce-pair")
      if (!body.includes('<link rel="canonical" href="' + url + '"'))
        fail("canonical")
      for (const marker of expected) {
        if (!body.includes(marker)) fail("missing:" + marker)
      }
    } else {
      if (
        !cacheControl.includes("private") ||
        !cacheControl.includes("no-store")
      ) {
        fail("404-no-store")
      }
    }
  }

  return {
    result: failures.length === 0 ? "PASS" : "FAIL",
    scope: "public-read-only-blog-edge; no-deployment-identity-attestation",
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
