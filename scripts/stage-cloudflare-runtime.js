import assert from "node:assert/strict"
import {
  access,
  cp,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const stage = path.join(root, ".cloudflare/runtime")
const stagedPublic = path.join(stage, "public")
const stagedWorker = path.join(stage, "worker")
const workerSource = path.join(root, ".cloudflare/functions/index.js")
const workerSourceMap = path.join(root, ".cloudflare/functions/index.js.map")
const pagesConfigPath = path.join(root, "wrangler.toml")

await Promise.all([
  access(path.join(root, "public/tailwind.css")),
  access(workerSource),
  access(pagesConfigPath),
])

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

await rm(stage, { recursive: true, force: true })
await mkdir(stagedPublic, { recursive: true })
await mkdir(stagedWorker, { recursive: true })
await cp(path.join(root, "public"), stagedPublic, {
  recursive: true,
})
await copyFile(workerSource, path.join(stagedWorker, "index.js"))

try {
  await copyFile(workerSourceMap, path.join(stagedWorker, "index.js.map"))
} catch (error) {
  if (error?.code !== "ENOENT") throw error
}

const runtimeConfig = `name = "${projectName}-runtime-contract"
main = "./worker/index.js"
compatibility_date = "${compatibilityDate}"
compatibility_flags = ${compatibilityFlags}

[assets]
directory = "./public"
binding = "ASSETS"
run_worker_first = false
`

await writeFile(path.join(stage, "wrangler.toml"), runtimeConfig)

const stagedEntries = (await readdir(stage)).sort()
assert.deepEqual(stagedEntries, ["public", "worker", "wrangler.toml"])
await access(path.join(stagedWorker, "index.js"))

for (const sourceOnlyPath of [
  "app",
  "build",
  "functions",
  "scripts",
  "node_modules",
  "package.json",
  "yarn.lock",
]) {
  await assert.rejects(access(path.join(stage, sourceOnlyPath)))
}

console.log(`Staged Cloudflare runtime artifact at ${stage}`)
