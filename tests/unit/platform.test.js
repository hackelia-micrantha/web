import assert from "node:assert/strict"
import test from "node:test"

import { resolveRuntimePlatform } from "../../app/services/platform.server.ts"

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
