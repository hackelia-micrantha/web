import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { setTimeout as delay } from "node:timers/promises"
import { fileURLToPath } from "node:url"

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)
const runtimeRoot = path.join(repositoryRoot, ".cloudflare", "runtime")
const wranglerExecutable = path.join(
  repositoryRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "wrangler.cmd" : "wrangler",
)
const host = "127.0.0.1"
const port = 8788
const baseUrl = `http://${host}:${port}`
const analyticsId = "cloudflare-runtime-contract"
const runtimeLog = []

for (const requiredPath of [
  wranglerExecutable,
  path.join(runtimeRoot, "manifest.json"),
  path.join(runtimeRoot, "public", "tailwind.css"),
  path.join(runtimeRoot, "public", "_worker.js"),
  path.join(runtimeRoot, "wrangler.toml"),
]) {
  await stat(requiredPath).catch(() => {
    throw new Error(
      `Missing runtime contract input: ${path.relative(repositoryRoot, requiredPath)}`,
    )
  })
}

const manifest = JSON.parse(
  await readFile(path.join(runtimeRoot, "manifest.json"), "utf8"),
)
assert.equal(manifest.schemaVersion, 1)
assert.ok(manifest.files.length > 0)
assert.equal(
  manifest.files.some((file) =>
    ["app/", "build/", "functions/", "node_modules/"].some((prefix) =>
      file.path.startsWith(prefix),
    ),
  ),
  false,
)

function appendRuntimeLog(chunk) {
  runtimeLog.push(chunk.toString())

  if (runtimeLog.join("").length > 64_000) {
    runtimeLog.shift()
  }
}

const runtime = spawn(
  wranglerExecutable,
  [
    "--cwd",
    runtimeRoot,
    "pages",
    "dev",
    "public",
    "--ip",
    host,
    "--port",
    String(port),
    "--local-protocol",
    "http",
    "--binding",
    `MICRANTHA_ANALYTICS_ID=${analyticsId}`,
    "--persist-to",
    ".wrangler-state",
    "--log-level",
    "warn",
    "--show-interactive-dev-session=false",
  ],
  {
    cwd: repositoryRoot,
    detached: process.platform !== "win32",
    env: {
      ...process.env,
      CI: "true",
      NO_COLOR: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
)

runtime.stdout.on("data", appendRuntimeLog)
runtime.stderr.on("data", appendRuntimeLog)

const runtimeExit = new Promise((resolve) => {
  runtime.once("exit", (code, signal) => resolve({ code, signal }))
})

function formattedRuntimeLog() {
  const output = runtimeLog.join("").trim()
  return output ? `\n\nWrangler output:\n${output}` : ""
}

async function stopRuntime() {
  if (runtime.exitCode !== null || runtime.signalCode !== null) return

  try {
    if (process.platform !== "win32" && runtime.pid) {
      process.kill(-runtime.pid, "SIGTERM")
    } else {
      runtime.kill("SIGTERM")
    }
  } catch {
    return
  }

  await Promise.race([runtimeExit, delay(3_000)])

  if (runtime.exitCode === null && runtime.signalCode === null) {
    try {
      if (process.platform !== "win32" && runtime.pid) {
        process.kill(-runtime.pid, "SIGKILL")
      } else {
        runtime.kill("SIGKILL")
      }
    } catch {
      return
    }
  }
}

async function fetchRuntime(pathname, options = {}) {
  return fetch(new URL(pathname, baseUrl), {
    redirect: "manual",
    signal: AbortSignal.timeout(5_000),
    ...options,
  })
}

async function waitForRuntime() {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    if (runtime.exitCode !== null || runtime.signalCode !== null) {
      const result = await runtimeExit
      throw new Error(
        `Wrangler exited before becoming ready (${JSON.stringify(result)})${formattedRuntimeLog()}`,
      )
    }

    try {
      const response = await fetchRuntime("/")
      if (response.status === 200) return
    } catch {
      // The local socket is not ready yet.
    }

    await delay(250)
  }

  throw new Error(`Timed out waiting for Wrangler${formattedRuntimeLog()}`)
}

async function readRuntime(pathname, options) {
  const response = await fetchRuntime(pathname, options)
  const body = await response.text()
  return { response, body }
}

function assertDocumentHeaders(response, body, { requireNonce = true } = {}) {
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/)
  assert.equal(response.headers.get("x-content-type-options"), "nosniff")
  assert.equal(response.headers.get("x-frame-options"), "DENY")
  assert.equal(
    response.headers.get("permissions-policy"),
    "camera=(), geolocation=(), microphone=()",
  )
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  )
  assert.equal(
    response.headers.get("strict-transport-security"),
    "max-age=31536000",
  )
  assert.ok(response.headers.get("cache-control"), "expected a cache policy")

  const policy = response.headers.get("content-security-policy") ?? ""

  if (!requireNonce && !policy) return

  const nonce = policy.match(/'nonce-([^']+)'/)?.[1]
  assert.ok(nonce, "expected a CSP nonce in the document response")
  assert.ok(
    body.includes(`nonce="${nonce}"`),
    "expected the response body to use the CSP nonce",
  )
}

