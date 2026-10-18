import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, readFile, symlink, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { cleanGeneratedOutput } from "../../scripts/clean-generated-output.js";

async function withRoot(fn) {
  const root = await mkdtemp(path.join(os.tmpdir(), "micrantha-clean-"));
  try { await fn(root); } finally { await rm(root, { recursive: true, force: true }); }
}
async function save(root, relative, content) {
  const full = path.join(root, relative);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content);
}

test("build cleanup is repeatable and preserves tracked public and shared caches", async () => {
  await withRoot(async (root) => {
    await save(root, "build/index.js", "compiled");
    await save(root, "public/build/a.js", "bundle");
    await save(root, "public/tailwind.css", "generated");
    await save(root, ".cloudflare/functions/config.json", "{}");
    await save(root, ".cloudflare/runtime/manifest.json", "{}");
    await save(root, ".performance/build-budget.json", "{}");
    await save(root, "public/robots.txt", "retained");
    await save(root, "node_modules/safe/file.js", "cached");
    await save(root, ".wrangler/state.json", "runtime");
    await cleanGeneratedOutput(root, "build");
    assert.equal(await readFile(path.join(root, "public/robots.txt"), "utf8"), "retained");
    assert.equal(await readFile(path.join(root, "node_modules/safe/file.js"), "utf8"), "cached");
    assert.equal(await readFile(path.join(root, ".wrangler/state.json"), "utf8"), "runtime");
    assert.deepEqual(await cleanGeneratedOutput(root, "build"), []);
  });
});

test("browser cleanup leaves unrelated performance and source files", async () => {
  await withRoot(async (root) => {
    await save(root, "playwright-report/index.html", "generated");
    await save(root, "test-results/a/trace.zip", "generated");
    await save(root, ".performance/browser/run.json", "generated");
    await save(root, ".performance/build-budget.json", "keep");
    await cleanGeneratedOutput(root, "browser");
    assert.equal(await readFile(path.join(root, ".performance/build-budget.json"), "utf8"), "keep");
  });
});

test("refuses symlinked outputs before removing earlier artifacts", async () => {
  await withRoot(async (root) => {
    await save(root, "build/index.js", "must survive");
    await save(root, "outside/file.txt", "external");
    await mkdir(path.join(root, "public"));
    await symlink(path.join(root, "outside"), path.join(root, "public/build"));
    await assert.rejects(cleanGeneratedOutput(root, "build"), /symlinked/);
    assert.equal(await readFile(path.join(root, "build/index.js"), "utf8"), "must survive");
    assert.equal(await readFile(path.join(root, "outside/file.txt"), "utf8"), "external");
  });
});
