import type { AppLoadContext } from "@remix-run/node"

type RuntimeEnvironment = {
  MICRANTHA_ANALYTICS_ID?: unknown
  ANALYTICS_ID?: unknown
}

type CloudflareLoadContext = AppLoadContext & {
  env?: RuntimeEnvironment
  cloudflare?: {
    env?: RuntimeEnvironment
  }
}

export type RuntimePlatform = {
  analyticsId: string | null
  edgeCache: Cache | null
  origin: string
}

function configuredString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function firstConfiguredString(...values: unknown[]): string | null {
  for (const value of values) {
    const configured = configuredString(value)
    if (configured) return configured
  }

  return null
}

export function resolveRuntimePlatform(
  context: AppLoadContext,
  request: Request,
): RuntimePlatform {
  const cloudflareContext = context as CloudflareLoadContext
  const nodeAnalyticsId =
    typeof process !== "undefined"
      ? firstConfiguredString(
          process.env.MICRANTHA_ANALYTICS_ID,
          process.env.ANALYTICS_ID,
        )
      : null
  const analyticsId = firstConfiguredString(
    cloudflareContext.env?.MICRANTHA_ANALYTICS_ID,
    cloudflareContext.env?.ANALYTICS_ID,
    cloudflareContext.cloudflare?.env?.MICRANTHA_ANALYTICS_ID,
    cloudflareContext.cloudflare?.env?.ANALYTICS_ID,
    nodeAnalyticsId,
  )

  const cacheStorage =
    typeof globalThis.caches !== "undefined"
      ? (globalThis.caches as unknown as { default?: Cache })
      : undefined
  const edgeCache = cacheStorage?.default ?? null
  const origin = new URL(request.url).origin

  return {
    analyticsId,
    edgeCache,
    origin,
  }
}
