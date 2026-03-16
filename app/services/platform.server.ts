import type { AppLoadContext } from "@remix-run/node"

type CloudflareLoadContext = AppLoadContext & {
  cloudflare?: {
    env?: {
      MICRANTHA_ANALYTICS_ID?: string
      ANALYTICS_ID?: string
    }
  }
}

export type RuntimePlatform = {
  analyticsId: string | null
  edgeCache: Cache | null
  origin: string
}

export function resolveRuntimePlatform(
  context: AppLoadContext,
  request: Request,
): RuntimePlatform {
  const cloudflareContext = context as CloudflareLoadContext
  const nodeAnalyticsId =
    typeof process !== "undefined"
      ? (process.env.MICRANTHA_ANALYTICS_ID ?? process.env.ANALYTICS_ID ?? null)
      : null
  const analyticsId =
    cloudflareContext.cloudflare?.env?.MICRANTHA_ANALYTICS_ID ??
    cloudflareContext.cloudflare?.env?.ANALYTICS_ID ??
    nodeAnalyticsId ??
    null

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
