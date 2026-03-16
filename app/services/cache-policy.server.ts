const DEFAULT_TTL_SECONDS = 300
const DEFAULT_STALE_SECONDS = 600

type CacheRule = {
  pattern: RegExp
  ttlSeconds: number
  staleSeconds: number
}

const CACHE_MATRIX: CacheRule[] = [
  { pattern: /^\/$/, ttlSeconds: 300, staleSeconds: 900 },
  {
    pattern: /^\/(services|solutions|philosophy|laboratory|compost)$/,
    ttlSeconds: 600,
    staleSeconds: 1800,
  },
  { pattern: /^\/(privacy|support)$/, ttlSeconds: 1800, staleSeconds: 3600 },
]

export function getDocumentCacheControl(pathname: string): string {
  const rule = CACHE_MATRIX.find((entry) => entry.pattern.test(pathname)) ?? {
    ttlSeconds: DEFAULT_TTL_SECONDS,
    staleSeconds: DEFAULT_STALE_SECONDS,
  }

  return `public, max-age=60, s-maxage=${rule.ttlSeconds}, stale-while-revalidate=${rule.staleSeconds}`
}
