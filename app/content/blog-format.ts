export const BLOG_TITLE = "Architecture Notes"

export const BLOG_DESCRIPTION =
  "Practical notes on secure integration, delivery governance, AI-assisted systems, and durable software boundaries."

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}
