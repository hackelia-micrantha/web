import assert from "node:assert/strict"
import test from "node:test"

import { parseBlogMermaidSource } from "../../app/content/blog-mermaid.js"

const validSource = `%% title: Governed execution
%% caption: Evidence remains visible.
flowchart TD
  A[Intent] --> B[Evidence]`

test("parses constrained Mermaid flowchart metadata and source", () => {
  assert.deepEqual(parseBlogMermaidSource(validSource), {
    title: "Governed execution",
    caption: "Evidence remains visible.",
    chart: "flowchart TD\n  A[Intent] --> B[Evidence]",
  })
})

test("requires title and caption metadata", () => {
  assert.throws(
    () => parseBlogMermaidSource("flowchart TD\nA --> B"),
    /missing its title metadata line/u,
  )
  assert.throws(
    () => parseBlogMermaidSource("%% title: Diagram\nflowchart TD\nA --> B"),
    /missing its caption metadata line/u,
  )
  assert.throws(
    () =>
      parseBlogMermaidSource(
        "%% title:   \n%% caption: Caption\nflowchart TD\nA --> B",
      ),
    /title must not be empty/u,
  )
  assert.throws(
    () =>
      parseBlogMermaidSource(
        "%% title: Diagram\n%% caption:   \nflowchart TD\nA --> B",
      ),
    /caption must not be empty/u,
  )
})

test("enforces metadata and chart size limits", () => {
  assert.throws(
    () =>
      parseBlogMermaidSource(
        `%% title: ${"T".repeat(161)}\n%% caption: Caption\nflowchart TD\nA --> B`,
      ),
    /title exceeds 160 characters/u,
  )
  assert.throws(
    () =>
      parseBlogMermaidSource(
        `%% title: Diagram\n%% caption: ${"C".repeat(321)}\nflowchart TD\nA --> B`,
      ),
    /caption exceeds 320 characters/u,
  )
  assert.throws(
    () =>
      parseBlogMermaidSource(
        "%% title: Diagram\n%% caption: Caption\n",
      ),
    /between 1 and 4000 characters/u,
  )
  assert.throws(
    () =>
      parseBlogMermaidSource(
        `%% title: Diagram\n%% caption: Caption\nflowchart TD\n${"A".repeat(4_000)}`,
      ),
    /between 1 and 4000 characters/u,
  )
})

test("permits only directed flowcharts", () => {
  assert.throws(
    () =>
      parseBlogMermaidSource(
        "%% title: Diagram\n%% caption: Caption\nsequenceDiagram\nA->>B: Hi",
      ),
    /must be a directed flowchart/u,
  )
})

test("rejects Mermaid directives, links, HTML, and control characters", () => {
  for (const chart of [
    "flowchart TD\n%%{init: {}}%%\nA --> B",
    "flowchart TD\nA --> B\nclick A callback",
    "flowchart TD\nA href https://example.com",
    "flowchart TD\nA[javascript:alert(1)] --> B",
  ]) {
    assert.throws(
      () =>
        parseBlogMermaidSource(
          `%% title: Diagram\n%% caption: Caption\n${chart}`,
        ),
      /forbidden directive or link/u,
    )
  }

  assert.throws(
    () =>
      parseBlogMermaidSource(
        "%% title: Diagram\n%% caption: Caption\nflowchart TD\nA[<b>HTML</b>] --> B",
      ),
    /must not contain HTML/u,
  )
  assert.throws(
    () =>
      parseBlogMermaidSource(
        "%% title: Diagram\n%% caption: Caption\nflowchart TD\nA[bad\u0000value] --> B",
      ),
    /contains control characters/u,
  )
})
