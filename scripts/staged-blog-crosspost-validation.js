import assert from "node:assert/strict"
import { readFile, readdir, stat } from "node:fs/promises"
import path from "node:path"

import { repositoryRoot } from "./blog-content-inventory.js"
import { validateBlogMdxSource } from "./blog-mdx-validation.js"
import { validateBlogMermaidBlocks } from "./blog-mermaid-validation.js"

const stagedDirectory = path.join(repositoryRoot, "editorial", "staged")

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile()
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

async function isPresent(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

export async function validateStagedBlogCrossposts(inventory) {
  let entries
  try {
    entries = await readdir(stagedDirectory, { withFileTypes: true })
  } catch (error) {
    if (error?.code === "ENOENT") return 0
    throw error
  }

  const knownSlugs = new Set(inventory.posts.map((post) => post.slug))
  const metadata = await readFile(
    path.join(repositoryRoot, "app/content/blog.generated.ts"),
    "utf8",
  )
  const sitemap = await readFile(
    path.join(repositoryRoot, "public/sitemap.xml"),
    "utf8",
  )

  for (const entry of entries) {
    assert.ok(entry.isDirectory(), "Staging entries must be directories")
    assert.match(entry.name, /^blog\.[a-z0-9-]+$/, "Invalid staged blog folder")

    const slug = entry.name.slice("blog.".length)
    const relativeContentPath = path.join(
      "editorial",
      "staged",
      entry.name,
      "content.mdx",
    )
    const directory = path.join(stagedDirectory, entry.name)
    const source = await readFile(path.join(directory, "content.mdx"), "utf8")
    const cover = path.join(directory, "cover.webp")
    const template = path.join(directory, "route.tsx.template")
    const readme = path.join(directory, "README.md")
    const header = source.split("\n---\n", 1)[0]

    assert.ok(source.startsWith("---\n"), "Staged MDX must have frontmatter")
    assert.ok(
      header.split("\n").includes("slug: " + slug),
      "Staged slug differs from folder",
    )
    assert.ok(
      header.split("\n").includes("status: draft"),
      "Staged MDX must remain a draft",
    )
    assert.equal(knownSlugs.has(slug), false, "Staged slug is publicly routed")
    assert.equal(
      await isPresent(path.join(repositoryRoot, "app/routes", entry.name)),
      false,
      "Staged article must not have an app route",
    )
    assert.equal(
      await isPresent(
        path.join(repositoryRoot, "public/img/blog", slug + ".webp"),
      ),
      false,
      "Staged cover must not be in public assets",
    )
    assert.equal(
      metadata.includes('slug: "' + slug + '"'),
      false,
      "Staged article must not appear in generated metadata",
    )
    assert.equal(
      sitemap.includes("/blog/" + slug),
      false,
      "Staged article must not appear in sitemap",
    )
    assert.ok(await isFile(cover), "Missing private staged cover")
    assert.ok(await isFile(template), "Missing staged route template")
    assert.ok(await isFile(readme), "Missing staging/promotion notes")

    const expectedCoverUrl = "/img/blog/" + slug + ".webp"
    await validateBlogMdxSource({
      source,
      relativePath: relativeContentPath,
      knownPostSlugs: knownSlugs,
      assetExists: async (url) =>
        url === expectedCoverUrl && (await isFile(cover)),
    })
    validateBlogMermaidBlocks(source, relativeContentPath)
  }

  return entries.length
}
