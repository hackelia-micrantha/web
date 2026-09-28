import type { MetaDescriptor } from "@remix-run/node"

const SITE_NAME = "Micrantha Software"
const SITE_TITLE = "Micrantha Software"
const SITE_URL = "https://micrantha.com"
const DEFAULT_IMAGE = `${SITE_URL}/img/logo.png`

type PageMetaOptions = {
  title: string
  description: string
  path: string
}

type ArticleMetaOptions = PageMetaOptions & {
  publishedTime: string
  modifiedTime?: string
  tags?: string[]
}

type CollectionItem = {
  name: string
  description: string
  url?: string
}

type CollectionStructuredDataOptions = {
  name: string
  description: string
  path: string
  items: CollectionItem[]
}

type ArticleStructuredDataOptions = {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified?: string
  keywords?: string[]
}

export function buildPageMeta({
  title,
  description,
  path,
}: PageMetaOptions): MetaDescriptor[] {
  const url = new URL(path, SITE_URL).toString()

  return [
    { title: `${title} | ${SITE_NAME}` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: `${title} | ${SITE_NAME}` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: DEFAULT_IMAGE },
    { property: "og:image:alt", content: SITE_NAME },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: `${title} | ${SITE_NAME}` },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: DEFAULT_IMAGE },
    { name: "twitter:image:alt", content: SITE_NAME },
  ]
}

export function buildArticleMeta({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  tags = [],
}: ArticleMetaOptions): MetaDescriptor[] {
  const url = new URL(path, SITE_URL).toString()

  return [
    { title: `${title} | ${SITE_NAME}` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: `${title} | ${SITE_NAME}` },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
    { property: "og:image", content: DEFAULT_IMAGE },
    { property: "og:image:alt", content: SITE_NAME },
    { property: "article:published_time", content: publishedTime },
    ...(modifiedTime
      ? [{ property: "article:modified_time", content: modifiedTime }]
      : []),
    ...tags.map((tag) => ({ property: "article:tag", content: tag })),
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: `${title} | ${SITE_NAME}` },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: DEFAULT_IMAGE },
    { name: "twitter:image:alt", content: SITE_NAME },
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
    { property: "og:image:alt", content: SITE_NAME },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SITE_TITLE },
    {
      name: "twitter:description",
      content:
        "Micrantha builds resilient software systems from discovery to production.",
    },
    { name: "twitter:image", content: DEFAULT_IMAGE },
    { name: "twitter:image:alt", content: SITE_NAME },
  ]
}

export function buildCollectionPageStructuredData({
  name,
  description,
  path,
  items,
}: CollectionStructuredDataOptions) {
  const url = new URL(path, SITE_URL).toString()

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        ...(item.url ? { url: new URL(item.url, SITE_URL).toString() } : {}),
        item: {
          "@type": "Thing",
          name: item.name,
          description: item.description,
        },
      })),
    },
  }
}

export function buildArticleStructuredData({
  title,
  description,
  path,
  datePublished,
  dateModified,
  keywords = [],
}: ArticleStructuredDataOptions) {
  const url = new URL(path, SITE_URL).toString()

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished,
    ...(dateModified ? { dateModified } : {}),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_IMAGE,
      },
    },
    image: [DEFAULT_IMAGE],
    keywords,
  }
}
