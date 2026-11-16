import type { AppLoadContext } from "@remix-run/node"

type RuntimeEnvironment = {
  MICRANTHA_ANALYTICS_CLIENT_ENABLED?: unknown
}

type CloudflareLoadContext = AppLoadContext & {
  env?: RuntimeEnvironment
  cloudflare?: {
    env?: RuntimeEnvironment
  }
}

export type RuntimePlatform = {
  analyticsClientEnabled: boolean
  edgeCache: Cache | null
  origin: string
}

export function resolveRuntimePlatform(
  context: AppLoadContext,
  request: Request,
): RuntimePlatform {
  const cloudflareContext = context as CloudflareLoadContext
  // Only an explicit boolean-like "true" enables the Phenology client.
  // Old Umami website-ID bindings must never re-enable browser analytics.
  const analyticsFlag =
    cloudflareContext.env?.MICRANTHA_ANALYTICS_CLIENT_ENABLED ??
    cloudflareContext.cloudflare?.env?.MICRANTHA_ANALYTICS_CLIENT_ENABLED ??
    (typeof process !== "undefined"
      ? process.env.MICRANTHA_ANALYTICS_CLIENT_ENABLED
      : undefined)
  const analyticsClientEnabled = analyticsFlag === "true"

  const cacheStorage =
    typeof globalThis.caches !== "undefined"
      ? (globalThis.caches as unknown as { default?: Cache })
      : undefined
  const edgeCache = cacheStorage?.default ?? null
  const origin = new URL(request.url).origin

  return {
    analyticsClientEnabled,
    edgeCache,
    origin,
  }
}
