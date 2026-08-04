import assert from "node:assert/strict"
import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"

export const repositoryRoot = process.cwd()

const routesDirectory = path.join(repositoryRoot, "app/routes")
const seriesPath = "app/content/blog-series.ts"
const siteOrigin = "https://micrantha.com"
const staticPathsBeforeBlogContent = ["/", "/solutions"]
const staticPathsAfterBlogContent = [
  "/laboratory",
  "/compost",
  "/services",
  "/support",
  "/security",
  "/philosophy",
  "/privacy",
]

async function pathExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

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
  return object.properties.find((candidate) => propertyName(candidate) === name)
}

function literalText(node, context) {
  assert.ok(
    ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node),
    `${context} must be a string literal`,
  )
  assert.notEqual(node.text.trim(), "", `${context} must not be empty`)

  return node.text
}

function stringProperty(object, name, context) {
  const property = findProperty(object, name)

  assert.ok(
    property && ts.isPropertyAssignment(property),
    `${context} is missing ${name}`,
  )

  return literalText(property.initializer, `${context}.${name}`)
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

function parseScalar(rawValue, context) {
  const value = rawValue.trim()
  assert.notEqual(value, "", `${context} must not be empty`)

  const quote = value[0]
  if ((quote === '"' || quote === "'") && value.at(-1) === quote) {
    return value.slice(1, -1)
  }

  return value
}

function parseFrontmatter(source, relativePath) {
  const normalized = source.replaceAll("\r\n", "\n")
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)

  assert.ok(match, `${relativePath} must begin with YAML frontmatter`)

  const lines = match[1].split("\n")
  const attributes = {}

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.trim() === "") continue

    assert.equal(
      line.includes("\t"),
      false,
      `${relativePath} must not use tabs`,
    )
    assert.equal(
      line.startsWith(" "),
      false,
      `${relativePath}:${index + 2} has unexpected indentation`,
    )

    const property = line.match(/^([A-Za-z][A-Za-z0-9]*):(.*)$/)
    assert.ok(property, `${relativePath}:${index + 2} is invalid frontmatter`)

    const [, name, rawValue] = property
    assert.equal(
      Object.hasOwn(attributes, name),
      false,
      `${relativePath} repeats frontmatter field ${name}`,
    )

    if (rawValue.trim() !== "") {
      attributes[name] = parseScalar(rawValue, `${relativePath}.${name}`)
      continue
    }

    const collection = []
    const object = {}
    let collectionKind = null

    while (index + 1 < lines.length && lines[index + 1].startsWith("  ")) {
      index += 1
      const child = lines[index]

      if (child.startsWith("  - ")) {
        assert.notEqual(
          collectionKind,
          "object",
          `${relativePath}.${name} mixes array and object values`,
        )
        collectionKind = "array"
        collection.push(
          parseScalar(
            child.slice(4),
            `${relativePath}.${name}[${collection.length}]`,
          ),
        )
        continue
      }

      const nested = child.match(/^ {2}([A-Za-z][A-Za-z0-9]*):(.*)$/)
      assert.ok(
        nested,
        `${relativePath}:${index + 2} has invalid nested frontmatter`,
      )
      assert.notEqual(
        collectionKind,
        "array",
        `${relativePath}.${name} mixes array and object values`,
      )
      collectionKind = "object"

      const [, childName, childRawValue] = nested
      assert.equal(
        Object.hasOwn(object, childName),
        false,
        `${relativePath}.${name} repeats ${childName}`,
      )
      const parsed = parseScalar(
        childRawValue,
        `${relativePath}.${name}.${childName}`,
      )
      object[childName] = /^\d+$/u.test(parsed) ? Number(parsed) : parsed
    }

    assert.ok(collectionKind, `${relativePath}.${name} must not be empty`)
    attributes[name] = collectionKind === "array" ? collection : object
  }

  return attributes
}

function requiredString(attributes, name, relativePath) {
  const value = attributes[name]
  assert.equal(
    typeof value,
    "string",
    `${relativePath}.${name} must be a string`,
  )
  assert.notEqual(value.trim(), "", `${relativePath}.${name} must not be empty`)
  return value
}

function requiredStringArray(attributes, name, relativePath) {
  const value = attributes[name]
  assert.ok(
    Array.isArray(value) && value.length > 0,
    `${relativePath}.${name} must be a non-empty array`,
  )
  assert.ok(
    value.every((item) => typeof item === "string" && item.trim() !== ""),
    `${relativePath}.${name} must contain non-empty strings`,
  )
  assertUnique(value, `${relativePath}.${name}`)
  return value
}

function optionalSeries(attributes, relativePath) {
  const value = attributes.series
  if (value === undefined) return null

  assert.ok(
    value && typeof value === "object" && !Array.isArray(value),
    `${relativePath}.series must be an object`,
  )
  assert.equal(
    typeof value.slug,
    "string",
    `${relativePath}.series.slug must be a string`,
  )
  assert.ok(
    Number.isInteger(value.order) && value.order > 0,
    `${relativePath}.series.order must be a positive integer`,
  )

  return {
    slug: value.slug,
    order: value.order,
  }
}

