import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import {
  copyFile,
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)
const cloudflareRoot = path.join(repositoryRoot, ".cloudflare")
const bundleRoot = path.join(cloudflareRoot, "functions")
const runtimeRoot = path.join(cloudflareRoot, "runtime")
const runtimeAssets = path.join(runtimeRoot, "public")
const runtimeWorker = path.join(runtimeRoot, "worker")
const runtimeMetadata = path.join(runtimeRoot, "metadata")
const pagesConfigPath = path.join(repositoryRoot, "wrangler.toml")

const requiredInputs = [
  path.join(repositoryRoot, "public"),
  pagesConfigPath,
  path.join(bundleRoot, "index.js"),
  path.join(bundleRoot, "config.json"),
  path.join(bundleRoot, "build-metadata.json"),
]

for (const input of requiredInputs) {
  await stat(input).catch(() => {
    throw new Error(
      `Missing Cloudflare runtime input: ${path.relative(repositoryRoot, input)}`,
    )
  })
}

const pagesConfig = await readFile(pagesConfigPath, "utf8")
const projectName = pagesConfig.match(/^name\s*=\s*"([^"]+)"\s*$/m)?.[1]
const compatibilityDate = pagesConfig.match(
  /^compatibility_date\s*=\s*"([^"]+)"\s*$/m,
)?.[1]
const compatibilityFlags = pagesConfig.match(
  /^compatibility_flags\s*=\s*(\[[^\n]+\])\s*$/m,
)?.[1]

assert.ok(projectName, "expected name in the Pages Wrangler configuration")
assert.ok(
  compatibilityDate,
  "expected compatibility_date in the Pages Wrangler configuration",
)
assert.ok(
  compatibilityFlags,
  "expected compatibility_flags in the Pages Wrangler configuration",
)

await rm(runtimeRoot, { recursive: true, force: true })
await mkdir(runtimeWorker, { recursive: true })
await mkdir(runtimeMetadata, { recursive: true })
await cp(path.join(repositoryRoot, "public"), runtimeAssets, {
  recursive: true,
})
await copyFile(
  path.join(bundleRoot, "index.js"),
  path.join(runtimeWorker, "index.js"),
)

try {
  await copyFile(
    path.join(bundleRoot, "index.js.map"),
    path.join(runtimeWorker, "index.js.map"),
  )
} catch (error) {
  if (error?.code !== "ENOENT") throw error
}

await copyFile(
  path.join(bundleRoot, "config.json"),
  path.join(runtimeMetadata, "functions-config.json"),
)
await copyFile(
  path.join(bundleRoot, "build-metadata.json"),
  path.join(runtimeMetadata, "build-metadata.json"),
)

const runtimeConfig = `name = "${projectName}-runtime-contract"
main = "./worker/index.js"
compatibility_date = "${compatibilityDate}"
compatibility_flags = ${compatibilityFlags}

[assets]
directory = "./public"
binding = "ASSETS"
run_worker_first = false
`

await writeFile(path.join(runtimeRoot, "wrangler.toml"), runtimeConfig)

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

const stagedFiles = (await collectFiles(runtimeRoot)).sort()
const manifestFiles = []

for (const file of stagedFiles) {
  const content = await readFile(file)
  const relativePath = path
    .relative(runtimeRoot, file)
    .split(path.sep)
    .join("/")

  manifestFiles.push({
    path: relativePath,
    bytes: content.byteLength,
    sha256: createHash("sha256").update(content).digest("hex"),
  })
}

const stagedPaths = new Set(manifestFiles.map((file) => file.path))
assert.ok(stagedPaths.has("public/tailwind.css"), "missing generated CSS")
assert.ok(stagedPaths.has("worker/index.js"), "missing prebuilt Worker")
assert.ok(
  stagedPaths.has("metadata/functions-config.json"),
  "missing generated Function route metadata",
)
assert.ok(
  stagedPaths.has("metadata/build-metadata.json"),
  "missing Worker build metadata",
)
assert.ok(stagedPaths.has("wrangler.toml"), "missing runtime configuration")

for (const forbiddenPrefix of [
  "app/",
  "build/",
  "functions/",
  "node_modules/",
  "scripts/",
]) {
  assert.equal(
    manifestFiles.some((file) => file.path.startsWith(forbiddenPrefix)),
    false,
    `runtime stage unexpectedly contains ${forbiddenPrefix}`,
  )
}

for (const forbiddenFile of ["package.json", "yarn.lock"]) {
  assert.equal(
    stagedPaths.has(forbiddenFile),
    false,
    `runtime stage unexpectedly contains ${forbiddenFile}`,
  )
}

const manifest = {
  schemaVersion: 2,
  contract:
    "Static assets are served before the prebuilt Pages Worker, and unknown paths execute under workerd without repository source or dependencies.",
  sourceConfiguration: {
    projectName,
    compatibilityDate,
    compatibilityFlags: JSON.parse(compatibilityFlags.replaceAll("'", '"')),
  },
  routing: {
    assetsDirectory: "public",
    workerEntry: "worker/index.js",
    assetsBinding: "ASSETS",
    runWorkerFirst: false,
  },
  files: manifestFiles,
  totalBytes: manifestFiles.reduce((total, file) => total + file.bytes, 0),
}

await writeFile(
  path.join(runtimeRoot, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

console.log(
  `Staged ${manifestFiles.length} Cloudflare runtime files (${manifest.totalBytes} bytes)`,
)
