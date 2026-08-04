import { createProcessor } from "@mdx-js/mdx"

import { parseBlogMermaidSource } from "../app/content/blog-mermaid.js"

const mdxProcessor = createProcessor({ format: "mdx" })

function stripFrontmatter(source, relativePath) {
  const normalized = source.replaceAll("\r\n", "\n")

  if (!normalized.startsWith("---\n")) {
    throw new Error(`${relativePath} must begin with YAML frontmatter`)
  }

  const closingDelimiter = normalized.indexOf("\n---\n", 4)

  if (closingDelimiter === -1) {
    throw new Error(`${relativePath} is missing its closing frontmatter delimiter`)
  }

  return normalized.slice(closingDelimiter + "\n---\n".length)
}

function validateNode(node, relativePath) {
  let mermaidBlocks = 0

  if (node.type === "code" && node.lang === "mermaid") {
    try {
      parseBlogMermaidSource(node.value)
      mermaidBlocks += 1
    } catch (error) {
      const line = node.position?.start?.line
      const context = line ? `${relativePath}:${line}` : relativePath
      throw new Error(`${context} has invalid Mermaid source: ${error.message}`)
    }
  }

  for (const child of node.children ?? []) {
    mermaidBlocks += validateNode(child, relativePath)
  }

  return mermaidBlocks
}

export function validateBlogMermaidBlocks(source, relativePath) {
  const body = stripFrontmatter(source, relativePath)
  const tree = mdxProcessor.parse({ path: relativePath, value: body })

  return validateNode(tree, relativePath)
}
