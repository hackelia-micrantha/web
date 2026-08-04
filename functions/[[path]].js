import { createRequestHandler } from "@remix-run/server-runtime"
import * as build from "../build/index.js"

const handleRequest = createRequestHandler(build)

function ensureHtmlCharset(response) {
  const contentType = response.headers.get("Content-Type")

  if (
    !contentType ||
    !/^text\/html(?:;|$)/i.test(contentType) ||
    /(?:^|;)\s*charset=/i.test(contentType)
  ) {
    return response
  }

  const headers = new Headers(response.headers)
  headers.set("Content-Type", `${contentType}; charset=utf-8`)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const onRequest = async (context) =>
  ensureHtmlCharset(await handleRequest(context.request, context))
