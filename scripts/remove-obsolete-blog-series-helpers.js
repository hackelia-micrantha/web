import assert from "node:assert/strict"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"

const repositoryRoot = process.cwd()
const relativePath = "app/content/blog.tsx"
const filePath = path.join(repositoryRoot, relativePath)
const firstHelper = "export function getBlogSeriesBySlug"
const nextLiveExport = "export function formatBlogDate"
const helperNames = new Set([
  "getBlogSeriesBySlug",
  "getSeriesPosts",
  "getSeriesNavigation",
])

let source = await readFile(filePath, "utf8")
const start = source.indexOf(firstHelper)
const end = source.indexOf(nextLiveExport)

assert.notEqual(start, -1, `Unable to find ${firstHelper}`)
assert.notEqual(end, -1, `Unable to find ${nextLiveExport}`)
assert.ok(start < end, "Obsolete series helper block is out of order")

source = `${source.slice(0, start)}${source.slice(end)}`

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
assert.equal(
  migrated.statements.some(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === "formatBlogDate",
  ),
  true,
  "formatBlogDate must remain after cleanup",
)

await writeFile(filePath, source)
console.log("Removed obsolete local blog series helpers")
