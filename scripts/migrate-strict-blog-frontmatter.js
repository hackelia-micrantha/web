import assert from "node:assert/strict"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const repositoryRoot = process.cwd()

async function replaceInFile(relativePath, replacements) {
  const filePath = path.join(repositoryRoot, relativePath)
  let source = await readFile(filePath, "utf8")

  for (const { before, after } of replacements) {
    const first = source.indexOf(before)
    assert.notEqual(first, -1, `${relativePath} is missing expected migration input`)
    assert.equal(
      source.indexOf(before, first + before.length),
      -1,
      `${relativePath} contains duplicate migration input`,
    )
    source = `${source.slice(0, first)}${after}${source.slice(first + before.length)}`
  }

  await writeFile(filePath, source)
  console.log(`Migrated ${relativePath}`)
}

await replaceInFile("scripts/blog-content-inventory.js", [
  {
    before: 'import ts from "typescript"\n',
    after: `import ts from "typescript"\n\nimport {\n  assertKnownBlogFrontmatterFields,\n  assertKnownBlogSeriesFields,\n  getBlogLastModifiedDate,\n  parseBlogCalendarDate,\n  readOptionalBlogUpdatedAt,\n} from "./blog-frontmatter-schema.js"\n`,
  },
  {
    before: `function parseCalendarDate(value, context) {\n  assert.match(value, /^\\d{4}-\\d{2}-\\d{2}$/, \`${"${context}"} must be YYYY-MM-DD\`)\n\n  const parsed = new Date(\`${"${value}"}T00:00:00Z\`)\n  assert.equal(\n    Number.isNaN(parsed.valueOf()),\n    false,\n    \`${"${context}"} must be a valid calendar date\`,\n  )\n  assert.equal(\n    parsed.toISOString().slice(0, 10),\n    value,\n    \`${"${context}"} must be a valid calendar date\`,\n  )\n\n  return value\n}\n\n`,
    after: "",
  },
  {
    before: `  assert.ok(\n    value && typeof value === "object" && !Array.isArray(value),\n    \`${"${relativePath}"}.series must be an object\`,\n  )\n  assert.equal(\n`,
    after: `  assert.ok(\n    value && typeof value === "object" && !Array.isArray(value),\n    \`${"${relativePath}"}.series must be an object\`,\n  )\n  assertKnownBlogSeriesFields(value, relativePath)\n  assert.equal(\n`,
  },
  {
    before: `    const attributes = parseFrontmatter(sourceText, relativePath)\n    const slug = requiredString(attributes, "slug", relativePath)\n`,
    after: `    const attributes = parseFrontmatter(sourceText, relativePath)\n    assertKnownBlogFrontmatterFields(attributes, relativePath)\n    const slug = requiredString(attributes, "slug", relativePath)\n`,
  },
  {
    before: `    const status = requiredString(attributes, "status", relativePath)\n    const tags = requiredStringArray(attributes, "tags", relativePath)\n`,
    after: `    const status = requiredString(attributes, "status", relativePath)\n    const date = parseBlogCalendarDate(\n      requiredString(attributes, "date", relativePath),\n      \`${"${relativePath}"}.date\`,\n    )\n    const updatedAt = readOptionalBlogUpdatedAt(attributes, date, relativePath)\n    const tags = requiredStringArray(attributes, "tags", relativePath)\n`,
  },
  {
    before: `      date: parseCalendarDate(\n        requiredString(attributes, "date", relativePath),\n        \`${"${relativePath}"}.date\`,\n      ),\n      excerpt: requiredString(attributes, "excerpt", relativePath),\n`,
    after: `      date,\n      ...(updatedAt ? { updatedAt } : {}),\n      excerpt: requiredString(attributes, "excerpt", relativePath),\n`,
  },
  {
    before: `    date: post.date,\n    excerpt: post.excerpt,\n`,
    after: `    date: post.date,\n    ...(post.updatedAt ? { updatedAt: post.updatedAt } : {}),\n    excerpt: post.excerpt,\n`,
  },
  {
    before: `.map((post) => post.date)\n`,
    after: `.map(getBlogLastModifiedDate)\n`,
  },
  {
    before: `        lastmod: post.date,\n`,
    after: `        lastmod: getBlogLastModifiedDate(post),\n`,
  },
  {
    before: `      lastmod: post.date,\n`,
    after: `      lastmod: getBlogLastModifiedDate(post),\n`,
  },
])

