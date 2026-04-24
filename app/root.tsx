import type {
  HeadersFunction,
  LinksFunction,
  MetaFunction,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
} from "@remix-run/react"

import { Navigation, Footer, Analytics } from "./components"
import { getDocumentCacheControl } from "./services/cache-policy.server"
import { resolveRuntimePlatform } from "./services/platform.server"
import { buildSiteMeta } from "./utils/seo"

const NONCE_HEADER = "X-CSP-Nonce"

function buildContentSecurityPolicy(nonce: string, isDev: boolean) {
  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    "https://analytics.micrantha.com",
  ]
  const connectSources = ["'self'", "https://analytics.micrantha.com"]

  if (isDev) {
    connectSources.push("ws:", "wss:")
    scriptSources.push("'unsafe-eval'")
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' https: data:",
    "manifest-src 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `script-src ${scriptSources.join(" ")}`,
  ].join("; ")
}

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

export const meta: MetaFunction = () => buildSiteMeta()

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const cacheControl =
    loaderHeaders.get("Cache-Control") ??
    "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
  const nonce = loaderHeaders.get(NONCE_HEADER)
  const isDev =
    typeof process !== "undefined"
      ? process.env.NODE_ENV === "development"
      : false

  const headers: Record<string, string> = {
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Cache-Control": cacheControl,
  }

  if (!isDev && nonce) {
    headers["Content-Security-Policy"] = buildContentSecurityPolicy(
      nonce,
      isDev,
    )
    headers["Strict-Transport-Security"] = "max-age=31536000"
  }

  return headers
}

type State = { analyticsId: string | null; nonce: string }

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const runtime = resolveRuntimePlatform(context, request)
  const cacheControl = getDocumentCacheControl(new URL(request.url).pathname)
  const nonce = globalThis.crypto.randomUUID()

  return new Response(
    JSON.stringify({ analyticsId: runtime.analyticsId, nonce }),
    {
      headers: {
        "Cache-Control": cacheControl,
        "Content-Type": "application/json; charset=utf-8",
        [NONCE_HEADER]: nonce,
      },
    },
  )
}

export default function App() {
  const isDev =
    typeof process !== "undefined"
      ? process.env.NODE_ENV === "development"
      : false

  const state = useLoaderData() as State | null
  const matches = useMatches()
  const routeStructuredData = matches.flatMap((match) => {
    const candidate = (match.handle as { structuredData?: unknown } | undefined)
      ?.structuredData
    const resolvedCandidate =
      typeof candidate === "function"
        ? (candidate as (data: unknown) => unknown)(match.data)
        : candidate

    return resolvedCandidate ? [resolvedCandidate] : []
  })
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
    ...routeStructuredData,
  ]

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          nonce={state?.nonce}
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
        <main
          id="content"
          className="body mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
        >
          <Outlet />
        </main>
        <Footer />
        <ScrollRestoration nonce={state?.nonce} />
        <Scripts nonce={state?.nonce} />
        <Analytics id={state?.analyticsId} nonce={state?.nonce} />
        {isDev ? <LiveReload nonce={state?.nonce} /> : null}
      </body>
    </html>
  )
}
