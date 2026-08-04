declare module "*.mdx" {
  import type { ComponentType, ElementType } from "react"

  export const attributes: Record<string, unknown>

  const MdxComponent: ComponentType<{
    components?: Record<string, ElementType>
  }>

  export default MdxComponent
}
