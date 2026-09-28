import assert from "node:assert/strict"
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs"
import path from "node:path"
import test from "node:test"

import { getDocumentCachePolicy } from "../../app/services/cache-policy.js"

const routesDirectory = "app/routes"

function read(filePath) {
  return readFileSync(filePath, "utf8")
}

function staticPublicRoutes() {
  return readdirSync(routesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
    .filter(
      (entry) =>
        !entry.name.startsWith("api.") &&
        !entry.name.startsWith("runtime-contract.") &&
        entry.name !== "blog.tsx" &&
        !entry.name.includes("$"),
    )
    .map((entry) => {
      if (entry.name === "_index.tsx") {
        return { pathname: "/", file: path.join(routesDirectory, entry.name) }
      }

      if (entry.name.endsWith("._index.tsx")) {
        return {
          pathname: `/${entry.name.slice(0, -"._index.tsx".length)}`,
          file: path.join(routesDirectory, entry.name),
        }
      }

      const routeName = entry.name.slice(0, -".tsx".length)
      assert.equal(
        routeName.includes("."),
        false,
        `unexpected static public route filename: ${entry.name}`,
      )

      return {
        pathname: `/${routeName}`,
        file: path.join(routesDirectory, entry.name),
      }
    })
    .sort((left, right) => left.pathname.localeCompare(right.pathname))
}

function walkSourceFiles(directory) {
  const files = []

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...walkSourceFiles(entryPath))
      continue
    }

    if (/\.(?:ts|tsx|js|jsx|mdx)$/u.test(entry.name)) {
      files.push(entryPath)
    }
  }

  return files
}

function staticAssetReferences(source) {
  return [
    ...source.matchAll(
      /(?:src|href)=["'](\/(?:img|icon)\/[^"'?#]+|\/(?:navigation\.js|accessibility\.css))["']/gu,
    ),
  ].map((match) => match[1])
}

test("every static public route has an explicit cache and canonical metadata contract", () => {
  const routes = staticPublicRoutes()

  assert.ok(routes.length > 0)

  for (const route of routes) {
    const policy = getDocumentCachePolicy(route.pathname)

    assert.notEqual(
      policy.className,
      "private",
      `${route.pathname} is routable but has no public cache classification`,
    )

    const source = read(route.file)

    if (route.pathname === "/contact") {
      assert.match(source, /redirect\("\/services", 301\)/u)
      continue
    }

    assert.match(
      source,
      /buildPageMeta\s*\(/u,
      `${route.pathname} must use the shared page metadata builder`,
    )
    assert.match(
      source,
      new RegExp(`path:\\s*["']${route.pathname.replaceAll("/", "\\/")}["']`, "u"),
      `${route.pathname} must declare its own canonical metadata path`,
    )
  }
})

test("shell navigation only points at classified internal public routes", () => {
  const shellSources = [
    read("app/components/navigation.tsx"),
    read("app/components/footer.tsx"),
  ]

  const links = new Set(
    shellSources.flatMap((source) =>
      [...source.matchAll(/(?:to|href)=["'](\/[^"'?#]*)["']/gu)].map(
        (match) => match[1],
      ),
    ),
  )

  assert.ok(links.size > 0)

  for (const pathname of links) {
    assert.notEqual(
      getDocumentCachePolicy(pathname).className,
      "private",
      `shell link ${pathname} does not resolve to a classified public route`,
    )
  }
})

test("source-authored static asset references exist under public", () => {
  const references = new Map()

  for (const filePath of walkSourceFiles("app")) {
    for (const reference of staticAssetReferences(read(filePath))) {
      if (!references.has(reference)) {
        references.set(reference, [])
      }
      references.get(reference).push(filePath)
    }
  }

  assert.ok(references.size > 0)

  for (const [reference, owners] of references) {
    const publicPath = path.join("public", reference.slice(1))

    assert.equal(
      existsSync(publicPath) && statSync(publicPath).isFile(),
      true,
      `${reference} referenced by ${owners.join(", ")} is missing from public/`,
    )
  }
})
