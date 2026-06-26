import type { BlogPost } from "~/content/blog"
import { blogPosts } from "~/content/blog"
import { agentPermissionBlogPosts } from "~/content/blog-agent-permissions"
import { governanceNativeBlogPosts } from "~/content/blog-governance-native"

export interface BlogContentProvider {
  getPosts(): BlogPost[]
  getPostBySlug(slug: string): BlogPost | null
}

const tsxBlogPosts: BlogPost[] = [
  ...agentPermissionBlogPosts,
  ...governanceNativeBlogPosts,
  ...blogPosts,
]

export const tsxBlogProvider: BlogContentProvider = {
  getPosts() {
    return tsxBlogPosts
  },

  getPostBySlug(slug: string) {
    return tsxBlogPosts.find((post) => post.slug === slug) ?? null
  },
}

export const blogContentProvider = tsxBlogProvider

export function getBlogPosts() {
  return blogContentProvider.getPosts()
}

export function getBlogPostBySlug(slug: string) {
  return blogContentProvider.getPostBySlug(slug)
}

export function getRelatedPosts(post: BlogPost) {
  return post.relatedSlugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((candidate): candidate is BlogPost => candidate !== null)
}
