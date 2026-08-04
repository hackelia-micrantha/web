import { writeFile } from "node:fs/promises"
import path from "node:path"

import {
  buildSitemapXml,
  loadBlogContentInventory,
  repositoryRoot,
} from "./blog-content-inventory.js"

const inventory = await loadBlogContentInventory()
const sitemapPath = path.join(repositoryRoot, "public/sitemap.xml")

await writeFile(sitemapPath, buildSitemapXml(inventory))

console.log(
  `Generated sitemap for ${inventory.posts.length} post(s) and ${inventory.series.length} series`,
)
