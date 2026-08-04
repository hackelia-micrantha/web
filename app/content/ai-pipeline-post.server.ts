import { defineBlogMdxPost } from "~/content/blog-mdx"
import { attributes } from "~/content/posts/ai-pipelines-need-control-boundaries.mdx"

export const AI_PIPELINE_POST_SLUG = "ai-pipelines-need-control-boundaries"

export const aiPipelinePost = defineBlogMdxPost(
  attributes,
  AI_PIPELINE_POST_SLUG,
)
