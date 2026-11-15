const ANALYTICS_ORIGIN = "https://analytics.micrantha.com"

export const CSP_NONCE_HEADER = "X-CSP-Nonce"

/**
 * @typedef {object} DocumentSecurityOptions
 * @property {string | null | undefined} [nonce]
 * @property {boolean} [isDevelopment]
 * @property {boolean} [analyticsEnabled]
 */

function baseDirectives() {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data:",
    "manifest-src 'self'",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
  ]
}

/**
 * @param {DocumentSecurityOptions} [options]
 */
export function buildContentSecurityPolicy({
  nonce,
  isDevelopment = false,
  analyticsEnabled = false,
} = {}) {
  const directives = baseDirectives()

  if (!nonce) {
    return [...directives, "connect-src 'self'", "script-src 'none'"].join("; ")
  }

  const connectSources = ["'self'"]
  const scriptSources = ["'self'", `'nonce-${nonce}'`]

  if (analyticsEnabled) {
    connectSources.push(ANALYTICS_ORIGIN)
    scriptSources.push(ANALYTICS_ORIGIN)
  }

  if (isDevelopment) {
    connectSources.push("ws:", "wss:")
    scriptSources.push("'unsafe-eval'")
  }

  return [
    ...directives,
    `connect-src ${connectSources.join(" ")}`,
    `script-src ${scriptSources.join(" ")}`,
  ].join("; ")
}

/**
 * @param {DocumentSecurityOptions} [options]
 */
export function buildDocumentSecurityHeaders({
  nonce,
  isDevelopment = false,
  analyticsEnabled = false,
} = {}) {
  /** @type {Record<string, string>} */
  const headers = {
    "Content-Security-Policy": buildContentSecurityPolicy({
      nonce,
      isDevelopment,
      analyticsEnabled,
    }),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Origin-Agent-Cluster": "?1",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  }

  if (!isDevelopment) {
    headers["Strict-Transport-Security"] = "max-age=31536000"
  }

  return headers
}
