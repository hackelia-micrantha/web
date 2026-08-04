import assert from "node:assert/strict"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"

const repositoryRoot = process.cwd()

const registryMigrations = [
  {
    path: "app/content/blog-governance-native.tsx",
    arrayName: "governanceNativeBlogPosts",
    membership: new Map([
      ["governance-native-engineering-control-plane", ["governance-native-engineering", 1]],
      ["replayability-is-a-governance-problem", ["governance-native-engineering", 2]],
      ["recursive-governance-and-agent-workflows", ["governance-native-engineering", 3]],
    ]),
  },
  {
    path: "app/content/blog.tsx",
    arrayName: "blogPosts",
    membership: new Map([
      ["secure-platform-integration-is-not-plumbing", ["architecture-control-boundaries", 1]],
      ["ai-pipelines-need-control-boundaries", ["architecture-control-boundaries", 2]],
      ["software-layers-are-risk-boundaries", ["architecture-control-boundaries", 3]],
    ]),
    updateTypes: true,
  },
]

function parse(relativePath, source) {
  const filePath = path.join(repositoryRoot, relativePath)
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  assert.equal(
    sourceFile.parseDiagnostics.length,
    0,
    `Unable to parse ${relativePath}: ${sourceFile.parseDiagnostics
      .map((diagnostic) => diagnostic.messageText)
      .join(", ")}`,
  )

  return sourceFile
}

function propertyName(property) {
  if (
    ts.isPropertyAssignment(property) ||
    ts.isShorthandPropertyAssignment(property) ||
    ts.isMethodDeclaration(property)
  ) {
    return ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
      ? property.name.text
      : null
  }

  return null
}

function findArray(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === name &&
        declaration.initializer &&
        ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        return declaration.initializer
      }
    }
  }

  throw new Error(`Unable to find ${name}`)
}

function findTypeAlias(sourceFile, name) {
  return sourceFile.statements.find(
    (statement) =>
      ts.isTypeAliasDeclaration(statement) && statement.name.text === name,
  )
}

function findFunction(sourceFile, name) {
  return sourceFile.statements.find(
    (statement) =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === name,
  )
}

function stringProperty(object, name) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) && propertyName(candidate) === name,
  )

  assert.ok(property, `Missing ${name} property`)
  assert.ok(
    ts.isStringLiteral(property.initializer),
    `${name} must be a string literal`,
  )

  return property.initializer.text
}

function removeStatement(source, statement) {
  let end = statement.end

  while (source[end] === "\r" || source[end] === "\n") end += 1

  return {
    start: statement.getFullStart(),
    end,
    replacement: "\n",
  }
}

function addTypeEdits(source, sourceFile, edits) {
  const seriesType = findTypeAlias(sourceFile, "BlogSeries")
  const seriesGroupType = findTypeAlias(sourceFile, "BlogSeriesGroup")
  const legacySeriesFunction = findFunction(sourceFile, "getBlogSeriesGroups")
  const blogPostType = findTypeAlias(sourceFile, "BlogPost")

  assert.ok(seriesType, "Unable to find BlogSeries type")
  assert.ok(seriesGroupType, "Unable to find BlogSeriesGroup type")
  assert.ok(legacySeriesFunction, "Unable to find legacy getBlogSeriesGroups")
  assert.ok(blogPostType && ts.isTypeLiteralNode(blogPostType.type))

  const seriesMember = blogPostType.type.members.find(
    (member) =>
      ts.isPropertySignature(member) &&
      member.name &&
      (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) &&
      member.name.text === "series",
  )

  assert.ok(seriesMember, "Unable to find BlogPost.series")

  edits.push({
    start: seriesType.getStart(sourceFile),
    end: seriesType.end,
    replacement:
      "export type BlogSeriesMembership = {\n  slug: string\n  order: number\n}",
  })
  edits.push({
    start: seriesMember.getStart(sourceFile),
    end: seriesMember.end,
    replacement: "series?: BlogSeriesMembership",
  })
  edits.push(removeStatement(source, seriesGroupType))
  edits.push(removeStatement(source, legacySeriesFunction))
}

function addMembershipEdits(source, sourceFile, migration, edits) {
  const posts = findArray(sourceFile, migration.arrayName)
  const seen = new Set()

  for (const element of posts.elements) {
    assert.ok(
      ts.isObjectLiteralExpression(element),
      `${migration.arrayName} entries must remain object literals`,
    )

    const slug = stringProperty(element, "slug")
    const membership = migration.membership.get(slug)

    assert.ok(membership, `Missing migration membership for ${slug}`)
    assert.equal(
      element.properties.some((property) => propertyName(property) === "series"),
      false,
      `${slug} already has series metadata`,
    )

    const contentProperty = element.properties.find(
      (property) => propertyName(property) === "Content",
    )
    const anchor = contentProperty
      ? contentProperty.getStart(sourceFile)
      : element.end - 1
    const lineStart = source.lastIndexOf("\n", anchor - 1) + 1
    const [seriesSlug, order] = membership

    edits.push({
      start: lineStart,
      end: lineStart,
      replacement: `    series: {\n      slug: "${seriesSlug}",\n      order: ${order},\n    },\n`,
    })
    seen.add(slug)
  }

  assert.deepEqual(
    [...seen].sort(),
    [...migration.membership.keys()].sort(),
    `${migration.arrayName} migration map does not match registry entries`,
  )
}

for (const migration of registryMigrations) {
  const filePath = path.join(repositoryRoot, migration.path)
  let source = await readFile(filePath, "utf8")
  const sourceFile = parse(migration.path, source)
  const edits = []

  if (migration.updateTypes) {
    addTypeEdits(source, sourceFile, edits)
  }

  addMembershipEdits(source, sourceFile, migration, edits)

  for (const edit of edits.sort((left, right) => right.start - left.start)) {
    source = `${source.slice(0, edit.start)}${edit.replacement}${source.slice(edit.end)}`
  }

  const migrated = parse(migration.path, source)
  const posts = findArray(migrated, migration.arrayName)

  for (const element of posts.elements) {
    assert.ok(ts.isObjectLiteralExpression(element))
    assert.equal(
      element.properties.some((property) => propertyName(property) === "series"),
      true,
      `${stringProperty(element, "slug")} is missing series metadata`,
    )
  }

  if (migration.updateTypes) {
    assert.ok(findTypeAlias(migrated, "BlogSeriesMembership"))
    assert.equal(findTypeAlias(migrated, "BlogSeries"), undefined)
    assert.equal(findTypeAlias(migrated, "BlogSeriesGroup"), undefined)
    assert.equal(findFunction(migrated, "getBlogSeriesGroups"), undefined)
  }

  await writeFile(filePath, source)
  console.log(`Migrated series membership in ${migration.path}`)
}
