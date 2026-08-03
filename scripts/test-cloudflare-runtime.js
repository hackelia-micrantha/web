import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { readFile, stat } from "node:fs/promises"
import { createServer } from "node:net"
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
const analyticsId = "cloudflare-runtime-contract"
const runtimeLog = []

async function getAvailablePort() {
  const server = createServer()

  server.unref()

  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, host, resolve)
  })

  const address = server.address()

  assert.ok(address && typeof address === "object")

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })

  return address.port
}

const port = Number(
  process.env.CLOUDFLARE_RUNTIME_PORT ?? (await getAvailablePort()),
)
const baseUrl = `http://${host}:${port}`

for (const requiredPath of [
  wranglerExecutable,
  path.join(runtimeRoot, "manifest.json"),
  path.join(runtimeRoot, "public", "tailwind.css"),
  path.join(runtimeRoot, "worker", "index.js"),
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
assert.equal(manifest.schemaVersion, 2)
assert.ok(manifest.sourceConfiguration.projectName)
assert.match(
  manifest.sourceConfiguration.compatibilityDate,
  /^\d{4}-\d{2}-\d{2}$/,
)
assert.ok(
  manifest.sourceConfiguration.compatibilityFlags.includes("nodejs_compat"),
)
assert.equal(manifest.routing.assetsDirectory, "public")
assert.equal(manifest.routing.workerEntry, "worker/index.js")
assert.equal(manifest.routing.assetsBinding, "ASSETS")
assert.equal(manifest.routing.runWorkerFirst, false)
assert.ok(manifest.files.length > 0)
assert.equal(
  manifest.files.some((file) =>
    ["app/", "build/", "functions/", "node_modules/", "scripts/"].some(
      (prefix) => file.path.startsWith(prefix),
    ),
  ),
  false,
)
assert.equal(
  manifest.files.some((file) =>
    ["package.json", "yarn.lock"].includes(file.path),
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
    "dev",
    "--config",
    "wrangler.toml",
    "--no-bundle",
    "--ip",
    host,
    "--port",
    String(port),
    "--local-protocol",
    "http",
    "--var",
    `MICRANTHA_ANALYTICS_ID:${analyticsId}`,
    "--show-interactive-dev-session=false",
  ],
  {
    cwd: repositoryRoot,
    detached: process.platform !== "win32",
    env: {
      ...process.env,
      CI: "true",
      NO_COLOR: "1",
      WRANGLER_SEND_METRICS: "false",
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

  const stoppedGracefully = await Promise.race([
    runtimeExit.then(() => true),
    delay(3_000).then(() => false),
  ])

  if (stoppedGracefully || runtime.exitCode !== null) return

  try {
    if (process.platform !== "win32" && runtime.pid) {
      process.kill(-runtime.pid, "SIGKILL")
    } else {
      runtime.kill("SIGKILL")
    }
  } catch {
    return
  }

  await runtimeExit
}

async function fetchRuntime(pathname, options = {}) {
  return fetch(new URL(pathname, baseUrl), {
    redirect: "manual",
    signal: AbortSignal.timeout(5_000),
    ...options,
  })
}

async function waitForRuntime() {
  const startedAt = Date.now()
  const deadline = startedAt + 30_000

  while (Date.now() < deadline) {
    if (runtime.exitCode !== null || runtime.signalCode !== null) {
      const result = await runtimeExit
      throw new Error(
        `Wrangler exited before becoming ready (${JSON.stringify(result)})${formattedRuntimeLog()}`,
      )
    }

    try {
      const response = await fetchRuntime("/")

      await response.body?.cancel()

      if (response.status === 200) return Date.now() - startedAt
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
  const readyMilliseconds = await waitForRuntime()

  const home = await readRuntime("/")
  assert.equal(home.response.status, 200)
  assert.match(home.body, /<!DOCTYPE html>/i)
  assert.match(home.body, /id="content"/)
  assert.match(home.body, new RegExp(`data-website-id="${analyticsId}"`))
  assert.match(home.body, /https:\/\/micrantha\.com/)
  assertDocumentHeaders(home.response, home.body)

  const css = await readRuntime("/tailwind.css")
  assert.equal(css.response.status, 200)
  assert.match(css.response.headers.get("content-type") ?? "", /^text\/css\b/)
  assert.ok(css.body.length > 1_000, "expected generated Tailwind CSS")

  const manifestResponse = await fetchRuntime("/icon/site.webmanifest")
  assert.equal(manifestResponse.status, 200)
  const siteManifest = await manifestResponse.json()
  assert.equal(siteManifest.name, "Micrantha Software")

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

  const articlePath = "/blog/ai-pipelines-need-control-boundaries"
  const article = await readRuntime(articlePath)
  assert.equal(article.response.status, 200)
  assert.match(article.body, /AI Pipelines Need Control Boundaries/)
  assert.match(
    article.body,
    /AI is not the system of record\. AI is an untrusted reasoning component/,
  )
  assert.match(article.body, new RegExp(`https://micrantha.com${articlePath}`))
  assert.match(article.body, /"@type":"Article"/)
  assertDocumentHeaders(article.response, article.body)

  const botArticle = await readRuntime(articlePath, {
    headers: { "User-Agent": "Googlebot/2.1" },
  })
  assert.equal(botArticle.response.status, 200)
  assert.match(botArticle.body, /AI Pipelines Need Control Boundaries/)
  assertDocumentHeaders(botArticle.response, botArticle.body)

  const missing = await readRuntime("/this-route-does-not-exist")
  assert.equal(missing.response.status, 404)
  assert.match(missing.body, /404|Not Found/i)
  assertDocumentHeaders(missing.response, missing.body, { requireNonce: false })

  console.log(
    `Cloudflare runtime contract passed; local workerd ready in ${readyMilliseconds} ms`,
  )
} catch (error) {
  error.message += formattedRuntimeLog()
  throw error
} finally {
  await stopRuntime()
}
