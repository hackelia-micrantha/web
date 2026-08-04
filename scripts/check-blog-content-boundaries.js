import assert from "node:assert/strict"
import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"

import {
  assertBlogPostContentOptional,
  buildSitemapXml,
  loadBlogContentInventory,
  repositoryRoot,
} from "./blog-content-inventory.js"

const routesDirectory = path.join(repositoryRoot, "app/routes")
const sitemapPath = path.join(repositoryRoot, "public/sitemap.xml")

async function pathExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

async function discoverMdxSlugs() {
  const entries = await readdir(routesDirectory, { withFileTypes: true })
  const slugs = []

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("blog.")) continue

    const routeDirectory = path.join(routesDirectory, entry.name)
    const hasMdx = await pathExists(path.join(routeDirectory, "content.mdx"))

    if (!hasMdx) continue

    assert.equal(
      await pathExists(path.join(routeDirectory, "route.tsx")),
      true,
      `MDX route ${entry.name} is missing route.tsx`,
    )

    slugs.push(entry.name.slice("blog.".length))
  }

  assert.equal(
    new Set(slugs).size,
    slugs.length,
    "Static MDX routes contain duplicate slugs",
  )

  return slugs.sort()
}

await assertBlogPostContentOptional()

const [mdxSlugs, inventory, currentSitemap] = await Promise.all([
  discoverMdxSlugs(),
  loadBlogContentInventory(),
  readFile(sitemapPath, "utf8"),
])

for (const slug of mdxSlugs) {
  const post = inventory.postsBySlug.get(slug)

  assert.ok(post, `MDX route ${slug} is missing registry metadata`)
  assert.equal(
    post.hasContent,
    false,
    `MDX route ${slug} still has a legacy Content renderer in ${post.source}`,
  )
}

for (const post of inventory.posts) {
  if (mdxSlugs.includes(post.slug)) continue

  assert.equal(
    post.hasContent,
    true,
    `Legacy TSX post ${post.slug} is missing its Content renderer in ${post.source}`,
  )
}

const expectedSitemap = buildSitemapXml(inventory)

assert.equal(
  currentSitemap,
  expectedSitemap,
  "public/sitemap.xml is stale; run node scripts/generate-sitemap.js",
)

console.log(
  `Blog content boundaries passed: ${inventory.posts.length} post(s), ${inventory.series.length} series, ${mdxSlugs.length} MDX route(s), ${
    inventory.posts.length - mdxSlugs.length
  } legacy TSX route(s), sitemap current`,
)
