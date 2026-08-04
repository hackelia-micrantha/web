import assert from "node:assert/strict"
import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"

const repositoryRoot = process.cwd()
const routesDirectory = path.join(repositoryRoot, "app/routes")
const registryPath = path.join(repositoryRoot, "app/content/blog.tsx")

async function pathExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

async function discoverMdxSlugs() {
  const entries = await readdir(routesDirectory, { withFileTypes: true })
  const slugs = []

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("blog.")) continue

    const routeDirectory = path.join(routesDirectory, entry.name)
    const hasMdx = await pathExists(path.join(routeDirectory, "content.mdx"))

    if (!hasMdx) continue

    assert.equal(
      await pathExists(path.join(routeDirectory, "route.tsx")),
      true,
      `MDX route ${entry.name} is missing route.tsx`,
    )

    slugs.push(entry.name.slice("blog.".length))
  }

  return slugs.sort()
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

function stringProperty(object, name) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) && propertyName(candidate) === name,
  )

  assert.ok(property, `Blog registry entry is missing ${name}`)
  assert.ok(
    ts.isStringLiteral(property.initializer),
    `Blog registry field ${name} must be a string literal`,
  )

  return property.initializer.text
}

function parseRegistry(source) {
  const sourceFile = ts.createSourceFile(
    registryPath,
    source,
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

  let contentPropertyOptional = false
  let postsArray = null

  for (const statement of sourceFile.statements) {
    if (
      ts.isTypeAliasDeclaration(statement) &&
      statement.name.text === "BlogPost"
    ) {
      assert.ok(
        ts.isTypeLiteralNode(statement.type),
        "BlogPost must remain a type literal",
      )

      const contentMember = statement.type.members.find(
        (member) =>
          ts.isPropertySignature(member) &&
          member.name &&
          (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) &&
          member.name.text === "Content",
      )

      assert.ok(contentMember, "BlogPost is missing the Content contract")
      contentPropertyOptional = Boolean(contentMember.questionToken)
    }

    if (!ts.isVariableStatement(statement)) continue

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === "blogPosts" &&
        declaration.initializer &&
        ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        postsArray = declaration.initializer
      }
    }
  }

  assert.equal(
    contentPropertyOptional,
    true,
    "BlogPost.Content must be optional for metadata-only MDX entries",
  )
  assert.ok(postsArray, "Unable to find blogPosts array")

  const posts = postsArray.elements.map((element) => {
    assert.ok(
      ts.isObjectLiteralExpression(element),
      "Every blogPosts entry must be an object literal",
    )

    return {
      slug: stringProperty(element, "slug"),
      hasContent: element.properties.some(
        (property) => propertyName(property) === "Content",
      ),
    }
  })

  return posts
}

const mdxSlugs = await discoverMdxSlugs()
const registrySource = await readFile(registryPath, "utf8")
const posts = parseRegistry(registrySource)
const registrySlugs = posts.map((post) => post.slug)

assert.equal(
  new Set(registrySlugs).size,
  registrySlugs.length,
  "Blog registry contains duplicate slugs",
)

for (const slug of mdxSlugs) {
  const post = posts.find((candidate) => candidate.slug === slug)

  assert.ok(post, `MDX route ${slug} is missing registry metadata`)
  assert.equal(
    post.hasContent,
    false,
    `MDX route ${slug} still has a legacy Content renderer`,
  )
}

for (const post of posts) {
  if (mdxSlugs.includes(post.slug)) continue

  assert.equal(
    post.hasContent,
    true,
    `Legacy TSX post ${post.slug} is missing its Content renderer`,
  )
}

console.log(
  `Blog content boundaries passed: ${mdxSlugs.length} MDX route(s), ${
    posts.length - mdxSlugs.length
  } legacy TSX route(s)`,
)