try {
  await waitForRuntime()

  const home = await readRuntime("/")
  assert.equal(home.response.status, 200)
  assert.match(home.body, /<!DOCTYPE html>/i)
  assert.match(home.body, /id="content"/)
  assert.match(home.body, new RegExp(`data-website-id="${analyticsId}"`))
  assert.match(home.body, /https:\/\/micrantha\.com/)
  assertDocumentHeaders(home.response, home.body)

  const contactRedirect = await readRuntime("/contact")
  assert.equal(contactRedirect.response.status, 301)
  assert.equal(contactRedirect.response.headers.get("location"), "/services")

  const css = await readRuntime("/tailwind.css")
  assert.equal(css.response.status, 200)
  assert.match(css.response.headers.get("content-type") ?? "", /^text\/css\b/)
  assert.ok(css.body.length > 1_000, "expected generated Tailwind CSS")

  const browserAssetPath = home.body.match(
    /(?:src|href)="([^"?#]*\/build\/[^"?#]+\.js)"/,
  )?.[1]
  assert.ok(browserAssetPath, "expected a generated browser bundle reference")

  const browserAsset = await readRuntime(browserAssetPath)
  assert.equal(browserAsset.response.status, 200)
  assert.match(
    browserAsset.response.headers.get("content-type") ?? "",
    /(?:javascript|ecmascript)/,
  )
  assert.ok(browserAsset.body.length > 1_000, "expected a browser bundle")

  const article = await readRuntime(
    "/blog/ai-pipelines-need-control-boundaries",
  )
  assert.equal(article.response.status, 200)
  assert.match(article.body, /AI Pipelines Need Control Boundaries/)
  assert.match(
    article.body,
    /AI is not the system of record\. AI is an untrusted reasoning component/,
  )
  assertDocumentHeaders(article.response, article.body)

  const botArticle = await readRuntime(
    "/blog/ai-pipelines-need-control-boundaries",
    {
      headers: { "User-Agent": "Googlebot/2.1" },
    },
  )
  assert.equal(botArticle.response.status, 200)
  assert.match(botArticle.body, /AI Pipelines Need Control Boundaries/)
  assertDocumentHeaders(botArticle.response, botArticle.body)

  const methodNotAllowed = await readRuntime("/services", { method: "POST" })
  assert.equal(methodNotAllowed.response.status, 405)
  assert.match(methodNotAllowed.body, /405|Method Not Allowed/i)
  assertDocumentHeaders(methodNotAllowed.response, methodNotAllowed.body, {
    requireNonce: false,
  })

  const missing = await readRuntime("/this-route-does-not-exist")
  assert.equal(missing.response.status, 404)
  assert.match(missing.body, /404|Not Found/i)
  assertDocumentHeaders(missing.response, missing.body, { requireNonce: false })

  console.log("Cloudflare Pages runtime contract passed")
} catch (error) {
  error.message += formattedRuntimeLog()
  throw error
} finally {
  await stopRuntime()
}