async function discoverBlogPosts() {
  const entries = await readdir(routesDirectory, { withFileTypes: true })
  const posts = []

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("blog.")) continue

    const routeDirectory = path.join(routesDirectory, entry.name)
    const contentPath = path.join(routeDirectory, "content.mdx")
    if (!(await pathExists(contentPath))) continue

    assert.equal(
      await pathExists(path.join(routeDirectory, "route.tsx")),
      true,
      `MDX route ${entry.name} is missing route.tsx`,
    )

    const relativePath = path.relative(repositoryRoot, contentPath)
    const sourceText = await readFile(contentPath, "utf8")
    const attributes = parseFrontmatter(sourceText, relativePath)
    const slug = requiredString(attributes, "slug", relativePath)
    const routeSlug = entry.name.slice("blog.".length)

    assert.equal(
      slug,
      routeSlug,
      `${relativePath}.slug must match route ${routeSlug}`,
    )

    const status = requiredString(attributes, "status", relativePath)
    const tags = requiredStringArray(attributes, "tags", relativePath)
    const relatedSlugs = requiredStringArray(
      attributes,
      "relatedSlugs",
      relativePath,
    )

    assert.equal(
      relatedSlugs.includes(slug),
      false,
      `${relativePath}.relatedSlugs must not reference itself`,
    )

    posts.push({
      slug,
      status,
      title: requiredString(attributes, "title", relativePath),
      description: requiredString(attributes, "description", relativePath),
      date: parseCalendarDate(
        requiredString(attributes, "date", relativePath),
        `${relativePath}.date`,
      ),
      excerpt: requiredString(attributes, "excerpt", relativePath),
      tags,
      relatedSlugs,
      series: optionalSeries(attributes, relativePath),
      relativePath,
      source: relativePath,
      sourceText,
    })
  }

  return posts.sort(
    (left, right) =>
      right.date.localeCompare(left.date) ||
      (left.series?.slug ?? "").localeCompare(right.series?.slug ?? "") ||
      (left.series?.order ?? Number.MAX_SAFE_INTEGER) -
        (right.series?.order ?? Number.MAX_SAFE_INTEGER) ||
      left.slug.localeCompare(right.slug),
  )
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

    return {
      slug: stringProperty(element, "slug", context),
      title: stringProperty(element, "title", context),
      description: stringProperty(element, "description", context),
    }
  })
}

export async function loadBlogContentInventory() {
  const [posts, series] = await Promise.all([
    discoverBlogPosts(),
    readSeriesDefinitions(),
  ])

  assert.ok(posts.length > 0, "No canonical blog MDX routes were discovered")
  assertUnique(
    posts.map((post) => post.slug),
    "Canonical blog frontmatter",
  )

  const postsBySlug = new Map(posts.map((post) => [post.slug, post]))

  for (const post of posts) {
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

  const seriesBySlug = new Map(
    series.map((definition) => [definition.slug, definition]),
  )
  const seriesPostsBySlug = new Map(
    series.map((definition) => [definition.slug, []]),
  )

  for (const post of posts) {
    if (!post.series) continue

    assert.ok(
      seriesBySlug.has(post.series.slug),
      `Post ${post.slug} references unknown series ${post.series.slug}`,
    )
    seriesPostsBySlug.get(post.series.slug).push(post)
  }

  for (const definition of series) {
    const seriesPosts = seriesPostsBySlug.get(definition.slug)
    assert.ok(
      seriesPosts,
      `Missing derived series collection for ${definition.slug}`,
    )
    assert.ok(seriesPosts.length > 0, `Series ${definition.slug} has no posts`)

    seriesPosts.sort((left, right) => left.series.order - right.series.order)

    const orders = seriesPosts.map((post) => post.series.order)
    assertUnique(orders, `Series ${definition.slug} order values`)
    assert.deepEqual(
      orders,
      seriesPosts.map((_, index) => index + 1),
      `Series ${definition.slug} order values must be contiguous from 1`,
    )
  }

  return {
    posts,
    postsBySlug,
    series,
    seriesBySlug,
    seriesPostsBySlug,
  }
}

function projectBlogPost(post) {
  return {
    slug: post.slug,
    status: post.status,
    title: post.title,
    description: post.description,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags,
    relatedSlugs: post.relatedSlugs,
    ...(post.series ? { series: post.series } : {}),
  }
}

export function buildBlogMetadataModule(inventory) {
  const posts = inventory.posts.map(projectBlogPost)

  return [
    "// Generated from canonical blog MDX frontmatter. Do not edit by hand.",
    'import type { BlogPost } from "~/content/blog"',
    "",
    `export const blogPosts = ${JSON.stringify(posts, null, 2)} satisfies BlogPost[]`,
    "",
  ].join("\n")
}

function latestDate(posts) {
  assert.ok(posts.length > 0, "Cannot calculate a latest date for no posts")
  return posts
    .map((post) => post.date)
    .sort()
    .at(-1)
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
  const location =
    pathname === "/" ? `${siteOrigin}/` : `${siteOrigin}${pathname}`
  const lines = ["  <url>", `    <loc>${escapeXml(location)}</loc>`]

  if (lastmod) {
    lines.push(`    <lastmod>${lastmod}</lastmod>`)
  }

  lines.push("  </url>")
  return lines.join("\n")
}

export function buildSitemapXml(inventory) {
  const entries = staticPathsBeforeBlogContent.map((pathname) => ({ pathname }))

  entries.push({
    pathname: "/blog",
    lastmod: latestDate(inventory.posts),
  })

  for (const definition of inventory.series) {
    const posts = inventory.seriesPostsBySlug.get(definition.slug)
    assert.ok(posts, `Missing posts for series ${definition.slug}`)

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
    if (post.series) continue
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
