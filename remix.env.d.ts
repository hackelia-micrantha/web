/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

declare module "react-dom/server.browser" {
  export * from "react-dom/server"
}

declare module "*.mdx" {
  export const attributes: unknown
  export const filename: string

  const Content: import("react").ComponentType<{
    components?: Record<string, import("react").ElementType>
  }>

  export default Content
}
