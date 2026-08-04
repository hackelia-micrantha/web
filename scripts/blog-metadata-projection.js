import { buildBlogMetadataModule as buildRawBlogMetadataModule } from "./blog-content-inventory.js"
import { formatBlogMetadataModule } from "./blog-metadata-format.js"

export function buildBlogMetadataModule(inventory) {
  return formatBlogMetadataModule(buildRawBlogMetadataModule(inventory))
}
