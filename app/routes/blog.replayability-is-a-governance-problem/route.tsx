import { createBlogMdxRoute } from "~/content/blog-mdx-route"

import Content from "./content.mdx"

const route = createBlogMdxRoute(
  "replayability-is-a-governance-problem",
  Content,
)

export const meta = route.meta
export const handle = route.handle
export default route.Component
