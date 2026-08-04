import { format } from "prettier"

import { buildBlogMetadataModule as buildRawBlogMetadataModule } from "./blog-content-inventory.js"

export async function buildBlogMetadataModule(inventory) {
  return format(buildRawBlogMetadataModule(inventory), {
    parser: "typescript",
  })
}
