#!/usr/bin/env node
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { checkFiles, sensitivePath, listTree } from "./check-publication-secrets.js"

assert.equal(sensitivePath("test/certs/dev-key.pem"), true)
assert.equal(sensitivePath("assets/private.pem"), true)
assert.equal(sensitivePath("notes/.env"), true)
assert.equal(sensitivePath("notes/.env.production"), true)
assert.equal(sensitivePath("notes/.env.example"), false)
assert.equal(sensitivePath("public/logo.svg"), false)

const root = mkdtempSync(path.join(os.tmpdir(), "web-secret-gate-"))
try {
  mkdirSync(path.join(root, "assets"))
  writeFileSync(path.join(root, "assets", "ordinary.svg"), "<svg/>")
  const marker = "-----BEGIN " + "PRIVATE KEY-----"
  writeFileSync(path.join(root, "assets", "secret.txt"),
    "A".repeat(65530) + marker + "\nsynthetic-test-only")
  writeFileSync(path.join(root, "assets", "hidden.pem"), "synthetic")
  symlinkSync(path.join(root, "assets", "ordinary.svg"), path.join(root, "assets", "shortcut"))
  const findings = await checkFiles(root, listTree(root))
  assert.deepEqual(findings, [
    ["assets/hidden.pem", "sensitive path"],
    ["assets/secret.txt", "private-key PEM header"],
    ["assets/shortcut", "symlink in publication scope"],
  ])
  assert.deepEqual(await checkFiles(root, ["assets/ordinary.svg"]), [])
  assert.deepEqual(await checkFiles(root, ["missing"]), [["missing", "tracked file absent"]])
  assert.deepEqual(await checkFiles(root, ["../outside"]), [["../outside", "unsafe path"]])
} finally {
  rmSync(root, { recursive: true, force: true })
}
console.log("publication-secret-gate: synthetic tests passed")
