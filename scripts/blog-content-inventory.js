import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"

export const repositoryRoot = process.cwd()

const registryDefinitions = [
  {
    path: "app/content/blog-governance-native.tsx",
    exportName: "governanceNativeBlogPosts",
  },
  {
    path: "app/content/blog.tsx",
    exportName: "blogPosts",
  },
]

const seriesPath = "app/content/blog-series.ts"
const blogTypePath = "app/content/blog.tsx"
const siteOrigin = "https://micrantha.com"
const staticPathsBeforeBlogContent = ["/", "/solutions", "/blog"]
const staticPathsAfterBlogContent = [
  "/laboratory",
  "/compost",
  "/services",
  "/support",
  "/security",
  "/philosophy",
  "/privacy",
]

function parseSource(relativePath, source, scriptKind) {
  const filePath = path.join(repositoryRoot, relativePath)
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
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

function findProperty(object, name) {
  return object.properties.find(
    (candidate) => propertyName(candidate) === name,
  )
}

function literalText(node, context) {
  assert.ok(
    ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node),
    `${context} must be a string literal`,
  )

  return node.text
}

function stringProperty(object, name, context) {
  const property = findProperty(object, name)

  assert.ok(
    property && ts.isPropertyAssignment(property),
    `${context} is missing ${name}`,
  )

  const value = literalText(property.initializer, `${context}.${name}`)
  assert.notEqual(value.trim(), "", `${context}.${name} must not be empty`)
  return value
}

function stringArrayProperty(object, name, context) {
  const property = findProperty(object, name)

  assert.ok(
    property && ts.isPropertyAssignment(property),
    `${context} is missing ${name}`,
  )
  assert.ok(
    ts.isArrayLiteralExpression(property.initializer),
    `${context}.${name} must be an array literal`,
  )

  return property.initializer.elements.map((element, index) =>
    literalText(element, `${context}.${name}[${index}]`),
  )
}

function findArrayDeclaration(sourceFile, declarationName, relativePath) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === declarationName &&
        declaration.initializer &&
        ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        return declaration.initializer
      }
    }
  }

  throw new Error(`Unable to find ${declarationName} in ${relativePath}`)
}

function parseCalendarDate(value, context) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/, `${context} must be YYYY-MM-DD`)

  const parsed = new Date(`${value}T00:00:00Z`)
  assert.equal(
    Number.isNaN(parsed.valueOf()),
    false,
    `${context} must be a valid calendar date`,
  )
  assert.equal(
    parsed.toISOString().slice(0, 10),
    value,
    `${context} must be a valid calendar date`,
  )

  return value
}

function assertUnique(values, context) {
  assert.equal(
    new Set(values).size,
    values.length,
    `${context} contains duplicate values`,
  )
}

async function readPostRegistry(definition) {
  const absolutePath = path.join(repositoryRoot, definition.path)
  const source = await readFile(absolutePath, "utf8")
  const sourceFile = parseSource(definition.path, source, ts.ScriptKind.TSX)
  const array = findArrayDeclaration(
    sourceFile,
    definition.exportName,
    definition.path,
  )

  return array.elements.map((element, index) => {
    const context = `${definition.exportName}[${index}]`
    assert.ok(
      ts.isObjectLiteralExpression(element),
      `${context} must be an object literal`,
    )

    const slug = stringProperty(element, "slug", context)
    const date = parseCalendarDate(
      stringProperty(element, "date", context),
      `${context}.date`,
    )
    const tags = stringArrayProperty(element, "tags", context)
    const relatedSlugs = stringArrayProperty(element, "relatedSlugs", context)

    stringProperty(element, "title", context)
    stringProperty(element, "description", context)
    stringProperty(element, "excerpt", context)
    assertUnique(tags, `${context}.tags`)
    assertUnique(relatedSlugs, `${context}.relatedSlugs`)
    assert.equal(
      relatedSlugs.includes(slug),
      false,
      `${context}.relatedSlugs must not reference itself`,
    )

    return {
      slug,
      date,
      tags,
      relatedSlugs,
      hasContent: Boolean(findProperty(element, "Content")),
      source: definition.path,
    }
  })
}

