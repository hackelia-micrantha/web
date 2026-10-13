#!/usr/bin/env node
/**
 * Fail-closed publication checks for tracked source and deployable web output.
 * Identifies PEM private-key headers and sensitive file paths without printing
 * file contents. This guard does NOT inspect historic Git objects.
 */
import { execFileSync } from "node:child_process"
import { createReadStream, lstatSync, readdirSync } from "node:fs"
import path from "node:path"
import process from "node:process"

const PEM = /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/u
const SENSITIVE_SUFFIX = /\.(?:pem|key|p12|pfx|jks|keystore|sqlite|db)$/iu

export function sensitivePath(relative) {
  const unix = relative.replaceAll("\\", "/")
  const parts = unix.split("/")
  const name = parts.at(-1) || ""
  return (
    parts.includes("certs") && parts.includes("test")
  ) || /(^|\/)\.env(?:$|\.)(?!example$|sample$|template$)/iu.test(unix) ||
    SENSITIVE_SUFFIX.test(name) ||
    /^(?:id_rsa|id_ed25519|id_ecdsa|credentials\.json)$/iu.test(name)
}

export async function hasPrivateKeyHeader(file) {
  let tail = ""
  for await (const bytes of createReadStream(file, { highWaterMark: 65536 })) {
    const text = tail + bytes.toString("latin1")
    if (PEM.test(text)) return true
    tail = text.slice(-100)
  }
  return false
}

export async function checkFiles(root, relativeFiles) {
  const findings = []
  for (const name of [...relativeFiles].sort()) {
    const relative = name.replaceAll("\\", "/")
    if (!relative || path.isAbsolute(relative) ||
        relative.split("/").includes("..")) {
      findings.push([relative, "unsafe path"])
      continue
    }
    const absolute = path.resolve(root, relative)
    let stat
    try {
      stat = lstatSync(absolute)
    } catch {
      findings.push([relative, "tracked file absent"])
      continue
    }
    if (stat.isSymbolicLink()) {
      findings.push([relative, "symlink in publication scope"])
    } else if (!stat.isFile()) {
      findings.push([relative, "non-file in publication scope"])
    } else if (sensitivePath(relative)) {
      findings.push([relative, "sensitive path"])
    } else if (await hasPrivateKeyHeader(absolute)) {
      findings.push([relative, "private-key PEM header"])
    }
  }
  return findings
}

export function listTree(root) {
  const result = []
  function visit(directory) {
    for (const item of readdirSync(path.join(root, directory), { withFileTypes: true })) {
      const relative = path.join(directory, item.name)
      if (item.isDirectory()) visit(relative)
      else result.push(relative)
    }
  }
  visit("")
  return result
}

function trackedFiles(root) {
  const output = execFileSync("git", ["ls-files", "--cached", "-z"], {
    cwd: root,
    maxBuffer: 8 * 1024 * 1024,
  })
  return output.toString("utf8").split("\0").filter(Boolean)
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.length !== 1 || !["--tracked", "--public", "--functions"].includes(argv[0])) {
    process.stderr.write("Usage: check-publication-secrets.js --tracked|--public|--functions\n")
    return 2
  }
  const root = process.cwd()
  const base = argv[0] === "--tracked" ? root :
    path.join(root, argv[0] === "--public" ? "public" : ".cloudflare/functions")
  let names
  try {
    const stat = lstatSync(base)
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("invalid output")
    names = argv[0] === "--tracked" ? trackedFiles(root) : listTree(base)
    const findings = await checkFiles(base, names)
    if (findings.length > 0) {
      for (const [name, reason] of findings) {
        process.stderr.write("publication-secret-gate: blocked " +
          JSON.stringify(name) + ": " + reason + "\n")
      }
      return 1
    }
    process.stdout.write("publication-secret-gate: " + argv[0] + " passed\n")
    return 0
  } catch (error) {
    process.stderr.write("publication-secret-gate: unable to inspect: " +
      (error?.code || "invalid scope") + "\n")
    return 2
  }
}

if (process.argv[1] && import.meta.url === new URL("file://" + path.resolve(process.argv[1])).href) {
  process.exitCode = await main()
}
