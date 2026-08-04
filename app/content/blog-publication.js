const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const BLOG_PUBLICATION_STATUSES = Object.freeze(["draft", "published"])

export function isCalendarDate(value) {
  if (typeof value !== "string" || !CALENDAR_DATE_PATTERN.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00Z`)

  return (
    !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
  )
}

export function resolvePublicationCutoff(value, now = new Date()) {
  const cutoff = value ?? now.toISOString().slice(0, 10)

  if (!isCalendarDate(cutoff)) {
    throw new Error("Blog publication cutoff must be a valid YYYY-MM-DD date")
  }

  return cutoff
}

export function getBlogPublicationStatus(post) {
  return post?.status ?? null
}

export function isPublishedBlogPost(post) {
  return getBlogPublicationStatus(post) === "published"
}

export function filterPublishedBlogPosts(posts) {
  return posts.filter(isPublishedBlogPost)
}

function assertKnownStatus(status, context) {
  if (!BLOG_PUBLICATION_STATUSES.includes(status)) {
    throw new Error(`${context} has unsupported publication status ${status}`)
  }
}

function assertRoutableRecord(post, cutoff, context) {
  if (!post || typeof post.slug !== "string" || post.slug.trim() === "") {
    throw new Error(`${context} must have a non-empty slug`)
  }

  if (!isCalendarDate(post.date)) {
    throw new Error(`${context} must have a valid YYYY-MM-DD date`)
  }

  const status = getBlogPublicationStatus(post)

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
  { cutoff = resolvePublicationCutoff() } = {},
) {
  const validatedCutoff = resolvePublicationCutoff(cutoff)
  const routableSlugs = new Set()

  for (const [index, post] of posts.entries()) {
    const context = `Blog post ${post?.slug ?? index}`

    if (post?.slug && routableSlugs.has(post.slug)) {
      throw new Error(`Duplicate routable blog slug ${post.slug}`)
    }

    assertRoutableRecord(post, validatedCutoff, context)
    routableSlugs.add(post.slug)
  }

  return posts
}

export function assertRoutableMdxPublication(
  post,
  { cutoff = resolvePublicationCutoff() } = {},
) {
  const validatedCutoff = resolvePublicationCutoff(cutoff)

  assertRoutableRecord(
    post,
    validatedCutoff,
    `MDX route ${post?.slug ?? ""}`,
  )

  return post
}
