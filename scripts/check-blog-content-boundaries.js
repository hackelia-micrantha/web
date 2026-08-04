import assert from "node:assert/strict"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"

import {
  assertRoutableBlogPublication,
  assertRoutableMdxPublication,
  resolvePublicationCutoff,
} from "../app/content/blog-publication.js"
import {
  buildSitemapXml,
  loadBlogContentInventory,
  repositoryRoot,
} from "./blog-content-inventory.js"
import { buildBlogMetadataModule } from "./blog-metadata-projection.js"
import { validateBlogMdxFile } from "./blog-mdx-validation.js"
import { validateBlogMermaidBlocks } from "./blog-mermaid-validation.js"

const routesDirectory = path.join(repositoryRoot, "app/routes")
const legacyDynamicRoutePath = path.join(routesDirectory, "blog.$slug.tsx")
const metadataPath = path.join(repositoryRoot, "app/content/blog.generated.ts")
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

const [inventory, currentMetadata, currentSitemap] = await Promise.all([
  loadBlogContentInventory(),
  readFile(metadataPath, "utf8"),
  readFile(sitemapPath, "utf8"),
])

assertRoutableBlogPublication(inventory.posts, {
  cutoff: publicationCutoff,
})

const mermaidBlockCounts = await Promise.all(
  inventory.posts.map(async (post) => {
    assertRoutableMdxPublication(post, { cutoff: publicationCutoff })
    await validateBlogMdxFile(post.relativePath, inventory)
    return validateBlogMermaidBlocks(post.sourceText, post.relativePath)
  }),
)
const mermaidBlockCount = mermaidBlockCounts.reduce(
  (total, count) => total + count,
  0,
)

assert.equal(
  await pathExists(legacyDynamicRoutePath),
  false,
  "app/routes/blog.$slug.tsx must remain absent after the final TSX migration",
)

const [expectedMetadata, expectedSitemap] = await Promise.all([
  buildBlogMetadataModule(inventory),
  Promise.resolve(buildSitemapXml(inventory)),
])

assert.equal(
  currentMetadata,
  expectedMetadata,
  "app/content/blog.generated.ts is stale; run node scripts/generate-blog-content.js",
)
assert.equal(
  currentSitemap,
  expectedSitemap,
  "public/sitemap.xml is stale; run node scripts/generate-blog-content.js",
)

console.log(
  `Blog content boundaries passed at ${publicationCutoff}: ${inventory.posts.length} canonical MDX post(s), ${inventory.series.length} series, ${mermaidBlockCount} Mermaid block(s), frontmatter projection current, sitemap current`,
)
