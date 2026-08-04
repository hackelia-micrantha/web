import { createRequestHandler } from "@remix-run/server-runtime"
import * as build from "../build/index.js"
import {
  PRIVATE_NO_STORE_CACHE_CONTROL,
  getRequestCacheControl,
} from "../app/services/cache-policy.js"

const handleRequest = createRequestHandler(build)

function cloneResponse(response, headers) {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

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

  return cloneResponse(response, headers)
}

function enforcePrivateRequestCaching(request, response) {
  if (getRequestCacheControl(request) !== PRIVATE_NO_STORE_CACHE_CONTROL) {
    return response
  }

  const headers = new Headers(response.headers)
  headers.set("Cache-Control", PRIVATE_NO_STORE_CACHE_CONTROL)

  return cloneResponse(response, headers)
}

export const onRequest = async (context) => {
  const response = ensureHtmlCharset(
    await handleRequest(context.request, context),
  )

  return enforcePrivateRequestCaching(context.request, response)
}
