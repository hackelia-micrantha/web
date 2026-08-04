import { createBlogMdxRoute } from "~/content/blog-mdx-route"

import Content from "./content.mdx"

const route = createBlogMdxRoute(
  "secure-platform-integration-is-not-plumbing",
  Content,
)

export const meta = route.meta
export const handle = route.handle
export default route.Component
