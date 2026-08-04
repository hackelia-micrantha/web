import assert from "node:assert/strict"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"

const repositoryRoot = process.cwd()
const blogPath = path.join(repositoryRoot, "app/content/blog.tsx")
const targetRenderer = "aiPipelinesControlBoundariesContent"
const targetSlug = "ai-pipelines-need-control-boundaries"

let source = await readFile(blogPath, "utf8")

function parse(text) {
  const sourceFile = ts.createSourceFile(
    blogPath,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  assert.equal(
    sourceFile.parseDiagnostics.length,
    0,
    `Unable to parse blog registry: ${sourceFile.parseDiagnostics
      .map((diagnostic) => diagnostic.messageText)
      .join(", ")}`,
  )

  return sourceFile
}

function findBlogPostsArray(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === "blogPosts" &&
        declaration.initializer &&
        ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        return declaration.initializer
      }
    }
  }

  throw new Error("Unable to find blogPosts array")
}

function findPostObject(sourceFile, slug) {
  const posts = findBlogPostsArray(sourceFile)

  for (const element of posts.elements) {
    if (!ts.isObjectLiteralExpression(element)) continue

    const slugProperty = element.properties.find(
      (property) =>
        ts.isPropertyAssignment(property) &&
        ts.isIdentifier(property.name) &&
        property.name.text === "slug" &&
        ts.isStringLiteral(property.initializer) &&
        property.initializer.text === slug,
    )

    if (slugProperty) return element
  }

  throw new Error(`Unable to find blog post: ${slug}`)
}

function findRendererStatement(sourceFile) {
  return sourceFile.statements.find(
    (statement) =>
      ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.some(
        (declaration) =>
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === targetRenderer,
      ),
  )
}

function findContentProperty(post) {
  return post.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === "Content",
  )
}

const initialFile = parse(source)
const rendererStatement = findRendererStatement(initialFile)
const postObject = findPostObject(initialFile, targetSlug)
const contentProperty = findContentProperty(postObject)
const edits = []

if (rendererStatement) {
  let end = rendererStatement.end

  while (source[end] === "\r" || source[end] === "\n") end += 1

  edits.push({
    start: rendererStatement.getFullStart(),
    end,
    replacement: "\n",
  })
}

if (contentProperty) {
  let end = contentProperty.end

  if (source[end] === ",") end += 1
  if (source[end] === "\r") end += 1
  if (source[end] === "\n") end += 1

  edits.push({
    start: contentProperty.getFullStart(),
    end,
    replacement: "\n",
  })
}

const requiredContentType = "  Content: () => ReactNode"
const optionalContentType = "  Content?: () => ReactNode"

if (source.includes(requiredContentType)) {
  assert.equal(
    source.split(requiredContentType).length - 1,
    1,
    "Expected exactly one required BlogPost Content declaration",
  )
  const start = source.indexOf(requiredContentType)
  edits.push({
    start,
    end: start + requiredContentType.length,
    replacement: optionalContentType,
  })
} else {
  assert.ok(
    source.includes(optionalContentType),
    "BlogPost Content declaration is neither required nor optional",
  )
}

for (const edit of edits.sort((left, right) => right.start - left.start)) {
  source = `${source.slice(0, edit.start)}${edit.replacement}${source.slice(edit.end)}`
}

const migratedFile = parse(source)
const migratedPost = findPostObject(migratedFile, targetSlug)

assert.equal(findRendererStatement(migratedFile), undefined)
assert.equal(findContentProperty(migratedPost), undefined)
assert.ok(source.includes(optionalContentType))

if (edits.length === 0) {
  console.log("Representative legacy body is already removed")
} else {
  await writeFile(blogPath, source)
  console.log("Removed representative legacy TSX body from blog registry")
}
