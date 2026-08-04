import assert from "node:assert/strict"
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import vm from "node:vm"
import { gzipSync } from "node:zlib"

const repositoryRoot = process.cwd()
const publicDirectory = path.join(repositoryRoot, "public")
const buildDirectory = path.join(publicDirectory, "build")
const budgetPath = path.join(repositoryRoot, "config/performance-budgets.json")
const reportPath = path.join(repositoryRoot, ".performance/build-budget.json")
const imageExtensions = new Set([
  ".avif",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
])

function assertPositiveInteger(value, label) {
  assert.ok(
    Number.isInteger(value) && value > 0,
    `${label} must be a positive integer`,
  )
}

function measureBuffer(buffer) {
  return {
    uncompressedBytes: buffer.byteLength,
    compressedBytes: gzipSync(buffer, { level: 9 }).byteLength,
  }
}

function addMeasurements(measurements) {
  return measurements.reduce(
    (total, measurement) => ({
      uncompressedBytes:
        total.uncompressedBytes + measurement.uncompressedBytes,
      compressedBytes: total.compressedBytes + measurement.compressedBytes,
    }),
    { uncompressedBytes: 0, compressedBytes: 0 },
  )
}

function assertWithinBudget(actual, budget, label) {
  for (const key of ["uncompressedBytes", "compressedBytes"]) {
    assertPositiveInteger(budget[key], `${label} ${key} budget`)
    assert.ok(
      actual[key] <= budget[key],
      `${label} ${key} ${actual[key]} exceeds budget ${budget[key]}`,
    )
  }
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    (error) => {
      if (error.code === "ENOENT") return []
      throw error
    },
  )
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

