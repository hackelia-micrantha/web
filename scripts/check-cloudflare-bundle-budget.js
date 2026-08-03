import assert from "node:assert/strict"
import { gzipSync } from "node:zlib"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const bundlePath = path.join(root, ".cloudflare/functions/index.js")
const budgetPath = path.join(root, "config/cloudflare-bundle-budget.json")
const reportPath = path.join(root, ".cloudflare/functions/bundle-budget.json")

const [bundle, budgetDocument] = await Promise.all([
  readFile(bundlePath),
  readFile(budgetPath, "utf8"),
])
const budget = JSON.parse(budgetDocument)
const compressedBytes = gzipSync(bundle, { level: 9 }).byteLength
const uncompressedBytes = bundle.byteLength

assert.ok(
  budget.budgets.compressedBytes < budget.platformLimits.compressedBytes,
  "the repository compressed budget must preserve platform headroom",
)
assert.ok(
  budget.budgets.uncompressedBytes < budget.platformLimits.uncompressedBytes,
  "the repository uncompressed budget must preserve platform headroom",
)
assert.ok(
  compressedBytes <= budget.budgets.compressedBytes,
  `compressed Worker bundle ${compressedBytes} exceeds budget ${budget.budgets.compressedBytes}`,
)
assert.ok(
  uncompressedBytes <= budget.budgets.uncompressedBytes,
  `uncompressed Worker bundle ${uncompressedBytes} exceeds budget ${budget.budgets.uncompressedBytes}`,
)

const report = {
  measuredAt: new Date().toISOString(),
  planCompatibility: budget.planCompatibility,
  baseline: budget.baseline,
  platformLimits: budget.platformLimits,
  budgets: budget.budgets,
  actual: {
    compressedBytes,
    uncompressedBytes,
    uncompressedDeltaBytes:
      uncompressedBytes - budget.baseline.uncompressedBytes,
  },
}

await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(
  `Cloudflare Worker bundle: ${uncompressedBytes} bytes raw, ${compressedBytes} bytes gzip`,
)
console.log(
  `Budgets: ${budget.budgets.uncompressedBytes} bytes raw, ${budget.budgets.compressedBytes} bytes gzip`,
)
