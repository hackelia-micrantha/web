export type BlogPublicationStatus = "draft" | "published"

export type BlogSeriesMembership = {
  slug: string
  order: number
}

export type BlogPost = {
  slug: string
  status: BlogPublicationStatus
  title: string
  description: string
  date: string
  excerpt: string
  tags: string[]
  relatedSlugs: string[]
  series?: BlogSeriesMembership
}

export const BLOG_TITLE = "Architecture Notes"
export const BLOG_DESCRIPTION =
  "Architecture notes on secure platform integration, delivery governance, AI-assisted systems, and long-lived software design."

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}
