import assert from "node:assert/strict"

process.env.NODE_ENV = "production"

const { onRequest } = await import("../functions/[[path]].js")
const pathname = "/blog/recursive-governance-and-agent-workflows"
const request = new Request(new URL(pathname, "https://micrantha.example"), {
  headers: {
    "User-Agent": "recursive-mdx-adapter-contract",
  },
})

const response = await onRequest({
  request,
  env: {},
  params: {},
  data: {},
  functionPath: "[[path]]",
  waitUntil() {},
  passThroughOnException() {},
  next() {
    throw new Error("Unexpected Pages Functions next() call")
  },
})
const body = await response.text()

assert.equal(response.status, 200)
assert.match(
  response.headers.get("content-type") ?? "",
  /^text\/html;\s*charset=utf-8$/iu,
)
assert.match(body, /Recursive Governance and Agent Workflows/u)
assert.match(body, /data-content-source="mdx"/u)
assert.match(body, /data-mermaid-status="source"/u)
assert.match(body, /data-mermaid-source="true"/u)
assert.match(body, /Workflow request/u)
assert.match(body, /weakest materially contributing execution boundary/u)
assert.doesNotMatch(body, /data-mermaid-rendered/u)

console.log("Recursive governance MDX Pages adapter contract passed")
