import type { Fortune } from "~/model"

const FORTUNE_URL = "https://fortunes.micrantha.com/api/v1/random?s=true"
const FORTUNE_CACHE_KEY = "/__cache/fortune?s=true"
const FORTUNE_CACHE_TTL_SECONDS = 300

type FortuneOptions = {
  cache: Cache | null
  origin: string
}

function getCacheKey(origin: string) {
  return new Request(`${origin}${FORTUNE_CACHE_KEY}`, { method: "GET" })
}

export async function getFortune(
  options: FortuneOptions,
): Promise<Fortune | null> {
  const { cache, origin } = options
  const cacheKey = getCacheKey(origin)

  if (cache) {
    const cached = await cache.match(cacheKey)
    if (cached) {
      return (await cached.json()) as Fortune
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 1500)

  try {
    const response = await fetch(FORTUNE_URL, { signal: controller.signal })
    if (!response.ok) return null

    const fortune = (await response.json()) as Fortune

    if (cache) {
      await cache.put(
        cacheKey,
        new Response(JSON.stringify(fortune), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${FORTUNE_CACHE_TTL_SECONDS}`,
          },
        }),
      )
    }

    return fortune
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}
