#!/usr/bin/env node
// Worktree-local generated build and browser cleanup, never source/deployment state.
import { lstat, rm } from "node:fs/promises";
import path from "node:path";

const ownedPaths = {
  build: ["build", "public/build", "public/tailwind.css", ".cloudflare/functions", ".cloudflare/runtime", ".performance/build-budget.json"],
  browser: ["playwright-report", "playwright-report-cloudflare", "test-results", "test-results-cloudflare", ".performance/browser"],
};

export async function cleanGeneratedOutput(root, kind) {
  if (!Object.hasOwn(ownedPaths, kind)) {
    throw new Error("expected build or browser cleanup");
  }
  const pending = [];
  for (const relative of ownedPaths[kind]) {
    const fullPath = path.join(root, relative);
    const parts = relative.split("/");
    for (let index = 1; index <= parts.length; index++) {
      const ancestor = path.join(root, ...parts.slice(0, index));
      let meta;
      try {
        meta = await lstat(ancestor);
      } catch (error) {
        if (error.code === "ENOENT") break;
        throw error;
      }
      if (meta.isSymbolicLink()) {
        throw new Error("refusing symlinked generated output: " + ancestor);
      }
      if (index < parts.length && !meta.isDirectory()) {
        throw new Error("refusing non-directory generated parent: " + ancestor);
      }
      if (index === parts.length) {
        pending.push({ fullPath, meta });
      }
    }
  }
  // Validate every path before deleting any. Do not touch shared node_modules or .wrangler.
  for (const { fullPath, meta } of pending) {
    if (!meta.isFile() && !meta.isDirectory()) {
      throw new Error("refusing unexpected output type: " + fullPath);
    }
  }
  for (const { fullPath } of pending) {
    await rm(fullPath, { recursive: true, force: false });
  }
  return pending.map(({ fullPath }) => fullPath);
}
