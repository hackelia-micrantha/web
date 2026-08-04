import { writeFile } from "node:fs/promises"
import path from "node:path"

import {
  buildSitemapXml,
  loadBlogContentInventory,
  repositoryRoot,
} from "./blog-content-inventory.js"
import { buildBlogMetadataModule } from "./blog-metadata-projection.js"

const inventory = await loadBlogContentInventory()
const metadataPath = path.join(repositoryRoot, "app/content/blog.generated.ts")
const sitemapPath = path.join(repositoryRoot, "public/sitemap.xml")
const metadata = await buildBlogMetadataModule(inventory)

await Promise.all([
  writeFile(metadataPath, metadata),
  writeFile(sitemapPath, buildSitemapXml(inventory)),
])

console.log(
  `Generated metadata and sitemap from ${inventory.posts.length} canonical MDX post(s) and ${inventory.series.length} series`,
)
