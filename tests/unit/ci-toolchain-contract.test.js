import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import test from "node:test"

const workflow = readFileSync(".github/workflows/ci.yml", "utf8")
function yamlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = `${directory}/${entry.name}`

    if (entry.isDirectory()) {
      return yamlFiles(entryPath)
    }

    return /\.ya?ml$/u.test(entry.name)
      ? [{ name: entryPath, source: readFileSync(entryPath, "utf8") }]
      : []
  })
}

const actionFiles = [
  ...yamlFiles(".github/workflows"),
  ...yamlFiles(".github/actions"),
]
const securityWorkflow = readFileSync(".github/workflows/security.yml", "utf8")
const dockerfile = readFileSync("Dockerfile", "utf8")
const flake = readFileSync("flake.nix", "utf8")
const lock = readFileSync("flake.lock", "utf8")
const setup = readFileSync(".github/actions/setup/action.yml", "utf8")
const packageJson = JSON.parse(readFileSync("package.json", "utf8"))
const playwrightConfig = readFileSync("playwright.config.ts", "utf8")
const headlessShell = readFileSync(
  "nix/playwright/chromium-headless-shell.nix",
  "utf8",
)
const yarnLock = readFileSync("yarn.lock", "utf8")

const jobsSection = workflow.split("\njobs:\n")[1] ?? ""
const jobBlocks = jobsSection.split(/\n(?= {2}[a-zA-Z0-9_-]+:\n)/)

test("every runner-web job uses the repository-owned setup action", () => {
  assert.doesNotMatch(workflow, /actions\/setup-node@/)

  const runnerJobs = jobBlocks.filter((block) =>
    /^ {4}runs-on: runner-web$/m.test(block),
  )

  assert.ok(runnerJobs.length > 0, "CI must retain at least one runner-web job")

  for (const job of runnerJobs) {
    const setupUses = job.match(/uses: \.\/\.github\/actions\/setup/g) ?? []
    assert.equal(
      setupUses.length,
      1,
      "every runner-web job must activate the project-owned setup exactly once",
    )
  }
})

