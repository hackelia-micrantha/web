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
const runtimeMetadata = path.join(runtimeRoot, "metadata")

const requiredInputs = [
  path.join(repositoryRoot, "public"),
  path.join(repositoryRoot, "wrangler.toml"),
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

await rm(runtimeRoot, { recursive: true, force: true })
await mkdir(runtimeMetadata, { recursive: true })
await cp(path.join(repositoryRoot, "public"), runtimeAssets, {
  recursive: true,
})
await copyFile(
  path.join(repositoryRoot, "wrangler.toml"),
  path.join(runtimeRoot, "wrangler.toml"),
)
await copyFile(
  path.join(bundleRoot, "index.js"),
  path.join(runtimeAssets, "_worker.js"),
)
await copyFile(
  path.join(bundleRoot, "config.json"),
  path.join(runtimeMetadata, "functions-config.json"),
)
await copyFile(
  path.join(bundleRoot, "build-metadata.json"),
  path.join(runtimeMetadata, "build-metadata.json"),
)

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
assert.ok(stagedPaths.has("public/_worker.js"), "missing prebuilt Worker")
assert.ok(
  stagedPaths.has("metadata/functions-config.json"),
  "missing generated Function route metadata",
)
assert.ok(
  stagedPaths.has("metadata/build-metadata.json"),
  "missing Worker build metadata",
)
assert.ok(stagedPaths.has("wrangler.toml"), "missing Wrangler configuration")

for (const forbiddenPrefix of [
  "app/",
  "build/",
  "functions/",
  "node_modules/",
]) {
  assert.equal(
    manifestFiles.some((file) => file.path.startsWith(forbiddenPrefix)),
    false,
    `runtime stage unexpectedly contains ${forbiddenPrefix}`,
  )
}

const manifest = {
  schemaVersion: 1,
  contract:
    "Static assets and a prebuilt advanced-mode Pages Worker are sufficient for local runtime execution.",
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
