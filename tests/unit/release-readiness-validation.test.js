import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import test from "node:test"

import { assertReleaseReadinessManifest } from "../../scripts/release-readiness-validation.js"

const slug = "example-article"
const canonical = "https://ryanjennin.gs/posts/" + slug + "/"
const sha256 = (value) => createHash("sha256").update(value).digest("hex")

function fixture() {
  const content = "---\nslug: example-article\nstatus: draft\n---\n" + canonical
  const cover = Buffer.from("not-actually-an-image")
  const routeTemplate =
    '"' + slug + '"\n"' + canonical + '"\n"/img/blog/' + slug + '.webp"'
  const manifest = {
    schemaVersion: 1,
    slug,
    authorization: "not-granted",
    source: {
      repository: "ryjen/blog",
      path: "content/posts/example-article.md",
      gitCommit: "a".repeat(40),
      sha256: "b".repeat(64),
      canonicalUrl: canonical,
    },
    staged: {
      contentSha256: sha256(content),
      coverSha256: sha256(cover),
      routeTemplateSha256: sha256(routeTemplate),
    },
    observed: {
      checkedAt: "2026-11-06",
      httpStatus: 200,
      finalUrl: canonical,
      canonicalUrl: canonical,
      robots: "index, follow",
    },
  }
  return { manifest, slug, content, cover, routeTemplate }
}

test("release readiness manifests bind staged bytes without granting publication", () => {
  assert.doesNotThrow(() => assertReleaseReadinessManifest(fixture()))
})

test("a release readiness record cannot itself authorize publication", () => {
  const data = fixture()
  data.manifest.authorization = "granted"
  assert.throws(() => assertReleaseReadinessManifest(data))
})

test("stale content, cover, and route-template digests fail closed", () => {
  for (const field of ["content", "cover", "routeTemplate"]) {
    const data = fixture()
    data[field] = Buffer.from("changed")
    assert.throws(() => assertReleaseReadinessManifest(data))
  }
})

test("wrong canonical, source path, and forged live observations fail", () => {
  for (const mutation of [
    (m) => {
      m.source.canonicalUrl = "https://attacker.example/posts/example-article/"
    },
    (m) => {
      m.source.path = "../unsafe.md"
    },
    (m) => {
      m.observed.httpStatus = 404
    },
    (m) => {
      m.observed.canonicalUrl = "https://other.example/"
    },
    (m) => {
      m.observed.robots = "noindex"
    },
  ]) {
    const data = fixture()
    mutation(data.manifest)
    assert.throws(() => assertReleaseReadinessManifest(data))
  }
})

test("published-looking route templates are not sufficient for readiness", () => {
  const data = fixture()
  data.routeTemplate =
    '"' + slug + '"\n"' + canonical + '"\n"/img/blog/unrelated.webp"'
  data.manifest.staged.routeTemplateSha256 = sha256(data.routeTemplate)
  assert.throws(() => assertReleaseReadinessManifest(data))
})
