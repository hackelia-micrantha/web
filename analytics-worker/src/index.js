import { createClientScript } from "./client-source.js"

// A site name is public routing metadata, not an authentication credential.
// None means no vendor SDK is loaded, regardless of client consent calls.
export const SITES = Object.freeze({
  "micrantha-web": Object.freeze({
    provider: "none",
    paths: [],
    titles: {},
    events: {},
  }),
})

const JAVASCRIPT_HEADERS = {
  "Content-Type": "application/javascript; charset=utf-8",
  "Cache-Control": "public, max-age=300, must-revalidate",
  "Access-Control-Allow-Origin": "*",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
}

function reply(body, status, headers = {}) {
  return new Response(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  })
}

export default {
  fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return reply("Method Not Allowed", 405, { Allow: "GET, HEAD" })
    }

    const path = new URL(request.url).pathname
    const head = request.method === "HEAD"

    if (path === "/healthz") {
      return reply(
        head ? null : JSON.stringify({ status: "ok", service: "lenticel" }),
        200,
        { "Content-Type": "application/json; charset=utf-8" },
      )
    }

    const match = /^\/v1\/sites\/([a-z][a-z0-9-]*)\.js$/.exec(path)
    if (!match || !Object.prototype.hasOwnProperty.call(SITES, match[1])) {
      return reply(head ? null : "Not Found", 404)
    }

    return reply(
      head ? null : createClientScript(SITES[match[1]]),
      200,
      JAVASCRIPT_HEADERS,
    )
  },
}
