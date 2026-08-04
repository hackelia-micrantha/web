import { writeFile } from "node:fs/promises"
import path from "node:path"

import {
  assertRoutableBlogPublication,
  resolvePublicationCutoff,
} from "../app/content/blog-publication.js"
import {
  buildSitemapXml,
  loadBlogContentInventory,
  repositoryRoot,
} from "./blog-content-inventory.js"

const inventory = await loadBlogContentInventory()
const publicationCutoff = resolvePublicationCutoff(
  process.env.BLOG_PUBLICATION_DATE,
)
const sitemapPath = path.join(repositoryRoot, "public/sitemap.xml")

assertRoutableBlogPublication(inventory.posts, {
  cutoff: publicationCutoff,
})

await writeFile(sitemapPath, buildSitemapXml(inventory))

console.log(
  `Generated sitemap at ${publicationCutoff} for ${inventory.posts.length} published post(s) and ${inventory.series.length} series`,
)
