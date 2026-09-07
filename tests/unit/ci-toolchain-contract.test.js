import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const workflow = readFileSync(".github/workflows/ci.yml", "utf8")
const flake = readFileSync("flake.nix", "utf8")
const lock = readFileSync("flake.lock", "utf8")
const setup = readFileSync(".github/actions/setup/action.yml", "utf8")
const yarnLock = readFileSync("yarn.lock", "utf8")

const jobsSection = workflow.split("\njobs:\n")[1] ?? ""
const jobBlocks = jobsSection.split(/\n(?=  [a-zA-Z0-9_-]+:\n)/)

test("every runner-web job uses the repository-owned setup action", () => {
  assert.doesNotMatch(workflow, /actions\/setup-node@/)

  const runnerJobs = jobBlocks.filter((block) =>
    /^    runs-on: runner-web$/m.test(block),
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

test("project toolchain pins Node 24 and Yarn 1 through Nix", () => {
  assert.match(flake, /nodejs = pkgs\.nodejs_24;/)
  assert.match(flake, /yarn = pkgs\.yarn\.override \{ inherit nodejs; \};/)
  assert.match(flake, /ci-toolchain = ciToolchain;/)
  assert.match(setup, /nix flake check/)
  assert.match(setup, /nix build --no-link --print-out-paths \.#ci-toolchain/)
  assert.match(setup, /yarn install --frozen-lockfile --non-interactive/)
})

test("Playwright browser runtime matches the Yarn-locked client", () => {
  assert.match(
    yarnLock,
    /"@playwright\/test@\^1\.54\.2":\n  version "1\.60\.0"/,
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

test("Nix input is locked to an immutable nixpkgs revision", () => {
  const parsed = JSON.parse(lock)
  const nixpkgs = parsed.nodes?.nixpkgs?.locked

  assert.equal(nixpkgs?.type, "github")
  assert.equal(nixpkgs?.owner, "NixOS")
  assert.equal(nixpkgs?.repo, "nixpkgs")
  assert.match(nixpkgs?.rev ?? "", /^[0-9a-f]{40}$/)
  assert.match(nixpkgs?.narHash ?? "", /^sha256-/)
})
