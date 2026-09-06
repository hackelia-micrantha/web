import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const workflow = readFileSync(".github/workflows/ci.yml", "utf8")
const flake = readFileSync("flake.nix", "utf8")
const lock = readFileSync("flake.lock", "utf8")
const setup = readFileSync(".github/actions/setup/action.yml", "utf8")

test("self-hosted CI uses the repository-owned setup action", () => {
  assert.doesNotMatch(workflow, /actions\/setup-node@/)
  assert.match(workflow, /uses: \.\/\.github\/actions\/setup/g)

  const setupUses = workflow.match(/uses: \.\/\.github\/actions\/setup/g)
  assert.equal(
    setupUses?.length,
    2,
    "quality and end-to-end jobs must both use the project-owned setup action",
  )
})

test("project toolchain pins Node 24 and Yarn 1 through Nix", () => {
  assert.match(flake, /nodejs = pkgs\.nodejs_24;/)
  assert.match(flake, /yarn = pkgs\.yarn\.override \{ inherit nodejs; \};/)
  assert.match(flake, /ci-toolchain = ciToolchain;/)
  assert.match(setup, /nix flake check/)
  assert.match(setup, /nix build --no-link --print-out-paths \.#ci-toolchain/)
  assert.match(setup, /yarn install --frozen-lockfile --non-interactive/)
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
