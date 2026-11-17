import { createBlogCrosspostRoute } from "~/content/blog-crosspost-route"
import Content from "./content.mdx"

const route = createBlogCrosspostRoute(
  "ai-native-sdlc-governed-software-delivery",
  Content,
  "https://ryanjennin.gs/posts/ai-native-sdlc-governed-software-delivery/",
  "/img/blog/ai-native-sdlc-governed-software-delivery.webp",
  "Pastel layered software delivery pipeline connecting code, verification, security controls, and organizational governance.",
)

export const meta = route.meta
export const handle = route.handle
export default route.Component
