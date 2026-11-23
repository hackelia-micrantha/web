import { redirect } from "@remix-run/node"

export const loader = () => redirect("/blog/series/ai-research-transforming-tools", 301)

export default function ResearchSeriesRedirect() {
  return null
}
