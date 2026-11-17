import assert from "node:assert/strict"
import { createHash } from "node:crypto"

const digest = (bytes) => createHash("sha256").update(bytes).digest("hex")

/**
 * Validates a recorded source-and-staging snapshot, NOT permission to publish.
 *
 * The canonical HTTP observation is evidence captured by a reviewer. This
 * offline validator cannot independently attest remote availability or
 * guarantee the canonical source has not changed since observation.
 */
export function assertReleaseReadinessManifest({
  manifest,
  slug,
  content,
  cover,
  routeTemplate,
}) {
  assert.equal(manifest.schemaVersion, 1)
  assert.equal(manifest.slug, slug)
  assert.equal(manifest.authorization, "not-granted")

  const { source, staged, observed } = manifest
  assert.equal(source.repository, "ryjen/blog")
  assert.match(source.path, /^content\/posts\/[a-z0-9-]+\.md$/)
  assert.match(source.gitCommit, /^[0-9a-f]{40}$/)
  assert.match(source.sha256, /^[0-9a-f]{64}$/)

  const canonical = new URL(source.canonicalUrl)
  assert.equal(canonical.protocol, "https:")
  assert.equal(canonical.hostname, "ryanjennin.gs")
  assert.equal(canonical.pathname, "/posts/" + slug + "/")
  assert.equal(canonical.search, "")
  assert.equal(canonical.hash, "")

  assert.equal(staged.contentSha256, digest(content))
  assert.equal(staged.coverSha256, digest(cover))
  assert.equal(staged.routeTemplateSha256, digest(routeTemplate))
  assert.ok(content.includes(source.canonicalUrl))
  assert.ok(routeTemplate.includes(source.canonicalUrl))
  assert.ok(routeTemplate.includes('"' + slug + '"'))
  assert.ok(
    routeTemplate.includes('"/img/blog/' + slug + '.webp"'),
    "Future route template must use its staged cover",
  )

  assert.match(observed.checkedAt, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(observed.httpStatus, 200)
  assert.equal(observed.finalUrl, source.canonicalUrl)
  assert.equal(observed.canonicalUrl, source.canonicalUrl)
  assert.equal(observed.robots, "index, follow")
}
