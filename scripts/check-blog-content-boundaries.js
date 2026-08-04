import assert from "node:assert/strict"
import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"

import {
  assertBlogPostContentOptional,
  buildSitemapXml,
  loadBlogContentInventory,
  repositoryRoot,
} from "./blog-content-inventory.js"
import { validateBlogMdxSource } from "./blog-mdx-boundary.js"

const routesDirectory = path.join(repositoryRoot, "app/routes")
const publicDirectory = path.join(repositoryRoot, "public")
const sitemapPath = path.join(publicDirectory, "sitemap.xml")

async function pathExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

async function discoverMdxRoutes() {
  const entries = await readdir(routesDirectory, { withFileTypes: true })
  const routes = []

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("blog.")) continue

    const routeDirectory = path.join(routesDirectory, entry.name)
    const contentPath = path.join(routeDirectory, "content.mdx")
    const hasMdx = await pathExists(contentPath)

    if (!hasMdx) continue

    assert.equal(
      await pathExists(path.join(routeDirectory, "route.tsx")),
      true,
      `MDX route ${entry.name} is missing route.tsx`,
    )

    routes.push({
      contentPath,
      slug: entry.name.slice("blog.".length),
    })
  }

  assert.equal(
    new Set(routes.map((route) => route.slug)).size,
    routes.length,
    "Static MDX routes contain duplicate slugs",
  )

  return routes.sort((left, right) => left.slug.localeCompare(right.slug))
}

async function validateMdxRoute(route, inventory) {
  const relativePath = path.relative(repositoryRoot, route.contentPath)
  const source = await readFile(route.contentPath, "utf8")
  const report = await validateBlogMdxSource({
    source,
    filePath: relativePath,
  })

  for (const linkedSlug of report.postLinks) {
    assert.notEqual(
      linkedSlug,
      route.slug,
      `${relativePath} contains a self-referencing PostLink`,
    )
    assert.ok(
      inventory.postsBySlug.has(linkedSlug),
      `${relativePath} references unknown PostLink slug ${linkedSlug}`,
    )
  }

  for (const assetPath of report.localAssets) {
    const filePath = path.resolve(publicDirectory, assetPath.slice(1))

    assert.ok(
      filePath.startsWith(`${publicDirectory}${path.sep}`),
      `${relativePath} resolves outside public/: ${assetPath}`,
    )
    assert.equal(
      await pathExists(filePath),
      true,
      `${relativePath} references missing local asset ${assetPath}`,
    )
  }

  return report
}

await assertBlogPostContentOptional()

const [mdxRoutes, inventory, currentSitemap] = await Promise.all([
  discoverMdxRoutes(),
  loadBlogContentInventory(),
  readFile(sitemapPath, "utf8"),
])

const mdxSlugs = mdxRoutes.map((route) => route.slug)
const mdxReports = await Promise.all(
  mdxRoutes.map((route) => validateMdxRoute(route, inventory)),
)

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

const componentCount = mdxReports.reduce(
  (count, report) => count + report.components.length,
  0,
)

console.log(
  `Blog content boundaries passed: ${inventory.posts.length} post(s), ${inventory.series.length} series, ${mdxSlugs.length} MDX route(s), ${
    inventory.posts.length - mdxSlugs.length
  } legacy TSX route(s), ${componentCount} approved component type(s), sitemap current`,
)
