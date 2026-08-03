import assert from "node:assert/strict"
import { access, cp, copyFile, mkdir, readdir, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const stage = path.join(root, ".cloudflare/runtime")
const workerSource = path.join(root, ".cloudflare/functions/index.js")

await Promise.all([
  access(path.join(root, "public/tailwind.css")),
  access(workerSource),
  access(path.join(root, "wrangler.toml")),
])

await rm(stage, { recursive: true, force: true })
await mkdir(path.join(stage, "worker"), { recursive: true })
await cp(path.join(root, "public"), path.join(stage, "public"), {
  recursive: true,
})
await copyFile(workerSource, path.join(stage, "worker/index.js"))
await copyFile(path.join(root, "wrangler.toml"), path.join(stage, "wrangler.toml"))

const stagedEntries = (await readdir(stage)).sort()
assert.deepEqual(stagedEntries, ["public", "worker", "wrangler.toml"])

for (const sourceOnlyPath of ["app", "build", "functions", "scripts", "node_modules"]) {
  await assert.rejects(access(path.join(stage, sourceOnlyPath)))
}

console.log(`Staged Cloudflare runtime artifact at ${stage}`)
