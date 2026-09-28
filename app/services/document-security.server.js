const ANALYTICS_ORIGIN = "https://analytics.micrantha.com"

export const CSP_NONCE_HEADER = "X-CSP-Nonce"

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

export function buildContentSecurityPolicy({
  nonce,
  isDevelopment = false,
} = {}) {
  const directives = baseDirectives()

  if (!nonce) {
    return [
      ...directives,
      "connect-src 'self'",
      "script-src 'none'",
    ].join("; ")
  }

  const connectSources = ["'self'", ANALYTICS_ORIGIN]
  const scriptSources = ["'self'", `'nonce-${nonce}'`, ANALYTICS_ORIGIN]

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

export function buildDocumentSecurityHeaders({
  nonce,
  isDevelopment = false,
} = {}) {
  const headers = {
    "Content-Security-Policy": buildContentSecurityPolicy({
      nonce,
      isDevelopment,
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
