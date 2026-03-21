import type { EntryContext } from "@remix-run/node"
import { RemixServer } from "@remix-run/react"
import { isbot } from "isbot"
import { renderToReadableStream } from "react-dom/server.browser"

const ABORT_DELAY = 5000

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const userAgent = request.headers.get("user-agent")
  const isBotRequest = userAgent ? isbot(userAgent) : false
  let didError = false
  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        didError = true
        console.error(error)
      },
    },
  )

  if (isBotRequest && "allReady" in body && body.allReady) {
    const timeout = setTimeout(() => body.cancel(), ABORT_DELAY)
    try {
      await body.allReady
    } finally {
      clearTimeout(timeout)
    }
  }

  responseHeaders.set("Content-Type", "text/html")

  return new Response(body, {
    status: didError ? 500 : responseStatusCode,
    headers: responseHeaders,
  })
}
