import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const repositoryRoot = process.cwd()
const reportPath = path.join(
  repositoryRoot,
  ".cloudflare/runtime/performance-report.json",
)
const output = []

const child = spawn(process.execPath, ["scripts/test-cloudflare-runtime.js"], {
  cwd: repositoryRoot,
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"],
})

function capture(stream, destination) {
  stream.on("data", (chunk) => {
    output.push(chunk.toString())
    destination.write(chunk)
  })
}

capture(child.stdout, process.stdout)
capture(child.stderr, process.stderr)

const exit = await new Promise((resolve) => {
  child.once("exit", (code, signal) => resolve({ code, signal }))
})

assert.deepEqual(exit, { code: 0, signal: null }, "workerd contract failed")

const combinedOutput = output.join("")
const readyMilliseconds = Number(
  combinedOutput.match(/local workerd ready in (\d+) ms/u)?.[1],
)
assert.ok(
  Number.isFinite(readyMilliseconds),
  "workerd contract did not report startup timing",
)

await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(
  reportPath,
  `${JSON.stringify(
    {
      schemaVersion: 1,
      measuredAt: new Date().toISOString(),
      enforcement: "advisory",
      environment: "pinned CI workerd harness",
      workerdReadyMilliseconds: readyMilliseconds,
    },
    null,
    2,
  )}\n`,
)
