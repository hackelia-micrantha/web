import { compile } from "@mdx-js/mdx"

const allowedMarkdownNodes = new Set([
  "blockquote",
  "break",
  "code",
  "delete",
  "emphasis",
  "heading",
  "image",
  "inlineCode",
  "link",
  "list",
  "listItem",
  "paragraph",
  "root",
  "strong",
  "text",
  "thematicBreak",
])

const phrasingNodes = new Set([
  "break",
  "delete",
  "emphasis",
  "inlineCode",
  "strong",
  "text",
])

const componentSchemas = {
  Callout: {
    kind: "flow",
    props: {},
    requiredProps: [],
    children: "content",
  },
  ControlRow: {
    kind: "flow",
    props: {
      cause: "string",
      failureMode: "string",
      response: "string",
    },
    requiredProps: ["cause", "failureMode", "response"],
    children: "none",
  },
  ControlTable: {
    kind: "flow",
    props: {
      label: "string",
    },
    requiredProps: ["label"],
    children: "rows",
  },
  Figure: {
    kind: "flow",
    props: {
      alt: "string",
      caption: "string",
      narrow: "boolean",
      src: "string",
      title: "string",
    },
    requiredProps: ["alt", "caption", "src", "title"],
    children: "none",
  },
  PostLink: {
    kind: "text",
    props: {
      slug: "string",
    },
    requiredProps: ["slug"],
    children: "phrasing",
  },
}

function nodeLocation(node) {
  const line = node?.position?.start?.line
  const column = node?.position?.start?.column

  return line && column ? `:${line}:${column}` : ""
}

function boundaryError(filePath, node, message) {
  throw new Error(`${filePath}${nodeLocation(node)}: ${message}`)
}

function stripFrontmatter(source, filePath) {
  const normalized = source.replace(/^\uFEFF/, "")
  const lines = normalized.split(/\r?\n/)

  if (lines[0] !== "---") {
    throw new Error(`${filePath}: MDX content must begin with YAML frontmatter`)
  }

  const closingIndex = lines.indexOf("---", 1)

  if (closingIndex === -1) {
    throw new Error(`${filePath}: MDX frontmatter is missing its closing delimiter`)
  }

  return lines.slice(closingIndex + 1).join("\n")
}

function isWhitespaceText(node) {
  return node.type === "text" && node.value.trim() === ""
}

function validateExternalOrInternalLink(value, filePath, node) {
  if (/^[\u0000-\u0020\u007f]/.test(value) || /[\u0000-\u001f\u007f]/.test(value)) {
    boundaryError(filePath, node, `Link URL contains control characters: ${value}`)
  }

  if (value.startsWith("#")) {
    if (value.length === 1) {
      boundaryError(filePath, node, "Empty fragment links are not allowed")
    }
    return
  }

  if (value.startsWith("/")) {
    if (value.startsWith("//") || value.includes("\\")) {
      boundaryError(filePath, node, `Unsafe internal link URL: ${value}`)
    }
    return
  }

  let parsed

  try {
    parsed = new URL(value)
  } catch {
    boundaryError(
      filePath,
      node,
      `Links must use a root-relative path, fragment, or approved absolute protocol: ${value}`,
    )
  }

  if (!["https:", "mailto:", "tel:"].includes(parsed.protocol)) {
    boundaryError(filePath, node, `Unsupported link protocol: ${parsed.protocol}`)
  }

  if (parsed.protocol === "https:" && (parsed.username || parsed.password)) {
    boundaryError(filePath, node, "Credential-bearing links are not allowed")
  }
}

function validateLocalBlogAsset(value, filePath, node) {
  let decoded

  try {
    decoded = decodeURIComponent(value)
  } catch {
    boundaryError(filePath, node, `Asset path is not valid URL encoding: ${value}`)
  }

  if (
    !decoded.startsWith("/img/blog/") ||
    decoded.includes("\\") ||
    decoded.includes("?") ||
    decoded.includes("#") ||
    decoded.split("/").includes("..")
  ) {
    boundaryError(
      filePath,
      node,
      `Blog assets must be root-relative files under /img/blog/: ${value}`,
    )
  }
}

function readLiteralProps(node, schema, filePath) {
  const values = {}

  for (const attribute of node.attributes ?? []) {
    if (attribute.type !== "mdxJsxAttribute") {
      boundaryError(filePath, attribute, "Spread and expression attributes are not allowed")
    }

    if (typeof attribute.name !== "string") {
      boundaryError(filePath, attribute, "Namespaced JSX attributes are not allowed")
    }

    if (Object.hasOwn(values, attribute.name)) {
      boundaryError(filePath, attribute, `Duplicate prop: ${attribute.name}`)
    }

    const expectedType = schema.props[attribute.name]

    if (!expectedType) {
      boundaryError(
        filePath,
        attribute,
        `Unsupported prop ${attribute.name} on <${node.name}>`,
      )
    }

    if (expectedType === "boolean") {
      if (attribute.value !== null) {
        boundaryError(
          filePath,
          attribute,
          `Boolean prop ${attribute.name} on <${node.name}> must use bare syntax`,
        )
      }
      values[attribute.name] = true
      continue
    }

    if (typeof attribute.value !== "string" || attribute.value.trim() === "") {
      boundaryError(
        filePath,
        attribute,
        `Prop ${attribute.name} on <${node.name}> must be a non-empty string literal`,
      )
    }

    values[attribute.name] = attribute.value
  }

  for (const requiredProp of schema.requiredProps) {
    if (!Object.hasOwn(values, requiredProp)) {
      boundaryError(
        filePath,
        node,
        `<${node.name}> is missing required prop ${requiredProp}`,
      )
    }
  }

  return values
}

