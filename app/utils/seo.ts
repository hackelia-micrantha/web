import type { MetaDescriptor } from "@remix-run/node"

const SITE_NAME = "Micrantha Software"
const SITE_TITLE = "Micrantha Software Solutions"
const SITE_URL = "https://micrantha.com"
const DEFAULT_IMAGE = `${SITE_URL}/img/logo.png`

type PageMetaOptions = {
  title: string
  description: string
  path: string
}

export function buildPageMeta({
  title,
  description,
  path,
}: PageMetaOptions): MetaDescriptor[] {
  const url = new URL(path, SITE_URL).toString()

  return [
    { title: `${SITE_NAME} | ${title}` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: `${SITE_NAME} | ${title}` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: DEFAULT_IMAGE },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: `${SITE_NAME} | ${title}` },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: DEFAULT_IMAGE },
  ]
}

export function buildSiteMeta(): MetaDescriptor[] {
  return [
    { charset: "utf-8" },
    { title: SITE_TITLE },
    { viewport: "width=device-width,initial-scale=1" },
    {
      name: "description",
      content:
        "Micrantha builds resilient software systems from discovery to production.",
    },
    { name: "robots", content: "index,follow" },
    {
      name: "keywords",
      content:
        "saas, software, consulting, mobile, frontend, backend, infrastructure, deployment, architecture, testing, javascript, typescript",
    },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: SITE_TITLE },
    {
      property: "og:description",
      content:
        "Micrantha builds resilient software systems from discovery to production.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: SITE_URL },
    { property: "og:image", content: DEFAULT_IMAGE },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SITE_TITLE },
    {
      name: "twitter:description",
      content:
        "Micrantha builds resilient software systems from discovery to production.",
    },
    { name: "twitter:image", content: DEFAULT_IMAGE },
  ]
}
