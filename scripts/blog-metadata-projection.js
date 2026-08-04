import { readFile } from "node:fs/promises"
import path from "node:path"

import { format } from "prettier"

import {
  buildBlogMetadataModule as buildRawBlogMetadataModule,
  repositoryRoot,
} from "./blog-content-inventory.js"

const prettierConfig = JSON.parse(
  await readFile(path.join(repositoryRoot, ".prettierrc.json"), "utf8"),
)

export async function buildBlogMetadataModule(inventory) {
  return format(buildRawBlogMetadataModule(inventory), {
    ...prettierConfig,
    parser: "typescript",
  })
}
