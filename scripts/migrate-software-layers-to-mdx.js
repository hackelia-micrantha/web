import assert from "node:assert/strict"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"

const repositoryRoot = process.cwd()
const relativePath = "app/content/blog.tsx"
const filePath = path.join(repositoryRoot, relativePath)
const targetFunction = "softwareLayersRiskBoundariesContent"
const targetSlug = "software-layers-are-risk-boundaries"

let source = await readFile(filePath, "utf8")
const sourceFile = ts.createSourceFile(
  filePath,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
)

assert.equal(sourceFile.parseDiagnostics.length, 0)

function propertyName(property) {
  if (!ts.isPropertyAssignment(property)) return null
  return ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
    ? property.name.text
    : null
}

function stringProperty(object, name) {
  const property = object.properties.find(
    (candidate) => propertyName(candidate) === name,
  )

  assert.ok(property && ts.isPropertyAssignment(property))
  assert.ok(ts.isStringLiteral(property.initializer))
  return property.initializer.text
}

const functionStatement = sourceFile.statements.find(
  (statement) =>
    ts.isVariableStatement(statement) &&
    statement.declarationList.declarations.some(
      (declaration) =>
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === targetFunction,
    ),
)

assert.ok(functionStatement, `Unable to find ${targetFunction}`)
assert.equal(
  functionStatement.declarationList.declarations.length,
  1,
  `${targetFunction} must remain in its own variable statement`,
)

let blogPostsArray = null

for (const statement of sourceFile.statements) {
  if (!ts.isVariableStatement(statement)) continue

  for (const declaration of statement.declarationList.declarations) {
    if (
      ts.isIdentifier(declaration.name) &&
      declaration.name.text === "blogPosts" &&
      declaration.initializer &&
      ts.isArrayLiteralExpression(declaration.initializer)
    ) {
      blogPostsArray = declaration.initializer
    }
  }
}

assert.ok(blogPostsArray, "Unable to find blogPosts array")

const targetPost = blogPostsArray.elements.find(
  (element) =>
    ts.isObjectLiteralExpression(element) &&
    stringProperty(element, "slug") === targetSlug,
)

assert.ok(targetPost && ts.isObjectLiteralExpression(targetPost))

const contentProperty = targetPost.properties.find(
  (property) => propertyName(property) === "Content",
)

assert.ok(
  contentProperty && ts.isPropertyAssignment(contentProperty),
  `${targetSlug} is missing Content`,
)
assert.ok(
  ts.isIdentifier(contentProperty.initializer) &&
    contentProperty.initializer.text === targetFunction,
  `${targetSlug}.Content must reference ${targetFunction}`,
)

function statementRemoval(statement) {
  let end = statement.end
  while (source[end] === "\r" || source[end] === "\n") end += 1

  return {
    start: statement.getFullStart(),
    end,
    replacement: "\n",
  }
}

function propertyRemoval(property) {
  const start = source.lastIndexOf("\n", property.getStart(sourceFile) - 1) + 1
  let end = property.end
  if (source[end] === ",") end += 1
  while (source[end] === "\r" || source[end] === "\n") end += 1

  return {
    start,
    end,
    replacement: "",
  }
}

const edits = [
  statementRemoval(functionStatement),
  propertyRemoval(contentProperty),
]

for (const edit of edits.sort((left, right) => right.start - left.start)) {
  source = `${source.slice(0, edit.start)}${edit.replacement}${source.slice(edit.end)}`
}

const migrated = ts.createSourceFile(
  filePath,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
)

assert.equal(migrated.parseDiagnostics.length, 0)
assert.equal(
  migrated.statements.some(
    (statement) =>
      ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.some(
        (declaration) =>
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === targetFunction,
      ),
  ),
  false,
  `${targetFunction} remains after migration`,
)

let migratedPost = null
for (const statement of migrated.statements) {
  if (!ts.isVariableStatement(statement)) continue
  for (const declaration of statement.declarationList.declarations) {
    if (
      ts.isIdentifier(declaration.name) &&
      declaration.name.text === "blogPosts" &&
      declaration.initializer &&
      ts.isArrayLiteralExpression(declaration.initializer)
    ) {
      migratedPost = declaration.initializer.elements.find(
        (element) =>
          ts.isObjectLiteralExpression(element) &&
          stringProperty(element, "slug") === targetSlug,
      )
    }
  }
}

assert.ok(migratedPost && ts.isObjectLiteralExpression(migratedPost))
assert.equal(
  migratedPost.properties.some(
    (property) => propertyName(property) === "Content",
  ),
  false,
  `${targetSlug}.Content remains after migration`,
)

await writeFile(filePath, source)
console.log(`Migrated ${targetSlug} from TSX content to static MDX`)
