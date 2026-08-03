import assert from "node:assert/strict"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)
const workerPath = path.join(
  repositoryRoot,
  ".cloudflare",
  "functions",
  "index.js",
)
const reportPath = path.join(
  repositoryRoot,
  ".cloudflare",
  "functions",
  "size-report.json",
)

const plan = (process.env.CLOUDFLARE_WORKERS_PLAN ?? "free").toLowerCase()
const compressedLimits = {
  free: 3_000_000,
  paid: 10_000_000,
}
const uncompressedLimit = 64_000_000
const budgetRatio = 0.8

assert.ok(
  Object.hasOwn(compressedLimits, plan),
  `Unsupported CLOUDFLARE_WORKERS_PLAN=${plan}; expected free or paid`,
)

const worker = await readFile(workerPath).catch(() => {
  throw new Error(
    "Missing .cloudflare/functions/index.js; run yarn cloudflare:functions:build first",
  )
})
const gzipBytes = gzipSync(worker, { level: 9 }).byteLength
const rawBytes = worker.byteLength
const compressedPlatformLimitBytes = compressedLimits[plan]
const compressedBudgetBytes = Math.floor(
  compressedPlatformLimitBytes * budgetRatio,
)
const uncompressedBudgetBytes = Math.floor(uncompressedLimit * budgetRatio)

const report = {
  schemaVersion: 1,
  plan,
  budgetRatio,
  artifact: path.relative(repositoryRoot, workerPath).split(path.sep).join("/"),
  rawBytes,
  gzipBytes,
  limits: {
    compressedPlatformLimitBytes,
    uncompressedPlatformLimitBytes: uncompressedLimit,
  },
  budgets: {
    compressedBytes: compressedBudgetBytes,
    uncompressedBytes: uncompressedBudgetBytes,
  },
  headroom: {
    compressedBytes: compressedBudgetBytes - gzipBytes,
    uncompressedBytes: uncompressedBudgetBytes - rawBytes,
  },
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

assert.ok(
  gzipBytes <= compressedBudgetBytes,
  `Cloudflare Worker gzip size ${gzipBytes} exceeds the ${plan} plan budget ${compressedBudgetBytes}`,
)
assert.ok(
  rawBytes <= uncompressedBudgetBytes,
  `Cloudflare Worker raw size ${rawBytes} exceeds the budget ${uncompressedBudgetBytes}`,
)

console.log(
  `Cloudflare Worker size passed (${rawBytes} raw bytes, ${gzipBytes} gzip bytes, ${report.headroom.compressedBytes} gzip bytes headroom)`,
)