test("external GitHub Actions use immutable commit pins", () => {
  for (const { name, source } of actionFiles) {
    for (const match of source.matchAll(
      /^\s*(?:-\s*)?uses:\s*([^\s#]+)(?:\s+#\s*(.+))?$/gmu,
    )) {
      const reference = match[1]
      const comment = match[2]

      if (reference.startsWith("./") || reference.startsWith("docker://")) {
        continue
      }

      const separator = reference.lastIndexOf("@")
      assert.notEqual(
        separator,
        -1,
        `${name}: external action is missing a ref`,
      )

      const action = reference.slice(0, separator)
      const ref = reference.slice(separator + 1)

      assert.match(
        ref,
        /^[0-9a-f]{40}$/u,
        `${name}: ${action} must use an immutable commit SHA`,
      )
      assert.match(
        comment ?? "",
        /^v\d/u,
        `${name}: ${action} must retain a human-readable version comment`,
      )
    }
  }
})

test("security workflow keeps first-party analysis off the Dubnium JIT image", () => {
  assert.match(securityWorkflow, /runs-on: ubuntu-latest/u)
  assert.doesNotMatch(securityWorkflow, /runs-on: runner-web/u)
  assert.doesNotMatch(securityWorkflow, /\.\/\.github\/actions\/setup/u)
  assert.match(securityWorkflow, /actions\/dependency-review-action@/u)
  assert.match(securityWorkflow, /fail-on-severity: moderate/u)
  assert.match(securityWorkflow, /github\/codeql-action\/init@/u)
  assert.match(securityWorkflow, /github\/codeql-action\/analyze@/u)
  assert.match(securityWorkflow, /languages: javascript-typescript/u)
  assert.match(securityWorkflow, /build-mode: none/u)
  assert.match(securityWorkflow, /security-events: write/u)
})

test("project toolchain pins Node 24 and Yarn 1 through Nix", () => {
  assert.match(flake, /nodejs = pkgs\.nodejs_24;/)
  assert.match(flake, /yarn = pkgs\.yarn\.override \{ inherit nodejs; \};/)
  assert.match(flake, /ci-toolchain = ciToolchain;/)
  assert.match(setup, /nix flake check/)
  assert.match(setup, /nix build --no-link --print-out-paths \.#ci-toolchain/)
  assert.match(setup, /yarn install --frozen-lockfile --non-interactive/)
})

test("package manifest matches the repository-owned toolchain authority", () => {
  assert.equal(packageJson.packageManager, "yarn@1.22.22")
  assert.equal(packageJson.engines?.node, ">=24 <25")
  assert.equal(packageJson.devDependencies?.["@playwright/test"], "1.60.0")
  assert.equal(packageJson.devDependencies?.typescript, "5.9.3")
  assert.equal(packageJson.devDependencies?.wrangler, "4.114.0")
})

test("secondary portability paths do not define competing toolchains", () => {
  assert.equal(existsSync(".gitlab-ci.yml"), false)
  assert.ok(
    dockerfile.startsWith(
      "FROM docker.io/library/node:24-bookworm-slim AS base\n",
    ),
  )
  assert.doesNotMatch(dockerfile, /npm install --global yarn/)
  assert.equal(
    (dockerfile.match(/yarn install --frozen-lockfile/g) ?? []).length,
    2,
  )
})

test("Playwright browser runtime matches the Yarn-locked client", () => {
  assert.match(
    yarnLock,
    /"@playwright\/test@1\.60\.0":\n {2}version "1\.60\.0"/,
  )
  assert.match(flake, /playwrightVersion = "1\.60\.0";/)
  assert.match(flake, /revision = "1223";/)
  assert.match(flake, /browserVersion = "148\.0\.7778\.96";/)
  assert.match(flake, /playwrightFfmpegRevision = "1011";/)
  assert.match(flake, /playwright-browsers = playwrightBrowsers;/)

  assert.doesNotMatch(workflow, /playwright install/)
  assert.doesNotMatch(workflow, /\bsudo\b|\bapt(?:-get)?\b/)
  assert.match(workflow, /playwright: "true"/)
  assert.match(setup, /PLAYWRIGHT_BROWSERS_PATH/)
  assert.match(setup, /PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1/)
  assert.match(setup, /PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1/)
})

test("Playwright browser runtime owns its font availability", () => {
  assert.match(
    flake,
    /fontDirectories = \[ pkgs\.dejavu_fonts \];/,
    "browser fontconfig must not depend on host fonts",
  )
  assert.match(
    flake,
    /chromiumHeadlessShell = pkgs\.callPackage[\s\S]*fontconfig_file = fontconfigFile;/,
    "headless shell must receive the same repository-owned fontconfig",
  )
  assert.match(headlessShell, /makeWrapper/)
  assert.match(
    headlessShell,
    /x86_64-linux = "chrome-headless-shell-linux64\/chrome-headless-shell";/,
    "x86_64 headless shell path must match Playwright 1.60",
  )
  assert.match(
    headlessShell,
    /aarch64-linux = "chrome-linux\/headless_shell";/,
    "aarch64 headless shell path must match Playwright 1.60",
  )
  assert.match(
    headlessShell,
    /wrapProgram \$out\/\$\{headlessShellPath\}[\s\\\n]*--set-default FONTCONFIG_FILE \$\{fontconfig_file\}/,
  )
})

test("Playwright CI concurrency stays bounded for the small JIT profile", () => {
  assert.match(playwrightConfig, /workers: process\.env\.CI \? 1 : undefined/)
})

test("Nix input is locked to an immutable nixpkgs revision", () => {
  const parsed = JSON.parse(lock)
  const nixpkgs = parsed.nodes?.nixpkgs?.locked

  assert.equal(nixpkgs?.type, "github")
  assert.equal(nixpkgs?.owner, "NixOS")
  assert.equal(nixpkgs?.repo, "nixpkgs")
  assert.match(nixpkgs?.rev ?? "", /^[0-9a-f]{40}$/)
  assert.match(nixpkgs?.narHash ?? "", /^sha256-/)
})
