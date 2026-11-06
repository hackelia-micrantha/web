import { createBlogCrosspostRoute } from "~/content/blog-crosspost-route"
import Content from "./content.mdx"

const route = createBlogCrosspostRoute(
  "secure-auth-systems-reference",
  Content,
  "https://ryanjennin.gs/posts/secure-auth-systems-reference/",
  "/img/blog/secure-auth-systems-reference.webp",
  "Illustration for a secure authentication reference architecture.",
)

export const meta = route.meta
export const handle = route.handle
export default route.Component
