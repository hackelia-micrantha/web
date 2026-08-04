const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const BLOG_PUBLICATION_STATUSES = Object.freeze(["draft", "published"])

export const blogPublicationManifest = Object.freeze({
  "governance-native-engineering-control-plane": Object.freeze({
    status: "published",
  }),
  "replayability-is-a-governance-problem": Object.freeze({
    status: "published",
  }),
  "recursive-governance-and-agent-workflows": Object.freeze({
    status: "published",
  }),
  "secure-platform-integration-is-not-plumbing": Object.freeze({
    status: "published",
  }),
  "ai-pipelines-need-control-boundaries": Object.freeze({
    status: "published",
  }),
  "software-layers-are-risk-boundaries": Object.freeze({
    status: "published",
  }),
})

export function isCalendarDate(value) {
  if (typeof value !== "string" || !CALENDAR_DATE_PATTERN.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00Z`)

  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  )
}

export function resolvePublicationCutoff(value, now = new Date()) {
  const cutoff = value ?? now.toISOString().slice(0, 10)

  if (!isCalendarDate(cutoff)) {
    throw new Error("Blog publication cutoff must be a valid YYYY-MM-DD date")
  }

  return cutoff
}

export function getBlogPublicationStatus(
  slug,
  manifest = blogPublicationManifest,
) {
  return manifest[slug]?.status ?? null
}

export function isPublishedBlogPost(post, manifest = blogPublicationManifest) {
  return getBlogPublicationStatus(post.slug, manifest) === "published"
}

export function filterPublishedBlogPosts(
  posts,
  manifest = blogPublicationManifest,
) {
  return posts.filter((post) => isPublishedBlogPost(post, manifest))
}

function assertKnownStatus(status, context) {
  if (!BLOG_PUBLICATION_STATUSES.includes(status)) {
    throw new Error(`${context} has unsupported publication status ${status}`)
  }
}

function assertRoutableRecord(post, manifest, cutoff, context) {
  if (!post || typeof post.slug !== "string" || post.slug.trim() === "") {
    throw new Error(`${context} must have a non-empty slug`)
  }

  if (!isCalendarDate(post.date)) {
    throw new Error(`${context} must have a valid YYYY-MM-DD date`)
  }

  const status = getBlogPublicationStatus(post.slug, manifest)

  if (status === null) {
    throw new Error(`${context} is missing publication metadata`)
  }

  assertKnownStatus(status, context)

  if (status !== "published") {
    throw new Error(`${context} is ${status} but remains routable`)
  }

  if (post.date > cutoff) {
    throw new Error(
      `${context} is dated ${post.date}, after publication cutoff ${cutoff}`,
    )
  }
}

export function assertRoutableBlogPublication(
  posts,
  {
    manifest = blogPublicationManifest,
    cutoff = resolvePublicationCutoff(),
  } = {},
) {
  const routableSlugs = new Set()

  for (const [index, post] of posts.entries()) {
    const context = `Blog post ${post?.slug ?? index}`

    if (post?.slug && routableSlugs.has(post.slug)) {
      throw new Error(`Duplicate routable blog slug ${post.slug}`)
    }

    assertRoutableRecord(post, manifest, cutoff, context)
    routableSlugs.add(post.slug)
  }

  for (const [slug, publication] of Object.entries(manifest)) {
    assertKnownStatus(publication?.status, `Publication entry ${slug}`)

    if (publication.status === "published" && !routableSlugs.has(slug)) {
      throw new Error(
        `Published publication entry ${slug} is missing routable metadata`,
      )
    }
  }

  return posts
}

export function assertRoutableMdxPublication(
  post,
  {
    manifest = blogPublicationManifest,
    cutoff = resolvePublicationCutoff(),
  } = {},
) {
  assertRoutableRecord(post, manifest, cutoff, `MDX route ${post?.slug ?? ""}`)

  if (post.status !== "published") {
    throw new Error(`MDX route ${post.slug} must declare status published`)
  }

  return post
}
