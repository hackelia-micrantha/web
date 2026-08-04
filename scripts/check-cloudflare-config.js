import assert from "node:assert/strict"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)

const [wranglerToml, contractDocument, packageDocument] = await Promise.all([
  readFile(path.join(repositoryRoot, "wrangler.toml"), "utf8"),
  readFile(
    path.join(repositoryRoot, "config", "cloudflare-pages-contract.json"),
    "utf8",
  ),
  readFile(path.join(repositoryRoot, "package.json"), "utf8"),
])

const contract = JSON.parse(contractDocument)
const packageJson = JSON.parse(packageDocument)

function tomlString(name) {
  const value = wranglerToml.match(
    new RegExp(`^${name}\\s*=\\s*"([^"]+)"\\s*$`, "m"),
  )?.[1]

  assert.ok(value, `wrangler.toml must define ${name}`)
  return value
}

function tomlBoolean(name) {
  const value = wranglerToml.match(
    new RegExp(`^${name}\\s*=\\s*(true|false)\\s*$`, "m"),
  )?.[1]

  assert.ok(value, `wrangler.toml must define ${name}`)
  return value === "true"
}

function tomlStringArray(name) {
  const value = wranglerToml.match(
    new RegExp(`^${name}\\s*=\\s*\\[([^\\]]*)\\]\\s*$`, "m"),
  )?.[1]

  assert.notEqual(value, undefined, `wrangler.toml must define ${name}`)

  return [...value.matchAll(/"([^"]+)"/g)].map((match) => match[1])
}

assert.equal(tomlString("name"), contract.projectName)
assert.equal(
  tomlString("pages_build_output_dir"),
  contract.pagesBuildOutputDirectory,
)
assert.equal(tomlString("compatibility_date"), contract.compatibilityDate)
assert.deepEqual(
  tomlStringArray("compatibility_flags").sort(),
  [...contract.compatibilityFlags].sort(),
)
assert.equal(tomlBoolean("upload_source_maps"), contract.uploadSourceMaps)

const deployCommand = packageJson.scripts?.["deploy:cloudflare"] ?? ""
assert.match(
  deployCommand,
  /--project-name \$\{CLOUDFLARE_PAGES_PROJECT:-micrantha-web\}/,
  "deploy:cloudflare must default to the contracted Pages project name",
)
assert.match(
  deployCommand,
  /wrangler pages deploy public/,
  "deploy:cloudflare must deploy the contracted public output directory",
)

await stat(path.join(repositoryRoot, "functions", "[[path]].js"))

for (const binding of contract.bindings) {
  assert.match(binding.name, /^[A-Z][A-Z0-9_]*$/)
  assert.equal(typeof binding.required, "boolean")
  assert.equal(typeof binding.sensitive, "boolean")
}

console.log(
  `Cloudflare Pages config passed (${contract.projectName}, ${contract.compatibilityDate}, ${contract.compatibilityFlags.join(", ")})`,
)