async function readBrowserManifest() {
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

function buildFilePath(moduleReference, importerPath = buildDirectory) {
  const reference = moduleReference.split(/[?#]/u)[0]

  if (reference.startsWith("/build/")) {
    return path.join(buildDirectory, reference.slice("/build/".length))
  }

  if (reference.startsWith("build/")) {
    return path.join(buildDirectory, reference.slice("build/".length))
  }

  if (reference.startsWith("./") || reference.startsWith("../")) {
    return path.resolve(path.dirname(importerPath), reference)
  }

  if (!reference.includes(":") && reference.endsWith(".js")) {
    return path.join(buildDirectory, reference.replace(/^\//u, ""))
  }

  return null
}

function staticImportedModules(source) {
  const imports = new Set()
  const pattern = /(?:import|export)\s*(?:[^"'()]*?\s+from\s*)?["']([^"']+)["']/gu

  for (const match of source.matchAll(pattern)) imports.add(match[1])

  return imports
}

async function collectStaticGraph(moduleReferences) {
  const pending = moduleReferences.map((reference) => ({
    importerPath: buildDirectory,
    reference,
  }))
  const visited = new Set()
  const files = new Map()

  while (pending.length > 0) {
    const { importerPath, reference } = pending.pop()
    const filePath = buildFilePath(reference, importerPath)

    if (!filePath || visited.has(filePath)) continue
    visited.add(filePath)

    const source = await readFile(filePath)
    files.set(filePath, source)

    for (const imported of staticImportedModules(source.toString("utf8"))) {
      const importedPath = buildFilePath(imported, filePath)

      if (importedPath && !visited.has(importedPath)) {
        pending.push({ importerPath: filePath, reference: imported })
      }
    }
  }

  return files
}

function routeForPathname(manifest, pathname) {
  const expectedPath = pathname === "/" ? "" : pathname.slice(1)
  const routes = Object.values(manifest.routes)
  const matches = routes.filter((route) => {
    if (pathname === "/") {
      return route.index === true && route.parentId === "root"
    }

    return route.path === expectedPath
  })

  assert.equal(
    matches.length,
    1,
    `Expected one browser route for ${pathname}, found ${matches.length}`,
  )

  return matches[0]
}

function routeChain(manifest, route) {
  const chain = []
  let current = route

  while (current) {
    chain.unshift(current)
    current = current.parentId ? manifest.routes[current.parentId] : null
  }

  return chain
}

function manifestReferences(entryOrRoute) {
  return [entryOrRoute?.module, ...(entryOrRoute?.imports ?? [])].filter(Boolean)
}

async function measureGraph(references) {
  const graph = await collectStaticGraph(references)
  const files = []

  for (const [filePath, source] of graph) {
    files.push({
      path: path.relative(publicDirectory, filePath),
      ...measureBuffer(source),
    })
  }

  files.sort((left, right) => left.path.localeCompare(right.path))

  return {
    ...addMeasurements(files),
    fileCount: files.length,
    files,
  }
}

const [manifest, budgetDocument] = await Promise.all([
  readBrowserManifest(),
  readFile(budgetPath, "utf8"),
])
const budget = JSON.parse(budgetDocument)
assert.equal(budget.schemaVersion, 1)

const javascriptPaths = (await walkFiles(buildDirectory)).filter((filePath) =>
  filePath.endsWith(".js"),
)
const javascriptFiles = []

for (const filePath of javascriptPaths) {
  const source = await readFile(filePath)
  javascriptFiles.push({
    path: path.relative(publicDirectory, filePath),
    ...measureBuffer(source),
  })
}

javascriptFiles.sort((left, right) => left.path.localeCompare(right.path))
const javascriptTotal = addMeasurements(javascriptFiles)
const largestJavaScript = javascriptFiles.reduce(
  (largest, file) => ({
    uncompressedBytes: Math.max(largest.uncompressedBytes, file.uncompressedBytes),
    compressedBytes: Math.max(largest.compressedBytes, file.compressedBytes),
  }),
  { uncompressedBytes: 0, compressedBytes: 0 },
)

assertWithinBudget(
  javascriptTotal,
  budget.browserJavaScript.allAssets,
  "all browser JavaScript",
)
for (const key of ["largestUncompressedBytes", "largestCompressedBytes"]) {
  assertPositiveInteger(
    budget.browserJavaScript.allAssets[key],
    `all browser JavaScript ${key} budget`,
  )
}
assert.ok(
  largestJavaScript.uncompressedBytes <=
    budget.browserJavaScript.allAssets.largestUncompressedBytes,
  `largest browser JavaScript asset ${largestJavaScript.uncompressedBytes} exceeds budget ${budget.browserJavaScript.allAssets.largestUncompressedBytes}`,
)
assert.ok(
  largestJavaScript.compressedBytes <=
    budget.browserJavaScript.allAssets.largestCompressedBytes,
  `largest compressed browser JavaScript asset ${largestJavaScript.compressedBytes} exceeds budget ${budget.browserJavaScript.allAssets.largestCompressedBytes}`,
)

const entry = await measureGraph(manifestReferences(manifest.entry))
assertWithinBudget(entry, budget.browserJavaScript.entry, "browser entry graph")

const routeReports = []
for (const routeBudget of budget.browserJavaScript.routes) {
  const route = routeForPathname(manifest, routeBudget.pathname)
  const references = [
    ...manifestReferences(manifest.entry),
    ...routeChain(manifest, route).flatMap(manifestReferences),
  ]
  const measurement = await measureGraph([...new Set(references)])

  assertWithinBudget(
    measurement,
    routeBudget,
    `browser route graph ${routeBudget.pathname}`,
  )
  routeReports.push({ pathname: routeBudget.pathname, ...measurement })
}

const stylePaths = [
  path.join(publicDirectory, "tailwind.css"),
  path.join(publicDirectory, "accessibility.css"),
]
const styleFiles = []
for (const filePath of stylePaths) {
  const source = await readFile(filePath)
  styleFiles.push({
    path: path.relative(publicDirectory, filePath),
    ...measureBuffer(source),
  })
}
const styleTotal = addMeasurements(styleFiles)
const largestStyle = styleFiles.reduce(
  (largest, file) => ({
    uncompressedBytes: Math.max(largest.uncompressedBytes, file.uncompressedBytes),
    compressedBytes: Math.max(largest.compressedBytes, file.compressedBytes),
  }),
  { uncompressedBytes: 0, compressedBytes: 0 },
)
assertWithinBudget(styleTotal, budget.styles, "compiled styles")
assert.ok(
  largestStyle.uncompressedBytes <= budget.styles.largestUncompressedBytes,
  `largest stylesheet ${largestStyle.uncompressedBytes} exceeds budget ${budget.styles.largestUncompressedBytes}`,
)
assert.ok(
  largestStyle.compressedBytes <= budget.styles.largestCompressedBytes,
  `largest compressed stylesheet ${largestStyle.compressedBytes} exceeds budget ${budget.styles.largestCompressedBytes}`,
)

const imagePaths = (
  await Promise.all(
    ["img", "icon"].map((directory) =>
      walkFiles(path.join(publicDirectory, directory)),
    ),
  )
)
  .flat()
  .filter((filePath) => imageExtensions.has(path.extname(filePath).toLowerCase()))
const imageFiles = []
for (const filePath of imagePaths) {
  const fileStats = await stat(filePath)
  imageFiles.push({
    path: path.relative(publicDirectory, filePath),
    bytes: fileStats.size,
  })
}
imageFiles.sort((left, right) => left.path.localeCompare(right.path))
const totalImageBytes = imageFiles.reduce((total, file) => total + file.bytes, 0)
const largestImageBytes = imageFiles.reduce(
  (largest, file) => Math.max(largest, file.bytes),
  0,
)
assertPositiveInteger(budget.images.totalBytes, "total image budget")
assertPositiveInteger(budget.images.largestBytes, "largest image budget")
assert.ok(
  totalImageBytes <= budget.images.totalBytes,
  `image inventory ${totalImageBytes} exceeds budget ${budget.images.totalBytes}`,
)
assert.ok(
  largestImageBytes <= budget.images.largestBytes,
  `largest image ${largestImageBytes} exceeds budget ${budget.images.largestBytes}`,
)

const report = {
  schemaVersion: 1,
  measuredAt: new Date().toISOString(),
  browserJavaScript: {
    total: { ...javascriptTotal, fileCount: javascriptFiles.length },
    largest: largestJavaScript,
    entry,
    routes: routeReports,
    files: javascriptFiles,
  },
  styles: {
    total: styleTotal,
    largest: largestStyle,
    files: styleFiles,
  },
  images: {
    totalBytes: totalImageBytes,
    largestBytes: largestImageBytes,
    fileCount: imageFiles.length,
    files: imageFiles,
  },
}

await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(
  `Performance budgets passed: ${javascriptFiles.length} JS assets, ${styleFiles.length} stylesheets, ${imageFiles.length} images`,
)
for (const route of routeReports) {
  console.log(
    `${route.pathname}: ${route.uncompressedBytes} bytes raw JS, ${route.compressedBytes} bytes gzip`,
  )
}
