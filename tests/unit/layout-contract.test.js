import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) => readFileSync(path, "utf8")

test("site shell keeps bounded width and shared responsive gutters", () => {
  const root = read("app/root.tsx")
  const navigation = read("app/components/navigation.tsx")
  const footer = read("app/components/footer.tsx")

  assert.match(root, /max-w-6xl px-4 py-8 sm:px-6 lg:px-8/)
  assert.match(navigation, /max-w-6xl items-center justify-between gap-4/)
  assert.match(navigation, /px-4 py-3[\s\S]*sm:px-6 lg:px-8/)
  assert.match(footer, /px-4 py-8[\s\S]*sm:px-6 lg:px-8/)
  assert.match(footer, /max-w-6xl flex-col items-center gap-4/)
})

test("repeated content collections retain responsive grid behavior", () => {
  const support = read("app/routes/support.tsx")
  const blog = read("app/routes/blog._index.tsx")
  const home = read("app/routes/_index.tsx")

  assert.match(support, /grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3/)
  assert.match(blog, /grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3/)

  const homeThreeColumnGrids = home.match(
    /grid grid-cols-1 gap-4 md:grid-cols-3/g,
  )
  assert.ok(
    (homeThreeColumnGrids?.length ?? 0) >= 3,
    "homepage should retain its repeated one-to-three-column collections",
  )
})

test("wrapped metadata and footer groups retain asymmetric gaps", () => {
  const footer = read("app/components/footer.tsx")
  const article = read("app/components/blog-article-layout.tsx")

  assert.match(
    footer,
    /flex w-full max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-2/,
  )
  assert.match(
    article,
    /article-meta-row flex flex-wrap items-center gap-x-4 gap-y-2/,
  )
})

test("stack-to-row compositions retain their responsive relationship", () => {
  const home = read("app/routes/_index.tsx")
  const article = read("app/components/blog-article-layout.tsx")

  assert.match(
    home,
    /flex flex-col items-start justify-center gap-8 md:flex-row md:items-center/,
  )
  assert.match(
    home,
    /flex flex-col gap-6 md:flex-row md:items-end md:justify-between/,
  )
  assert.match(
    article,
    /flex flex-col gap-4 md:flex-row md:items-start md:justify-between/,
  )
})

test("vertical rhythm remains explicit in page and component composition", () => {
  const pageTitle = read("app/components/page-title.tsx")
  const services = read("app/routes/services.tsx")
  const card = read("app/components/card.tsx")

  assert.match(pageTitle, /page-title mb-10 space-y-4/)
  assert.match(services, /section className="space-y-4"/)
  assert.match(card, /flex w-full flex-col/)
  assert.match(card, /mt-4 grow/)
  assert.match(card, /mt-4 flex justify-end gap-2/)
})
