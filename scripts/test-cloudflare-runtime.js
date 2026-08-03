import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { createServer } from "node:net"
import path from "node:path"
import { setTimeout as delay } from "node:timers/promises"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const stage = path.join(root, ".cloudflare/runtime")
const wrangler = path.join(
  root,
  "node_modules/.bin",
  process.platform === "win32" ? "wrangler.cmd" : "wrangler",
)
const analyticsId = "runtime-contract-test"

async function getAvailablePort() {
  const server = createServer()

  server.unref()

  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
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
const origin = `http://127.0.0.1:${port}`

let logs = ""
let exitResult = null
let spawnError = null

const runtime = spawn(
  wrangler,
  [
    "dev",
    "--config",
    "wrangler.toml",
    "--no-bundle",
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
    "--local-protocol",
    "http",
    "--var",
    `MICRANTHA_ANALYTICS_ID:${analyticsId}`,
  ],
  {
    cwd: stage,
    env: {
      ...process.env,
      CI: "true",
      NO_COLOR: "1",
      WRANGLER_SEND_METRICS: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
)

function capture(chunk) {
  logs = `${logs}${chunk}`.slice(-200_000)
}

runtime.stdout.setEncoding("utf8")
runtime.stderr.setEncoding("utf8")
runtime.stdout.on("data", capture)
runtime.stderr.on("data", capture)
runtime.on("error", (error) => {
  spawnError = error
})
runtime.on("exit", (code, signal) => {
  exitResult = { code, signal }
})

async function stopRuntime() {
  if (runtime.exitCode !== null || runtime.signalCode !== null) return

  const gracefulExit = once(runtime, "exit")

  runtime.kill("SIGTERM")

  const stoppedGracefully = await Promise.race([
    gracefulExit.then(() => true),
    delay(3_000).then(() => false),
  ])

  if (stoppedGracefully || runtime.exitCode !== null) return

  const forcedExit = once(runtime, "exit")

  runtime.kill("SIGKILL")
  await forcedExit
}

async function waitForRuntime() {
  const startedAt = Date.now()

  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (spawnError) throw spawnError

    if (exitResult) {
      throw new Error(
        `Wrangler exited before becoming ready (${JSON.stringify(exitResult)}).\n${logs}`,
      )
    }

    try {
      const response = await fetch(origin, {
        signal: AbortSignal.timeout(1_000),
      })

      await response.body?.cancel()

      return Date.now() - startedAt
    } catch {
      // The local Workers runtime is still starting.
    }

    await delay(250)
  }

  throw new Error(`Timed out waiting for the Workers runtime.\n${logs}`)
}

async function read(pathname, { userAgent = "runtime-contract" } = {}) {
  const response = await fetch(new URL(pathname, origin), {
    headers: {
      "User-Agent": userAgent,
    },
    redirect: "manual",
  })
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

  const home = await read("/")
  assert.equal(home.response.status, 200)
  assert.match(home.body, /<!DOCTYPE html>/i)
  assert.match(home.body, /id="content"/)
  assert.match(home.body, new RegExp(`data-website-id="${analyticsId}"`))
  assertDocumentHeaders(home.response, home.body)

  const articlePath = "/blog/ai-pipelines-need-control-boundaries"
  const article = await read(articlePath)
  assert.equal(article.response.status, 200)
  assert.match(article.body, /AI Pipelines Need Control Boundaries/)
  assert.match(
    article.body,
    /AI is not the system of record\. AI is an untrusted reasoning component/,
  )
  assert.match(
    article.body,
    /https:\/\/micrantha\.com\/blog\/ai-pipelines-need-control-boundaries/,
  )
  assert.match(article.body, /"@type":"Article"/)
  assertDocumentHeaders(article.response, article.body)

  const botArticle = await read(articlePath, {
    userAgent: "Googlebot/2.1",
  })
  assert.equal(botArticle.response.status, 200)
  assert.match(botArticle.body, /AI Pipelines Need Control Boundaries/)
  assertDocumentHeaders(botArticle.response, botArticle.body)

  const missing = await read("/this-route-does-not-exist")
  assert.equal(missing.response.status, 404)
  assert.match(missing.body, /404|Not Found/i)
  assertDocumentHeaders(missing.response, missing.body, { requireNonce: false })

  const stylesheet = await read("/tailwind.css")
  assert.equal(stylesheet.response.status, 200)
  assert.match(
    stylesheet.response.headers.get("content-type") ?? "",
    /^text\/css\b/,
  )
  assert.ok(stylesheet.body.length > 1_000, "expected generated Tailwind CSS")

  const manifestResponse = await fetch(
    new URL("/icon/site.webmanifest", origin),
  )
  assert.equal(manifestResponse.status, 200)
  const manifest = await manifestResponse.json()
  assert.equal(manifest.name, "Micrantha Software")

  const browserAsset = home.body.match(/["'](\/build\/[^"']+)["']/)?.[1]
  assert.ok(browserAsset, "expected a generated browser asset reference")
  const assetResponse = await fetch(new URL(browserAsset, origin))
  assert.equal(assetResponse.status, 200)
  await assetResponse.body?.cancel()

  console.log(
    `Cloudflare runtime contract passed; local workerd ready in ${readyMilliseconds} ms`,
  )
} catch (error) {
  console.error(logs)
  throw error
} finally {
  await stopRuntime()
}
