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
import { validateBlogMermaidBlocks } from "./blog-mermaid-validation.js"

const routesDirectory = path.join(repositoryRoot, "app/routes")
const legacyDynamicRoutePath = path.join(routesDirectory, "blog.$slug.tsx")
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
  const line = frontmatter
    .split("\n")
    .find((candidate) => candidate.startsWith(`${name}:`))

  assert.ok(line, `MDX route ${routeName} is missing ${name} frontmatter`)

  const value = line
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

    const source = await readFile(contentPath, "utf8")
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
      source,
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

const mermaidBlockCounts = await Promise.all(
  mdxRoutes.map(async (route) => {
    await validateBlogMdxFile(route.relativePath, inventory)
    return validateBlogMermaidBlocks(route.source, route.relativePath)
  }),
)
const mermaidBlockCount = mermaidBlockCounts.reduce(
  (total, count) => total + count,
  0,
)

for (const route of mdxRoutes) {
  assertRoutableMdxPublication(route, { cutoff: publicationCutoff })

  const post = inventory.postsBySlug.get(route.slug)

  assert.ok(post, `MDX route ${route.slug} is missing registry metadata`)
  assert.equal(
    post.hasContent,
    false,
    `MDX route ${route.slug} still has a legacy Content renderer in ${post.source}`,
  )
}

const mdxSlugs = mdxRoutes.map((route) => route.slug)
const legacyPosts = inventory.posts.filter(
  (post) => !mdxSlugs.includes(post.slug),
)

for (const post of legacyPosts) {
  assert.equal(
    post.hasContent,
    true,
    `Legacy TSX post ${post.slug} is missing its Content renderer in ${post.source}`,
  )
}

assert.equal(
  await pathExists(legacyDynamicRoutePath),
  legacyPosts.length > 0,
  legacyPosts.length > 0
    ? "Legacy TSX posts require app/routes/blog.$slug.tsx"
    : "app/routes/blog.$slug.tsx must be removed after the final TSX migration",
)

const expectedSitemap = buildSitemapXml(inventory)

assert.equal(
  currentSitemap,
  expectedSitemap,
  "public/sitemap.xml is stale; run node scripts/generate-sitemap.js",
)

console.log(
  `Blog content boundaries passed at ${publicationCutoff}: ${inventory.posts.length} published post(s), ${inventory.series.length} series, ${mdxSlugs.length} MDX route(s), ${legacyPosts.length} legacy TSX route(s), ${mermaidBlockCount} Mermaid block(s), MDX grammar enforced, sitemap current`,
)
