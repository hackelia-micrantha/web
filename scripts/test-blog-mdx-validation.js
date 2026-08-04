import assert from "node:assert/strict"

import { validateBlogMdxSource } from "./blog-mdx-validation.js"

const knownPostSlugs = new Set(["current-post", "related-post"])
const relativePath = "app/routes/blog.current-post/content.mdx"
const frontmatter = `---
title: Test
---

`

async function validate(body, assetExists = async () => true) {
  return validateBlogMdxSource({
    assetExists,
    knownPostSlugs,
    relativePath,
    source: `${frontmatter}${body}`,
  })
}

await validate(`# Heading

<Callout>Govern the boundary.</Callout>

<Figure
  title="Architecture"
  caption="A controlled boundary."
  src="/img/blog/example.svg"
  alt="A boundary diagram"
  narrow
/>

See <PostLink slug="related-post">the related post</PostLink>.

<ControlTable
  rows={[
    {
      failureMode: "Unsafe write",
      cause: "Missing authorization",
      response: "Require an approval boundary",
    },
  ]}
/>
`)

const invalidCases = [
  ["ESM", "export const unsafe = true", /imports or exports/u],
  ["expression", "{Date.now()}", /arbitrary JavaScript expressions/u],
  ["raw element", "<script />", /unsupported MDX component script/u],
  ["unknown component", "<Widget />", /unsupported MDX component Widget/u],
  [
    "event prop",
    '<Callout onClick="unsafe">Text</Callout>',
    /does not allow component attribute onClick/u,
  ],
  [
    "unsafe asset URL",
    '<Figure title="x" caption="x" src="javascript:alert(1)" alt="x" />',
    /root-relative local asset URL/u,
  ],
  [
    "unknown post",
    '<PostLink slug="missing">Missing</PostLink>',
    /unknown post missing/u,
  ],
  [
    "executable table value",
    '<ControlTable rows={[{ failureMode: makeValue(), cause: "x", response: "x" }]} />',
    /failureMode must be a string literal/u,
  ],
  [
    "spread prop",
    "<Callout {...props}>Text</Callout>",
    /spread or expression attributes/u,
  ],
]

for (const [name, body, message] of invalidCases) {
  await assert.rejects(validate(body), message, name)
}

await assert.rejects(
  validate(
    '<Figure title="x" caption="x" src="/img/blog/missing.svg" alt="x" />',
    async () => false,
  ),
  /references missing asset/u,
)

console.log(
  `Blog MDX validation tests passed: 1 valid case, ${invalidCases.length + 1} rejected cases`,
)