await replaceInFile("app/content/blog.ts", [
  {
    before: `  date: string\n  excerpt: string\n`,
    after: `  date: string\n  updatedAt?: string\n  excerpt: string\n`,
  },
])

await replaceInFile("app/content/blog-mdx-route.tsx", [
  {
    before: `      publishedTime: \`${"${post.date}"}T00:00:00Z\`,\n      tags: post.tags,\n`,
    after: `      publishedTime: \`${"${post.date}"}T00:00:00Z\`,\n      modifiedTime: post.updatedAt\n        ? \`${"${post.updatedAt}"}T00:00:00Z\`\n        : undefined,\n      tags: post.tags,\n`,
  },
  {
    before: `      datePublished: \`${"${post.date}"}T00:00:00Z\`,\n      keywords: post.tags,\n`,
    after: `      datePublished: \`${"${post.date}"}T00:00:00Z\`,\n      dateModified: post.updatedAt\n        ? \`${"${post.updatedAt}"}T00:00:00Z\`\n        : undefined,\n      keywords: post.tags,\n`,
  },
])

await replaceInFile("app/utils/seo.ts", [
  {
    before: `  publishedTime: string\n  tags?: string[]\n`,
    after: `  publishedTime: string\n  modifiedTime?: string\n  tags?: string[]\n`,
  },
  {
    before: `  datePublished: string\n  keywords?: string[]\n`,
    after: `  datePublished: string\n  dateModified?: string\n  keywords?: string[]\n`,
  },
  {
    before: `  publishedTime,\n  tags = [],\n`,
    after: `  publishedTime,\n  modifiedTime,\n  tags = [],\n`,
  },
  {
    before: `    { property: "article:published_time", content: publishedTime },\n    ...tags.map`,
    after: `    { property: "article:published_time", content: publishedTime },\n    ...(modifiedTime\n      ? [{ property: "article:modified_time", content: modifiedTime }]\n      : []),\n    ...tags.map`,
  },
  {
    before: `  datePublished,\n  keywords = [],\n`,
    after: `  datePublished,\n  dateModified,\n  keywords = [],\n`,
  },
  {
    before: `    datePublished,\n    author: {\n`,
    after: `    datePublished,\n    ...(dateModified ? { dateModified } : {}),\n    author: {\n`,
  },
])

await replaceInFile(
  "app/routes/blog.recursive-governance-and-agent-workflows/content.mdx",
  [
    {
      before: `date: "2026-05-18"\nexcerpt:`,
      after: `date: "2026-05-18"\nupdatedAt: "2026-08-03"\nexcerpt:`,
    },
  ],
)

await replaceInFile("scripts/test-cloudflare-adapter.js", [
  {
    before: `assert.doesNotMatch(recursiveArticle.body, /data-mermaid-rendered/)\nassertDocumentHeaders(recursiveArticle.response, recursiveArticle.body)\n`,
    after: `assert.doesNotMatch(recursiveArticle.body, /data-mermaid-rendered/)\nassert.match(\n  recursiveArticle.body,\n  /property="article:modified_time" content="2026-08-03T00:00:00Z"/,\n)\nassert.match(\n  recursiveArticle.body,\n  /"dateModified":"2026-08-03T00:00:00Z"/,\n)\nassertDocumentHeaders(recursiveArticle.response, recursiveArticle.body)\n`,
  },
])

await replaceInFile("docs/architecture/blog-publication-workflow.md", [
  {
    before: `date: "2026-08-03"\nexcerpt:`,
    after: `date: "2026-08-03"\nupdatedAt: "2026-08-03" # optional; must be on or after date\nexcerpt:`,
  },
  {
    before: `The frontmatter parser is intentionally strict. Unknown structure, missing fields, invalid dates, duplicate tags or related posts, unknown related slugs, self-references, invalid series membership, duplicate order values, and series ordering gaps fail validation.\n`,
    after: `The frontmatter parser is intentionally strict. Unknown top-level fields, unknown nested series fields, missing fields, invalid dates, an \`updatedAt\` value before \`date\`, duplicate tags or related posts, unknown related slugs, self-references, invalid series membership, duplicate order values, and series ordering gaps fail validation. When present, \`updatedAt\` is projected into article metadata and JSON-LD and becomes the sitemap \`lastmod\` value.\n`,
  },
])
