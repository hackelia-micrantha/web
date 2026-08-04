import { readFile } from "node:fs/promises"
import path from "node:path"

import { format } from "prettier"

const repositoryRoot = process.cwd()
const prettierConfig = JSON.parse(
  await readFile(path.join(repositoryRoot, ".prettierrc.json"), "utf8"),
)

export function formatBlogMetadataModule(source) {
  return format(source, {
    ...prettierConfig,
    parser: "typescript",
  })
}