function validateComponent(node, parent, filePath, report) {
  if (typeof node.name !== "string" || node.name === "") {
    boundaryError(filePath, node, "JSX fragments are not allowed")
  }

  if (/^[a-z]/.test(node.name)) {
    boundaryError(filePath, node, `Lowercase JSX element <${node.name}> is not allowed`)
  }

  const schema = componentSchemas[node.name]

  if (!schema) {
    boundaryError(filePath, node, `Unsupported MDX component <${node.name}>`)
  }

  const expectedNodeType =
    schema.kind === "flow" ? "mdxJsxFlowElement" : "mdxJsxTextElement"

  if (node.type !== expectedNodeType) {
    boundaryError(
      filePath,
      node,
      `<${node.name}> must be used as a ${schema.kind} component`,
    )
  }

  const props = readLiteralProps(node, schema, filePath)
  report.components.add(node.name)

  if (node.name === "Figure") {
    validateLocalBlogAsset(props.src, filePath, node)
    report.localAssets.add(props.src)
  }

  if (node.name === "PostLink") {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(props.slug)) {
      boundaryError(filePath, node, `Invalid PostLink slug: ${props.slug}`)
    }
    report.postLinks.add(props.slug)
  }

  if (node.name === "ControlRow") {
    if (parent?.type !== "mdxJsxFlowElement" || parent.name !== "ControlTable") {
      boundaryError(filePath, node, "<ControlRow> must be a direct child of <ControlTable>")
    }
  }

  if (schema.children === "none" && node.children.length > 0) {
    boundaryError(filePath, node, `<${node.name}> must be self-closing`)
  }

  if (schema.children === "content") {
    if (node.children.length === 0 || node.children.every(isWhitespaceText)) {
      boundaryError(filePath, node, `<${node.name}> must contain readable content`)
    }
  }

  if (schema.children === "phrasing") {
    if (node.children.length === 0 || node.children.every(isWhitespaceText)) {
      boundaryError(filePath, node, `<${node.name}> must contain link text`)
    }

    for (const child of node.children) {
      if (!phrasingNodes.has(child.type)) {
        boundaryError(
          filePath,
          child,
          `<${node.name}> children must be plain phrasing content`,
        )
      }
    }
  }

  if (schema.children === "rows") {
    if (node.children.length === 0 || node.children.every(isWhitespaceText)) {
      boundaryError(filePath, node, "<ControlTable> must contain at least one row")
    }

    for (const child of node.children) {
      if (isWhitespaceText(child)) continue
      if (child.type !== "mdxJsxFlowElement" || child.name !== "ControlRow") {
        boundaryError(
          filePath,
          child,
          "<ControlTable> may contain only <ControlRow> children",
        )
      }
    }
  }
}

function validateMarkdownNode(node, filePath, report) {
  if (node.type === "heading" && (node.depth < 2 || node.depth > 6)) {
    boundaryError(filePath, node, "Article headings must use levels 2 through 6")
  }

  if (node.type === "code") {
    if (node.meta) {
      boundaryError(filePath, node, "Code block metadata is not supported")
    }
    if (node.lang && !/^[a-z0-9][a-z0-9-]*$/i.test(node.lang)) {
      boundaryError(filePath, node, `Invalid code block language: ${node.lang}`)
    }
  }

  if (node.type === "link") {
    validateExternalOrInternalLink(node.url, filePath, node)
  }

  if (node.type === "image") {
    if (!node.alt || node.alt.trim() === "") {
      boundaryError(filePath, node, "Markdown images require non-empty alt text")
    }
    validateLocalBlogAsset(node.url, filePath, node)
    report.localAssets.add(node.url)
  }
}

function validateTree(tree, filePath) {
  const report = {
    components: new Set(),
    localAssets: new Set(),
    postLinks: new Set(),
  }

  const walk = (node, parent = null) => {
    if (
      node.type === "mdxjsEsm" ||
      node.type === "mdxFlowExpression" ||
      node.type === "mdxTextExpression"
    ) {
      boundaryError(filePath, node, "Executable MDX expressions, imports, and exports are not allowed")
    }

    if (node.type === "html") {
      boundaryError(filePath, node, "Raw HTML is not allowed in blog MDX")
    }

    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      validateComponent(node, parent, filePath, report)
    } else if (allowedMarkdownNodes.has(node.type)) {
      validateMarkdownNode(node, filePath, report)
    } else {
      boundaryError(filePath, node, `Unsupported Markdown/MDX node type: ${node.type}`)
    }

    for (const child of node.children ?? []) {
      walk(child, node)
    }
  }

  walk(tree)

  return {
    components: [...report.components].sort(),
    localAssets: [...report.localAssets].sort(),
    postLinks: [...report.postLinks].sort(),
  }
}

export async function validateBlogMdxSource({ source, filePath = "<blog-mdx>" }) {
  const body = stripFrontmatter(source, filePath)
  let report = null

  try {
    await compile(body, {
      format: "mdx",
      jsx: true,
      outputFormat: "program",
      remarkPlugins: [
        () => (tree) => {
          report = validateTree(tree, filePath)
        },
      ],
    })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(`${filePath}:`)) {
      throw error
    }

    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${filePath}: MDX parsing failed: ${message}`, {
      cause: error,
    })
  }

  if (!report) {
    throw new Error(`${filePath}: MDX validation did not produce a report`)
  }

  return report
}
