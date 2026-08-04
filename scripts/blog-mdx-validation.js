import assert from "node:assert/strict"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"

import { createProcessor } from "@mdx-js/mdx"
import ts from "typescript"

import { repositoryRoot } from "./blog-content-inventory.js"

const mdxProcessor = createProcessor({ format: "mdx" })
const publicDirectory = path.join(repositoryRoot, "public")

const allowedComponents = new Set([
  "Callout",
  "ControlTable",
  "Figure",
  "PostLink",
])

function contextFor(relativePath, node) {
  const start = node?.position?.start
  return start
    ? `${relativePath}:${start.line}:${start.column}`
    : relativePath
}

function stripFrontmatter(source, relativePath) {
  const normalized = source.replaceAll("\r\n", "\n")

  assert.ok(
    normalized.startsWith("---\n"),
    `${relativePath} must begin with YAML frontmatter`,
  )

  const closingDelimiter = normalized.indexOf("\n---\n", 4)

  assert.notEqual(
    closingDelimiter,
    -1,
    `${relativePath} is missing its closing frontmatter delimiter`,
  )

  return normalized.slice(closingDelimiter + "\n---\n".length)
}

function assertSafeLinkUrl(url, context) {
  assert.equal(url, url.trim(), `${context} URL must not contain outer whitespace`)
  assert.notEqual(url, "", `${context} URL must not be empty`)
  assert.equal(
    /[\u0000-\u001f\u007f]/u.test(url),
    false,
    `${context} URL contains control characters`,
  )
  assert.equal(
    url.includes("\\"),
    false,
    `${context} URL must not contain backslashes`,
  )

  if (url.startsWith("#")) {
    assert.ok(url.length > 1, `${context} fragment must not be empty`)
    return
  }

  if (url.startsWith("/")) {
    assert.equal(
      url.startsWith("//"),
      false,
      `${context} URL must not be protocol-relative`,
    )
    assert.equal(
      url.split(/[?#]/u)[0].split("/").includes(".."),
      false,
      `${context} URL must not traverse parent directories`,
    )
    return
  }

  const parsed = new URL(url)
  assert.ok(
    ["http:", "https:", "mailto:"].includes(parsed.protocol),
    `${context} uses unsupported protocol ${parsed.protocol}`,
  )
}

function assertLocalAssetUrl(url, context) {
  assert.match(
    url,
    /^\/[-A-Za-z0-9_./]+$/u,
    `${context} must be a root-relative local asset URL`,
  )
  assert.equal(
    url.startsWith("//"),
    false,
    `${context} must not be protocol-relative`,
  )
  assert.equal(
    url.split("/").includes(".."),
    false,
    `${context} must not traverse parent directories`,
  )
}

async function repositoryAssetExists(url) {
  const absolutePath = path.resolve(publicDirectory, `.${url}`)

  if (
    absolutePath !== publicDirectory &&
    !absolutePath.startsWith(`${publicDirectory}${path.sep}`)
  ) {
    return false
  }

  try {
    return (await stat(absolutePath)).isFile()
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

function readAttributes(node, relativePath) {
  const context = contextFor(relativePath, node)
  const attributes = new Map()

  for (const attribute of node.attributes ?? []) {
    assert.equal(
      attribute.type,
      "mdxJsxAttribute",
      `${context} does not allow spread or expression attributes`,
    )
    assert.equal(
      typeof attribute.name,
      "string",
      `${context} component attribute names must be plain identifiers`,
    )
    assert.equal(
      attributes.has(attribute.name),
      false,
      `${context} repeats component attribute ${attribute.name}`,
    )
    attributes.set(attribute.name, attribute.value)
  }

  return attributes
}

function assertOnlyAttributes(attributes, allowed, context) {
  for (const name of attributes.keys()) {
    assert.ok(
      allowed.has(name),
      `${context} does not allow component attribute ${name}`,
    )
    assert.equal(
      /^on[A-Z]/u.test(name),
      false,
      `${context} does not allow event-handler props`,
    )
  }
}

function requiredStringAttribute(attributes, name, context) {
  assert.ok(
    attributes.has(name),
    `${context} is missing required attribute ${name}`,
  )
  const value = attributes.get(name)

  assert.equal(
    typeof value,
    "string",
    `${context}.${name} must be a string literal`,
  )
  assert.notEqual(value.trim(), "", `${context}.${name} must not be empty`)

  return value
}

function parseExpression(expression, context) {
  const sourceFile = ts.createSourceFile(
    "blog-mdx-expression.ts",
    `const value = (${expression})`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

  assert.equal(
    sourceFile.parseDiagnostics.length,
    0,
    `${context} must be valid literal JavaScript`,
  )

  const statement = sourceFile.statements[0]
  assert.ok(
    statement && ts.isVariableStatement(statement),
    `${context} must be a literal expression`,
  )

  const initializer = statement.declarationList.declarations[0]?.initializer
  assert.ok(initializer, `${context} must contain an expression`)

  return ts.isParenthesizedExpression(initializer)
    ? initializer.expression
    : initializer
}

function literalString(node, context) {
  assert.ok(
    ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node),
    `${context} must be a string literal`,
  )
  assert.notEqual(node.text.trim(), "", `${context} must not be empty`)
  return node.text
}

function validateControlTableRows(expression, context) {
  const node = parseExpression(expression, context)

  assert.ok(
    ts.isArrayLiteralExpression(node),
    `${context} must be an array literal`,
  )
  assert.ok(
    node.elements.length > 0,
    `${context} must contain at least one row`,
  )

  const failureModes = []

  for (const [index, element] of node.elements.entries()) {
    const rowContext = `${context}[${index}]`
    assert.ok(
      ts.isObjectLiteralExpression(element),
      `${rowContext} must be an object literal`,
    )

    const values = new Map()

    for (const property of element.properties) {
      assert.ok(
        ts.isPropertyAssignment(property),
        `${rowContext} allows only property assignments`,
      )
      assert.ok(
        ts.isIdentifier(property.name) || ts.isStringLiteral(property.name),
        `${rowContext} property names must be literals`,
      )

      const name = property.name.text
      assert.ok(
        ["failureMode", "cause", "response"].includes(name),
        `${rowContext} contains unsupported property ${name}`,
      )
      assert.equal(
        values.has(name),
        false,
        `${rowContext} repeats property ${name}`,
      )
      values.set(
        name,
        literalString(property.initializer, `${rowContext}.${name}`),
      )
    }

    assert.deepEqual(
      [...values.keys()].sort(),
      ["cause", "failureMode", "response"],
      `${rowContext} must define failureMode, cause, and response`,
    )
    failureModes.push(values.get("failureMode"))
  }

  assert.equal(
    new Set(failureModes).size,
    failureModes.length,
    `${context} contains duplicate failureMode values`,
  )
}

async function validateComponent(node, options) {
  const { assetExists, knownPostSlugs, relativePath } = options
  const context = contextFor(relativePath, node)

  assert.equal(
    typeof node.name,
    "string",
    `${context} does not allow JSX fragments`,
  )
  assert.ok(
    allowedComponents.has(node.name),
    `${context} uses unsupported MDX component ${node.name}`,
  )

  const attributes = readAttributes(node, relativePath)

  if (node.name === "Callout") {
    assertOnlyAttributes(attributes, new Set(), context)
    assert.ok(
      node.children?.length > 0,
      `${context} Callout must contain content`,
    )
    return
  }

  if (node.name === "PostLink") {
    assertOnlyAttributes(attributes, new Set(["slug"]), context)
    const slug = requiredStringAttribute(attributes, "slug", context)
    assert.ok(
      knownPostSlugs.has(slug),
      `${context} references unknown post ${slug}`,
    )
    assert.ok(
      node.children?.length > 0,
      `${context} PostLink must contain link text`,
    )
    return
  }

  if (node.name === "Figure") {
    assertOnlyAttributes(
      attributes,
      new Set(["alt", "caption", "narrow", "src", "title"]),
      context,
    )

    requiredStringAttribute(attributes, "alt", context)
    requiredStringAttribute(attributes, "caption", context)
    requiredStringAttribute(attributes, "title", context)
    const src = requiredStringAttribute(attributes, "src", context)

    if (attributes.has("narrow")) {
      assert.equal(
        attributes.get("narrow"),
        null,
        `${context}.narrow must use boolean shorthand`,
      )
    }

    assert.equal(
      node.children?.length ?? 0,
      0,
      `${context} Figure must be self-closing`,
    )
    assertLocalAssetUrl(src, `${context}.src`)
    assert.equal(
      await assetExists(src),
      true,
      `${context}.src references missing asset ${src}`,
    )
    return
  }

  assertOnlyAttributes(attributes, new Set(["rows"]), context)
  assert.equal(
    node.children?.length ?? 0,
    0,
    `${context} ControlTable must be self-closing`,
  )
  assert.ok(
    attributes.has("rows"),
    `${context} is missing required attribute rows`,
  )

  const rows = attributes.get("rows")
  assert.equal(
    rows?.type,
    "mdxJsxAttributeValueExpression",
    `${context}.rows must be a controlled array expression`,
  )
  validateControlTableRows(rows.value, `${context}.rows`)
}

async function validateNode(node, options) {
  const context = contextFor(options.relativePath, node)

  if (node.type === "mdxjsEsm") {
    assert.fail(`${context} does not allow MDX imports or exports`)
  }

  if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
    assert.fail(`${context} does not allow arbitrary JavaScript expressions`)
  }

  if (node.type === "html") {
    assert.fail(`${context} does not allow raw HTML`)
  }

  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    await validateComponent(node, options)
  }

  if (node.type === "link" || node.type === "definition") {
    assertSafeLinkUrl(node.url, context)
  }

  if (node.type === "image") {
    assertLocalAssetUrl(node.url, context)
    assert.equal(
      await options.assetExists(node.url),
      true,
      `${context} references missing asset ${node.url}`,
    )
  }

  if (node.type === "imageReference") {
    assert.fail(`${context} does not allow reference-style images`)
  }

  for (const child of node.children ?? []) {
    await validateNode(child, options)
  }
}

export async function validateBlogMdxSource({
  assetExists = repositoryAssetExists,
  knownPostSlugs,
  relativePath,
  source,
}) {
  assert.ok(knownPostSlugs instanceof Set, "knownPostSlugs must be a Set")

  const body = stripFrontmatter(source, relativePath)
  const tree = mdxProcessor.parse({ path: relativePath, value: body })

  await validateNode(tree, {
    assetExists,
    knownPostSlugs,
    relativePath,
  })
}

export async function validateBlogMdxFile(relativePath, inventory) {
  const source = await readFile(path.join(repositoryRoot, relativePath), "utf8")

  await validateBlogMdxSource({
    knownPostSlugs: new Set(inventory.posts.map((post) => post.slug)),
    relativePath,
    source,
  })
}
