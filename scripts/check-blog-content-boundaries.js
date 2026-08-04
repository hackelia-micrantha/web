import assert from "node:assert/strict"
import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"

import {
  assertRoutableBlogPublication,
  assertRoutableMdxPublication,
  resolvePublicationCutoff,
} from "../app/content/blog-publication.js"
import {
  assertBlogPostContentOptional,
  buildSitemapXml,
  loadBlogContentInventory,
  repositoryRoot,
} from "./blog-content-inventory.js"
import { validateBlogMdxFile } from "./blog-mdx-validation.js"

const routesDirectory = path.join(repositoryRoot, "app/routes")
const sitemapPath = path.join(repositoryRoot, "public/sitemap.xml")
const publicationCutoff = resolvePublicationCutoff(
  process.env.BLOG_PUBLICATION_DATE,
)

async function pathExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

function readFrontmatterField(frontmatter, name, routeName) {
  const matchingLines = frontmatter
    .split("\n")
    .filter((candidate) => candidate.startsWith(`${name}:`))

  assert.equal(
    matchingLines.length,
    1,
    `MDX route ${routeName} must declare ${name} frontmatter exactly once`,
  )

  const value = matchingLines[0]
    .slice(name.length + 1)
    .trim()
    .replace(/^(["'])|(["'])$/g, "")

  assert.notEqual(value, "", `MDX route ${routeName} has empty ${name}`)

  return value
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

    const source = (await readFile(contentPath, "utf8")).replaceAll("\r\n", "\n")
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1]

    assert.ok(frontmatter, `MDX route ${entry.name} is missing frontmatter`)

    const slug = entry.name.slice("blog.".length)
    const declaredSlug = readFrontmatterField(frontmatter, "slug", entry.name)

    assert.equal(
      declaredSlug,
      slug,
      `MDX route ${entry.name} frontmatter slug must match its route`,
    )

    routes.push({
      relativePath: path.relative(repositoryRoot, contentPath),
      slug,
      date: readFrontmatterField(frontmatter, "date", entry.name),
      status: readFrontmatterField(frontmatter, "status", entry.name),
    })
  }

  assert.equal(
    new Set(routes.map((route) => route.slug)).size,
    routes.length,
    "Static MDX routes contain duplicate slugs",
  )

  return routes.sort((left, right) => left.slug.localeCompare(right.slug))
}

await assertBlogPostContentOptional()

const [mdxRoutes, inventory, currentSitemap] = await Promise.all([
  discoverMdxRoutes(),
  loadBlogContentInventory(),
  readFile(sitemapPath, "utf8"),
])

assertRoutableBlogPublication(inventory.posts, {
  cutoff: publicationCutoff,
})

await Promise.all(
  mdxRoutes.map(async (route) => {
    assertRoutableMdxPublication(route, { cutoff: publicationCutoff })
    await validateBlogMdxFile(route.relativePath, inventory)
  }),
)

const mdxSlugs = mdxRoutes.map((route) => route.slug)

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
  `Blog content boundaries passed at ${publicationCutoff}: ${inventory.posts.length} published post(s), ${inventory.series.length} series, ${mdxSlugs.length} MDX route(s), ${
    inventory.posts.length - mdxSlugs.length
  } legacy TSX route(s), MDX grammar enforced, sitemap current`,
)
