import assert from "node:assert/strict"

import { validateBlogMdxSource } from "./blog-mdx-boundary.js"

function document(body) {
  return `---
title: Boundary fixture
---

${body}
`
}

async function expectInvalid(name, body, expected) {
  await assert.rejects(
    validateBlogMdxSource({
      source: document(body),
      filePath: `fixtures/${name}.mdx`,
    }),
    expected,
    name,
  )
}

const validReport = await validateBlogMdxSource({
  filePath: "fixtures/valid.mdx",
  source: document(`## Safe article

Plain **Markdown** with [an internal link](/services), [an external link](https://example.com), and \`inline code\`.

\`\`\`typescript
const governed = true
\`\`\`

<Callout>

The model proposes; the governed boundary authorizes.

</Callout>

<Figure
  src="/img/blog/example.svg"
  alt="Example architecture boundary"
  title="Example boundary"
  caption="A static, local figure."
  narrow
/>

<ControlTable label="Example control responses">
  <ControlRow
    failureMode="Unsafe effect"
    cause="Missing authorization"
    response="Require a governed boundary"
  />
</ControlTable>

Continue with <PostLink slug="safe-related-post">the related note</PostLink>.
`),
})

assert.deepEqual(validReport.components, [
  "Callout",
  "ControlRow",
  "ControlTable",
  "Figure",
  "PostLink",
])
assert.deepEqual(validReport.localAssets, ["/img/blog/example.svg"])
assert.deepEqual(validReport.postLinks, ["safe-related-post"])

await expectInvalid(
  "import",
  'import Widget from "./widget"\n\n## Heading',
  /Executable MDX expressions, imports, and exports are not allowed/,
)
await expectInvalid(
  "export",
  "export const value = 1\n\n## Heading",
  /Executable MDX expressions, imports, and exports are not allowed/,
)
await expectInvalid(
  "expression",
  "## Heading\n\nSecret: {process.env.SECRET}",
  /Executable MDX expressions, imports, and exports are not allowed/,
)
await expectInvalid(
  "expression-prop",
  '<Figure src={asset} alt="Alt" title="Title" caption="Caption" />',
  /must be a non-empty string literal/,
)
await expectInvalid(
  "spread-prop",
  "<Figure {...props} />",
  /Spread and expression attributes are not allowed/,
)
await expectInvalid(
  "raw-script",
  '<script src="https://example.com/script.js" />',
  /Lowercase JSX element <script> is not allowed/,
)
await expectInvalid(
  "raw-iframe",
  '<iframe src="https://example.com" />',
  /Lowercase JSX element <iframe> is not allowed/,
)
await expectInvalid(
  "unknown-component",
  "<ArbitraryWidget />",
  /Unsupported MDX component <ArbitraryWidget>/,
)
await expectInvalid(
  "event-handler",
  '<Callout onClick="run">Text</Callout>',
  /Unsupported prop onClick on <Callout>/,
)
await expectInvalid(
  "javascript-link",
  "[unsafe](javascript:alert(1))",
  /Unsupported link protocol: javascript:/,
)
await expectInvalid(
  "protocol-relative-link",
  "[unsafe](//example.com/path)",
  /Unsafe internal link URL/,
)
await expectInvalid(
  "external-figure",
  '<Figure src="https://example.com/a.svg" alt="Alt" title="Title" caption="Caption" />',
  /Blog assets must be root-relative files under \/img\/blog\//,
)
await expectInvalid(
  "missing-alt",
  '<Figure src="/img/blog/a.svg" title="Title" caption="Caption" />',
  /<Figure> is missing required prop alt/,
)
await expectInvalid(
  "heading-one",
  "# Duplicate page title",
  /Article headings must use levels 2 through 6/,
)
await expectInvalid(
  "control-row-outside-table",
  '<ControlRow failureMode="Failure" cause="Cause" response="Response" />',
  /<ControlRow> must be a direct child of <ControlTable>/,
)
await expectInvalid(
  "control-table-non-row-child",
  '<ControlTable label="Controls">\n\nNot a row.\n\n</ControlTable>',
  /<ControlTable> may contain only <ControlRow> children/,
)
await expectInvalid(
  "legacy-control-table-expression",
  "<ControlTable rows={[{ failureMode: 'Failure' }]} />",
  /Unsupported prop rows on <ControlTable>|must be a non-empty string literal/,
)
await expectInvalid(
  "empty-post-link",
  'Continue <PostLink slug="safe-post"></PostLink> here.',
  /<PostLink> must contain link text/,
)
await expectInvalid(
  "invalid-post-link-slug",
  '<PostLink slug="Unsafe Slug">Post</PostLink>',
  /Invalid PostLink slug/,
)
await expectInvalid(
  "markdown-image-alt",
  "![](/img/blog/example.svg)",
  /Markdown images require non-empty alt text/,
)

console.log("Blog MDX grammar tests passed")
