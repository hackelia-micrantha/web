import assert from "node:assert/strict"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"

const repositoryRoot = process.cwd()
const relativePath = "app/content/blog.tsx"
const filePath = path.join(repositoryRoot, relativePath)
const helperNames = new Set([
  "getBlogSeriesBySlug",
  "getSeriesPosts",
  "getSeriesNavigation",
])

let source = await readFile(filePath, "utf8")
const sourceFile = ts.createSourceFile(
  filePath,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
)

assert.equal(sourceFile.parseDiagnostics.length, 0)

const edits = sourceFile.statements
  .filter(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      helperNames.has(statement.name.text),
  )
  .map((statement) => {
    let end = statement.end

    while (source[end] === "\r" || source[end] === "\n") end += 1

    return {
      start: statement.getFullStart(),
      end,
    }
  })

assert.equal(
  edits.length,
  helperNames.size,
  "Expected all obsolete local series helpers to exist exactly once",
)

for (const edit of edits.sort((left, right) => right.start - left.start)) {
  source = `${source.slice(0, edit.start)}\n${source.slice(edit.end)}`
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
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      helperNames.has(statement.name.text),
  ),
  false,
)

await writeFile(filePath, source)
console.log("Removed obsolete local blog series helpers")
