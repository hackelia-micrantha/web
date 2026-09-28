import assert from "node:assert/strict"
import test from "node:test"

import {
  CSP_NONCE_HEADER,
  buildContentSecurityPolicy,
  buildDocumentSecurityHeaders,
} from "../../app/services/document-security.server.js"

test("production policy binds executable scripts to the response nonce", () => {
  const policy = buildContentSecurityPolicy({
    nonce: "nonce-value",
    isDevelopment: false,
  })

  assert.match(policy, /default-src 'self'/)
  assert.match(policy, /base-uri 'self'/)
  assert.match(policy, /object-src 'none'/)
  assert.match(policy, /frame-ancestors 'none'/)
  assert.match(policy, /form-action 'self'/)
  assert.match(policy, /img-src 'self' data:/)
  assert.doesNotMatch(policy, /img-src[^;]*https:/)
  assert.match(policy, /style-src 'self' 'unsafe-inline'/)
  assert.match(policy, /connect-src 'self' https:\/\/analytics\.micrantha\.com/)
  assert.match(
    policy,
    /script-src 'self' 'nonce-nonce-value' https:\/\/analytics\.micrantha\.com/,
  )
  assert.doesNotMatch(policy, /unsafe-eval/)
  assert.doesNotMatch(policy, /\bws:/)
  assert.doesNotMatch(policy, /\bwss:/)
})

test("development policy permits only the development runtime additions", () => {
  const policy = buildContentSecurityPolicy({
    nonce: "dev-nonce",
    isDevelopment: true,
  })

  assert.match(policy, /script-src[^;]*'nonce-dev-nonce'/)
  assert.match(policy, /script-src[^;]*'unsafe-eval'/)
  assert.match(policy, /connect-src[^;]*\bws:/)
  assert.match(policy, /connect-src[^;]*\bwss:/)
})

test("missing nonce fails closed for script execution", () => {
  const policy = buildContentSecurityPolicy({
    nonce: null,
    isDevelopment: false,
  })

  assert.match(policy, /script-src 'none'/)
  assert.match(policy, /connect-src 'self'/)
  assert.doesNotMatch(policy, /analytics\.micrantha\.com/)
  assert.doesNotMatch(policy, /nonce-/)
})

test("document headers apply cross-origin and transport hardening", () => {
  const production = buildDocumentSecurityHeaders({
    nonce: "production-nonce",
    isDevelopment: false,
  })

  assert.equal(CSP_NONCE_HEADER, "X-CSP-Nonce")
  assert.equal(production["Cross-Origin-Opener-Policy"], "same-origin")
  assert.equal(production["Cross-Origin-Resource-Policy"], "same-origin")
  assert.equal(production["Origin-Agent-Cluster"], "?1")
  assert.equal(
    production["Permissions-Policy"],
    "camera=(), geolocation=(), microphone=()",
  )
  assert.equal(production["Referrer-Policy"], "strict-origin-when-cross-origin")
  assert.equal(production["X-Content-Type-Options"], "nosniff")
  assert.equal(production["X-Frame-Options"], "DENY")
  assert.equal(production["Strict-Transport-Security"], "max-age=31536000")

  const development = buildDocumentSecurityHeaders({
    nonce: "development-nonce",
    isDevelopment: true,
  })

  assert.equal(Object.hasOwn(development, "Strict-Transport-Security"), false)
})