async function readSeriesDefinitions() {
  const absolutePath = path.join(repositoryRoot, seriesPath)
  const source = await readFile(absolutePath, "utf8")
  const sourceFile = parseSource(seriesPath, source, ts.ScriptKind.TS)
  const array = findArrayDeclaration(
    sourceFile,
    "blogSeriesDefinitions",
    seriesPath,
  )

  return array.elements.map((element, index) => {
    const context = `blogSeriesDefinitions[${index}]`
    assert.ok(
      ts.isObjectLiteralExpression(element),
      `${context} must be an object literal`,
    )

    const postSlugs = stringArrayProperty(element, "postSlugs", context)
    assertUnique(postSlugs, `${context}.postSlugs`)

    return {
      slug: stringProperty(element, "slug", context),
      title: stringProperty(element, "title", context),
      description: stringProperty(element, "description", context),
      postSlugs,
    }
  })
}

export async function assertBlogPostContentOptional() {
  const source = await readFile(path.join(repositoryRoot, blogTypePath), "utf8")
  const sourceFile = parseSource(blogTypePath, source, ts.ScriptKind.TSX)

  for (const statement of sourceFile.statements) {
    if (
      !ts.isTypeAliasDeclaration(statement) ||
      statement.name.text !== "BlogPost"
    ) {
      continue
    }

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
    assert.ok(
      contentMember.questionToken,
      "BlogPost.Content must be optional for metadata-only MDX entries",
    )
    return
  }

  throw new Error("Unable to find BlogPost type")
}

export async function loadBlogContentInventory() {
  const [registryPosts, series] = await Promise.all([
    Promise.all(registryDefinitions.map(readPostRegistry)).then((groups) =>
      groups.flat(),
    ),
    readSeriesDefinitions(),
  ])

  const postSlugs = registryPosts.map((post) => post.slug)
  assertUnique(postSlugs, "Blog registries")

  const postsBySlug = new Map(registryPosts.map((post) => [post.slug, post]))

  for (const post of registryPosts) {
    for (const relatedSlug of post.relatedSlugs) {
      assert.ok(
        postsBySlug.has(relatedSlug),
        `${post.slug} references unknown related post ${relatedSlug}`,
      )
    }
  }

  assertUnique(
    series.map((definition) => definition.slug),
    "Blog series definitions",
  )

  const seriesMembership = new Map()

  for (const definition of series) {
    for (const slug of definition.postSlugs) {
      assert.ok(
        postsBySlug.has(slug),
        `Series ${definition.slug} references unknown post ${slug}`,
      )
      assert.equal(
        seriesMembership.has(slug),
        false,
        `Post ${slug} belongs to multiple series`,
      )
      seriesMembership.set(slug, definition.slug)
    }
  }

  return {
    posts: registryPosts,
    postsBySlug,
    series,
    seriesMembership,
  }
}

function latestDate(posts) {
  assert.ok(posts.length > 0, "Cannot calculate a latest date for no posts")
  return posts.map((post) => post.date).sort().at(-1)
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function renderUrl(pathname, lastmod) {
  const location = pathname === "/" ? `${siteOrigin}/` : `${siteOrigin}${pathname}`
  const lines = ["  <url>", `    <loc>${escapeXml(location)}</loc>`]

  if (lastmod) {
    lines.push(`    <lastmod>${lastmod}</lastmod>`)
  }

  lines.push("  </url>")
  return lines.join("\n")
}

export function buildSitemapXml(inventory) {
  const entries = staticPathsBeforeBlogContent.slice(0, 2).map((pathname) => ({
    pathname,
  }))

  entries.push({
    pathname: "/blog",
    lastmod: latestDate(inventory.posts),
  })

  const seriesPostSlugs = new Set()

  for (const definition of inventory.series) {
    const posts = definition.postSlugs.map((slug) => {
      const post = inventory.postsBySlug.get(slug)
      assert.ok(post, `Missing post ${slug} while building sitemap`)
      seriesPostSlugs.add(slug)
      return post
    })

    entries.push({
      pathname: `/blog/series/${definition.slug}`,
      lastmod: latestDate(posts),
    })

    for (const post of posts) {
      entries.push({
        pathname: `/blog/${post.slug}`,
        lastmod: post.date,
      })
    }
  }

  for (const post of inventory.posts) {
    if (seriesPostSlugs.has(post.slug)) continue
    entries.push({
      pathname: `/blog/${post.slug}`,
      lastmod: post.date,
    })
  }

  for (const pathname of staticPathsAfterBlogContent) {
    entries.push({ pathname })
  }

  assertUnique(
    entries.map((entry) => entry.pathname),
    "Generated sitemap paths",
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => renderUrl(entry.pathname, entry.lastmod)),
    "</urlset>",
    "",
  ].join("\n")
}
