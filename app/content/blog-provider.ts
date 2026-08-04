import type { BlogPost } from "~/content/blog"
import { blogPosts } from "~/content/blog.generated"
import { filterPublishedBlogPosts } from "~/content/blog-publication.js"

export interface BlogContentProvider {
  getPosts(): BlogPost[]
  getPostBySlug(slug: string): BlogPost | null
}

const publishedBlogPosts = filterPublishedBlogPosts(blogPosts)

export const blogContentProvider: BlogContentProvider = {
  getPosts() {
    return publishedBlogPosts
  },

  getPostBySlug(slug: string) {
    return publishedBlogPosts.find((post) => post.slug === slug) ?? null
  },
}

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
