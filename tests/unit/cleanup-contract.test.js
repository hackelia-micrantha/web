import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, readFile, symlink, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { once } from "node:events";
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


test("invalid cleanup kind is refused", async () => {
  await withRoot(async (root) => {
    await assert.rejects(cleanGeneratedOutput(root, "global"), /expected build or browser/);
  });
});

test("missing outputs return no actions", async () => {
  await withRoot(async (root) => {
    assert.deepEqual(await cleanGeneratedOutput(root, "build"), []);
  });
});

test("non-directory parent and filesystem errors are refused", async () => {
  await withRoot(async (root) => {
    await save(root, "public", "invalid parent");
    await assert.rejects(cleanGeneratedOutput(root, "build"), /non-directory/);
    const file = path.join(root, "root-as-file");
    await writeFile(file, "file");
    await assert.rejects(cleanGeneratedOutput(file, "build"), /ENOTDIR/);
  });
});

test("symlinked parent is refused before deleting any build outputs", async () => {
  await withRoot(async (root) => {
    await save(root, "build/index.js", "keep");
    await mkdir(path.join(root, "external"));
    await symlink(path.join(root, "external"), path.join(root, ".cloudflare"));
    await assert.rejects(cleanGeneratedOutput(root, "build"), /symlinked/);
    assert.equal(await readFile(path.join(root, "build/index.js"), "utf8"), "keep");
  });
});

test("unexpected socket output is refused and earlier outputs survive", async () => {
  await withRoot(async (root) => {
    await save(root, "build/index.js", "keep");
    await mkdir(path.join(root, ".performance"), { recursive: true });
    const socketPath = path.join(root, ".performance/build-budget.json");
    const server = net.createServer();
    try {
      server.listen(socketPath);
      await once(server, "listening");
      await assert.rejects(cleanGeneratedOutput(root, "build"), /unexpected output type/);
      assert.equal(await readFile(path.join(root, "build/index.js"), "utf8"), "keep");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
