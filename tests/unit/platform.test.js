import assert from "node:assert/strict"
import test from "node:test"

import { resolveRuntimePlatform } from "../../app/services/platform.server.ts"

const analyticsEnvironmentKeys = ["MICRANTHA_ANALYTICS_ID", "ANALYTICS_ID"]

function preserveAnalyticsEnvironment() {
  return new Map(
    analyticsEnvironmentKeys.map((key) => [key, process.env[key]]),
  )
}

function restoreAnalyticsEnvironment(snapshot) {
  for (const [key, value] of snapshot) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

test("resolves analytics configuration in runtime precedence order", () => {
  const environment = preserveAnalyticsEnvironment()

  try {
    process.env.MICRANTHA_ANALYTICS_ID = "node-primary"
    process.env.ANALYTICS_ID = "node-secondary"

    const request = { url: "https://micrantha.test/path" }

    assert.equal(
      resolveRuntimePlatform(
        {
          env: {
            MICRANTHA_ANALYTICS_ID: "edge-primary",
            ANALYTICS_ID: "edge-secondary",
          },
          cloudflare: {
            env: {
              MICRANTHA_ANALYTICS_ID: "cloudflare-primary",
              ANALYTICS_ID: "cloudflare-secondary",
            },
          },
        },
        request,
      ).analyticsId,
      "edge-primary",
    )

    assert.equal(
      resolveRuntimePlatform(
        {
          env: { ANALYTICS_ID: "edge-secondary" },
          cloudflare: {
            env: {
              MICRANTHA_ANALYTICS_ID: "cloudflare-primary",
              ANALYTICS_ID: "cloudflare-secondary",
            },
          },
        },
        request,
      ).analyticsId,
      "edge-secondary",
    )

    assert.equal(
      resolveRuntimePlatform(
        {
          cloudflare: {
            env: {
              MICRANTHA_ANALYTICS_ID: "cloudflare-primary",
              ANALYTICS_ID: "cloudflare-secondary",
            },
          },
        },
        request,
      ).analyticsId,
      "cloudflare-primary",
    )

    assert.equal(
      resolveRuntimePlatform(
        {
          cloudflare: {
            env: { ANALYTICS_ID: "cloudflare-secondary" },
          },
        },
        request,
      ).analyticsId,
      "cloudflare-secondary",
    )

    assert.equal(
      resolveRuntimePlatform({}, request).analyticsId,
      "node-primary",
    )

    delete process.env.MICRANTHA_ANALYTICS_ID
    assert.equal(
      resolveRuntimePlatform({}, request).analyticsId,
      "node-secondary",
    )

    delete process.env.ANALYTICS_ID
    assert.equal(resolveRuntimePlatform({}, request).analyticsId, null)
  } finally {
    restoreAnalyticsEnvironment(environment)
  }
})

test("ignores malformed and blank analytics bindings", () => {
  const environment = preserveAnalyticsEnvironment()

  try {
    process.env.MICRANTHA_ANALYTICS_ID = "node-primary"

    const runtime = resolveRuntimePlatform(
      {
        env: {
          MICRANTHA_ANALYTICS_ID: 42,
          ANALYTICS_ID: "   ",
        },
        cloudflare: {
          env: {
            MICRANTHA_ANALYTICS_ID: "  cloudflare-primary  ",
          },
        },
      },
      { url: "https://micrantha.test/path" },
    )

    assert.equal(runtime.analyticsId, "cloudflare-primary")
  } finally {
    restoreAnalyticsEnvironment(environment)
  }
})

test("resolves request origin and the default edge cache when available", () => {
  const cachesDescriptor = Object.getOwnPropertyDescriptor(globalThis, "caches")
  const edgeCache = {}

  try {
    Object.defineProperty(globalThis, "caches", {
      configurable: true,
      value: { default: edgeCache },
    })

    const runtime = resolveRuntimePlatform(
      {},
      { url: "https://micrantha.test/path?source=test" },
    )

    assert.equal(runtime.origin, "https://micrantha.test")
    assert.equal(runtime.edgeCache, edgeCache)
  } finally {
    if (cachesDescriptor) {
      Object.defineProperty(globalThis, "caches", cachesDescriptor)
    } else {
      delete globalThis.caches
    }
  }
})

test("returns no edge cache when CacheStorage is unavailable", () => {
  const cachesDescriptor = Object.getOwnPropertyDescriptor(globalThis, "caches")

  try {
    Object.defineProperty(globalThis, "caches", {
      configurable: true,
      value: undefined,
    })

    const runtime = resolveRuntimePlatform(
      {},
      { url: "http://localhost:3000/path" },
    )

    assert.equal(runtime.origin, "http://localhost:3000")
    assert.equal(runtime.edgeCache, null)
  } finally {
    if (cachesDescriptor) {
      Object.defineProperty(globalThis, "caches", cachesDescriptor)
    } else {
      delete globalThis.caches
    }
  }
})
