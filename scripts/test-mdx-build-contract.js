import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)
const buildRoot = path.join(repositoryRoot, "public", "build")
const routeIds = {
  article: "routes/blog.ai-pipelines-need-control-boundaries",
  index: "routes/blog._index",
}
const articleMarkers = [
  "Start with the right mental model",
  "AI is not the system of record",
]
const unrelatedArticleMarkers = [
  "The integration layer is where identity gets translated",
]

const buildFiles = await readdir(buildRoot)
const manifestFiles = buildFiles.filter(
  (file) => file.startsWith("manifest-") && file.endsWith(".js"),
)

assert.equal(
  manifestFiles.length,
  1,
  `expected one Remix browser manifest, found ${manifestFiles.length}`,
)

const manifestSource = await readFile(
  path.join(buildRoot, manifestFiles[0]),
  "utf8",
)
const sandbox = { window: {} }

vm.runInNewContext(manifestSource, sandbox, {
  filename: manifestFiles[0],
})

const manifest = sandbox.window.__remixManifest
assert.ok(manifest?.routes, "expected Remix route metadata in browser manifest")

function requireRoute(routeId) {
  const route = manifest.routes[routeId]
  assert.ok(route, `missing route ${routeId} from Remix browser manifest`)
  assert.equal(typeof route.module, "string", `missing module for ${routeId}`)
  return route
}

function normalizeBuildFile(specifier, fromFile = "") {
  if (specifier.startsWith("/build/")) {
    return specifier.slice("/build/".length)
  }

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    return path
      .normalize(path.join(path.dirname(fromFile), specifier))
      .split(path.sep)
      .join("/")
  }

  return null
}

function extractStaticRelativeImports(source, fromFile) {
  const specifiers = new Set()
  const pattern = /\bimport\s*(?:[^"']*?\sfrom\s*)?["']([^"']+)["']/g

  for (const match of source.matchAll(pattern)) {
    const normalized = normalizeBuildFile(match[1], fromFile)
    if (normalized) specifiers.add(normalized)
  }

  return [...specifiers]
}

async function collectEagerRouteClosure(route) {
  const pending = [
    normalizeBuildFile(route.module),
    ...(route.imports ?? []).map((specifier) => normalizeBuildFile(specifier)),
  ].filter(Boolean)
  const visited = new Set()
  const sources = new Map()

  while (pending.length > 0) {
    const file = pending.pop()

    if (!file || visited.has(file)) continue

    visited.add(file)

    const source = await readFile(path.join(buildRoot, file), "utf8")
    sources.set(file, source)

    for (const importedFile of extractStaticRelativeImports(source, file)) {
      if (!visited.has(importedFile)) pending.push(importedFile)
    }
  }

  return sources
}

function filesContainingMarker(sources, marker) {
  return [...sources.entries()]
    .filter(([, source]) => source.includes(marker))
    .map(([file]) => file)
}

function assertMarkerAbsent(sources, marker, label) {
  const matches = filesContainingMarker(sources, marker)

  assert.deepEqual(
    matches,
    [],
    `${label} leaked marker ${marker} through ${matches.join(", ")}`,
  )
}

const articleRoute = requireRoute(routeIds.article)
const indexRoute = requireRoute(routeIds.index)

assert.notEqual(
  articleRoute.module,
  indexRoute.module,
  "the static MDX article must have its own browser route module",
)

const [articleClosure, indexClosure] = await Promise.all([
  collectEagerRouteClosure(articleRoute),
  collectEagerRouteClosure(indexRoute),
])

for (const marker of articleMarkers) {
  const articleMatches = filesContainingMarker(articleClosure, marker)

  assert.ok(
    articleMatches.length > 0,
    `the MDX article route closure is missing marker: ${marker}`,
  )
  assertMarkerAbsent(
    indexClosure,
    marker,
    "the blog index eager route closure",
  )
}

for (const marker of unrelatedArticleMarkers) {
  assertMarkerAbsent(
    articleClosure,
    marker,
    "the MDX article eager route closure",
  )
  assertMarkerAbsent(
    indexClosure,
    marker,
    "the blog index eager route closure",
  )
}

console.log(
  `MDX build contract passed: ${articleClosure.size} eager article files, ${indexClosure.size} eager index files`,
)
