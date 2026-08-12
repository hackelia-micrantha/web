import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const siteCopyFiles = [
  "app/routes/_index.tsx",
  "app/routes/philosophy.tsx",
  "app/routes/privacy.tsx",
  "app/routes/security.tsx",
  "app/routes/services.tsx",
  "app/routes/support.tsx",
]

const firstPersonPlural = /\b(?:we|our|ours|ourselves|us)\b/gi

for (const file of siteCopyFiles) {
  test(`${file} uses project-centered site voice`, () => {
    const source = readFileSync(file, "utf8")
    const matches = [...source.matchAll(firstPersonPlural)].map(
      ({ 0: word, index = 0 }) => {
        const line = source.slice(0, index).split("\n").length
        return `${word} (line ${line})`
      },
    )

    assert.deepEqual(
      matches,
      [],
      `${file} contains first-person plural site copy: ${matches.join(", ")}`,
    )
  })
}
