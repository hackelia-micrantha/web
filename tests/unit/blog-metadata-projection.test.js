import assert from "node:assert/strict"
import test from "node:test"

import { formatBlogMetadataModule } from "../../scripts/blog-metadata-format.js"

const rawMetadata = `// Generated from canonical blog MDX frontmatter. Do not edit by hand.
import type { BlogPost } from "~/content/blog";

export const blogPosts = [{ slug: "formatting-contract" }] satisfies BlogPost[];
`

test("formats generated blog metadata with repository Prettier settings", async () => {
  const generated = await formatBlogMetadataModule(rawMetadata)

  assert.match(
    generated,
    /^\/\/ Generated from canonical blog MDX frontmatter\. Do not edit by hand\./,
  )
  assert.match(generated, /import type \{ BlogPost \} from "~\/content\/blog"\n/)
  assert.match(generated, /\] satisfies BlogPost\[\]\n$/)
  assert.doesNotMatch(generated, /;\n/)
})
