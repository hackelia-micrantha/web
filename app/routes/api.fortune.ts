import type { LoaderFunctionArgs } from "@remix-run/cloudflare"

import { getFortune } from "~/services/fortune.server"
import { resolveRuntimePlatform } from "~/services/platform.server"

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const runtime = resolveRuntimePlatform(context, request)
  const fortune = await getFortune({
    cache: runtime.edgeCache,
    origin: runtime.origin,
  })

  return new Response(JSON.stringify(fortune), {
    headers: {
      "Cache-Control":
        "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json; charset=utf-8",
    },
  })
}
