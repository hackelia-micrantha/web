import type { MetaFunction } from "@remix-run/node"
import { createBlogMdxRoute } from "~/content/blog-mdx-route"

import Content from "./content.mdx"

// The personal essay is the canonical edition; this is a Micrantha cross-post.
const canonicalUrl = "https://ryanjennin.gs/posts/ai-chat-not-a-database/"
const coverUrl = "https://micrantha.com/img/blog/ai-chat-not-a-database.webp"
const coverAlt =
  "Editorial illustration about AI conversation memory and authoritative application state"

const route = createBlogMdxRoute("ai-chat-not-a-database", Content)

export const meta: MetaFunction = (args) =>
  route.meta(args).map((descriptor) => {
    if (
      "tagName" in descriptor &&
      descriptor.tagName === "link" &&
      "rel" in descriptor &&
      descriptor.rel === "canonical"
    ) {
      return { ...descriptor, href: canonicalUrl }
    }

    if ("property" in descriptor) {
      if (descriptor.property === "og:image") {
        return { ...descriptor, content: coverUrl }
      }
      if (descriptor.property === "og:image:alt") {
        return { ...descriptor, content: coverAlt }
      }
    }

    if ("name" in descriptor) {
      if (descriptor.name === "twitter:image") {
        return { ...descriptor, content: coverUrl }
      }
      if (descriptor.name === "twitter:image:alt") {
        return { ...descriptor, content: coverAlt }
      }
    }

    return descriptor
  })

export const handle = {
  structuredData: {
    ...route.handle.structuredData,
    author: { "@type": "Person", name: "Ryan Jennings" },
    image: [coverUrl],
    isBasedOn: canonicalUrl,
  },
}

export default route.Component
