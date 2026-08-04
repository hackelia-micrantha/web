import assert from "node:assert/strict"
import test from "node:test"

import { buildBlogMetadataModule } from "../../scripts/blog-metadata-projection.js"

const inventory = {
  posts: [
    {
      slug: "formatting-contract",
      status: "published",
      title: "Formatting Contract",
      description: "Generated metadata follows repository formatting.",
      date: "2026-08-03",
      excerpt: "A focused generator regression.",
      tags: ["testing"],
      relatedSlugs: ["formatting-contract-related"],
      series: {
        slug: "generator-contract",
        order: 1,
      },
    },
  ],
}

test("formats generated blog metadata with repository Prettier settings", async () => {
  const generated = await buildBlogMetadataModule(inventory)

  assert.match(
    generated,
    /^\/\/ Generated from canonical blog MDX frontmatter\. Do not edit by hand\./,
  )
  assert.match(generated, /import type \{ BlogPost \} from "~\/content\/blog"\n/)
  assert.match(generated, /\] satisfies BlogPost\[\]\n$/)
  assert.doesNotMatch(generated, /;\n/)
})
