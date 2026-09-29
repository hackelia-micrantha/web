import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { performance } from "node:perf_hooks"

const configPath =
  process.argv[2] ?? "config/cloudflare-edge-probe.json"
const config = JSON.parse(await readFile(configPath, "utf8"))

if (config.schemaVersion !== 2) {
  throw new Error(
    `Unsupported Cloudflare edge probe schema: ${config.schemaVersion}`,
  )
}

const failures = []
const report = {
  schemaVersion: 1,
  projectName: config.projectName,
  generatedAt: new Date().toISOString(),
  configPath,
  targets: [],
}

function recordFailure(targetName, requestName, message) {
  failures.push({ target: targetName, request: requestName, message })
}

function countOccurrences(source, value) {
  if (!value) return 0

  let count = 0
  let offset = 0

  while (true) {
    const index = source.indexOf(value, offset)
    if (index === -1) return count

    count += 1
    offset = index + value.length
  }
}

function extractScriptNonce(contentSecurityPolicy) {
  if (!contentSecurityPolicy) return null

  return (
    contentSecurityPolicy.match(
      /(?:^|;)\s*script-src\s+[^;]*'nonce-([^']+)'/u,
    )?.[1] ?? null
  )
}

function validateSample(target, request, sample) {
  const targetName = target.name
  const requestName = request.name

  if (sample.status !== request.status) {
    recordFailure(
      targetName,
      requestName,
      `expected status ${request.status}, received ${sample.status}`,
    )
  }

  if (
    request.cacheControl &&
    sample.headers.cacheControl !== request.cacheControl
  ) {
    recordFailure(
      targetName,
      requestName,
      `expected Cache-Control "${request.cacheControl}", received "${sample.headers.cacheControl}"`,
    )
  }

  if (
    request.contentType &&
    !sample.headers.contentType?.toLowerCase().startsWith(
      request.contentType.toLowerCase(),
    )
  ) {
    recordFailure(
      targetName,
      requestName,
      `expected Content-Type beginning "${request.contentType}", received "${sample.headers.contentType}"`,
    )
  }

  if (
    request.maximumBytes &&
    sample.bytes > request.maximumBytes
  ) {
    recordFailure(
      targetName,
      requestName,
      `body is ${sample.bytes} bytes; maximum is ${request.maximumBytes}`,
    )
  }

  for (const expected of request.bodyIncludes ?? []) {
    if (!sample.body.includes(expected)) {
      recordFailure(
        targetName,
        requestName,
        `response body is missing required content: ${expected}`,
      )
    }
  }

  if (request.freshNonce) {
    if (!sample.cspNonce) {
      recordFailure(
        targetName,
        requestName,
        "CSP script nonce is missing",
      )
    } else if (sample.bodyNonceCount < 1) {
      recordFailure(
        targetName,
        requestName,
        "CSP script nonce is not paired into the response body",
      )
    }
  }
}

async function runSample(target, request, repetition) {
  const url = new URL(request.pathname, target.baseUrl)
  const startedAt = performance.now()

  const response = await fetch(url, {
    method: request.method ?? "GET",
    headers: {
      "user-agent":
        request.userAgent ??
        config.userAgent ??
        "micrantha-edge-contract/2",
    },
    redirect: "manual",
    signal: AbortSignal.timeout(config.timeoutMilliseconds),
  })
  const headersMilliseconds = performance.now() - startedAt
  const bytes = Buffer.from(await response.arrayBuffer())
  const totalMilliseconds = performance.now() - startedAt
  const body = bytes.toString("utf8")
  const contentSecurityPolicy = response.headers.get(
    "content-security-policy",
  )
  const cspNonce = extractScriptNonce(contentSecurityPolicy)

  const sample = {
    repetition,
    url: url.toString(),
    status: response.status,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    headersMilliseconds: Number(headersMilliseconds.toFixed(3)),
    totalMilliseconds: Number(totalMilliseconds.toFixed(3)),
    headers: {
      age: response.headers.get("age"),
      cacheControl: response.headers.get("cache-control"),
      cfCacheStatus: response.headers.get("cf-cache-status"),
      contentType: response.headers.get("content-type"),
      vary: response.headers.get("vary"),
    },
    cspNonce,
    bodyNonceCount: cspNonce
      ? countOccurrences(body, `nonce="${cspNonce}"`)
      : 0,
    body,
  }

  validateSample(target, request, sample)
  return sample
}

for (const target of config.targets) {
  const targetResult = {
    name: target.name,
    baseUrl: target.baseUrl,
    requests: [],
  }

  for (const request of config.requests) {
    const requestResult = {
      name: request.name,
      pathname: request.pathname,
      method: request.method ?? "GET",
      samples: [],
    }

    for (
      let repetition = 1;
      repetition <= (request.repetitions ?? 1);
      repetition += 1
    ) {
      try {
        const sample = await runSample(target, request, repetition)
        const { body: _body, ...reportSample } = sample
        requestResult.samples.push(reportSample)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error)
        recordFailure(target.name, request.name, message)
        requestResult.samples.push({
          repetition,
          error: message,
        })
      }
    }

    if (request.freshNonce && requestResult.samples.length > 1) {
      const nonces = requestResult.samples
        .map((sample) => sample.cspNonce)
        .filter(Boolean)

      if (new Set(nonces).size !== nonces.length) {
        recordFailure(
          target.name,
          request.name,
          "CSP nonce was reused across repeated requests",
        )
      }
    }

    targetResult.requests.push(requestResult)
  }

  report.targets.push(targetResult)
}

report.failures = failures

const reportPath =
  process.env.CLOUDFLARE_EDGE_REPORT ??
  config.reportPath ??
  ".performance/cloudflare-edge.json"

await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n")

for (const target of report.targets) {
  console.log(`\n${target.name}: ${target.baseUrl}`)

  for (const request of target.requests) {
    const first = request.samples[0]
    const status = first?.status ?? "error"
    const cacheStatus = first?.headers?.cfCacheStatus ?? "-"
    const age = first?.headers?.age ?? "-"
    const total = first?.totalMilliseconds ?? "-"

    console.log(
      `  ${request.name}: status=${status} cf-cache=${cacheStatus} age=${age} totalMs=${total}`,
    )
  }
}

console.log(`\nEvidence: ${reportPath}`)

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(
      `FAIL ${failure.target}/${failure.request}: ${failure.message}`,
    )
  }

  process.exitCode = 1
}
