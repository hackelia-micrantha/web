/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

import type { ComponentType } from "react"

declare module "react-dom/server.browser" {
  export * from "react-dom/server"
}

declare module "*.mdx" {
  export const attributes: unknown
  export const filename: string

  const Content: ComponentType<{
    components?: Record<string, ComponentType<Record<string, unknown>>>
  }>

  export default Content
}
