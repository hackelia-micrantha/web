import assert from "node:assert/strict"

export function assertUnique(values, context) {
  assert.equal(
    new Set(values).size,
    values.length,
    `${context} contains duplicate values`,
  )
}

export function validateBlogSeriesMembership(posts, series) {
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

  return { seriesBySlug, seriesPostsBySlug }
}
