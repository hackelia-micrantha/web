export const PRIVATE_NO_STORE_CACHE_CONTROL = "private, no-store"

const CACHE_CLASSES = Object.freeze({
  home: Object.freeze({ ttlSeconds: 300, staleSeconds: 900 }),
  catalog: Object.freeze({ ttlSeconds: 600, staleSeconds: 1800 }),
  reference: Object.freeze({ ttlSeconds: 1800, staleSeconds: 3600 }),
  content: Object.freeze({ ttlSeconds: 600, staleSeconds: 1800 }),
})

const EXACT_PUBLIC_ROUTES = new Map([
  ["/", "home"],
  ["/contact", "home"],
  ["/services", "catalog"],
  ["/solutions", "catalog"],
  ["/philosophy", "catalog"],
  ["/laboratory", "catalog"],
  ["/compost", "catalog"],
  ["/privacy", "reference"],
  ["/security", "reference"],
  ["/support", "reference"],
  ["/blog", "content"],
])

const DYNAMIC_PUBLIC_ROUTES = Object.freeze([
  Object.freeze({
    className: "content",
    pattern: /^\/blog\/series\/[^/]+$/u,
  }),
  Object.freeze({
    className: "content",
    pattern: /^\/blog\/[^/]+$/u,
  }),
])

export const PUBLIC_DOCUMENT_CACHE_CASES = Object.freeze([
  Object.freeze({ pathname: "/", className: "home" }),
  Object.freeze({ pathname: "/contact", className: "home" }),
  Object.freeze({ pathname: "/services", className: "catalog" }),
  Object.freeze({ pathname: "/solutions", className: "catalog" }),
  Object.freeze({ pathname: "/philosophy", className: "catalog" }),
  Object.freeze({ pathname: "/laboratory", className: "catalog" }),
  Object.freeze({ pathname: "/compost", className: "catalog" }),
  Object.freeze({ pathname: "/privacy", className: "reference" }),
  Object.freeze({ pathname: "/security", className: "reference" }),
  Object.freeze({ pathname: "/support", className: "reference" }),
  Object.freeze({ pathname: "/blog", className: "content" }),
  Object.freeze({
    pathname: "/blog/series/governance-native-engineering",
    className: "content",
  }),
  Object.freeze({
    pathname: "/blog/governance-native-engineering-control-plane",
    className: "content",
  }),
])

function formatPublicCacheControl(className) {
  const policy = CACHE_CLASSES[className]

  if (!policy) {
    throw new Error(`Unknown document cache class: ${className}`)
  }

  return `public, max-age=60, s-maxage=${policy.ttlSeconds}, stale-while-revalidate=${policy.staleSeconds}`
}

export function getDocumentCachePolicy(pathname) {
  if (/^\/runtime-contract(?:\/|$)/u.test(pathname)) {
    return {
      className: "private",
      cacheControl: PRIVATE_NO_STORE_CACHE_CONTROL,
    }
  }

  const exactClass = EXACT_PUBLIC_ROUTES.get(pathname)

  if (exactClass) {
    return {
      className: exactClass,
      cacheControl: formatPublicCacheControl(exactClass),
    }
  }

  const dynamicRule = DYNAMIC_PUBLIC_ROUTES.find((rule) =>
    rule.pattern.test(pathname),
  )

  if (dynamicRule) {
    return {
      className: dynamicRule.className,
      cacheControl: formatPublicCacheControl(dynamicRule.className),
    }
  }

  return {
    className: "private",
    cacheControl: PRIVATE_NO_STORE_CACHE_CONTROL,
  }
}

export function getDocumentCacheControl(pathname) {
  return getDocumentCachePolicy(pathname).cacheControl
}

export function getRequestCacheControl(request) {
  const method = request.method.toUpperCase()

  if (method !== "GET" && method !== "HEAD") {
    return PRIVATE_NO_STORE_CACHE_CONTROL
  }

  const url = new URL(request.url)

  if (url.searchParams.has("_data")) {
    return PRIVATE_NO_STORE_CACHE_CONTROL
  }

  return getDocumentCacheControl(url.pathname)
}
