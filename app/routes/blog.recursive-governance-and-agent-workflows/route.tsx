import { createBlogMdxRoute } from "~/content/blog-mdx-route"

import Content from "./content.mdx"

const route = createBlogMdxRoute(
  "recursive-governance-and-agent-workflows",
  Content,
)

export const meta = route.meta
export const handle = route.handle
export default route.Component
