import type {
  LinksFunction,
  MetaFunction,
  LoaderFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"

import tailwind from "./tailwind.css"

import { Navigation, Footer, Analytics } from "./components"

import type { Fortune } from "./model"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
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

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Micrantha Software Solutions",
  viewport: "width=device-width,initial-scale=1",
  description: "a software as a service and consulting company",
  keywords:
    "sass, software, consulting, c, c++, objective-c, swift, java, kotlin, mobile, pwa, frontend, backend, android, ios, database, postgresql, infrastructure, deployment, architecture, design, testing, maintenance, golang, javascript, typescript",
})

type State = {
  fortune: Fortune | null
  analyticsId: string | null
}

export const loader: LoaderFunction = async () => {
  try {
    const res = await fetch(
      "https://fortunes.micrantha.com/api/v1/random?s=true",
    )
    const fortune = await res.json()
    const analyticsId = process.env.FORTUNES_ANALYTICS_ID

    return json({ fortune, analyticsId })
  } catch (e) {
    return null
  }
}

export default function App() {
  const state = useLoaderData() as State | null

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Navigation />
        <div className="body container mx-auto px-10">
          <Outlet />
        </div>
        <Footer fortune={state?.fortune?.text} />
        <ScrollRestoration />
        <Scripts />
        <Analytics id={state?.analyticsId} />
        <LiveReload />
      </body>
    </html>
  )
}
