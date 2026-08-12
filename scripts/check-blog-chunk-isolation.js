import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import vm from "node:vm"

import {
  loadBlogContentInventory,
  repositoryRoot,
} from "./blog-content-inventory.js"

const buildDirectory = path.join(repositoryRoot, "public/build")
const bodyMarkers = new Map([
  [
    "secure-platform-integration-is-not-plumbing",
    "Integration layers deserve architectural attention",
  ],
  [
    "ai-pipelines-need-control-boundaries",
    "The practical goal is not to remove AI",
  ],
  [
    "software-layers-are-risk-boundaries",
    "Software layers are not only a code-organization preference",
  ],
  [
    "governance-native-engineering-control-plane",
    "It can be the mechanism that makes more autonomy acceptable",
  ],
  [
    "replayability-is-a-governance-problem",
    "bounded explainability and attributable execution",
  ],
  [
    "recursive-governance-and-agent-workflows",
    "humans remain capable of comprehension, intervention, replay, audit",
  ],
])

function buildFilePath(moduleReference, importerPath = buildDirectory) {
  const reference = moduleReference.split(/[?#]/u)[0]

  if (reference.startsWith("/build/")) {
    return path.join(buildDirectory, reference.slice("/build/".length))
  }

  if (reference.startsWith("./") || reference.startsWith("../")) {
    return path.resolve(path.dirname(importerPath), reference)
  }

  return null
}

function importedModules(source) {
  const imports = new Set()
  const patterns = [
    /(?:from\s*|import\s*\(\s*)["']([^"']+)["']/gu,
    /\bimport\s*["']([^"']+)["']/gu,
  ]

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) imports.add(match[1])
  }

  return imports
}

async function readManifest() {
  const entries = await readdir(buildDirectory)
  const manifestFiles = entries.filter(
    (entry) => entry.startsWith("manifest-") && entry.endsWith(".js"),
  )

  assert.equal(
    manifestFiles.length,
    1,
    `Expected one browser manifest, found ${manifestFiles.length}`,
  )

  const manifestPath = path.join(buildDirectory, manifestFiles[0])
  const source = await readFile(manifestPath, "utf8")
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: manifestPath })
  assert.ok(sandbox.window.__remixManifest, "Browser manifest was not assigned")

  return sandbox.window.__remixManifest
}

async function collectModuleGraph(route) {
  const pending = [route.module, ...(route.imports ?? [])].map((reference) => ({
    importerPath: buildDirectory,
    reference,
  }))
  const visited = new Set()
  const sources = new Map()

  while (pending.length > 0) {
    const { importerPath, reference } = pending.pop()
    const filePath = buildFilePath(reference, importerPath)

    if (!filePath || visited.has(filePath)) continue
    visited.add(filePath)

    const source = await readFile(filePath, "utf8")
    sources.set(filePath, source)

    for (const imported of importedModules(source)) {
      const importedPath = buildFilePath(imported, filePath)
      if (!importedPath || visited.has(importedPath)) continue
      pending.push({ importerPath: filePath, reference: imported })
    }
  }

  return sources
}

function routeForSlug(manifest, slug) {
  const matches = Object.values(manifest.routes).filter(
    (route) =>
      route.id?.includes(slug) ||
      route.path === `blog/${slug}` ||
      route.path === slug,
  )

  assert.equal(matches.length, 1, `Expected one browser route for ${slug}`)
  return matches[0]
}

const [manifest, inventory] = await Promise.all([
  readManifest(),
  loadBlogContentInventory(),
])

assert.deepEqual(
  new Set(inventory.posts.map((post) => post.slug)),
  new Set(bodyMarkers.keys()),
  "Chunk-isolation markers must cover every canonical article",
)

const routeModules = new Set()

for (const post of inventory.posts) {
  const route = routeForSlug(manifest, post.slug)
  assert.ok(route.module, `Browser route ${post.slug} is missing a module`)
  routeModules.add(route.module)

  const graph = await collectModuleGraph(route)
  const graphSource = [...graph.values()].join("\n")

  for (const [markerSlug, marker] of bodyMarkers) {
    assert.equal(
      graphSource.includes(marker),
      markerSlug === post.slug,
      markerSlug === post.slug
        ? `Browser graph for ${post.slug} is missing its article body`
        : `Browser graph for ${post.slug} contains ${markerSlug} body content`,
    )
  }
}

assert.equal(
  routeModules.size,
  inventory.posts.length,
  "Every canonical article must have a distinct browser route module",
)

console.log(
  `Blog browser chunk isolation passed for ${inventory.posts.length} canonical article route(s)`,
)
