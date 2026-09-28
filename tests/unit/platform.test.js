import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import ts from "typescript"

async function loadPlatformModule() {
  const source = await readFile("app/services/platform.server.ts", "utf8")
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "app/services/platform.server.ts",
  }).outputText
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`

  return import(moduleUrl)
}

function restoreEnvironment(name, value) {
  if (value === undefined) {
    delete process.env[name]
    return
  }

  process.env[name] = value
}

function withoutNodeAnalytics(callback) {
  const primary = process.env.MICRANTHA_ANALYTICS_ID
  const legacy = process.env.ANALYTICS_ID
  delete process.env.MICRANTHA_ANALYTICS_ID
  delete process.env.ANALYTICS_ID

  try {
    return callback()
  } finally {
    restoreEnvironment("MICRANTHA_ANALYTICS_ID", primary)
    restoreEnvironment("ANALYTICS_ID", legacy)
  }
}

const platform = await loadPlatformModule()

test("direct Cloudflare analytics configuration has highest precedence", () => {
  withoutNodeAnalytics(() => {
    process.env.MICRANTHA_ANALYTICS_ID = "node"

    const runtime = platform.resolveRuntimePlatform(
      {
        env: {
          MICRANTHA_ANALYTICS_ID: "  direct  ",
          ANALYTICS_ID: "direct-legacy",
        },
        cloudflare: {
          env: {
            MICRANTHA_ANALYTICS_ID: "nested",
          },
        },
      },
      new Request("https://micrantha.com/services?from=test"),
    )

    assert.equal(runtime.analyticsId, "direct")
    assert.equal(runtime.origin, "https://micrantha.com")
  })
})

test("malformed and blank analytics bindings fall through to valid configuration", () => {
  withoutNodeAnalytics(() => {
    const runtime = platform.resolveRuntimePlatform(
      {
        env: {
          MICRANTHA_ANALYTICS_ID: 42,
          ANALYTICS_ID: "   ",
        },
        cloudflare: {
          env: {
            MICRANTHA_ANALYTICS_ID: " nested ",
          },
        },
      },
      new Request("https://micrantha.com/"),
    )

    assert.equal(runtime.analyticsId, "nested")
  })
})

test("direct legacy binding precedes nested Cloudflare configuration", () => {
  withoutNodeAnalytics(() => {
    const runtime = platform.resolveRuntimePlatform(
      {
        env: {
          ANALYTICS_ID: "direct-legacy",
        },
        cloudflare: {
          env: {
            MICRANTHA_ANALYTICS_ID: "nested-primary",
          },
        },
      },
      new Request("https://micrantha.com/"),
    )

    assert.equal(runtime.analyticsId, "direct-legacy")
  })
})

test("node analytics configuration is the final fallback", () => {
  withoutNodeAnalytics(() => {
    process.env.ANALYTICS_ID = "  node-legacy  "

    const runtime = platform.resolveRuntimePlatform(
      {},
      new Request("https://micrantha.com/"),
    )

    assert.equal(runtime.analyticsId, "node-legacy")
  })
})

test("missing analytics configuration resolves to null", () => {
  withoutNodeAnalytics(() => {
    const runtime = platform.resolveRuntimePlatform(
      {},
      new Request("https://micrantha.com/"),
    )

    assert.equal(runtime.analyticsId, null)
  })
})

test("edge cache is exposed only when the runtime provides a default cache", () => {
  const originalCaches = Object.getOwnPropertyDescriptor(globalThis, "caches")
  const fakeCache = { name: "edge-cache" }

  try {
    Object.defineProperty(globalThis, "caches", {
      configurable: true,
      value: { default: fakeCache },
    })

    const runtimeWithCache = withoutNodeAnalytics(() =>
      platform.resolveRuntimePlatform(
        {},
        new Request("https://micrantha.com/"),
      ),
    )

    assert.equal(runtimeWithCache.edgeCache, fakeCache)

    Object.defineProperty(globalThis, "caches", {
      configurable: true,
      value: undefined,
    })

    const runtimeWithoutCache = withoutNodeAnalytics(() =>
      platform.resolveRuntimePlatform(
        {},
        new Request("https://micrantha.com/"),
      ),
    )

    assert.equal(runtimeWithoutCache.edgeCache, null)
  } finally {
    if (originalCaches) {
      Object.defineProperty(globalThis, "caches", originalCaches)
    } else {
      delete globalThis.caches
    }
  }
})
