import path from "node:path"

import { format, resolveConfig } from "prettier"

import {
  buildBlogMetadataModule as buildRawBlogMetadataModule,
  repositoryRoot,
} from "./blog-content-inventory.js"

const metadataPath = path.join(repositoryRoot, "app/content/blog.generated.ts")

export async function buildBlogMetadataModule(inventory) {
  const repositoryConfig = (await resolveConfig(metadataPath)) ?? {}

  return format(buildRawBlogMetadataModule(inventory), {
    ...repositoryConfig,
    parser: "typescript",
  })
}
