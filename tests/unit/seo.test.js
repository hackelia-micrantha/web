import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import ts from "typescript"

async function loadSeoModule() {
  const source = await readFile("app/utils/seo.ts", "utf8")
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "app/utils/seo.ts",
  }).outputText
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`

  return import(moduleUrl)
}

function descriptor(meta, predicate) {
  return meta.find(predicate)
}

const seo = await loadSeoModule()

test("page metadata leads with the page topic and preserves canonical/social metadata", () => {
  const meta = seo.buildPageMeta({
    title: "Solutions",
    description: "Deployable systems.",
    path: "/solutions",
  })

  assert.equal(\n    descriptor(meta, (entry) => "title" in entry)?.title,\n    "Solutions | Micrantha Software",\n  )
  assert.equal(
    descriptor(meta, (entry) => entry.rel === "canonical")?.href,
    "https://micrantha.com/solutions",
  )
  assert.equal(
    descriptor(meta, (entry) => entry.property === "og:title")?.content,
    "Solutions | Micrantha Software",
  )
  assert.equal(
    descriptor(meta, (entry) => entry.property === "og:image:alt")?.content,
    "Micrantha Software",
  )
  assert.equal(
    descriptor(meta, (entry) => entry.name === "twitter:image:alt")?.content,
    "Micrantha Software",
  )
})

test("article metadata retains publication details and topic-first titles", () => {
  const meta = seo.buildArticleMeta({
    title: "Intent Is Security State",
    description: "A governance note.",
    path: "/blog/intent-is-security-state",
    publishedTime: "2026-08-12T00:00:00Z",
    modifiedTime: "2026-08-13T00:00:00Z",
    tags: ["security", "governance"],
  })

  assert.equal(
    descriptor(meta, (entry) => "title" in entry)?.title,
    "Intent Is Security State | Micrantha Software",
  )
  assert.equal(
    descriptor(meta, (entry) => entry.property === "article:modified_time")\n      ?.content,
    "2026-08-13T00:00:00Z",
  )
  assert.deepEqual(
    meta\n      .filter((entry) => entry.property === "article:tag")\n      .map((entry) => entry.content),
    ["security", "governance"],
  )

  const unmodified = seo.buildArticleMeta({
    title: "Article",
    description: "Description",
    path: "/blog/article",
    publishedTime: "2026-08-12T00:00:00Z",
  })
  assert.equal(
    unmodified.some((entry) => entry.property === "article:modified_time"),
    false,
  )
})

test("site metadata omits obsolete keywords and provides image alternatives", () => {
  const meta = seo.buildSiteMeta()

  assert.equal(\n    meta.some((entry) => entry.name === "keywords"),\n    false,\n  )
  assert.equal(
    descriptor(meta, (entry) => entry.property === "og:image:alt")?.content,
    "Micrantha Software",
  )
  assert.equal(
    descriptor(meta, (entry) => entry.name === "twitter:image:alt")?.content,
    "Micrantha Software",
  )
})

test("collection structured data resolves item URLs without requiring every item to link", () => {
  const data = seo.buildCollectionPageStructuredData({
    name: "Collection",
    description: "Description",
    path: "/collection",
    items: [
      { name: "Linked", description: "Linked item", url: "/linked" },
      { name: "Unlinked", description: "Unlinked item" },
    ],
  })

  assert.equal(data.url, "https://micrantha.com/collection")
  assert.equal(data.mainEntity.numberOfItems, 2)
  assert.equal(
    data.mainEntity.itemListElement[0].url,
    "https://micrantha.com/linked",
  )
  assert.equal("url" in data.mainEntity.itemListElement[1], false)
})

test("article structured data normalizes URLs and optional modification time", () => {
  const modified = seo.buildArticleStructuredData({
    title: "Article",
    description: "Description",
    path: "/blog/article",
    datePublished: "2026-08-12T00:00:00Z",
    dateModified: "2026-08-13T00:00:00Z",
    keywords: ["security"],
  })

  assert.equal(modified.url, "https://micrantha.com/blog/article")
  assert.equal(modified.dateModified, "2026-08-13T00:00:00Z")
  assert.deepEqual(modified.image, ["https://micrantha.com/img/logo.png"])
  assert.deepEqual(modified.keywords, ["security"])

  const unmodified = seo.buildArticleStructuredData({
    title: "Article",
    description: "Description",
    path: "/blog/article",
    datePublished: "2026-08-12T00:00:00Z",
  })
  assert.equal("dateModified" in unmodified, false)
})
