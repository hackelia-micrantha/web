import { format, resolveConfig } from "prettier"

import {
  buildBlogMetadataModule as buildRawBlogMetadataModule,
  repositoryRoot,
} from "./blog-content-inventory.js"

export async function buildBlogMetadataModule(inventory) {
  const repositoryConfig = (await resolveConfig(repositoryRoot)) ?? {}

  return format(buildRawBlogMetadataModule(inventory), {
    ...repositoryConfig,
    parser: "typescript",
  })
}
