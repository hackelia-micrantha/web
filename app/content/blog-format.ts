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
