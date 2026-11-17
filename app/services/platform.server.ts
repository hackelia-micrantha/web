import type { AppLoadContext } from "@remix-run/node"

export type RuntimePlatform = {
  edgeCache: Cache | null
  origin: string
}

export function resolveRuntimePlatform(
  _context: AppLoadContext,
  request: Request,
): RuntimePlatform {
  const cacheStorage =
    typeof globalThis.caches !== "undefined"
      ? (globalThis.caches as unknown as { default?: Cache })
      : undefined
  const edgeCache = cacheStorage?.default ?? null
  const origin = new URL(request.url).origin

  return { edgeCache, origin }
}
