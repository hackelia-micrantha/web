import type {
  HeadersFunction,
  LinksFunction,
  MetaFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"

import { Navigation, Footer, Analytics } from "./components"
import { getDocumentCacheControl } from "./services/cache-policy.server"
import { getFortune } from "./services/fortune.server"
import { resolveRuntimePlatform } from "./services/platform.server"

import type { Fortune } from "./model"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/tailwind.css" },
  { rel: "shortcut icon", href: "/icon/favicon.ico" },
  { rel: "manifest", href: "/icon/site.webmanifest" },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/icon/apple-touch-icon.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/icon/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/icon/favicon-16x16.png",
  },
]

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { title: "Micrantha Software Solutions" },
  { viewport: "width=device-width,initial-scale=1" },
  { description: "a software as a service and consulting company" },
  { name: "robots", content: "index,follow" },
  {
    keywords:
      "sass, software, consulting, c, c++, objective-c, swift, java, kotlin, mobile, pwa, frontend, backend, android, ios, database, postgresql, infrastructure, deployment, architecture, design, testing, maintenance, golang, javascript, typescript",
  },
  { property: "og:site_name", content: "Micrantha Software" },
  { property: "og:title", content: "Micrantha Software Solutions" },
  {
    property: "og:description",
    content: "A software as a service and consulting company.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://micrantha.com" },
  { property: "og:image", content: "https://micrantha.com/img/logo.png" },
  { name: "twitter:card", content: "summary" },
  { name: "twitter:title", content: "Micrantha Software Solutions" },
  {
    name: "twitter:description",
    content: "A software as a service and consulting company.",
  },
]

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const cacheControl =
    loaderHeaders.get("Cache-Control") ??
    "public, max-age=60, s-maxage=300, stale-while-revalidate=600"

  return {
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Cache-Control": cacheControl,
  }
}

type State = {
  fortune: Fortune | null
  analyticsId: string | null
}

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const runtime = resolveRuntimePlatform(context, request)
  const fortune = await getFortune({
    cache: runtime.edgeCache,
    origin: runtime.origin,
  })
  const cacheControl = getDocumentCacheControl(new URL(request.url).pathname)

  return new Response(JSON.stringify({ fortune, analyticsId: runtime.analyticsId }), {
    headers: {
      "Cache-Control": cacheControl,
      "Content-Type": "application/json; charset=utf-8",
    },
  })
}

export default function App() {
  const isDev =
    typeof process !== "undefined"
      ? process.env.NODE_ENV === "development"
      : false

  const state = useLoaderData() as State | null
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Micrantha Software",
      url: "https://micrantha.com",
      logo: "https://micrantha.com/img/logo.png",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Micrantha Software",
      url: "https://micrantha.com",
    },
  ]

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <Navigation />
        <main id="content" className="body container mx-auto px-10">
          <Outlet />
        </main>
        <Footer fortune={state?.fortune?.text} />
        <ScrollRestoration />
        <Scripts />
        <Analytics id={state?.analyticsId} />
        {isDev ? <LiveReload /> : null}
      </body>
    </html>
  )
}
